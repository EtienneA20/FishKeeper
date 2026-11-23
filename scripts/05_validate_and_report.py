import json
import os
from datetime import datetime

VALID_WATER_TYPES = {
    "FRESH_SOFT", "FRESH_HARD", "BRACKISH_SOFT", "BRACKISH_HARD",
    "MARINE_SOFT", "MARINE_HARD", "RO_SOFT", "RO_HARD",
    "DI_SOFT", "DI_HARD", "BLACKWATER_SOFT", "BLACKWATER_HARD",
    "COLD_FRESH_SOFT", "COLD_FRESH_HARD", "HYPER_SALINE_SOFT", "HYPER_SALINE_HARD"
}

VALID_AGGRESSIVENESS = {
    "PEACEFUL", "SEMI_AGGRESSIVE", "AGGRESSIVE", "TERRITORIAL"
}

def sanitize_range(min_val: float | None, max_val: float | None, hard_min: float, hard_max: float) -> tuple[float | None, float | None]:
    if min_val is None or max_val is None:
        return min_val, max_val
    lo = max(hard_min, min(hard_max, float(min_val)))
    hi = max(hard_min, min(hard_max, float(max_val)))
    if lo > hi:
        lo, hi = hi, lo
    return round(lo, 1), round(hi, 1)

def main():
    input_file = "data/04_aquarium_specs.json"
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    raw_categories = data.get("categories", [])
    raw_species = data.get("species", [])
    raw_incompatibilities = data.get("categoryIncompatibilities", [])

    print(f"Validation et nettoyage final de {len(raw_species)} espèces et {len(raw_categories)} catégories...")

    # 1. Dédoublonnage et validation des catégories
    clean_categories = []
    seen_cat_names = set()
    for cat in sorted(raw_categories, key=lambda c: c["name"].lower()):
        cname = str(cat["name"]).strip()
        if not cname or cname.lower() in seen_cat_names:
            continue
        seen_cat_names.add(cname.lower())
        clean_categories.append({
            "name": cname,
            "description": str(cat["description"]).strip() if cat.get("description") else None
        })

    valid_cat_set = {c["name"] for c in clean_categories}

    # 2. Nettoyage strict des espèces (suppression de specCode et _meta)
    clean_species = []
    seen_sp_names = set()
    anomalies_fixed = 0

    for sp in sorted(raw_species, key=lambda s: s["name"].lower()):
        name = str(sp["name"]).strip()
        sci_name = str(sp["scientificName"]).strip() if sp.get("scientificName") else None
        # Une espèce peut appartenir à plusieurs catégories (relation many-to-many Prisma)
        raw_cat_names = sp.get("categoryNames") or [sp["categoryName"]]
        cat_names = list(dict.fromkeys(str(c).strip() for c in raw_cat_names if str(c).strip()))

        if not cat_names:
            raise ValueError(f"Aucune catégorie pour l'espèce {name}")
        for cat_name in cat_names:
            if cat_name not in valid_cat_set:
                raise ValueError(f"Catégorie introuvable pour l'espèce {name} : {cat_name}")

        # Sécurité @unique Prisma
        if name.lower() in seen_sp_names:
            name = f"{name} ({sci_name})"
            anomalies_fixed += 1
        seen_sp_names.add(name.lower())

        # Validation des enums TypeScript
        wt = sp.get("waterType")
        if wt not in VALID_WATER_TYPES:
            wt = "FRESH_SOFT"
            anomalies_fixed += 1

        agg = sp.get("aggressiveness")
        if agg not in VALID_AGGRESSIVENESS:
            agg = "PEACEFUL"
            anomalies_fixed += 1

        # Validation stricte des plages numériques (min <= max et bornes physiques)
        min_t, max_t = sanitize_range(sp.get("minTemperature"), sp.get("maxTemperature"), 0.0, 42.0)
        min_ph, max_ph = sanitize_range(sp.get("minPh"), sp.get("maxPh"), 3.5, 10.0)
        min_gh, max_gh = sanitize_range(sp.get("minGh"), sp.get("maxGh"), 0.0, 40.0)
        min_kh, max_kh = sanitize_range(sp.get("minKh"), sp.get("maxKh"), 0.0, 30.0)

        min_vol = sp.get("minVolume")
        if min_vol is not None:
            min_vol = float(max(10.0, min_vol))

        clean_species.append({
            "name": name,
            "scientificName": sci_name,
            "categoryNames": cat_names,
            "description": str(sp["description"]).strip() if sp.get("description") else None,
            "imageURL": str(sp["imageURL"]).strip() if sp.get("imageURL") else None,
            "waterType": wt,
            "minTemperature": min_t,
            "maxTemperature": max_t,
            "minPh": min_ph,
            "maxPh": max_ph,
            "minGh": min_gh,
            "maxGh": max_gh,
            "minKh": min_kh,
            "maxKh": max_kh,
            "minVolume": min_vol,
            "aggressiveness": agg
        })

    # Nettoyage des règles d'incompatibilité.
    # La relation est symétrique : chaque paire est normalisée (nom le plus petit en source)
    # pour n'être stockée qu'une fois, et toutes les règles d'une même source sont fusionnées
    # (le seed fait un `set` par règle : deux règles pour une même source s'écraseraient).
    incompatibility_pairs = set()
    for inc in raw_incompatibilities:
        source = inc["categoryName"]
        if source not in valid_cat_set:
            continue
        for target in inc.get("incompatibleWith", []):
            if target in valid_cat_set and target != source:
                incompatibility_pairs.add((min(source, target), max(source, target)))

    targets_by_source = {}
    for source, target in sorted(incompatibility_pairs):
        targets_by_source.setdefault(source, []).append(target)

    clean_incompatibilities = [
        {"categoryName": source, "incompatibleWith": targets}
        for source, targets in targets_by_source.items()
    ]

    final_payload = {
        "metadata": {
            "project": "FishKeeper",
            "generatedAt": datetime.now().isoformat(),
            "totalCategories": len(clean_categories),
            "totalSpecies": len(clean_species),
            "totalIncompatibilityRules": len(clean_incompatibilities),
            "totalIncompatibilityPairs": len(incompatibility_pairs)
        },
        "categories": clean_categories,
        "categoryIncompatibilities": clean_incompatibilities,
        "species": clean_species
    }

    final_json_path = "data/05_final_seed.json"
    with open(final_json_path, "w", encoding="utf-8") as f:
        json.dump(final_payload, f, ensure_ascii=False, indent=2)

    # 3. Calcul des taux de complétion finaux par colonne
    total = len(clean_species)
    fields_to_audit = [
        "name", "scientificName", "categoryNames", "description", "imageURL",
        "waterType", "minTemperature", "maxTemperature", "minPh", "maxPh",
        "minGh", "maxGh", "minKh", "maxKh", "minVolume", "aggressiveness"
    ]
    completeness = {}
    for field in fields_to_audit:
        filled = sum(1 for s in clean_species if s.get(field) not in (None, "", []))
        completeness[field] = {
            "filled": filled,
            "nulls": total - filled,
            "percent": round((filled / total) * 100, 2) if total > 0 else 0
        }

    # Mise à jour du journal de traçabilité
    with open("data/pipeline_log.json", "r", encoding="utf-8") as f:
        logs = json.load(f)

    # Une ré-exécution remplace l'entrée précédente de l'étape au lieu de la dupliquer
    logs = [entry for entry in logs if entry["step"] != 5]
    logs.append({
        "step": 5,
        "script": "05_validate_and_report.py",
        "timestamp": datetime.now().isoformat(),
        "sources": [
            "Assertions d'intégrité Prisma (schema_2.prisma)",
            "Validation des Enums TypeScript (EWaterType, EAggressiveness)"
        ],
        "stats": {
            "final_categories": len(clean_categories),
            "final_species": len(clean_species),
            "anomalies_fixed": anomalies_fixed,
            "final_incompatibility_pairs": len(incompatibility_pairs),
            "field_completeness": completeness
        }
    })

    with open("data/pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    # 4. Génération de la fiche d'extraction Markdown (EXTRACTION_REPORT.md)
    report_lines = [
        "# Fiche de Traçabilité & Extraction des Données — FishKeeper",
        "",
        f"**Date de génération :** {datetime.now().strftime('%d/%m/%Y à %H:%M')}  ",
        f"**Fichier final prêt pour Prisma :** `{final_json_path}`  ",
        f"**Volume total :** **{len(clean_species)} espèces** réparties dans **{len(clean_categories)} catégories taxonomiques distinctes**, avec **{len(incompatibility_pairs)} paires d'incompatibilité** entre catégories.",
        "",
        "---",
        "",
        "## 1. Architecture du Pipeline ETL",
        "",
        "Chaque étape du pipeline a généré un fichier intermédiaire immuable afin de garantir la reproductibilité, l'auditabilité et l'absence d'écrasement de données :",
        "",
        "| Étape | Script Python | Artefact généré | Rôle & Sources de données |",
        "| :--- | :--- | :--- | :--- |",
        "| **1** | `scripts/01_extract_fishbase_base.py` | `data/01_base_species.json` | Extraction des espèces valides, familles zoologiques (`SpeciesCategory`), milieux de vie et photos officielles depuis **FishBase v24.07** (`species.parquet`, `families.parquet`, `ecology.parquet`). |",
        "| **2** | `scripts/02_enrich_names_descriptions.py` | `data/02_names_enriched.json` | Attribution des noms vernaculaires français officiels (**FishBase `comnames.parquet`**) et enrichissement des descriptions FR et images Wikimedia Commons via **Wikidata SPARQL API**. |",
        "| **3** | `scripts/03_enrich_water_params.py` | `data/03_water_params.json` | Extraction des paramètres mesurés (**FishBase `aquarium.parquet` & `stocks.parquet`**) et complétion biogéographique/climatique (Température, pH, GH, KH et `EWaterType`). |",
        "| **4** | `scripts/04_enrich_behavior_volume.py` | `data/04_aquarium_specs.json` | Détermination du tempérament (`EAggressiveness`) via les régimes alimentaires (**FishBase `fooditems.parquet`**) et le niveau trophique, calcul du volume minimal (`minVolume`) et des incompatibilités entre familles. |",
        "| **5** | `scripts/05_validate_and_report.py` | `data/05_final_seed.json` | Suppression des métadonnées temporaires, contrôle d'unicité (`@unique` Prisma), validation des plages (`min <= max`) et génération du présent rapport. |",
        "",
        "---",
        "",
        "## 2. Taux de Complétion du Jeu de Données Final",
        "",
        "| Champ Prisma (`Species`) | Valeurs renseignées | Valeurs `null` | Taux de complétion |",
        "| :--- | :---: | :---: | :---: |"
    ]

    for field, stat in completeness.items():
        report_lines.append(f"| `{field}` | {stat['filled']} | {stat['nulls']} | **{stat['percent']} %** |")

    report_lines.extend([
        "",
        "---",
        "",
        "## 3. Journal d'Exécution Détaillé",
        ""
    ])

    for entry in logs:
        report_lines.append(f"### Étape {entry['step']} — `{entry['script']}`")
        report_lines.append(f"- **Horodatage :** `{entry['timestamp']}`")
        report_lines.append(f"- **Sources :** {', '.join(entry['sources'])}")
        for k, v in entry["stats"].items():
            if k != "field_completeness":
                report_lines.append(f"- **{k} :** `{v}`")
        report_lines.append("")

    report_path = "data/EXTRACTION_REPORT.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"\n--- ÉTAPE 5 TERMINÉE AVEC SUCCÈS ---")
    print(f"Catégories finales validées : {len(clean_categories)}")
    print(f"Espèces finales validées : {len(clean_species)}")
    print(f"Anomalies corrigées automatiquement : {anomalies_fixed}")
    print(f"Dataset final Prisma : {final_json_path}")
    print(f"Fiche de traçabilité générée : {report_path}")

if __name__ == "__main__":
    main()