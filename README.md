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

<img width="1429" height="774" alt="Screenshot 2026-06-09 at 01 07 11" src="https://github.com/user-attachments/assets/5ac33046-57e1-40d3-8a80-03e8c1c6f333" />

<img width="1409" height="772" alt="Screenshot 2026-06-09 at 01 07 20" src="https://github.com/user-attachments/assets/8a8e075c-cc29-4612-8682-8074af90c5cc" />

<img width="1372" height="755" alt="Screenshot 2026-06-09 at 01 26 53" src="https://github.com/user-attachments/assets/5b21590a-82b0-45d2-8fbd-3a529a5aab63" />

<img width="1245" height="745" alt="Screenshot 2026-06-09 at 01 27 10" src="https://github.com/user-attachments/assets/2330095c-6ae4-42e1-87f0-52c69b1f2483" />
