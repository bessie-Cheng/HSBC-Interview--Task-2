from pydantic import BaseModel
from typing import List, Optional

class HousingFeatures(BaseModel):
    square_footage: float
    bedrooms: float
    bathrooms: float
    year_built: float
    lot_size: float
    distance_to_city_center: float
    school_rating: float

class ValuationRequest(BaseModel):
    features: HousingFeatures

class ValuationResponse(BaseModel):
    predicted_price: float
    request_id: str

class HistoryEntry(BaseModel):
    id: str
    timestamp: str
    features: HousingFeatures
    prediction: float
