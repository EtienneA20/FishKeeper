import json
import os
from datetime import datetime
import pandas as pd
import requests

os.makedirs("data/raw_parquet", exist_ok=True)
os.makedirs("data", exist_ok=True)

REPO_ID = "cboettig/fishbase"
BASE_URL = f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/data/fb/v24.07/parquet"

TABLES = {
    "species": f"{BASE_URL}/species.parquet",
    "families": f"{BASE_URL}/families.parquet",
    "ecology": f"{BASE_URL}/ecology.parquet",
}

def resolve_parquet_url(table_name: str, default_url: str) -> str:
    try:
        r = requests.head(default_url, allow_redirects=True, timeout=10)
        if r.status_code == 200:
            return default_url
    except Exception:
        pass

    api_url = f"https://huggingface.co/api/datasets/{REPO_ID}"
    resp = requests.get(api_url, timeout=15)
    resp.raise_for_status()
    siblings = resp.json().get("siblings", [])
    matches = [
        s["rfilename"] for s in siblings
        if s["rfilename"].endswith(f"/{table_name}.parquet") and "/fb/" in s["rfilename"]
    ]
    if not matches:
        raise FileNotFoundError(f"Impossible de trouver {table_name}.parquet dans {REPO_ID}")
    latest_path = sorted(matches)[-1]
    return f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/{latest_path}"

def load_parquet(name: str, url: str) -> pd.DataFrame:
    local_path = f"data/raw_parquet/{name}.parquet"
    if not os.path.exists(local_path):
        valid_url = resolve_parquet_url(name, url)
        print(f"Téléchargement de {name}.parquet depuis {valid_url}...")
        df = pd.read_parquet(valid_url)
        df.to_parquet(local_path)
    else:
        print(f"Chargement local de {name}.parquet...")
        df = pd.read_parquet(local_path)
    return df

def map_water_type(row) -> str:
    salt = row.get("Saltwater")
    fresh = row.get("Fresh")
    brack = row.get("Brack")

    is_salt = salt in (-1, 1, True)
    is_fresh = fresh in (-1, 1, True)
    is_brack = brack in (-1, 1, True)

    if is_salt and not is_fresh and not is_brack:
        return "MARINE_SOFT"
    if is_brack and not is_fresh:
        return "BRACKISH_SOFT"
    if is_fresh:
        return "FRESH_SOFT"
    if is_salt:
        return "MARINE_SOFT"
    return "FRESH_SOFT"

def main():
    df_species = load_parquet("species", TABLES["species"])
    df_families = load_parquet("families", TABLES["families"])
    df_ecology = load_parquet("ecology", TABLES["ecology"])

    print(f"Espèces brutes chargées : {len(df_species)}")

    # Fusion avec les familles pour obtenir des catégories zoologiques distinctes
    fam_cols = [c for c in ["FamCode", "Family", "CommonName", "Order", "Class"] if c in df_families.columns]
    df = df_species.merge(
        df_families[fam_cols],
        on="FamCode",
        how="left",
        suffixes=("", "_fam")
    )

    # Fusion avec ecology (une ligne par SpecCode)
    df_eco_dedup = df_ecology.drop_duplicates(subset=["SpecCode"])
    df = df.merge(df_eco_dedup, on="SpecCode", how="left", suffixes=("", "_eco"))

    # 1. Construction des catégories distinctes (SpeciesCategory)
    categories_map = {}
    for _, row in df_families.iterrows():
        fam_name = str(row["Family"]).strip() if pd.notna(row.get("Family")) else None
        if not fam_name:
            continue
        common_fam = str(row["CommonName"]).strip() if pd.notna(row.get("CommonName")) else ""
        order_name = str(row["Order"]).strip() if pd.notna(row.get("Order")) else ""
        
        cat_label = f"{fam_name} ({common_fam})" if common_fam else fam_name
        desc = (
            f"Famille des {fam_name}"
            + (f" ({common_fam})" if common_fam else "")
            + (f" — Ordre : {order_name}." if order_name else ".")
        )
        
        categories_map[row["FamCode"]] = {
            "name": cat_label,
            "family": fam_name,
            "description": desc
        }

    fallback_cat = {
        "name": "Autres espèces aquatiques",
        "family": "Unknown",
        "description": "Espèces dont la famille taxonomique n'est pas encore classifiée."
    }

    # 2. Construction de la liste des espèces
    species_list = []
    seen_names = set()

    for _, row in df.iterrows():
        genus = str(row["Genus"]).strip() if pd.notna(row.get("Genus")) else ""
        species_ep = str(row["Species"]).strip() if pd.notna(row.get("Species")) else ""
        if not genus or not species_ep:
            continue

        scientific_name = f"{genus} {species_ep}"
        fb_name = str(row["FBname"]).strip() if pd.notna(row.get("FBname")) and str(row.get("FBname")).strip() else ""

        # Garantir la contrainte @unique de Prisma sur Species.name
        base_name = fb_name if fb_name else scientific_name
        unique_name = base_name
        if unique_name.lower() in seen_names:
            unique_name = f"{base_name} ({scientific_name})"
        if unique_name.lower() in seen_names:
            unique_name = f"{base_name} [{int(row['SpecCode'])}]"
        seen_names.add(unique_name.lower())

        cat_info = categories_map.get(row.get("FamCode"), fallback_cat)
        pic_name = str(row["PicPreferredName"]).strip() if pd.notna(row.get("PicPreferredName")) else ""
        image_url = f"https://www.fishbase.se/images/species/{pic_name}" if pic_name else None

        species_list.append({
            "specCode": int(row["SpecCode"]),
            "name": unique_name,
            "scientificName": scientific_name,
            "categoryName": cat_info["name"],
            "description": str(row["Comments"]).strip() if pd.notna(row.get("Comments")) else None,
            "imageURL": image_url,
            "waterType": map_water_type(row),
            "minTemperature": None,
            "maxTemperature": None,
            "minPh": None,
            "maxPh": None,
            "minGh": None,
            "maxGh": None,
            "minKh": None,
            "maxKh": None,
            "minVolume": None,
            "aggressiveness": None,
            "_meta": {
                "lengthCm": float(row["Length"]) if pd.notna(row.get("Length")) else None,
                "demersPelag": str(row["DemersPelag"]) if pd.notna(row.get("DemersPelag")) else None,
                "troph": float(row["FoodTroph"]) if pd.notna(row.get("FoodTroph")) else None,
                "aquariumStatus": str(row["Aquarium"]) if pd.notna(row.get("Aquarium")) else None,
                "anaCat": str(row["AnaCat"]) if pd.notna(row.get("AnaCat")) else None,
            }
        })

    used_cat_names = {s["categoryName"] for s in species_list}
    categories_list = [
        {"name": c["name"], "description": c["description"]}
        for c in categories_map.values()
        if c["name"] in used_cat_names
    ]
    if fallback_cat["name"] in used_cat_names:
        categories_list.append({"name": fallback_cat["name"], "description": fallback_cat["description"]})

    output_data = {
        "categories": sorted(categories_list, key=lambda x: x["name"]),
        "species": species_list
    }

    output_file = "data/01_base_species.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    log_entry = {
        "step": 1,
        "script": "01_extract_fishbase_base.py",
        "timestamp": datetime.now().isoformat(),
        "sources": [
            "FishBase v24.07 (species.parquet)",
            "FishBase v24.07 (families.parquet)",
            "FishBase v24.07 (ecology.parquet)"
        ],
        "stats": {
            "total_categories": len(categories_list),
            "total_species": len(species_list),
            "with_image": sum(1 for s in species_list if s["imageURL"]),
            "with_description": sum(1 for s in species_list if s["description"]),
        }
    }

    with open("data/pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump([log_entry], f, ensure_ascii=False, indent=2)

    print(f"\n--- ÉTAPE 1 TERMINÉE ---")
    print(f"Catégories uniques générées : {len(categories_list)}")
    print(f"Espèces générées : {len(species_list)}")
    print(f"Fichier sauvegardé : {output_file}")

if __name__ == "__main__":
    main()