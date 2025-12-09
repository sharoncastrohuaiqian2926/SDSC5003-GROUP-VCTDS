# 校园食堂菜品评分系统

一个用于在校园食堂对菜品进行评分和推荐的简单全栈应用，基于 FastAPI 和 SQLite 构建。

## 技术栈

- Python
- FastAPI（后端 API）
- SQLite（关系型数据库）
- HTML/CSS/JS（后续将补充前端界面）

## 项目结构

- `app/`
  - `main.py`：FastAPI 入口文件
  - `db.py`：SQLite 连接与初始化
  - `models.py`：Pydantic 模型（响应数据结构）
  - `routers/`：API 路由模块（食堂、菜品、评分、统计等）
- `schema.sql`：数据库表结构定义
- `seed_data.py`：初始化数据库并插入示例数据的脚本
- `requirements.txt`：Python 依赖列表

## 环境搭建与运行

1. 创建并激活虚拟环境（可选但推荐）。
2. 安装依赖：

   ```bash
   pip install -r requirements.txt
   ```

3. 初始化数据库和示例数据：

   ```bash
   python seed_data.py
   ```

4. 使用 Uvicorn 启动 FastAPI 应用：

   ```bash
   uvicorn app.main:app --reload
   ```

5. 在浏览器中访问：

   - API 根地址：http://127.0.0.1:8000/
   - API 文档（Swagger UI）：http://127.0.0.1:8000/docs

## 后续计划

- 在各个路由中实现真实的数据库查询逻辑。
- 添加 HTML 模板和静态前端页面，提供更友好的用户交互界面。
- 完善认证和权限控制（登录、角色等）。
- 增加更多统计和推荐算法逻辑，提升推荐效果。
