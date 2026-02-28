"""
Enhanced data loader — tries Celestrak first, falls back to local JSON.
Fetches active satellites with real NORAD IDs.
"""
import json, os, logging
from pydantic import BaseModel
from typing import List

try:
    import urllib.request
    _HTTP_OK = True
except ImportError:
    _HTTP_OK = False

_HERE      = os.path.dirname(os.path.abspath(__file__))
_DATA_PATH = os.path.join(_HERE, "..", "data", "tle_data.json")

log = logging.getLogger(__name__)

# Celestrak active satellites — public, no auth
CELESTRAK_URL = "https://celestrak.org/pub/TLE/active.txt"

class TLEData(BaseModel):
    id:    str
    name:  str
    type:  str   # 'satellite' | 'debris'
    line1: str
    line2: str
    norad_id: str = ""

def _parse_3le_text(text: str) -> List[TLEData]:
    """Parse a 3-line-element (3LE) text block into TLEData list."""
    lines  = [l.strip() for l in text.splitlines() if l.strip()]
    result = []
    i = 0
    while i + 2 < len(lines):
        name  = lines[i]
        line1 = lines[i+1]
        line2 = lines[i+2]
        if line1.startswith("1 ") and line2.startswith("2 "):
            norad = line1[2:7].strip()
            obj_type = "debris" if any(k in name.upper() for k in ["DEB","R/B","FRAG","ROCKET"]) else "satellite"
            result.append(TLEData(
                id=f"NORAD-{norad}",
                name=name,
                type=obj_type,
                line1=line1,
                line2=line2,
                norad_id=norad,
            ))
            i += 3
        else:
            i += 1
    return result

def fetch_celestrak(limit: int = 30) -> List[TLEData]:
    """Fetch real TLEs from Celestrak. Returns up to `limit` objects."""
    req = urllib.request.Request(
        CELESTRAK_URL,
        headers={"User-Agent": "DebrisX-AI/1.0 (educational project)"}
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        text = resp.read().decode("utf-8")
    sats = _parse_3le_text(text)
    log.info(f"[Celestrak] Fetched {len(sats)} objects, using first {limit}.")
    return sats[:limit]

def load_sample_tle() -> List[TLEData]:
    """Load TLEs: try Celestrak live, fall back to local JSON."""
    if _HTTP_OK:
        try:
            sats = fetch_celestrak(limit=30)
            if sats:
                log.info("[data_loader] Using LIVE Celestrak TLEs.")
                return sats
        except Exception as e:
            log.warning(f"[data_loader] Celestrak fetch failed ({e}), using local data.")
    with open(_DATA_PATH, "r") as f:
        data = json.load(f)
    return [TLEData(**item) for item in data]
