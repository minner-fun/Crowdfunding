# 众筹 DApp 前端

这是一个基于 React 的去中心化众筹平台前端应用，与部署在 Sepolia 测试网的智能合约交互。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 安装 Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开。

## 📋 功能特性

### 🔗 钱包连接
- MetaMask 钱包集成
- 自动网络检测和切换
- Sepolia 测试网支持

### 🏠 首页
- 项目列表展示
- 搜索和过滤功能
- 实时统计数据
- 响应式设计

### ➕ 创建项目
- 项目信息表单
- 图片预览功能
- 表单验证
- 交易状态跟踪

### 💰 投资功能
- 投资金额输入
- 快速金额选择
- 风险提示
- 交易确认

### 📊 项目详情
- 详细项目信息
- 投资者列表
- 进度追踪
- 操作按钮

## 🛠️ 技术栈

- **React 18** - 前端框架
- **Ethers.js 6** - 以太坊交互
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **React Hot Toast** - 通知组件
- **Date-fns** - 日期处理

## 📁 项目结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Header.js       # 页面头部
│   │   ├── ProjectCard.js  # 项目卡片
│   │   └── ContributeModal.js # 投资模态框
│   ├── pages/              # 页面组件
│   │   ├── HomePage.js     # 首页
│   │   ├── CreateProjectPage.js # 创建项目
│   │   └── MyProjectsPage.js # 我的项目
│   ├── hooks/              # 自定义钩子
│   │   └── useWeb3.js      # Web3 钩子
│   ├── config/             # 配置文件
│   │   └── contracts.js    # 合约配置
│   ├── App.js              # 主应用组件
│   ├── App.css             # 全局样式
│   └── index.js            # 应用入口
├── package.json
└── README.md
```

## 🔧 配置说明

### 合约配置

在 `src/config/contracts.js` 中配置：

```javascript
export const CONTRACT_CONFIG = {
  sepolia: {
    chainId: 11155111,
    factoryAddress: "0xD67f4Ae056520Ad36456298D6F8714C9c899454C",
    // ... 其他配置
  }
};
```

### 环境要求

- Node.js 16+
- MetaMask 浏览器扩展
- Sepolia 测试网 ETH

## 🎨 UI/UX 特性

### 响应式设计
- 移动端适配
- 平板端优化
- 桌面端完整体验

### 交互体验
- 加载状态指示
- 错误处理提示
- 成功反馈动画
- 平滑过渡效果

### 可访问性
- 键盘导航支持
- 屏幕阅读器友好
- 高对比度设计
- 语义化 HTML

## 🔐 安全特性

- 钱包连接验证
- 网络检查
- 输入验证
- 交易确认
- 错误边界处理

## 📱 移动端支持

- 响应式布局
- 触摸友好的交互
- 移动端导航
- 优化的表单输入

## 🚀 部署

### 构建生产版本

```bash
npm run build
```

### 部署到静态托管

构建后的文件在 `build/` 目录，可以部署到：

- Vercel
- Netlify
- GitHub Pages
- IPFS

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `App.js` 中添加路由
3. 在 `Header.js` 中添加导航

### 添加新组件

1. 在 `src/components/` 创建组件
2. 使用 Tailwind CSS 样式
3. 添加 PropTypes 验证

### 自定义样式

在 `src/App.css` 中添加全局样式：

```css
.custom-class {
  /* 自定义样式 */
}
```

## 🐛 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查 MetaMask 是否安装
   - 确认网络设置正确

2. **交易失败**
   - 检查账户余额
   - 确认 Gas 费用设置

3. **页面加载慢**
   - 检查网络连接
   - 清除浏览器缓存

### 调试技巧

- 打开浏览器开发者工具
- 查看控制台错误信息
- 检查网络请求状态
- 验证合约地址配置

## 📞 支持

如有问题，请：

1. 检查文档和 FAQ
2. 查看 GitHub Issues
3. 联系开发团队

---

�� **享受去中心化众筹的体验！** 