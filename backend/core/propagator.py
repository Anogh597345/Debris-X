from sgp4.api import Satrec
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
import math


def jday(year, month, day, hr, minute, sec):
    """Convert calendar date/time to Julian date + fraction."""
    jd = (367.0 * year
          - int(7 * (year + int((month + 9) / 12.0)) * 0.25)
          + int(275 * month / 9.0)
          + day + 1721013.5)
    fr = (sec + minute * 60.0 + hr * 3600.0) / 86400.0
    return jd, fr


def propagate_orbit(
    tle_line1: str,
    tle_line2: str,
    start_time: datetime,
    duration_hours: int = 24,
    interval_minutes: int = 5,
) -> List[Dict[str, Any]]:
    """
    Propagate a satellite orbit using SGP4.
    Returns a list of {time, position{x,y,z}, velocity{vx,vy,vz}} dicts.
    Coordinates are in km (ECI frame).
    """
    satellite = Satrec.twoline2rv(tle_line1, tle_line2)
    positions: List[Dict[str, Any]] = []

    current_time = start_time.replace(tzinfo=timezone.utc) if start_time.tzinfo is None else start_time
    end_time = current_time + timedelta(hours=duration_hours)

    while current_time <= end_time:
        jd, fr = jday(
            current_time.year, current_time.month, current_time.day,
            current_time.hour, current_time.minute, current_time.second,
        )
        e, r, v = satellite.sgp4(jd, fr)
        if e == 0:
            positions.append({
                "time": current_time.isoformat(),
                "position": {"x": r[0], "y": r[1], "z": r[2]},
                "velocity": {"vx": v[0], "vy": v[1], "vz": v[2]},
            })
        current_time += timedelta(minutes=interval_minutes)

    return positions
