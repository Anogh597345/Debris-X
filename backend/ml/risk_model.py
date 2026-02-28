"""
Enhanced risk model with:
- Uncertainty ellipsoid radii
- Explainability breakdown
- Relative velocity estimation
- Cost-risk tradeoff curve
"""
import numpy as np
from typing import Dict, Any, List

# ── Uncertainty Model ──────────────────────────────────────────────────────────
def compute_uncertainty_ellipsoid(
    altitude_km: float = 550.0,
    age_hours: float = 12.0,
    drag_coeff: float = 2.2,
) -> Dict[str, float]:
    """
    Uncertainty grows with time (prediction horizon) and altitude-dependent drag.
    Returns 1-sigma radii in km (radial, in-track, cross-track).
    Based on simplified Covariance Realism.
    """
    drag_factor = max(1.0, 1.0 + (550 - altitude_km) / 400)  # LEO has more drag uncertainty
    radial      = 0.05  * age_hours ** 1.2 * drag_factor
    in_track    = 0.30  * age_hours ** 1.5 * drag_factor      # largest uncertainty axis
    cross_track = 0.08  * age_hours ** 1.1 * drag_factor

    return {
        "radial_km":      round(radial, 3),
        "in_track_km":    round(in_track, 3),
        "cross_track_km": round(cross_track, 3),
        "volume_km3":     round((4/3) * np.pi * radial * in_track * cross_track, 3),
    }

# ── Explainability ─────────────────────────────────────────────────────────────
def explain_risk(
    min_distance_km: float,
    time_to_approach_hours: float,
    rel_velocity_km_s: float = 10.0,
    approach_angle_deg: float = 90.0,
) -> Dict[str, Any]:
    """
    Returns human-readable breakdown of why the risk score is what it is.
    """
    factors = []

    # Distance factor
    if min_distance_km < 1.0:
        factors.append({"factor": "Critical proximity", "detail": f"{min_distance_km:.2f} km — within kill radius", "severity": "critical"})
    elif min_distance_km < 10.0:
        factors.append({"factor": "Close approach", "detail": f"{min_distance_km:.2f} km — high-risk threshold exceeded", "severity": "high"})
    else:
        factors.append({"factor": "Moderate separation", "detail": f"{min_distance_km:.2f} km — monitored", "severity": "low"})

    # Velocity factor
    if rel_velocity_km_s > 12.0:
        factors.append({"factor": "High relative velocity", "detail": f"{rel_velocity_km_s:.1f} km/s — extreme kinetic energy at impact", "severity": "critical"})
    elif rel_velocity_km_s > 7.0:
        factors.append({"factor": "Elevated velocity", "detail": f"{rel_velocity_km_s:.1f} km/s — typical LEO crossing", "severity": "medium"})

    # Time factor
    if time_to_approach_hours < 2.0:
        factors.append({"factor": "Imminent approach", "detail": f"T-{time_to_approach_hours:.1f}h — maneuver window closing", "severity": "critical"})
    elif time_to_approach_hours < 12.0:
        factors.append({"factor": "Short maneuver window", "detail": f"T-{time_to_approach_hours:.1f}h — decisive action needed", "severity": "high"})
    else:
        factors.append({"factor": "Adequate lead time", "detail": f"T-{time_to_approach_hours:.1f}h — planning phase", "severity": "low"})

    # Approach angle
    if 85 <= approach_angle_deg <= 95:
        factors.append({"factor": "Perpendicular crossing", "detail": f"{approach_angle_deg:.0f}° approach — maximum cross-section exposure", "severity": "high"})
    elif approach_angle_deg < 30 or approach_angle_deg > 150:
        factors.append({"factor": "Nearly co-planar", "detail": f"{approach_angle_deg:.0f}° approach — extended exposure, lower peak risk", "severity": "medium"})

    return {
        "factors": factors,
        "summary": f"Risk driven by {'distance + velocity' if min_distance_km < 5 else 'time horizon + velocity'}. Primary concern: {factors[0]['factor'].lower()}.",
        "dominant_factor": factors[0]["factor"],
    }

# ── Cost-Risk Tradeoff ─────────────────────────────────────────────────────────
def compute_cost_risk_tradeoff(
    baseline_probability: float,
    min_distance_km: float,
    rel_velocity_km_s: float = 10.0,
) -> List[Dict[str, float]]:
    """
    Returns a curve: for each delta-V level, the resulting probability and fuel cost.
    Models diminishing returns (as delta-V increases, risk reduction saturates).
    """
    curve = []
    dv_values = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.5, 2.0, 3.0, 5.0]
    isp = 220.0   # s (hydrazine thruster)
    g0  = 9.81e-3 # km/s²
    m0  = 1200.0  # kg (satellite mass)

    for dv in dv_values:
        # Tsiolkovsky: fuel mass = m0 * (1 - e^(-dv/(Isp*g0)))
        fuel = m0 * (1 - np.exp(-dv / (isp * g0))) if dv > 0 else 0.0

        # Risk reduction model: exponential saturation
        # At delta-V = 0 → baseline probability
        # At delta-V → ∞ → residual ~0.001
        residual  = 0.001
        scale     = 0.8   # how fast risk drops
        prob      = residual + (baseline_probability - residual) * np.exp(-scale * dv / 0.5)

        # Additional separation gained (km)
        sep_gain = dv * 3600 * 0.15  # rough: 0.15 km per second of burn time

        curve.append({
            "delta_v_ms":      round(dv * 1000, 1),  # convert to m/s
            "fuel_kg":         round(max(fuel, 0), 3),
            "collision_prob":  round(float(max(prob, residual)), 6),
            "separation_gain_km": round(sep_gain, 2),
        })

    return curve

# ── Main probability predictor (unchanged interface) ──────────────────────────
def predict_collision_probability(
    min_distance_km: float,
    time_to_approach_hours: float,
    rel_velocity_km_s: float = 10.0,
) -> float:
    base_risk       = 1.0 / (min_distance_km ** 2 + 0.1)
    time_factor     = np.exp(-time_to_approach_hours / 24.0)
    velocity_factor = min(rel_velocity_km_s / 15.0, 1.0)
    probability     = base_risk * time_factor * velocity_factor
    probability     = min(max(probability, 0.0), 1.0)
    if min_distance_km < 1.0 and time_to_approach_hours < 12.0:
        probability = max(probability, 0.9)
    return float(probability)
