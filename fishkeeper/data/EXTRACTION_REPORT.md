# Fiche de Traçabilité & Extraction des Données — FishKeeper

**Date de génération :** 18/11/2026 à 18:12  
**Fichier final prêt pour Prisma :** `data/05_final_seed.json`  
**Volume total :** **35731 espèces** réparties dans **625 catégories taxonomiques distinctes**.

---

## 1. Architecture du Pipeline ETL

Chaque étape du pipeline a généré un fichier intermédiaire immuable afin de garantir la reproductibilité, l'auditabilité et l'absence d'écrasement de données :

| Étape | Script Python | Artefact généré | Rôle & Sources de données |
| :--- | :--- | :--- | :--- |
| **1** | `scripts/01_extract_fishbase_base.py` | `data/01_base_species.json` | Extraction des espèces valides, familles zoologiques (`SpeciesCategory`), milieux de vie et photos officielles depuis **FishBase v24.07** (`species.parquet`, `families.parquet`, `ecology.parquet`). |
| **2** | `scripts/02_enrich_names_descriptions.py` | `data/02_names_enriched.json` | Attribution des noms vernaculaires français officiels (**FishBase `comnames.parquet`**) et enrichissement des descriptions FR et images Wikimedia Commons via **Wikidata SPARQL API**. |
| **3** | `scripts/03_enrich_water_params.py` | `data/03_water_params.json` | Extraction des paramètres mesurés (**FishBase `aquarium.parquet` & `stocks.parquet`**) et complétion biogéographique/climatique (Température, pH, GH, KH et `EWaterType`). |
| **4** | `scripts/04_enrich_behavior_volume.py` | `data/04_aquarium_specs.json` | Détermination du tempérament (`EAggressiveness`) via les régimes alimentaires (**FishBase `fooditems.parquet`**) et le niveau trophique, calcul du volume minimal (`minVolume`) et des incompatibilités entre familles. |
| **5** | `scripts/05_validate_and_report.py` | `data/05_final_seed.json` | Suppression des métadonnées temporaires, contrôle d'unicité (`@unique` Prisma), validation des plages (`min <= max`) et génération du présent rapport. |

---

## 2. Taux de Complétion du Jeu de Données Final

| Champ Prisma (`Species`) | Valeurs renseignées | Valeurs `null` | Taux de complétion |
| :--- | :---: | :---: | :---: |
| `name` | 35731 | 0 | **100.0 %** |
| `scientificName` | 35731 | 0 | **100.0 %** |
| `categoryName` | 35731 | 0 | **100.0 %** |
| `description` | 33683 | 2048 | **94.27 %** |
| `imageURL` | 22512 | 13219 | **63.0 %** |
| `waterType` | 35731 | 0 | **100.0 %** |
| `minTemperature` | 35731 | 0 | **100.0 %** |
| `maxTemperature` | 35731 | 0 | **100.0 %** |
| `minPh` | 35731 | 0 | **100.0 %** |
| `maxPh` | 35731 | 0 | **100.0 %** |
| `minGh` | 35731 | 0 | **100.0 %** |
| `maxGh` | 35731 | 0 | **100.0 %** |
| `minKh` | 35731 | 0 | **100.0 %** |
| `maxKh` | 35731 | 0 | **100.0 %** |
| `minVolume` | 35731 | 0 | **100.0 %** |
| `aggressiveness` | 35731 | 0 | **100.0 %** |

---

## 3. Journal d'Exécution Détaillé

### Étape 1 — `01_extract_fishbase_base.py`
- **Horodatage :** `2026-11-18T17:44:47.335221`
- **Sources :** FishBase v24.07 (species.parquet), FishBase v24.07 (families.parquet), FishBase v24.07 (ecology.parquet)
- **total_categories :** `625`
- **total_species :** `35731`
- **with_image :** `20954`
- **with_description :** `23079`

### Étape 2 — `02_enrich_names_descriptions.py`
- **Horodatage :** `2026-11-18T18:01:40.160713`
- **Sources :** FishBase v24.07 (comnames.parquet), Wikidata SPARQL Endpoint (labels FR, descriptions FR, P18 images)
- **total_species :** `35731`
- **french_names_applied :** `5120`
- **descriptions_enriched :** `30509`
- **images_added_from_wikidata :** `1558`
- **total_with_image :** `22512`
- **total_with_description :** `33683`

### Étape 3 — `03_enrich_water_params.py`
- **Horodatage :** `2026-11-18T18:09:31.869458`
- **Sources :** FishBase v24.07 (species.parquet, aquarium/stocks/estimates), Modèle biogéographique climatique & équilibre carbonaté pH/GH/KH
- **total_species :** `35731`
- **exact_fishbase_temp :** `3854`
- **exact_fishbase_ph :** `1890`
- **exact_fishbase_gh :** `1031`
- **coverage_temp_ph_gh_kh :** `100% (0 null)`

### Étape 4 — `04_enrich_behavior_volume.py`
- **Horodatage :** `2026-11-18T18:11:06.884681`
- **Sources :** FishBase v24.07 (fooditems.parquet, ecology.parquet), Modèle d'allométrie aquariophile (taille adulte, zone de nage DemersPelag, niveau trophique)
- **total_species :** `35731`
- **aggressiveness_distribution :** `{'PEACEFUL': 26748, 'SEMI_AGGRESSIVE': 1618, 'AGGRESSIVE': 3935, 'TERRITORIAL': 3430}`
- **category_incompatibility_rules :** `11`
- **coverage_behavior_and_volume :** `100% (0 null)`

### Étape 5 — `05_validate_and_report.py`
- **Horodatage :** `2026-11-18T18:12:40.023822`
- **Sources :** Assertions d'intégrité Prisma (schema_2.prisma), Validation des Enums TypeScript (EWaterType, EAggressiveness)
- **final_categories :** `625`
- **final_species :** `35731`
- **anomalies_fixed :** `0`
