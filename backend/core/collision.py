import math
from typing import List, Dict, Any

def calculate_distance(pos1: Dict[str, float], pos2: Dict[str, float]) -> float:
    """Calculates Euclidean distance between two positions in 3D space (km)"""
    return math.sqrt(
        (pos1["x"] - pos2["x"])**2 +
        (pos1["y"] - pos2["y"])**2 +
        (pos1["z"] - pos2["z"])**2
    )

def detect_close_approaches(trajectories: Dict[str, List[Dict[str, Any]]], threshold_km: float = 10.0) -> List[Dict[str, Any]]:
    """
    Takes a dictionary mapping satellite IDs to their propagated time-series trajectories.
    Returns a list of close approach events.
    """
    events = []
    sat_ids = list(trajectories.keys())
    
    # Assume all trajectories have the same timestamps
    if not sat_ids:
        return events
        
    num_timesteps = len(trajectories[sat_ids[0]])
    
    for i in range(len(sat_ids)):
        for j in range(i + 1, len(sat_ids)):
            sat1 = sat_ids[i]
            sat2 = sat_ids[j]
            
            min_distance = float('inf')
            closest_time = None
            closest_state_1 = None
            closest_state_2 = None
            
            for t in range(num_timesteps):
                state1 = trajectories[sat1][t]
                state2 = trajectories[sat2][t]
                
                dist = calculate_distance(state1["position"], state2["position"])
                
                if dist < min_distance:
                    min_distance = dist
                    closest_time = state1["time"]
                    closest_state_1 = state1
                    closest_state_2 = state2
            
            if min_distance <= threshold_km:
                events.append({
                    "sat1_id": sat1,
                    "sat2_id": sat2,
                    "min_distance_km": min_distance,
                    "time_of_closest_approach": closest_time,
                    "sat1_state": closest_state_1,
                    "sat2_state": closest_state_2
                })
                
    return events
