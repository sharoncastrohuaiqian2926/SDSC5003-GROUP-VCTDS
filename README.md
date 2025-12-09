# Smart Campus Canteen · 校园智慧点餐与评分系统

一个基于 FastAPI + SQLite + 原生前端的校园食堂点餐与评分系统，支持菜品浏览、在线点餐、用户评分评论、智能推荐、菜品可选项配置，以及简易聊天助手。

---

## 1. 项目结构概览

本项目采用典型的“后端 API + 静态前端”结构，主要目录和文件如下：

- **[app/](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app:0:0-0:0)**  
  - 应用入口、数据库工具和 Pydantic 模型。  
  - 包含所有业务路由模块，例如用户认证、食堂与菜品管理、评分、订单、统计、菜品选项配置、聊天助手等。

- **[static/](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/static:0:0-0:0)**  
  - 前端页面、样式和脚本。  
  - [index.html](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/static/index.html:0:0-0:0) 为单页应用入口，[css/](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/static/css:0:0-0:0) 与 [js/](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/static/js:0:0-0:0) 目录分别存放样式和逻辑脚本。

- **根目录文件**  
  - [schema.sql](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/schema.sql:0:0-0:0)：数据库模式定义。  
  - [canteen.db](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/canteen.db:0:0-0:0)：SQLite 数据库文件（运行时生成）。  
  - 若干数据/迁移脚本（如菜品选项初始化、食材信息更新、用户更新等）。  
  - [requirements.txt](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/requirements.txt:0:0-0:0)：Python 依赖列表。  
  - [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0)：本地环境变量配置（不提交到 Git）。  
  - [.gitignore](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.gitignore:0:0-0:0)：Git 忽略规则。  
  - [readmezh.md](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/readmezh.md:0:0-0:0)：简要中文说明。

---

## 2. 后端逻辑（FastAPI 应用）

后端基于 **FastAPI** 实现，主要职责包括：提供 RESTful 接口、管理数据库、处理业务逻辑，并为前端页面提供静态文件服务。

### 2.1 应用入口与生命周期

- **应用入口**：位于 [app/main.py](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app/main.py:0:0-0:0)。  
- 在应用启动时会：
  - 载入 [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 中的环境变量（例如数据库相关配置、外部服务配置）。  
  - 调用数据库初始化函数，检查并创建/迁移表结构。  
- 对外暴露的主要行为：
  - 根路径 `/` 用于返回前端页面。  
  - [/static](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/static:0:0-0:0) 路径挂载静态资源（CSS、JS 等）。  
  - 其余路径由各个业务 router 提供，全部注册到同一 FastAPI 应用实例。

### 2.2 数据库访问与初始化

- **数据库工具模块**：位于 [app/db.py](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app/db.py:0:0-0:0)。  
- 主要职责：
  - 建立与 SQLite 文件数据库的连接，并统一设置返回结果的格式。  
  - 在应用启动时执行：
    - 若数据库文件不存在或尚未初始化：根据 [schema.sql](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/schema.sql:0:0-0:0) 创建完整表结构。  
    - 若数据库已存在：尝试通过“增量迁移”的方式，为旧表增加新字段或新表，从而兼容已有数据。  

该设计允许在不破坏已有数据的前提下，逐步演化数据库结构（例如增加字段：用户邮箱、菜品食材中文字段、菜品卡路里信息、订单项的选项字段等）。

### 2.3 Pydantic 模型

- 定义在 [app/models.py](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app/models.py:0:0-0:0) 中。  
- 为核心实体（如食堂、菜品、评分、用户等）提供数据结构描述。  
- 用于：
  - 约束和验证请求体数据。  
  - 定义 API 的响应结构（例如返回给前端的字段和格式）。  
- 通过约束（例如评分必须在一定范围内）保证基本数据质量。

### 2.4 路由与业务模块

所有业务接口按照功能拆分在 [app/routers/](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/app/routers:0:0-0:0) 目录中，每个文件对应一类业务：

- **认证模块（auth）**  
  - 用户注册与登录。  
  - 校验用户凭证，返回用户信息及（如设计中需要）认证凭据。  

- **食堂模块（canteens）**  
  - 查询食堂列表和相关信息。  
  - 支持按食堂加载其下属的菜品列表，供前端构建树状菜单。  

- **菜品模块（dishes）**  
  - 查询单个菜品详情或菜品列表。  
  - 支持按分类或食堂筛选，为推荐和菜单展示提供数据。  

- **评分模块（ratings）**  
  - 为指定菜品返回已有评分与评论。  
  - 接收前端提交的评分与评论，并写入数据库。  
  - 确保每个用户对同一菜品只有一条评分记录。  

- **订单模块（orders）**  
  - 根据前端购物车信息创建订单及订单明细。  
  - 维护订单状态与总价。  
  - 支持查询用户的历史订单。  

- **统计模块（stats）**  
  - 提供各种聚合与统计数据，例如：
    - 某菜品的平均评分、评分分布。  
    - 各食堂或菜品的受欢迎程度。  
  - 为推荐页面和管理分析提供数据支持。  

- **菜品选项模块（options）**  
  - 为前端提供指定菜品的可选项配置。  
  - 数据源来自 `dish_option_configs` 表，用于描述加料、辣度、冰量等配置及其附加价格。  

- **聊天助手模块（chat）**  
  - 对前端聊天窗口请求进行处理。  
  - 可以封装对外部大模型接口的调用，或实现自定义规则引擎，用于回答点餐相关问题或推荐菜品。  

---

## 3. 前端结构与交互（static）

前端为单页应用形式，使用原生 HTML、CSS 和 JavaScript 实现，不依赖大型前端框架。

### 3.1 页面结构（HTML）

- 采用三栏 Dashboard 布局：
  - 左侧：导航栏与语言切换按钮，用于在“浏览菜单 / 每日推荐 / 我的订单”等视图之间切换。  
  - 中间：主内容区域，包含：
    - 食堂与菜品树状菜单。  
    - 菜品详情展示区（名称、价格、分类、卡路里、食材信息）。  
    - 菜品可选项区域（如加蛋、辣度等）。  
    - 用户评分展示与新评分表单。  
  - 右侧：购物车区域，展示已选菜品、数量与合计金额，并提供结算按钮。  

- 额外组件：
  - 登录 / 注册弹窗：通过遮罩层展示登录和注册表单。  
  - 结算弹窗：展示订单明细和最终价格，确认支付。  
  - 聊天窗口：悬浮在右下角，用于与后端聊天助手交互。

### 3.2 样式与 UI（CSS）

- 统一的主题色、阴影和圆角配置，使界面风格现代、统一。  
- 针对不同区域（菜单树、菜品详情、购物车、评分表单、聊天窗口等）定义专用样式。  
- 对滚动条、按钮悬停效果、模态框显示/隐藏做了视觉优化。  
- 针对移动端或窄屏窗口进行了基本适配，使整体布局在不同分辨率下保持可用性。

### 3.3 前端逻辑（JavaScript）

主要职责包括：

- **与后端 API 通信**  
  - 封装通用的请求函数，统一处理请求错误和响应解析。  
  - 调用后端的食堂、菜品、评分、订单、统计、选项配置和聊天等接口。  

- **状态管理**  
  - 维护当前登录用户信息，并使用本地存储在刷新后恢复状态。  
  - 维护购物车内容，包括每项菜品的数量、选项选择和价格。  
  - 维护当前语言（中/英），并在界面切换后自动更新文本。  

- **界面渲染与交互**  
  - 根据 API 返回的数据构建树状菜单，对食堂与菜品进行分组展示。  
  - 在选中菜品时展示详细信息、评分列表和可选项，并支持添加到购物车。  
  - 实时更新购物车内容、数量和价格，并控制结算按钮的可用状态。  
  - 处理登录 / 注册提交逻辑，并根据结果更新用户显示状态。  
  - 管理聊天窗口的打开/关闭和消息发送，在界面中追加聊天记录。  

- **多语言支持**  
  - 内置中英文文案映射，包括常用 UI 文本、提示语、标签等。  
  - 对菜品名称、类别、食堂名称也设有翻译映射，确保在中英切换时显示一致。  

---

## 4. 数据生成与测试脚本

为了方便初始化数据和演示功能，项目提供了若干独立脚本，用于填充或更新数据库中的部分内容：

- **菜品选项初始化脚本**  
  - 用于为各类菜品创建加料、辣度、冰量、糖度等可选项配置。  
  - 会向菜品选项配置表中写入一系列结构化配置数据，前端据此动态生成单选按钮。

- **食材信息更新脚本**  
  - 用于批量为菜品补充或更新中文食材说明。  
  - 与英文食材字段结合，可以在前端中英界面中展示不同语言的食材描述。  

- **用户与数据更新脚本**  
  - 用于在数据库结构调整后修正旧数据，或插入测试用户记录。  
  - 便于在开发与调试时快速模拟真实使用场景（如有评分、订单数据等）。  

这些脚本通常不会在生产环境中频繁执行，而是作为本地开发与测试流程的一部分，按需手动运行。

---

## 5. 依赖关系与环境配置

### 5.1 主要依赖

- **后端框架**：FastAPI  
- **ASGI 服务器**：Uvicorn  
- **数据模型与验证**：Pydantic（包含带 E-mail 字段支持的扩展）  
- **环境配置**：通过 `python-dotenv` 从 [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 文件加载环境变量  
- **HTTP 客户端**：可选，用于在聊天模块中访问外部模型服务或其他 API  

所有依赖均在 [requirements.txt](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/requirements.txt:0:0-0:0) 中列出，可通过包管理工具一次性安装。

### 5.2 环境变量

- 项目根目录下的 [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 文件用于存放本地敏感配置，例如：
  - 数据库连接路径（如需要自定义）。  
  - 聊天模块使用的外部 API 地址与密钥（如有）。  
- [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 文件已被加入 [.gitignore](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.gitignore:0:0-0:0)，不会被提交到 GitHub，以保护隐私与安全。

---

## 6. 如何运行项目

以下为本地运行步骤的概览，假设已有 Python 环境：

1. **克隆代码仓库**  
   - 使用 Git 将项目拉取到本地工作目录。

2. **创建并激活虚拟环境（推荐）**  
   - 在项目根目录创建虚拟环境，并根据操作系统激活它。  

3. **安装依赖**  
   - 使用包管理工具，根据 [requirements.txt](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/requirements.txt:0:0-0:0) 安装所有 Python 依赖。  

4. **准备环境变量**  
   - 在项目根目录创建 [.env](cci:7://file:///c:/Users/Administrator/Desktop/canteen-rating-app/.env:0:0-0:0) 文件，按需要配置数据库路径和外部服务参数。  
   - 若不配置数据库路径，则使用默认的 SQLite 文件。  

5. **初始化或迁移数据库**  
   - 启动 FastAPI 应用时会自动执行数据库初始化/迁移逻辑。  
   - 如需演示完整功能，可按需运行数据生成脚本，填充菜品选项、食材信息或测试用户数据。  

6. **启动开发服务器**  
   - 使用 ASGI 服务器在本地启动应用（支持自动重载）。  
   - 启动成功后，可在浏览器中访问：
     - Web 界面：主入口页面  
     - API 文档：自动生成的接口说明（Swagger / ReDoc）  

7. **在浏览器中体验功能**  
   - 浏览食堂与菜品菜单，切换中英文界面。  
   - 注册或登录用户账户，添加评分与评论。  
   - 将菜品及其可选项加入购物车并下单。  
   - 查看推荐页面和订单历史，打开聊天助手进行交互（如已配置）。  

---

通过以上设计，本项目实现了从数据库模式、后端逻辑、前端交互到数据生成脚本的一整套完整链路，适合作为校园场景的原型系统或课程项目参考。
