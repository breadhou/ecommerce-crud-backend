# React 前端界面 设计文档

## 概述

为已有 FastAPI CRUD 后端构建 React 管理界面，实现商品管理和订单管理的可视化操作。单页面应用，侧边栏导航布局。

## 技术栈

- **构建工具**: Vite
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **HTTP**: axios
- **路由**: react-router-dom (v6)

## 项目结构

```
frontend/
├── index.html
├── package.json
├── vite.config.ts            # Vite 配置 + API 代理
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx              # ReactDOM 入口
    ├── App.tsx               # 路由定义
    ├── index.css             # Tailwind 指令
    ├── api/
    │   └── client.ts         # axios 实例 + 所有 API 函数
    ├── components/
    │   ├── Layout.tsx         # 侧边栏 + Outlet
    │   ├── ProductTable.tsx   # 商品表格 + 搜索 + 分类筛选
    │   ├── ProductDialog.tsx  # 新增/编辑商品弹窗表单
    │   ├── OrderTable.tsx     # 订单表格 + 状态筛选
    │   ├── OrderCreateDialog.tsx  # 创建订单弹窗
    │   └── OrderDetailSheet.tsx   # 订单详情抽屉
    └── types/
        └── index.ts          # 共享类型定义
```

## 页面与路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/products` | ProductTable | 默认页，商品管理 |
| `/orders` | OrderTable | 订单管理 |

未匹配路径重定向到 `/products`。

## 组件设计

### Layout
- 左侧固定宽度侧边栏（深色背景），两个导航项：商品管理、订单管理
- 右侧内容区通过 `<Outlet />` 渲染匹配路由

### ProductTable
- **搜索栏**: 文本搜索（按名称）+ 分类下拉筛选
- **数据表格**: ID / 图片 / 名称 / 价格 / 库存 / 分类 / 操作
- **操作**: 编辑（打开 ProductDialog）/ 删除（弹出确认框）
- **新增按钮**: 右上角，打开 ProductDialog（空表单）
- **状态**: loading / error / 空数据提示

### ProductDialog
- 新增模式：空表单，标题"新增商品"
- 编辑模式：预填数据，标题"编辑商品"
- 字段: name(必填), description(选填), price(必填,数字), stock(必填,整数), category(必填), image_url(选填)
- 保存后关闭弹窗并刷新列表

### OrderTable
- **筛选栏**: 状态下拉选择（全部 / pending / confirmed / shipped / delivered）
- **数据表格**: 订单号 / 总价 / 状态标签(彩色) / 创建时间 / 操作
- **状态标签颜色**: pending 蓝 / confirmed 橙 / shipped 紫 / delivered 绿
- **操作栏**:
  - 详情: 打开 OrderDetailSheet
  - 状态流转: 显示下一状态名称（如"确认"→"发货"→"送达"），delivered 不显示
  - 删除: shipped/delivered 隐藏，其他显示
- **新增按钮**: 打开 OrderCreateDialog

### OrderCreateDialog
- 动态商品行，每行: 商品下拉选择 + 数量输入 + 删除按钮
- 添加按钮: 新增一行
- 实时计算总价
- 提交: 校验至少一个商品 → 调用 API → 关闭并刷新

### OrderDetailSheet
- 从右侧滑出的抽屉面板
- 显示: 订单基本信息 + 商品明细表格（商品名/单价/数量/小计）
- 合计金额

## 后端适配

### CORS 配置
main.py 需添加 CORS 中间件，允许前端跨域访问：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Vite 代理（可选替代方案）
如果不用 CORS，vite.config.ts 中配置代理到 `http://localhost:8000`。

## API 函数清单

```typescript
// 商品
getProducts(category?: string): Promise<Product[]>
getProduct(id: number): Promise<Product>
createProduct(data: ProductCreate): Promise<Product>
updateProduct(id: number, data: ProductUpdate): Promise<Product>
deleteProduct(id: number): Promise<void>

// 订单
getOrders(status?: string): Promise<Order[]>
getOrder(id: number): Promise<Order>
createOrder(data: OrderCreate): Promise<Order>
updateOrderStatus(id: number, status: string): Promise<Order>
deleteOrder(id: number): Promise<void>
```

## 交互细节

- 所有新增/编辑操作成功后显示 toast 提示
- 删除操作前弹出确认对话框
- 表格加载时显示骨架屏或 loading
- API 错误时显示错误提示
- 创建订单失败时显示具体原因（库存不足/商品不存在）
