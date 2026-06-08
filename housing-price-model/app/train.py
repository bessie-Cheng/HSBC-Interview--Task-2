# app/train.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

np.random.seed(42)
n_samples = 1000
X = np.random.rand(n_samples, 7) * np.array([1000, 5, 3, 50, 2000, 20, 4])  # 随便模拟
y = X @ np.array([100, 10000, 8000, 100, 2, -100, 5000]) + np.random.normal(0, 10000, n_samples)

# 训练模型
model = LinearRegression()
model.fit(X, y)

# 保存模型
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/housing_model.pkl")

# 保存特征顺序（可选）
feature_names = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 'distance_to_city_center', 'school_rating']
with open("models/feature_names.txt", "w") as f:
    f.write(','.join(feature_names))

print("模型已生成到 models/housing_model.pkl")
