import json
import os
from datetime import datetime
import pandas as pd
import requests

REPO_ID = "cboettig/fishbase"
BASE_URL = f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/data/fb/v24.07/parquet"

CANDIDATE_TABLES = ["aquarium", "estimates", "stocks"]

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
    print(f"Table optionnelle {table_name}.parquet non disponible, passage au fallback.")
    return None

def get_climate_temp_range(env_temp: str | None, depth_deep: float | None, is_marine: bool) -> tuple[float, float]:
    """Déduit une plage thermique biologiquement fiable selon la zone climatique FishBase."""
    env = (env_temp or "").strip().lower()
    is_deep = depth_deep is not None and depth_deep > 200

    if is_deep:
        return (4.0, 12.0)
    if "tropical" in env and "sub" not in env:
        return (24.0, 28.0) if is_marine else (23.0, 28.0)
    if "subtropical" in env:
        return (18.0, 24.0)
    if "temperate" in env:
        return (10.0, 20.0)
    if "polar" in env or "boreal" in env:
        return (1.0, 8.0)
    # Défaut tempéré/subtropical prudent
    return (20.0, 25.0)

def refine_water_type(base_wt: str, min_temp: float, max_temp: float, min_ph: float, max_ph: float, min_gh: float, max_gh: float, demers_pelag: str | None) -> str:
    """Affine le EWaterType exact selon les paramètres physico-chimiques."""
    avg_gh = (min_gh + max_gh) / 2.0
    is_hard = avg_gh >= 10.0 or min_ph >= 7.2
    is_cold = max_temp <= 20.0

    if base_wt.startswith("MARINE"):
        # Répartition récifal (dure/alcaline) vs pleine eau
        if demers_pelag and "reef" in demers_pelag.lower():
            return "MARINE_HARD"
        return "MARINE_HARD" if is_hard else "MARINE_SOFT"

    if base_wt.startswith("BRACKISH"):
        return "BRACKISH_HARD" if is_hard else "BRACKISH_SOFT"

    # Eau douce
    if max_ph <= 6.2 and avg_gh <= 5.0 and not is_cold:
        return "BLACKWATER_SOFT"
    if is_cold:
        return "COLD_FRESH_HARD" if is_hard else "COLD_FRESH_SOFT"
    return "FRESH_HARD" if is_hard else "FRESH_SOFT"

def main():
    input_file = "data/02_names_enriched.json"
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    species_list = data["species"]
    print(f"Chargement de {len(species_list)} espèces depuis {input_file}...")

    # Chargement des tables locales + tables complémentaires FishBase
    df_species = pd.read_parquet("data/raw_parquet/species.parquet")
    df_aq = try_load_parquet("aquarium")
    df_est = try_load_parquet("estimates")
    df_stocks = try_load_parquet("stocks")

    # Indexation rapide par SpecCode
    sp_lookup = df_species.drop_duplicates(subset=["SpecCode"]).set_index("SpecCode").to_dict(orient="index")
    aq_lookup = df_aq.drop_duplicates(subset=["SpecCode"]).set_index("SpecCode").to_dict(orient="index") if df_aq is not None and "SpecCode" in df_aq.columns else {}
    est_lookup = df_est.drop_duplicates(subset=["SpecCode"]).set_index("SpecCode").to_dict(orient="index") if df_est is not None and "SpecCode" in df_est.columns else {}
    stocks_lookup = df_stocks.drop_duplicates(subset=["SpecCode"]).set_index("SpecCode").to_dict(orient="index") if df_stocks is not None and "SpecCode" in df_stocks.columns else {}

    exact_temp_count = 0
    exact_ph_count = 0
    exact_gh_count = 0

    for sp in species_list:
        code = sp["specCode"]
        raw_sp = sp_lookup.get(code, {})
        raw_aq = aq_lookup.get(code, {})
        raw_est = est_lookup.get(code, {})
        raw_st = stocks_lookup.get(code, {})

        base_wt = sp.get("waterType") or "FRESH_SOFT"
        is_marine = base_wt.startswith("MARINE")
        is_brackish = base_wt.startswith("BRACKISH")

        # 1. TEMPÉRATURE (Priorité : aquarium -> stocks -> estimates -> zone climatique)
        t_min = raw_aq.get("TempMin") or raw_st.get("TempMin") or raw_est.get("TempMin")
        t_max = raw_aq.get("TempMax") or raw_st.get("TempMax") or raw_est.get("TempMax")

        if pd.notna(t_min) and pd.notna(t_max) and 0 <= float(t_min) <= float(t_max) <= 45:
            min_temp = round(float(t_min), 1)
            max_temp = round(float(t_max), 1)
            exact_temp_count += 1
        else:
            env_temp = raw_st.get("EnvTemp") or raw_sp.get("EnvTemp")
            depth_deep = float(raw_sp["DepthRangeDeep"]) if pd.notna(raw_sp.get("DepthRangeDeep")) else None
            min_temp, max_temp = get_climate_temp_range(str(env_temp) if pd.notna(env_temp) else None, depth_deep, is_marine)

        # 2. pH (Priorité : aquarium -> stocks -> milieu biologique)
        ph_min_raw = raw_aq.get("pHMin") or raw_st.get("pHMin")
        ph_max_raw = raw_aq.get("pHMax") or raw_st.get("pHMax")

        if pd.notna(ph_min_raw) and pd.notna(ph_max_raw) and 3.5 <= float(ph_min_raw) <= float(ph_max_raw) <= 10.0:
            min_ph = round(float(ph_min_raw), 1)
            max_ph = round(float(ph_max_raw), 1)
            exact_ph_count += 1
        else:
            if is_marine:
                min_ph, max_ph = 8.0, 8.4
            elif is_brackish:
                min_ph, max_ph = 7.4, 8.2
            else:
                # Eau douce : ajustement selon la famille (ex: Cichlidae africains vs Characidae)
                cat_lower = sp["categoryName"].lower()
                if any(k in cat_lower for k in ["cichlidae", "poeciliidae", "melanotaeniidae", "goodeidae"]):
                    min_ph, max_ph = 7.0, 8.0
                elif any(k in cat_lower for k in ["characidae", "loricariidae", "callichthyidae", "osphronemidae", "cyprinidae"]):
                    min_ph, max_ph = 6.0, 7.2
                else:
                    min_ph, max_ph = 6.5, 7.5

        # 3. GH (Dureté totale °dGH)
        gh_min_raw = raw_aq.get("dHMin") or raw_st.get("dHMin")
        gh_max_raw = raw_aq.get("dHMax") or raw_st.get("dHMax")

        if pd.notna(gh_min_raw) and pd.notna(gh_max_raw) and 0 <= float(gh_min_raw) <= float(gh_max_raw) <= 40.0:
            min_gh = round(float(gh_min_raw), 1)
            max_gh = round(float(gh_max_raw), 1)
            exact_gh_count += 1
        else:
            if is_marine:
                min_gh, max_gh = 14.0, 18.0
            elif is_brackish:
                min_gh, max_gh = 10.0, 16.0
            else:
                # Corrélation physico-chimique naturelle pH <-> GH en eau douce
                if max_ph <= 6.5:
                    min_gh, max_gh = 2.0, 6.0
                elif min_ph >= 7.2:
                    min_gh, max_gh = 10.0, 18.0
                else:
                    min_gh, max_gh = 5.0, 12.0

        # 4. KH (Dureté carbonatée °dKH) déduite chimiquement du GH et du pH
        if is_marine:
            min_kh, max_kh = 7.0, 11.0
        elif is_brackish:
            min_kh, max_kh = 6.0, 10.0
        else:
            ratio = 0.45 if max_ph <= 6.5 else 0.70
            min_kh = round(max(1.0, min_gh * ratio), 1)
            max_kh = round(max(min_kh + 1.0, max_gh * ratio), 1)

        # Mise à jour des champs de l'espèce
        sp["minTemperature"] = min_temp
        sp["maxTemperature"] = max_temp
        sp["minPh"] = min_ph
        sp["maxPh"] = max_ph
        sp["minGh"] = min_gh
        sp["maxGh"] = max_gh
        sp["minKh"] = min_kh
        sp["maxKh"] = max_kh

        demers_pelag = sp.get("_meta", {}).get("demersPelag")
        sp["waterType"] = refine_water_type(base_wt, min_temp, max_temp, min_ph, max_ph, min_gh, max_gh, demers_pelag)

    output_file = "data/03_water_params.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mise à jour du journal de traçabilité
    with open("data/pipeline_log.json", "r", encoding="utf-8") as f:
        logs = json.load(f)

    logs.append({
        "step": 3,
        "script": "03_enrich_water_params.py",
        "timestamp": datetime.now().isoformat(),
        "sources": [
            "FishBase v24.07 (species.parquet, aquarium/stocks/estimates)",
            "Modèle biogéographique climatique & équilibre carbonaté pH/GH/KH"
        ],
        "stats": {
            "total_species": len(species_list),
            "exact_fishbase_temp": exact_temp_count,
            "exact_fishbase_ph": exact_ph_count,
            "exact_fishbase_gh": exact_gh_count,
            "coverage_temp_ph_gh_kh": "100% (0 null)",
        }
    })

    with open("data/pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"\n--- ÉTAPE 3 TERMINÉE ---")
    print(f"Températures exactes FishBase : {exact_temp_count} | Complétées via climat/profondeur : {len(species_list) - exact_temp_count}")
    print(f"pH exacts FishBase : {exact_ph_count} | Complétés via taxonomie/biotope : {len(species_list) - exact_ph_count}")
    print(f"Taux de complétion Temp / pH / GH / KH : 100 %")
    print(f"Fichier sauvegardé : {output_file}")

if __name__ == "__main__":
    main()