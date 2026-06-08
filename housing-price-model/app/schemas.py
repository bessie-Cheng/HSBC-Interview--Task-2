from pydantic import BaseModel, Field
from typing import List

class HousingFeatures(BaseModel):
    """单个房屋特征的请求体，字段必须与训练数据特征列名一致"""
    square_footage: float = Field(..., description="房屋面积（平方英尺）")
    bedrooms: int = Field(..., description="卧室数量")
    bathrooms: float = Field(..., description="浴室数量")
    year_built: int = Field(..., description="建造年份")
    lot_size: float = Field(..., description="占地面积（平方英尺）")
    distance_to_city_center: float = Field(..., description="距市中心距离（英里）")
    school_rating: float = Field(..., description="学区评分（1-10）")

    class Config:
        json_schema_extra = {
            "example": {
                "square_footage": 1550,
                "bedrooms": 3,
                "bathrooms": 2,
                "year_built": 1997,
                "lot_size": 6800,
                "distance_to_city_center": 4.1,
                "school_rating": 7.6
            }
        }

class PredictionResponse(BaseModel):
    prediction: float = Field(..., description="预测的房价")
    message: str = Field(default="success")

class BatchPredictionResponse(BaseModel):
    predictions: List[float]
    count: int