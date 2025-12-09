# Smart Campus Canteen · 校园智慧点餐与评分系统

一个基于 **FastAPI + SQLite + 原生前端** 的校园食堂点餐与菜品评分系统，提供菜单浏览、在线点餐、用户评价、数据统计，以及中英双语界面和智能点餐助手。

## 功能概览

- **食堂与菜单浏览**
  - 按食堂查看菜品树状菜单（主食堂 / 北区 / 南区等）
  - 展示菜品分类、价格、食材、卡路里等信息

- **在线点餐与购物车**
  - 支持菜品数量增减
  - 支持**加蛋 / 加肉 / 辣度 / 冰量 / 糖度等可选项**，自动计算附加价格
  - 右侧购物车实时显示已选菜品与总价
  - 结算弹窗展示订单明细并发起下单请求

- **用户登录 / 注册**
  - 登录 / 注册弹窗（用户名 + 密码，可选邮箱）
  - 登录后显示用户名，支持退出登录
  - 订单与评价与用户绑定

- **菜品评分与评论**
  - 星级评分（1–5 星）
  - 文本评论
  - 展示已有人气评价列表

- **智能推荐与统计**
  - “每日推荐 / 本周推荐”菜品视图
  - 后端统计接口（例如各食堂热度、菜品评分等）

- **中英双语界面**
  - 支持中英文切换：菜单、按钮、标签等会根据语言自动变化
  - 内置大量菜品与食堂名称翻译映射

- **聊天助手**
  - 右下角悬浮聊天窗口
  - 通过后端 `/chat` 相关接口与大模型或对话机器人交互（具体实现见 [app/routers/chat.py](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app/routers/chat.py:0:0-0:0)）

---

## 技术栈

- **后端**
  - Python 3
  - FastAPI
  - SQLite（[canteen.db](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/canteen.db:0:0-0:0)）
  - `python-dotenv`（加载 [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 配置）

- **前端**
  - 原生 HTML + CSS + JavaScript
  - Font Awesome 图标
  - 响应式三栏布局（菜单 / 菜品详情 / 购物车）

---

## 项目结构

```bash
.
├── app/
│   ├── main.py          # FastAPI 入口，挂载静态文件与各业务路由
│   ├── db.py            # SQLite 连接与初始化 / 迁移逻辑（基于 schema.sql）
│   ├── models.py        # Pydantic 模型：Canteen / Dish / Rating / User 等
│   └── routers/
│       ├── auth.py      # 用户注册 / 登录 / 鉴权等接口
│       ├── canteens.py  # 食堂列表与信息
│       ├── dishes.py    # 菜品列表、详情等
│       ├── ratings.py   # 评分与评论相关接口
│       ├── stats.py     # 统计分析接口（如热门菜品等）
│       ├── orders.py    # 下单、订单明细相关接口
│       ├── options.py   # 菜品可选项（加蛋 / 辣度 / 冰量等）配置接口
│       └── chat.py      # 聊天机器人 / 点餐助手接口
│
├── static/
│   ├── index.html       # 主界面（侧边导航 + 菜单 + 购物车 + 推荐 + 订单 + 聊天）
│   ├── css/
│   │   └── style.css    # 完整 UI 样式，Dashboard 布局、模态框、评分控件等
│   └── js/
│       └── app.js       # 前端逻辑：路由调用、状态管理、i18n、购物车、评价表单等
│
├── schema.sql           # 数据库表结构
├── canteen.db           # SQLite 数据库文件（初始化后生成）
├── seed_dish_options.py # 初始化菜品可选项配置的脚本
├── update_ingredients_zh.py # 更新菜品中文食材字段脚本
├── update_users.py      # 用户表结构或数据迁移脚本
├── requirements.txt     # Python 依赖
├── .env                 # 环境变量（不会提交到 Git）
├── .gitignore
└── readmezh.md          # 中文说明（简版）
