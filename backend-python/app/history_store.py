from typing import List, Dict
import uuid
from datetime import datetime

_history: List[Dict] = []

def save_entry(features: dict, prediction: float) -> str:
    entry_id = str(uuid.uuid4())
    entry = {
        "id": entry_id,
        "timestamp": datetime.utcnow().isoformat(),
        "features": features,
        "prediction": prediction
    }
    _history.append(entry)
    return entry_id

def get_history(limit: int = 10) -> List[Dict]:
    return _history[-limit:]

def get_all_history() -> List[Dict]:
    return _history
