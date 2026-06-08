import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def load_data():
    """读取训练数据 CSV，返回特征 X 和目标 y"""
    df = pd.read_csv('House Price Dataset.csv')
    # 目标列是 'price'
    target = 'price'
    # 特征列：排除 id（无预测意义）和 price
    feature_cols = [col for col in df.columns if col not in ['id', target]]
    X = df[feature_cols]
    y = df[target]
    return X, y, feature_cols

def train_model():
    print("正在加载真实房价数据...")
    X, y, feature_names = load_data()
    print(f"数据集大小: {X.shape}")
    print(f"特征列: {feature_names}")
    
    # 划分训练集和测试集 (80% 训练, 20% 测试)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("正在训练线性回归模型...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # 评估模型
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"模型评估结果:")
    print(f"  - 均方误差 (MSE): {mse:.2f}")
    print(f"  - R² 分数: {r2:.4f}")
    
    # 保存模型
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/housing_model.joblib')
    
    # 保存特征名称（供 API 验证输入顺序）
    with open('model/feature_names.txt', 'w') as f:
        f.write(','.join(feature_names))
    
    print("✅ 模型已保存到 model/housing_model.joblib")
    print("✅ 特征名称已保存到 model/feature_names.txt")

if __name__ == '__main__':
    train_model()