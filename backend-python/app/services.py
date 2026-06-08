import requests
import os

MODEL_API_URL = os.getenv("MODEL_API_URL", "http://localhost:8000")

def predict_price(features: dict) -> float:
    print(f"DEBUG: Sending payload to model: {features}")
    response = requests.post(f"{MODEL_API_URL}/predict", json=features, timeout=10)
    response.raise_for_status()
    data = response.json()
    # 模型容器返回 {"prediction": xxx, "message": "success"}
    return data["prediction"]