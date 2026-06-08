from fastapi import FastAPI, HTTPException
from typing import List
import joblib
import numpy as np
import os
from .schemas import HousingFeatures, PredictionResponse, BatchPredictionResponse
from pydantic import BaseModel

app = FastAPI(title="House Price Prediction API", version="1.0.0")

model = None
feature_order = None

@app.on_event("startup")
async def load_model():
    global model, feature_order
    model_path = "models/housing_model.pkl"  # 改为 .pkl 文件
    features_path = "models/feature_names.txt"
    if not os.path.exists(model_path):
        raise RuntimeError(f"模型文件未找到: {model_path}")
    model = joblib.load(model_path)
    # 如果 feature_names.txt 不存在，可以从模型内部获取或手动定义
    if os.path.exists(features_path):
        with open(features_path, 'r') as f:
            feature_order = f.read().strip().split(',')
    else:
        # 使用默认顺序（与训练时一致）
        feature_order = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 'distance_to_city_center', 'school_rating']
    print("✅ 模型加载成功, 特征顺序:", feature_order)

def features_to_array(features: HousingFeatures) -> np.ndarray:
    """严格按照训练时的特征顺序构造数组"""
    # 顺序必须与 feature_order 一致
    values = [
        features.square_footage,
        features.bedrooms,
        features.bathrooms,
        features.year_built,
        features.lot_size,
        features.distance_to_city_center,
        features.school_rating
    ]
    return np.array([values])

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: HousingFeatures):
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    try:
        X = features_to_array(features)
        pred = model.predict(X)[0]
        return PredictionResponse(prediction=float(pred))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(features_list: List[HousingFeatures]):
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    predictions = []
    for f in features_list:
        X = features_to_array(f)
        pred = model.predict(X)[0]
        predictions.append(float(pred))
    return BatchPredictionResponse(predictions=predictions, count=len(predictions))

@app.get("/model-info")
async def model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="模型未加载")
    return {
        "model_type": "LinearRegression",
        "coefficients": model.coef_.tolist(),
        "intercept": float(model.intercept_),
        "features": feature_order,
        "performance": {
            "R2_score": 0.9123  # 可以从训练脚本中动态传入，为了简单先写固定值（实际可从文件读取）
        }
    }


# 定义单个特征模型（字段名必须与特征顺序完全一致）
class SingleHousingFeatures(BaseModel):
    square_footage: float
    bedrooms: float
    bathrooms: float
    year_built: float
    lot_size: float
    distance_to_city_center: float
    school_rating: float