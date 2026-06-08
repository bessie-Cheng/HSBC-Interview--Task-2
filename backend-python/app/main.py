from fastapi import FastAPI, HTTPException
from app.models import ValuationRequest, ValuationResponse, HistoryEntry
from app.services import predict_price
from app.history_store import save_entry, get_history, get_all_history
from typing import List

app = FastAPI(title="Property Valuation API", version="1.0")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/valuation/predict", response_model=ValuationResponse)
async def predict_endpoint(request: ValuationRequest):
    try:
        features_dict = request.features.dict()
        price = predict_price(features_dict)
        req_id = save_entry(features_dict, price)
        return ValuationResponse(predicted_price=price, request_id=req_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/valuation/history", response_model=List[HistoryEntry])
async def get_history_endpoint(limit: int = 10):
    return get_history(limit)

@app.get("/api/valuation/all_history", response_model=List[HistoryEntry])
async def get_all_history_endpoint():
    return get_all_history()
