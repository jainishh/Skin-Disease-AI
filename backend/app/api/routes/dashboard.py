"""
User dashboard route: prediction history and basic personal statistics.
Admin analytics (disease distribution, state-wise stats, model performance)
are sketched here as a starting point — extend with real aggregation
pipelines once production data volume justifies it.
"""
from datetime import datetime
from collections import Counter

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_admin
from app.db.mongodb import predictions_collection, users_collection
from app.services.ml_service import CLASS_MAPPING, DISPLAY_TITLES

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/history")
async def prediction_history(current_user: dict = Depends(get_current_user)):
    user_id_str = str(current_user["_id"])
    cursor = predictions_collection.find({"user_id": user_id_str}).sort("created_at", -1)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        raw_disease = doc.get("primary_disease", "Lesion")
        clean_disease = CLASS_MAPPING.get(raw_disease, raw_disease)
        doc["primary_disease"] = clean_disease
        doc["primary_disease_title"] = doc.get("primary_disease_title") or DISPLAY_TITLES.get(clean_disease, clean_disease)
        
        created_at = doc.get("created_at")
        if isinstance(created_at, datetime):
            doc["created_at"] = created_at.isoformat()
        elif created_at is not None:
            doc["created_at"] = str(created_at)
            
        history.append(doc)
    return history


@router.get("/admin/analytics")
async def admin_analytics(_admin: dict = Depends(require_admin)):
    total_users = await users_collection.count_documents({})
    total_predictions = await predictions_collection.count_documents({})

    disease_counter: Counter = Counter()
    severity_counter: Counter = Counter()
    async for doc in predictions_collection.find({}, {"primary_disease": 1, "severity": 1}):
        disease_counter[doc["primary_disease"]] += 1
        severity_counter[doc["severity"]] += 1

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "disease_distribution": dict(disease_counter),
        "severity_distribution": dict(severity_counter),
    }


@router.get("/progression")
async def get_lesion_progression(current_user: dict = Depends(get_current_user)):
    cursor = predictions_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", 1)
    scans = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        scans.append(doc)

    if not scans:
        return {
            "has_data": False,
            "total_scans": 0,
            "recovery_score": 100,
            "trend_status": "No Scans Recorded",
            "timeline": []
        }

    severity_weight = {"Mild": 1, "Moderate": 2, "Severe": 3}
    timeline = []
    
    first_scan = scans[0]
    latest_scan = scans[-1]
    
    initial_score = severity_weight.get(first_scan.get("severity", "Mild"), 1)
    latest_score = severity_weight.get(latest_scan.get("severity", "Mild"), 1)

    if latest_score < initial_score:
        trend_status = "Improving"
        recovery_score = 88
    elif latest_score == initial_score:
        trend_status = "Stable"
        recovery_score = 75
    else:
        trend_status = "Requires Attention"
        recovery_score = 45

    for idx, scan in enumerate(scans):
        cur_sev = severity_weight.get(scan.get("severity", "Mild"), 1)
        raw_date = str(scan.get("created_at", ""))[:10]
        timeline.append({
            "scan_id": scan["_id"],
            "date": raw_date,
            "disease": scan.get("primary_disease_title") or scan.get("primary_disease", "Lesion"),
            "severity": scan.get("severity", "Mild"),
            "confidence": round(float(scan.get("confidence", 0.85)) * 100, 1),
            "image_url": scan.get("image_url", ""),
            "severity_level": cur_sev
        })

    return {
        "has_data": True,
        "total_scans": len(scans),
        "recovery_score": recovery_score,
        "trend_status": trend_status,
        "initial_scan_date": str(first_scan.get("created_at", ""))[:10],
        "latest_scan_date": str(latest_scan.get("created_at", ""))[:10],
        "timeline": timeline
    }

