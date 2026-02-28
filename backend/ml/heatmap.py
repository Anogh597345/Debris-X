"""
Orbital Congestion Heatmap Generator
Divides LEO into altitude bands and scores congestion.
"""
from typing import List, Dict, Any


# Reference population by altitude band (real approximate data, normalized)
ALTITUDE_BANDS = [
    {"band": "100–200 km",  "alt_min": 100,  "alt_max": 200,  "object_density": 0.05,  "status": "safe",     "color": "#22dd66"},
    {"band": "200–400 km",  "alt_min": 200,  "alt_max": 400,  "object_density": 0.12,  "status": "safe",     "color": "#22dd66"},
    {"band": "400–600 km",  "alt_min": 400,  "alt_max": 600,  "object_density": 0.68,  "status": "dense",    "color": "#ffd700"},
    {"band": "550–600 km",  "alt_min": 550,  "alt_max": 600,  "object_density": 0.91,  "status": "critical", "color": "#ff2a2a"},
    {"band": "600–800 km",  "alt_min": 600,  "alt_max": 800,  "object_density": 0.85,  "status": "critical", "color": "#ff2a2a"},
    {"band": "800–1000 km", "alt_min": 800,  "alt_max": 1000, "object_density": 0.72,  "status": "dense",    "color": "#ff7700"},
    {"band": "1000–1200 km","alt_min": 1000, "alt_max": 1200, "object_density": 0.45,  "status": "moderate", "color": "#ffd700"},
    {"band": "1200–1500 km","alt_min": 1200, "alt_max": 1500, "object_density": 0.22,  "status": "safe",     "color": "#22dd66"},
    {"band": "1500–2000 km","alt_min": 1500, "alt_max": 2000, "object_density": 0.15,  "status": "safe",     "color": "#22dd66"},
    {"band": "20000–22000 (MEO/GPS)", "alt_min": 20000, "alt_max": 22000, "object_density": 0.18, "status": "safe", "color": "#22dd66"},
    {"band": "35786 (GEO Ring)",      "alt_min": 35786, "alt_max": 35800, "object_density": 0.55, "status": "dense","color": "#ffd700"},
]


def generate_heatmap() -> Dict[str, Any]:
    critical = [b for b in ALTITUDE_BANDS if b["status"] == "critical"]
    dense    = [b for b in ALTITUDE_BANDS if b["status"] == "dense"]
    safe     = [b for b in ALTITUDE_BANDS if b["status"] == "safe"]

    avg_density = sum(b["object_density"] for b in ALTITUDE_BANDS) / len(ALTITUDE_BANDS)
    global_index = round((1.0 - avg_density) * 100, 1)

    return {
        "bands": ALTITUDE_BANDS,
        "summary": {
            "critical_bands": len(critical),
            "dense_bands": len(dense),
            "safe_bands": len(safe),
            "global_congestion_index": round(avg_density * 100, 1),
            "global_health_score": global_index,
            "most_congested": critical[0]["band"] if critical else "None",
        },
        "recommendation": (
            "Critical congestion detected in LEO 550–800 km band. "
            "Recommend mandatory deorbit timelines for all non-operational satellites in this zone."
        ),
    }
