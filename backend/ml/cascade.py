"""
Kessler Cascade Simulator
Estimates secondary debris cloud if a primary collision occurs.
"""
import math
from typing import List, Dict, Any


def simulate_cascade(
    primary_sat_mass_kg: float = 1000.0,
    primary_debris_mass_kg: float = 10.0,
    collision_velocity_km_s: float = 10.0,
    primary_altitude_km: float = 550.0,
    simulation_steps: int = 5,
) -> Dict[str, Any]:
    """
    NASA standard fragmentation model (simplified):
    N_fragments ~ 0.1 * M_kg^0.75  for M > 11.5 * L_c^1.71

    Returns a list of cascade stages:
    stage 0 = primary collision
    stage 1..n = secondary debris fields
    """

    # Stage 0: primary collision  
    energy_kj = 0.5 * primary_debris_mass_kg * (collision_velocity_km_s * 1000) ** 2 / 1000
    n_primary_fragments = max(10, int(0.1 * (primary_sat_mass_kg ** 0.75)))

    stages: List[Dict[str, Any]] = []

    current_fragments = n_primary_fragments
    current_altitude = primary_altitude_km

    for step in range(simulation_steps):
        # Each subsequent collision doubles risk zone and produces ~30% secondary fragments
        years_forward = step * 6  # Simulate 6-month intervals
        affected_band_km = 50 + step * 80  # Expanding red zone
        secondary_fragments = int(current_fragments * 0.3)
        risk_score = min(1.0, current_fragments / 5000)

        stages.append({
            "stage": step,
            "years_forward": years_forward,
            "fragments_added": current_fragments,
            "total_fragments_cumulative": sum(
                int(n_primary_fragments * (0.3 ** i)) for i in range(step + 1)
            ),
            "altitude_km": current_altitude,
            "affected_band_km": affected_band_km,
            "risk_score": round(risk_score, 3),
            "orbital_accessibility": max(0.0, round(1.0 - risk_score * 0.9, 2)),
            "label": _stage_label(step),
        })

        current_fragments = secondary_fragments
        current_altitude += (step % 2 == 0) and 30 or -20  # Fragments spread up/down

    return {
        "primary_collision_energy_kj": round(energy_kj, 1),
        "primary_fragments": n_primary_fragments,
        "stages": stages,
        "kessler_threshold_crossed": n_primary_fragments > 2000,
        "warning": (
            "⚠ KESSLER SYNDROME THRESHOLD CROSSED — cascade likely self-sustaining."
            if n_primary_fragments > 2000
            else "Contained event — cascade manageable with active debris removal."
        ),
    }


def _stage_label(step: int) -> str:
    labels = [
        "Primary Collision",
        "First Fragmentation Wave",
        "Secondary Cascade",
        "Tertiary Propagation",
        "Runaway Congestion",
    ]
    return labels[min(step, len(labels) - 1)]
