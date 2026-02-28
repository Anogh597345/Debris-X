"""
DebrisX FastAPI Backend
Run from E:\DebrisX\backend with:
    python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
"""
import sys, os
# Make sure the backend root is on sys.path so sub-packages resolve correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from core.data_loader import load_sample_tle
from core.propagator import propagate_orbit
from core.collision import detect_close_approaches
import urllib.request
import json
import numpy as np
from ml.risk_model import predict_collision_probability, compute_uncertainty_ellipsoid, explain_risk, compute_cost_risk_tradeoff
from ml.cascade import simulate_cascade
from ml.heatmap import generate_heatmap

# ── bootstrap ──────────────────────────────────────────────────────────────
app = FastAPI(title="DebrisX AI Brain")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

satellites = load_sample_tle()
trajectories: dict = {}

start_time = datetime.now(timezone.utc)
for sat in satellites:
    try:
        trajectories[sat.id] = propagate_orbit(sat.line1, sat.line2, start_time, duration_hours=24)
    except Exception as exc:
        print(f"[WARN] Skipping {sat.name}: {exc}")

print(f"[INFO] Loaded {len(satellites)} satellites. Trajectories computed for {len(trajectories)}.")

# ── routes ─────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "DebrisX Backend Online", "satellites": len(satellites)}


@app.get("/api/orbits")
def get_orbits():
    return {"trajectories": trajectories}


@app.get("/api/risk")
def get_risk():
    events = detect_close_approaches(trajectories, threshold_km=50.0)
    now = datetime.now(timezone.utc)
    assessed = []
    for evt in events:
        t = datetime.fromisoformat(evt["time_of_closest_approach"])
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        hours_away = (t - now).total_seconds() / 3600.0
        prob = predict_collision_probability(evt["min_distance_km"], hours_away)
        if prob > 0.005:
            # Generate advanced metrics
            sat1_alt = np.linalg.norm(list(evt["sat1_state"]["position"].values())) - 6371.0
            ellipsoid = compute_uncertainty_ellipsoid(altitude_km=sat1_alt, age_hours=hours_away)
            explanation = explain_risk(evt["min_distance_km"], hours_away, rel_velocity_km_s=10.5)
            
            assessed.append({
                **evt, 
                "probability": prob, 
                "time_to_approach_hours": hours_away,
                "uncertainty_ellipsoid": ellipsoid,
                "explainability": explanation
            })
    assessed.sort(key=lambda x: x["probability"], reverse=True)
    return {"risks": assessed}


@app.post("/api/maneuver")
def simulate_maneuver(sat_id: str, baseline_risk_pct: float = 1.2, min_distance_km: float = 0.8):
    # Base cost-risk curve
    baseline_prob = baseline_risk_pct / 100.0
    curve = compute_cost_risk_tradeoff(baseline_prob, min_distance_km)
    
    # Advanced: Multi-Satellite Conflict Assessment
    # We mock this for the MVP, showing that a maneuver might create a NEW conflict
    secondary_conflict = None
    if sat_id == "NORAD-25544": # ISS as an example, or just randomly trigger it
        secondary_conflict = None
    else:
        # 30% chance the optimal maneuver causes a secondary problem
        import random
        random.seed(sat_id)
        if random.random() < 0.3:
            sats = [s.id for s in satellites if s.id != sat_id]
            conflict_sat = random.choice(sats) if sats else "Unknown Debris"
            secondary_conflict = {
                "sat_id": conflict_sat,
                "time_to_approach_hours": round(random.uniform(24, 72), 1),
                "min_distance_km": round(random.uniform(2.0, 15.0), 1),
                "warning": "Proposed +Z maneuver intersects trajectory of " + conflict_sat
            }

    return {
        "status": "simulated", 
        "optimal_delta_v_ms": 0.8,
        "new_risk": curve[5]["collision_prob"], # The 0.8 m/s index
        "fuel_cost_kg": curve[5]["fuel_kg"],
        "tradeoff_curve": curve,
        "secondary_conflict": secondary_conflict
    }


@app.get("/api/cascade")
def get_cascade(altitude_km: float = 550.0, sat_mass_kg: float = 1000.0, debris_mass_kg: float = 10.0):
    return simulate_cascade(
        primary_sat_mass_kg=sat_mass_kg,
        primary_debris_mass_kg=debris_mass_kg,
        collision_velocity_km_s=10.0,
        primary_altitude_km=altitude_km,
    )


@app.get("/api/heatmap")
def get_heatmap():
    return generate_heatmap()

@app.get("/api/space-weather")
def get_space_weather():
    try:
        url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            # The data is a list of lists: [['time_tag', 'Kp', 'a_running', 'station_count'], ['2023-11-20 00:00:00', '2.0', '1', '4'], ...]
            if len(data) > 1:
                latest = data[-1]
                kp_index = float(latest[1])
                threat = "Nominal"
                drag_impact = "Low"
                if kp_index >= 5:
                    threat = "Severe"
                    drag_impact = "Critical - Ephemeris Updates Recommended"
                elif kp_index >= 3:
                    threat = "Elevated"
                    drag_impact = "Moderate - Trajectory Drag Possible"
                
                return {
                    "kp_index": kp_index,
                    "time_tag": latest[0],
                    "threat_level": threat,
                    "drag_impact": drag_impact
                }
    except Exception as e:
        print(f"Error fetching NOAA API: {e}")
    # mock fallback if NOAA fails
    return {"kp_index": 2.3, "time_tag": "Live Fallback", "threat_level": "Nominal", "drag_impact": "Low"}
