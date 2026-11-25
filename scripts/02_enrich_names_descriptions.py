import json
import os
import time
from datetime import datetime
import pandas as pd
import requests
from tqdm import tqdm

REPO_ID = "cboettig/fishbase"
BASE_URL = f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/data/fb/v24.07/parquet"
COMNAMES_URL = f"{BASE_URL}/comnames.parquet"

def load_comnames() -> pd.DataFrame:
    local_path = "data/raw_parquet/comnames.parquet"
    if not os.path.exists(local_path):
        print("Téléchargement de comnames.parquet depuis FishBase...")
        df = pd.read_parquet(COMNAMES_URL)
        df.to_parquet(local_path)
    else:
        print("Chargement local de comnames.parquet...")
        df = pd.read_parquet(local_path)
    return df

def fetch_wikidata_batch(scientific_names: list[str]) -> dict:
    """Interroge Wikidata SPARQL par lots pour récupérer label FR, description FR et image Commons."""
    values_clause = " ".join([f'"{name}"' for name in scientific_names])
    query = f"""
    SELECT ?taxonName ?labelFr ?descFr ?image WHERE {{
      VALUES ?taxonName {{ {values_clause} }}
      ?item wdt:P225 ?taxonName .
      OPTIONAL {{ ?item rdfs:label ?labelFr . FILTER(LANG(?labelFr) = "fr") }}
      OPTIONAL {{ ?item schema:description ?descFr . FILTER(LANG(?descFr) = "fr") }}
      OPTIONAL {{ ?item wdt:P18 ?image . }}
    }}
    """
    url = "https://query.wikidata.org/sparql"
    headers = {
        "User-Agent": "FishKeeperDatasetBuilder/1.0 (contact: dev@fishkeeper.local)",
        "Accept": "application/sparql-results+json"
    }
    try:
        resp = requests.post(url, data={"query": query}, headers=headers, timeout=30)
        if resp.status_code != 200:
            return {}
        results = resp.json().get("results", {}).get("bindings", [])
        mapped = {}
        for r in results:
            sci = r.get("taxonName", {}).get("value")
            if not sci:
                continue
            if sci not in mapped:
                mapped[sci] = {"labelFr": None, "descFr": None, "image": None}
            if "labelFr" in r and not mapped[sci]["labelFr"]:
                val = r["labelFr"]["value"]
                # Ignorer si le label FR est juste le nom scientifique répété
                if val.lower() != sci.lower():
                    mapped[sci]["labelFr"] = val
            if "descFr" in r and not mapped[sci]["descFr"]:
                mapped[sci]["descFr"] = r["descFr"]["value"]
            if "image" in r and not mapped[sci]["image"]:
                mapped[sci]["image"] = r["image"]["value"]
        return mapped
    except Exception:
        return {}

def main():
    input_file = "data/01_base_species.json"
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    species_list = data["species"]
    print(f"Chargement de {len(species_list)} espèces depuis {input_file}...")

    # 1. Extraction des noms communs français depuis FishBase (comnames.parquet)
    df_com = load_comnames()
    df_fr = df_com[df_com["Language"].astype(str).str.lower() == "french"].copy()
    
    # Priorité aux noms marqués comme préférés (PreferredName == -1 ou 1)
    if "PreferredName" in df_fr.columns:
        df_fr["is_pref"] = df_fr["PreferredName"].apply(lambda x: 1 if x in (-1, 1, True) else 0)
        df_fr = df_fr.sort_values(by=["SpecCode", "is_pref"], ascending=[True, False])
    
    df_fr = df_fr.drop_duplicates(subset=["SpecCode"])
    fb_french_map = dict(zip(df_fr["SpecCode"], df_fr["ComName"].astype(str).str.strip()))
    print(f"Noms français trouvés dans FishBase : {len(fb_french_map)}")

    # 2. Enrichissement groupé via Wikidata SPARQL (par lots de 400)
    all_sci_names = [s["scientificName"] for s in species_list if s.get("scientificName")]
    wikidata_map = {}
    batch_size = 400

    print("Interrogation de Wikidata SPARQL pour les noms FR, descriptions FR et images...")
    for i in tqdm(range(0, len(all_sci_names), batch_size), desc="Lots Wikidata"):
        batch = all_sci_names[i:i + batch_size]
        batch_res = fetch_wikidata_batch(batch)
        wikidata_map.update(batch_res)
        time.sleep(0.5)  # Respect du rate-limit Wikidata

    # 3. Fusion et garantie d'unicité stricte sur Species.name
    seen_names = set()
    fr_names_applied = 0
    descriptions_enriched = 0
    images_added = 0

    for sp in species_list:
        spec_code = sp["specCode"]
        sci_name = sp["scientificName"]
        wd = wikidata_map.get(sci_name, {})

        # Choix du meilleur nom (Priorité : FishBase FR > Wikidata FR > Nom étape 1)
        best_name = fb_french_map.get(spec_code) or wd.get("labelFr") or sp["name"]
        best_name = best_name.strip()

        if best_name != sp["name"]:
            fr_names_applied += 1

        # Unicité stricte (@unique Prisma)
        unique_name = best_name
        if unique_name.lower() in seen_names:
            unique_name = f"{best_name} ({sci_name})"
        if unique_name.lower() in seen_names:
            unique_name = f"{best_name} [{spec_code}]"
        seen_names.add(unique_name.lower())
        sp["name"] = unique_name

        # Description : combinaison propre entre résumé FR Wikidata et notes FishBase
        wd_desc = wd.get("descFr")
        fb_desc = sp.get("description")
        if wd_desc and fb_desc:
            if wd_desc.lower() not in fb_desc.lower():
                sp["description"] = f"{wd_desc.capitalize()}. {fb_desc}"
                descriptions_enriched += 1
        elif wd_desc and not fb_desc:
            sp["description"] = f"{wd_desc.capitalize()}."
            descriptions_enriched += 1

        # Image : ajout si absente dans FishBase
        if not sp.get("imageURL") and wd.get("image"):
            sp["imageURL"] = wd["image"]
            images_added += 1

    output_file = "data/02_names_enriched.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mise à jour du journal de traçabilité
    with open("data/pipeline_log.json", "r", encoding="utf-8") as f:
        logs = json.load(f)

    logs.append({
        "step": 2,
        "script": "02_enrich_names_descriptions.py",
        "timestamp": datetime.now().isoformat(),
        "sources": [
            "FishBase v24.07 (comnames.parquet)",
            "Wikidata SPARQL Endpoint (labels FR, descriptions FR, P18 images)"
        ],
        "stats": {
            "total_species": len(species_list),
            "french_names_applied": fr_names_applied,
            "descriptions_enriched": descriptions_enriched,
            "images_added_from_wikidata": images_added,
            "total_with_image": sum(1 for s in species_list if s["imageURL"]),
            "total_with_description": sum(1 for s in species_list if s["description"]),
        }
    })

    with open("data/pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"\n--- ÉTAPE 2 TERMINÉE ---")
    print(f"Noms français appliqués : {fr_names_applied}")
    print(f"Descriptions enrichies : {descriptions_enriched}")
    print(f"Images ajoutées via Wikidata : {images_added}")
    print(f"Fichier sauvegardé : {output_file}")

if __name__ == "__main__":
    main()