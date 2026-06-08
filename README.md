housing-portal/
├── frontend/ # Next.js 前端 (端口 3000)
├── backend-python/ # Python FastAPI 后端 (端口 8001) – 物业估值
├── backend-java/ # Java Spring Boot 后端 (端口 8080) – 市场分析
├── housing-price-model/ # 房价预测模型容器 (端口 8000)
├── docker-compose.yml # 统一容器编排
└── README.md

- **前端**：Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Python 后端**：Python 3.12, FastAPI, scikit-learn, joblib
- **Java 后端**：Java 21, Spring Boot 3.4.4, Maven, Apache Commons CSV, Caffeine Cache
- **模型容器**：FastAPI, LinearRegression (scikit-learn)
- **容器化**：Docker, Docker Compose

## 🚀 快速启动（本地开发）

### 前置条件
- Node.js 20+
- Python 3.12+
- Java 21 + Maven
- Docker Desktop（可选，用于模型容器）

### 1. 启动模型容器（housing-price-model）

```bash
cd housing-price-model
python -m venv venv && source venv/bin/activate  # 或 .\venv\Scripts\activate
pip install -r requirements.txt
# 确保已有训练好的模型文件 models/housing_model.pkl
uvicorn app.main:app --port 8000

2. 启动 Python 后端（物业估值）
bash
cd backend-python
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export MODEL_API_URL=http://localhost:8000   # 指向模型容器
uvicorn app.main:app --reload --port 8001

3. 启动 Java 后端（市场分析）
bash
cd backend-java/market-analysis
mvn clean package
java -jar target/market-analysis-0.0.1-SNAPSHOT.jar
# 或使用 mvn spring-boot:run

4. 启动前端 Next.js
bash
cd frontend
npm install
npm run dev

🐳 使用 Docker Compose 一键启动所有服务（推荐）
bash
cd housing-portal
docker-compose up --build

服务启动后：

前端：http://localhost:3000

Python 后端 API 文档：http://localhost:8001/docs

模型容器 API 文档：http://localhost:8000/docs

```
<img width="1429" height="774" alt="Screenshot 2026-06-09 at 01 07 11" src="https://github.com/user-attachments/assets/0b8fca25-1ba9-434e-826f-197de0bf2ef9" />

<img width="1409" height="772" alt="Screenshot 2026-06-09 at 01 07 20" src="https://github.com/user-attachments/assets/28bdec8d-84de-411b-b67d-71b271994021" />

<img width="1372" height="755" alt="Screenshot 2026-06-09 at 01 26 53" src="https://github.com/user-attachments/assets/31f6bd09-3f81-4431-ac91-d44e911cfae4" />

<img width="1245" height="745" alt="Screenshot 2026-06-09 at 01 27 10" src="https://github.com/user-attachments/assets/ff9558ac-3016-4307-9df0-3b5520dc5c62" />




