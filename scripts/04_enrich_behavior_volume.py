import json
import os
from datetime import datetime
import pandas as pd
import requests

REPO_ID = "cboettig/fishbase"
BASE_URL = f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/data/fb/v24.07/parquet"

def try_load_parquet(table_name: str) -> pd.DataFrame | None:
    local_path = f"data/raw_parquet/{table_name}.parquet"
    if os.path.exists(local_path):
        print(f"Chargement local de {table_name}.parquet...")
        return pd.read_parquet(local_path)

    url = f"{BASE_URL}/{table_name}.parquet"
    try:
        r = requests.head(url, allow_redirects=True, timeout=10)
        if r.status_code == 200:
            print(f"Téléchargement de {table_name}.parquet depuis FishBase...")
            df = pd.read_parquet(url)
            df.to_parquet(local_path)
            return df
    except Exception:
        pass
    return None

STANDARD_VOLUMES = [
    20, 30, 40, 54, 60, 80, 100, 120, 150, 180, 200, 240, 300,
    350, 400, 450, 500, 600, 720, 800, 1000, 1200, 1500, 2000, 3000, 5000
]

def snap_to_standard_volume(raw_liters: float) -> float:
    for v in STANDARD_VOLUMES:
        if raw_liters <= v:
            return float(v)
    return float(round(raw_liters / 500) * 500)

def compute_aggressiveness(sp: dict, eats_fish: bool) -> str:
    """Détermine EAggressiveness : PEACEFUL, SEMI_AGGRESSIVE, AGGRESSIVE, TERRITORIAL."""
    meta = sp.get("_meta", {})
    troph = meta.get("troph")
    length = meta.get("lengthCm") or 10.0
    cat = sp["categoryName"].lower()

    # 1. Prédateurs avérés ou grands carnivores piscivores
    predator_families = [
        "carcharhinidae", "sphyrnidae", "lamnidae", "muraenidae", "esocidae",
        "channidae", "erythrinidae", "serrasalmidae", "scorpaenidae", "antennariidae",
        "synodontidae", "belonidae", "lepisosteidae", "amiidae", "polypteridae"
    ]
    if any(f in cat for f in predator_families):
        return "AGGRESSIVE"
    if eats_fish and length >= 15.0:
        return "AGGRESSIVE"
    if troph is not None and troph >= 4.0 and length >= 18.0:
        return "AGGRESSIVE"

    # 2. Espèces territoriales (cichlidés, demoiselles, labyrinthidés, poissons-chats territoriaux)
    territorial_families = [
        "cichlidae", "pomacentridae", "osphronemidae", "blenniidae",
        "acanthuridae", "balistidae", "chaetodontidae", "pomacanthidae", "labridae"
    ]
    if any(f in cat for f in territorial_families):
        # Les petits cichlidés nains ou petits labres restent territoriaux mais modérés
        if length >= 25.0 and (troph is not None and troph >= 3.6):
            return "AGGRESSIVE"
        return "TERRITORIAL"

    # 3. Semi-agressifs (grands omnivores, poissons-globes, grands barbus/tétras actifs)
    semi_families = [
        "tetraodontidae", "monodactylidae", "scatophagidae", "toxotidae",
        "terapontidae", "botiidae", "mastacembelidae", "pimelodidae", "bagridae"
    ]
    if any(f in cat for f in semi_families):
        return "SEMI_AGGRESSIVE"
    if troph is not None and 3.4 <= troph < 4.0 and length >= 12.0:
        return "SEMI_AGGRESSIVE"

    # 4. Pacifiques (poissons de banc, herbivores, micro-prédateurs calmes)
    return "PEACEFUL"

def compute_min_volume(sp: dict, aggressiveness: str) -> float:
    """Calcule un volume minimal cohérent en litres selon la taille adulte, le comportement et la nage."""
    meta = sp.get("_meta", {})
    length = meta.get("lengthCm")
    demers_pelag = (meta.get("demersPelag") or "").lower()
    is_marine = sp.get("waterType", "").startswith("MARINE")

    # Estimation de taille par défaut si inconnue dans FishBase
    if length is None or length <= 0:
        length = 12.0 if is_marine else 8.0

    # Règle aquariophile progressive selon la taille adulte (en cm)
    if length <= 3.5:
        raw_vol = 20.0
    elif length <= 5.0:
        raw_vol = 40.0
    elif length <= 7.5:
        raw_vol = 60.0
    elif length <= 10.0:
        raw_vol = 100.0
    elif length <= 15.0:
        raw_vol = 180.0
    elif length <= 22.0:
        raw_vol = 300.0
    elif length <= 30.0:
        raw_vol = 450.0
    elif length <= 50.0:
        raw_vol = 800.0
    elif length <= 80.0:
        raw_vol = 1500.0
    else:
        raw_vol = length * 25.0

    # Multiplicateur de nage (les poissons pélagiques actifs demandent plus de longueur de nage)
    if "pelagic" in demers_pelag:
        raw_vol *= 1.35
    elif "benthopelagic" in demers_pelag:
        raw_vol *= 1.15

    # Multiplicateur comportemental et milieu marin
    if aggressiveness == "AGGRESSIVE":
        raw_vol *= 1.4
    elif aggressiveness == "TERRITORIAL":
        raw_vol *= 1.2

    if is_marine:
        raw_vol = max(raw_vol * 1.25, 60.0)

    return snap_to_standard_volume(raw_vol)

def build_category_incompatibilities(categories: list[dict]) -> list[dict]:
    """Construit les paires d'incompatibilités logiques entre familles pour SpeciesCategory."""
    predator_keywords = ["carcharhinidae", "muraenidae", "esocidae", "channidae", "serrasalmidae", "scorpaenidae", "lepisosteidae"]
    small_prey_keywords = ["characidae", "poeciliidae", "cyprinidae", "danionidae", "atherinidae", "gobiidae", "callichthyidae"]

    pred_cats = [c["name"] for c in categories if any(k in c["name"].lower() for k in predator_keywords)]
    prey_cats = [c["name"] for c in categories if any(k in c["name"].lower() for k in small_prey_keywords)]

    incompatibilities = []
    for p in pred_cats:
        incompatibilities.append({
            "categoryName": p,
            "incompatibleWith": prey_cats
        })
    return incompatibilities

def main():
    input_file = "data/03_water_params.json"
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    species_list = data["species"]
    categories_list = data["categories"]
    print(f"Chargement de {len(species_list)} espèces depuis {input_file}...")

    # Chargement optionnel de fooditems.parquet pour détecter les piscivores
    df_food = try_load_parquet("fooditems")
    piscivore_codes = set()
    if df_food is not None and "SpecCode" in df_food.columns:
        food_cols = [c for c in ["FoodI", "FoodII", "FoodIII"] if c in df_food.columns]
        for col in food_cols:
            matches = df_food[df_food[col].astype(str).str.lower().str.contains("finfish|nekton", na=False)]
            piscivore_codes.update(matches["SpecCode"].dropna().astype(int).tolist())
    print(f"Espèces identifiées comme piscivores via FishBase fooditems : {len(piscivore_codes)}")

    agg_counts = {"PEACEFUL": 0, "SEMI_AGGRESSIVE": 0, "AGGRESSIVE": 0, "TERRITORIAL": 0}

    for sp in species_list:
        eats_fish = sp["specCode"] in piscivore_codes
        agg = compute_aggressiveness(sp, eats_fish)
        vol = compute_min_volume(sp, agg)

        sp["aggressiveness"] = agg
        sp["minVolume"] = vol
        agg_counts[agg] += 1

    # Ajout des incompatibilités entre catégories
    data["categoryIncompatibilities"] = build_category_incompatibilities(categories_list)

    output_file = "data/04_aquarium_specs.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mise à jour du journal de traçabilité
    with open("data/pipeline_log.json", "r", encoding="utf-8") as f:
        logs = json.load(f)

    logs.append({
        "step": 4,
        "script": "04_enrich_behavior_volume.py",
        "timestamp": datetime.now().isoformat(),
        "sources": [
            "FishBase v24.07 (fooditems.parquet, ecology.parquet)",
            "Modèle d'allométrie aquariophile (taille adulte, zone de nage DemersPelag, niveau trophique)"
        ],
        "stats": {
            "total_species": len(species_list),
            "aggressiveness_distribution": agg_counts,
            "category_incompatibility_rules": len(data["categoryIncompatibilities"]),
            "coverage_behavior_and_volume": "100% (0 null)",
        }
    })

    with open("data/pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"\n--- ÉTAPE 4 TERMINÉE ---")
    print(f"Répartition comportementale : {agg_counts}")
    print(f"Règles d'incompatibilité entre catégories générées : {len(data['categoryIncompatibilities'])}")
    print(f"Fichier sauvegardé : {output_file}")

if __name__ == "__main__":
    main()