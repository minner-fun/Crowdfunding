# 🚀 Crowdfunding DApp - 众筹智能合约项目

一个功能完整的众筹智能合约项目，演示了 Solidity 的常用功能和最佳实践。

## ✨ 项目特色

### 🎯 包含的 Solidity 常用功能
- **状态管理** - 使用枚举管理众筹的不同阶段
- **权限控制** - 修饰符控制函数访问权限  
- **时间控制** - 基于区块时间的截止日期管理
- **资金管理** - 安全的资金接收、退款、提取机制
- **事件日志** - 完整的事件记录系统
- **错误处理** - 自定义错误和 require 检查
- **映射和数组** - 高效的数据存储结构
- **工厂模式** - 通过工厂合约创建多个众筹实例
- **接收以太币** - receive 和 fallback 函数

### 🔧 技术栈
- **Solidity ^0.8.19** - 智能合约开发语言
- **Hardhat** - 开发框架和测试环境
- **Ethers.js** - 以太坊交互库
- **Chai** - 测试断言库
- **OpenZeppelin** - 安全的合约库

## 📁 项目结构

```
Crowdfunding/
├── contracts/                 # 智能合约
│   ├── Crowdfunding.sol      # 主众筹合约
│   └── CrowdfundingFactory.sol # 众筹工厂合约
├── test/                      # 测试文件
│   └── Crowdfunding.test.js   # 合约测试
├── scripts/                   # 部署脚本
│   └── deploy.js             # 部署脚本
├── docs/                      # 文档
│   └── USAGE.md              # 使用说明
├── hardhat.config.js         # Hardhat 配置
├── package.json              # 项目依赖
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd Crowdfunding
```

### 2. 安装依赖
```bash
npm install
```

### 3. 编译合约
```bash
npm run compile
```

### 4. 运行测试
```bash
npm run test
```

### 5. 启动本地节点
```bash
npm run node
```

### 6. 部署合约
```bash
# 部署到本地网络
npm run deploy:local

# 部署到 Hardhat 网络
npm run deploy:hardhat
```

## 🎮 合约功能演示

### 创建众筹项目
```solidity
// 通过工厂合约创建新的众筹项目
function createCrowdfunding(
    uint256 _goal,           // 目标金额 (wei)
    uint256 _durationInDays, // 持续天数
    string memory _title,    // 项目标题
    string memory _description, // 项目描述
    string memory _imageUrl  // 项目图片
) external returns (address);
```

### 投资项目
```solidity
// 向众筹项目投资
function contribute() external payable;
```

### 提取资金
```solidity
// 创建者提取资金（仅在成功时）
function withdrawFunds() external onlyCreator;
```

### 申请退款
```solidity
// 投资者申请退款（仅在失败时）
function getRefund() external;
```

## 📊 合约状态流转

```
Active (进行中)
    ↓
    ├── 达到目标 → Successful (成功) → Closed (已关闭)
    └── 超过截止时间且未达到目标 → Failed (失败)
```

## 🔒 安全特性

- **权限控制**: 使用修饰符确保只有授权用户可以执行特定操作
- **时间控制**: 基于区块时间戳的截止日期管理
- **资金安全**: 使用 `call` 方法安全转账，防止重入攻击
- **状态管理**: 严格的状态转换逻辑
- **输入验证**: 全面的参数验证和错误处理

## 🧪 测试覆盖

项目包含全面的测试用例，覆盖：
- 合约部署和初始化
- 投资功能和边界条件
- 资金提取和权限控制
- 退款机制和失败处理
- 工厂合约功能
- 查询函数和状态管理

## 📚 学习价值

这个项目是学习 Solidity 的绝佳示例，包含了：

1. **基础语法**: 变量类型、函数、修饰符
2. **高级特性**: 枚举、结构体、映射、数组
3. **安全实践**: 权限控制、重入防护、安全转账
4. **设计模式**: 工厂模式、状态机模式
5. **Gas 优化**: immutable 变量、事件使用
6. **测试驱动**: 完整的测试套件

## 🌐 部署到测试网

### 配置环境变量
创建 `.env` 文件：
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 部署命令
```bash
# 部署到 Sepolia 测试网
npm run deploy:sepolia

# 验证合约
npm run verify:sepolia <合约地址>
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 Issue 或联系项目维护者。

---

⭐ 如果这个项目对你有帮助，请给个 Star！