# 迷你电商后台管理系统

基于 FastAPI + React 的全栈电商管理后台，实现商品与订单的 CRUD 管理。

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | Python · FastAPI · SQLModel · SQLite |
| 前端 | React · TypeScript · Tailwind CSS · Vite |
| 测试 | pytest · FastAPI TestClient |

## 功能

- **商品管理** — 增删改查、分类筛选、名称搜索
- **订单管理** — 创建订单、状态流转（待处理→已确认→已发货→已送达）、库存事务（下单扣减/删单恢复）
- **Swagger 文档** — 自动生成 API 文档

## 项目结构

```
├── main.py              # FastAPI 应用入口 + 路由
├── models.py            # SQLModel 数据模型
├── schemas.py           # Pydantic 请求/响应 Schema
├── database.py          # 数据库连接 + Session 管理
├── seed.py              # 种子数据脚本
├── test_api.py          # 集成测试（13 个）
└── frontend/            # React 前端
    └── src/
        ├── components/  # 页面组件
        ├── api/         # API 客户端
        └── types/       # TypeScript 类型
```

## 快速开始

```bash
# 1. 安装后端依赖
pip install -r requirements.txt

# 2. 导入种子数据
python seed.py

# 3. 启动后端
python -m uvicorn main:app --reload --port 8000

# 4. 安装前端依赖
cd frontend && npm install

# 5. 启动前端
npm run dev
```

后端运行在 http://localhost:8000 ，Swagger 文档在 http://localhost:8000/docs 。

前端运行在 http://localhost:5173 。

## 运行测试

```bash
python -m pytest test_api.py -v
```
