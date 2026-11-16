import json
import os
import time
import duckdb
import requests

# Liste de départ : (Nom commun FR, Nom scientifique exact, Catégorie, Agressivité)
TARGET_SPECIES = [
    ("Néon bleu", "Paracheirodon innesi", "Characidés", "PEACEFUL"),
    ("Néon cardinalis", "Paracheirodon axelrodi", "Characidés", "PEACEFUL"),
    ("Nez rouge", "Hemigrammus rhodostomus", "Characidés", "PEACEFUL"),
    ("Guppy", "Poecilia reticulata", "Poeciliidés", "PEACEFUL"),
    ("Platy", "Xiphophorus maculatus", "Poeciliidés", "PEACEFUL"),
    ("Molly", "Poecilia sphenops", "Poeciliidés", "PEACEFUL"),
    ("Combattant", "Betta splendens", "Anabantidés", "AGGRESSIVE"),
    ("Gourami nain", "Trichogaster lalius", "Anabantidés", "PEACEFUL"),
    ("Corydoras panda", "Corydoras panda", "Callichthyidés", "PEACEFUL"),
    ("Corydoras poivré", "Corydoras paleatus", "Callichthyidés", "PEACEFUL"),
    ("Ancistrus", "Ancistrus cirrhosus", "Loricariidés", "PEACEFUL"),
    ("Scalaire", "Pterophyllum scalare", "Cichlidés", "SEMI_AGGRESSIVE"),
    ("Ramirezi", "Mikrogeophagus ramirezi", "Cichlidés", "PEACEFUL"),
    ("Discus", "Symphysodon discus", "Cichlidés", "PEACEFUL"),
    ("Danio rerio", "Danio rerio", "Cyprinidés", "PEACEFUL"),
]

CATEGORIES = [
    {"name": "Characidés", "description": "Poissons de banc paisibles originaires d'Amérique du Sud.", "incompatibleWith": ["Cichlidés"]},
    {"name": "Poeciliidés", "description": "Poissons vivipares robustes appréciant une eau neutre à dure.", "incompatibleWith": []},
    {"name": "Anabantidés", "description": "Poissons à labyrinthe territoriaux originaires d'Asie.", "incompatibleWith": []},
    {"name": "Callichthyidés", "description": "Poissons-chats cuirassés de fond vivant en groupe.", "incompatibleWith": []},
    {"name": "Loricariidés", "description": "Poissons-chats ventouses herbivores ou omnivores.", "incompatibleWith": []},
    {"name": "Cichlidés", "description": "Poissons territoriaux au comportement parental développé.", "incompatibleWith": ["Characidés"]},
    {"name": "Cyprinidés", "description": "Poissons actifs et nageurs originaires d'Asie.", "incompatibleWith": []},
]

HEADERS = {
    "User-Agent": "FishKeeperStudentProject/1.0 (contact@fishkeeper.fr)"
}


def fetch_wikipedia_fr(scientific_name: str) -> dict:
    """Récupère la description en français et l'image officielle via Wikipédia REST API."""
    formatted_title = scientific_name.replace(" ", "_")
    url = f"https://fr.wikipedia.org/api/rest_v1/page/summary/{formatted_title}"
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.status_code == 200:
            data = res.json()
            image_url = None
            if "originalimage" in data:
                image_url = data["originalimage"].get("source")
            elif "thumbnail" in data:
                image_url = data["thumbnail"].get("source")
            return {
                "description": data.get("extract"),
                "imageURL": image_url,
            }
    except requests.RequestException as e:
        print(f"Erreur Wikipédia pour {scientific_name}: {e}")
    return {"description": None, "imageURL": None}


def fetch_fishbase_data(scientific_names: list[str]) -> dict:
    """Interroge les tables Parquet FishBase via DuckDB pour extraire les paramètres biologiques."""
    con = duckdb.connect()
    names_sql = ", ".join([f"'{name}'" for name in scientific_names])

    query = f"""
        SELECT 
            s.Genus || ' ' || s.Species AS scientific_name,
            s.Length AS max_length,
            s.Fresh AS is_fresh,
            s.Brack AS is_brackish,
            s.Saltwater AS is_saltwater,
            e.TempMin AS min_temp,
            e.TempMax AS max_temp,
            e.pHMin AS min_ph,
            e.pHMax AS max_ph
        FROM read_parquet('https://fishbase.ropensci.org/fishbase/species.parquet') s
        LEFT JOIN read_parquet('https://fishbase.ropensci.org/fishbase/ecology.parquet') e
            ON s.SpecCode = e.SpecCode
        WHERE (s.Genus || ' ' || s.Species) IN ({names_sql})
    """
    rows = con.execute(query).fetchall()
    result = {}
    for row in rows:
        sci_name, length, fresh, brack, salt, t_min, t_max, ph_min, ph_max = row
        if sci_name not in result:
            result[sci_name] = {
                "maxLength": length,
                "isFresh": fresh,
                "isBrackish": brack,
                "isSaltwater": salt,
                "minTemperature": t_min,
                "maxTemperature": t_max,
                "minPh": ph_min,
                "maxPh": ph_max,
            }
    return result


def compute_aquarium_rules(fb: dict) -> dict:
    """Déduit les paramètres d'aquariophilie manquants dans FishBase (waterType, GH, KH, minVolume)."""
    min_ph = fb.get("minPh") or 6.5
    max_ph = fb.get("maxPh") or 7.5
    avg_ph = (min_ph + max_ph) / 2
    length = fb.get("maxLength") or 5.0

    # Déduction du type d'eau et dureté selon le pH et la salinité
    if fb.get("isSaltwater") == 1 and fb.get("isFresh") == 0:
        water_type, min_gh, max_gh, min_kh, max_kh = "MARINE", 15.0, 25.0, 7.0, 12.0
    elif fb.get("isBrackish") == 1 and fb.get("isFresh") == 0:
        water_type, min_gh, max_gh, min_kh, max_kh = "BRACKISH", 10.0, 20.0, 6.0, 10.0
    elif avg_ph < 6.8:
        water_type, min_gh, max_gh, min_kh, max_kh = "FRESH_SOFT", 2.0, 8.0, 1.0, 4.0
    else:
        water_type, min_gh, max_gh, min_kh, max_kh = "FRESH_HARD", 8.0, 18.0, 4.0, 10.0

    # Estimation du volume minimal selon la taille adulte (règle aquariophile standard)
    if length <= 4.5:
        min_volume = 54.0
    elif length <= 7.0:
        min_volume = 80.0
    elif length <= 12.0:
        min_volume = 120.0
    else:
        min_volume = 240.0

    return {
        "waterType": water_type,
        "minTemperature": round(fb.get("minTemperature") or 22.0, 1),
        "maxTemperature": round(fb.get("maxTemperature") or 27.0, 1),
        "minPh": round(min_ph, 1),
        "maxPh": round(max_ph, 1),
        "minGh": min_gh,
        "maxGh": max_gh,
        "minKh": min_kh,
        "maxKh": max_kh,
        "minVolume": min_volume,
    }


def main():
    sci_names = [item[1] for item in TARGET_SPECIES]
    print("Interrogation de FishBase (Parquet)...")
    fb_data = fetch_fishbase_data(sci_names)

    species_output = []
    for common_name, sci_name, category, aggressiveness in TARGET_SPECIES:
        print(f"Traitement de {common_name} ({sci_name})...")
        wiki = fetch_wikipedia_fr(sci_name)
        fb = fb_data.get(sci_name, {})
        rules = compute_aquarium_rules(fb)

        species_output.append({
            "name": common_name,
            "scientificName": sci_name,
            "categoryName": category,
            "description": wiki["description"],
            "imageURL": wiki["imageURL"],
            "aggressiveness": aggressiveness,
            **rules,
        })
        time.sleep(0.2)  # Respect du rate-limit Wikipédia

    output_dir = os.path.join("fishkeeper", "prisma", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "seed_fauna.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"categories": CATEGORIES, "species": species_output}, f, ensure_ascii=False, indent=2)

    print(f"Fichier généré avec succès : {output_path} ({len(species_output)} espèces)")


if __name__ == "__main__":
    main()