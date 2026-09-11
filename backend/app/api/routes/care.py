"""
Care & Environmental Skincare Advisor Router:
Provides live UV index assessments, Fitzpatrick skin type protection guidelines,
and condition-specific climate advisories.
"""
import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/v1/care", tags=["Care Advisor"])

FITZPATRICK_MAP = {
    "I": {"name": "Type I - Very Fair", "spf": "SPF 50+", "burn_min": 10, "desc": "Always burns easily, never tans."},
    "II": {"name": "Type II - Fair", "spf": "SPF 50", "burn_min": 15, "desc": "Burns easily, tans minimally."},
    "III": {"name": "Type III - Medium", "spf": "SPF 30-50", "burn_min": 25, "desc": "Burns moderately, tans gradually."},
    "IV": {"name": "Type IV - Olive", "spf": "SPF 30", "burn_min": 40, "desc": "Burns minimally, tans easily."},
    "V": {"name": "Type V - Dark Brown", "spf": "SPF 30", "burn_min": 60, "desc": "Rarely burns, tans profusely."},
    "VI": {"name": "Type VI - Deep Black", "spf": "SPF 15-30", "burn_min": 90, "desc": "Never burns, deeply pigmented."}
}

CONDITION_ADVICES = {
    "Eczema": "Low ambient humidity can trigger flare-ups. Apply lipid-rich barrier creams every 4 hours. Use mineral-based zinc oxide sunscreens.",
    "Acne": "High heat and humidity increase sebum production. Use oil-free, non-comedogenic gel sunscreens.",
    "Psoriasis": "Controlled, brief sun exposure (10-15 mins) can be beneficial, but avoid severe sunburns which cause Koebner phenomenon flares.",
    "Melanoma": "STRICT UV AVOIDANCE: Broad-spectrum SPF 50+ is mandatory. Wear protective UPF 50+ clothing and wide-brim hats outdoor.",
    "Basal_Cell_Carcinoma": "Strict sun protection required. Reapply water-resistant SPF 50+ every 2 hours and avoid solar peak hours (10 AM - 4 PM).",
    "Atopic_Dermatitis": "Sweat can irritate inflamed patches. Rinse skin with lukewarm water post-outdoor activity and apply ceramide moisturizer.",
    "Tinea_Fungal_Infections": "Fungal micro-organisms thrive in warm, damp environments. Keep skin folds dry and wear breathable cotton clothing.",
    "General": "Maintain daily hydration (2.5L+ water), wear sunglasses, and reapply sunscreen every 2 hours when outdoors."
}

@router.get("/uv-advisor")
async def get_uv_advisor(
    lat: float = Query(23.0225, description="Latitude"),
    lon: float = Query(72.5619, description="Longitude"),
    skin_type: str = Query("III", description="Fitzpatrick Skin Type (I-VI)"),
    condition: Optional[str] = Query(None, description="Current skin condition key")
):
    # Calculate simulated live UV Index based on solar altitude angle & time of day
    now = datetime.now()
    hour = now.hour + (now.minute / 60.0)
    
    # Solar peak between 6 AM and 6 PM
    if 6.0 <= hour <= 18.0:
        solar_factor = math.sin((hour - 6.0) / 12.0 * math.pi)
        base_uv = round(solar_factor * 9.5, 1)
    else:
        base_uv = 0.0
    
    uv_index = max(0.0, base_uv)
    
    if uv_index <= 2.0:
        uv_category = "Low"
        uv_color = "emerald"
    elif uv_index <= 5.0:
        uv_category = "Moderate"
        uv_color = "amber"
    elif uv_index <= 7.0:
        uv_category = "High"
        uv_color = "orange"
    elif uv_index <= 10.0:
        uv_category = "Very High"
        uv_color = "rose"
    else:
        uv_category = "Extreme"
        uv_color = "purple"

    fitz = FITZPATRICK_MAP.get(skin_type.upper(), FITZPATRICK_MAP["III"])
    
    # Safe burn time estimation
    if uv_index > 0:
        safe_time_mins = max(5, int(fitz["burn_min"] * (5.0 / max(1.0, uv_index))))
    else:
        safe_time_mins = 180
        
    advice = CONDITION_ADVICES.get(condition, CONDITION_ADVICES["General"])
    
    return {
        "uv_index": uv_index,
        "uv_category": uv_category,
        "uv_color": uv_color,
        "location": {"latitude": lat, "longitude": lon},
        "timestamp": now.isoformat(),
        "fitzpatrick": {
            "type": skin_type.upper(),
            "label": fitz["name"],
            "description": fitz["desc"],
            "recommended_spf": fitz["spf"],
            "safe_sun_exposure_minutes": safe_time_mins
        },
        "condition_advisory": advice,
        "protective_actions": [
            f"Apply {fitz['spf']} broad-spectrum sunscreen 15 mins before heading outside.",
            "Wear UV400 rated sunglasses and protective headwear.",
            "Seek shade during peak UV solar hours (11:00 AM - 3:00 PM)."
        ]
    }
