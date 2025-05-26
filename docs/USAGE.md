# 众筹合约使用说明

## 项目概述

这是一个功能完整的众筹智能合约项目，演示了 Solidity 的常用功能和最佳实践。

## 合约功能特性

### 🎯 核心功能
- **众筹创建**: 通过工厂合约创建新的众筹项目
- **资金投资**: 用户可以向众筹项目投资以太币
- **目标达成**: 自动检测是否达到众筹目标
- **资金提取**: 创建者在成功时可以提取资金
- **退款机制**: 失败时投资者可以申请退款

### 🔧 技术特性
- **状态管理**: 使用枚举管理众筹状态
- **权限控制**: 修饰符控制函数访问权限
- **时间控制**: 基于区块时间的截止日期管理
- **事件日志**: 完整的事件记录系统
- **错误处理**: 自定义错误和 require 检查
- **Gas 优化**: 使用 immutable 和优化的存储结构

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 编译合约

```bash
npm run compile
```

### 3. 运行测试

```bash
npm run test
```

### 4. 启动本地节点

```bash
npm run node
```

### 5. 部署到本地网络

```bash
npm run deploy:local
```

## 合约交互示例

### 创建众筹项目

```javascript
// 通过工厂合约创建众筹项目
const goal = ethers.parseEther("10"); // 10 ETH
const duration = 30; // 30 天
const title = "我的众筹项目";
const description = "项目描述";
const imageUrl = "https://example.com/image.jpg";

const tx = await crowdfundingFactory.createCrowdfunding(
    goal,
    duration,
    title,
    description,
    imageUrl
);
```

### 投资项目

```javascript
// 向众筹项目投资
const contributionAmount = ethers.parseEther("1"); // 1 ETH
await crowdfunding.contribute({ value: contributionAmount });
```

### 查询项目信息

```javascript
// 获取众筹项目详细信息
const info = await crowdfunding.getCrowdfundingInfo();
console.log("创建者:", info[0]);
console.log("目标金额:", ethers.formatEther(info[1]), "ETH");
console.log("当前金额:", ethers.formatEther(info[3]), "ETH");
console.log("投资者数量:", info[5].toString());

// 获取进度百分比
const progress = await crowdfunding.getProgress();
console.log("完成进度:", progress.toString(), "%");
```

### 提取资金

```javascript
// 创建者提取资金（仅在成功时）
await crowdfunding.withdrawFunds();
```

### 申请退款

```javascript
// 投资者申请退款（仅在失败时）
await crowdfunding.getRefund();
```

## 合约状态说明

- **Active (0)**: 众筹进行中
- **Successful (1)**: 众筹成功
- **Failed (2)**: 众筹失败
- **Closed (3)**: 众筹已关闭

## 安全特性

### 权限控制
- 只有创建者可以提取资金
- 只有在适当状态下才能执行特定操作

### 时间控制
- 投资只能在截止日期前进行
- 退款只能在截止日期后申请

### 资金安全
- 使用 `call` 方法安全转账
- 防止重入攻击
- 状态更新在转账前完成

### 错误处理
- 自定义错误节省 gas
- 详细的错误信息
- 输入验证

## 测试网络部署

### 配置环境变量

创建 `.env` 文件：

```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 部署到 Sepolia

```bash
npm run deploy:sepolia
```

### 验证合约

```bash
npm run verify:sepolia <合约地址> <构造函数参数>
```

## Gas 优化建议

1. **使用 immutable**: 构造函数设置的不变值
2. **打包结构体**: 合理安排变量顺序
3. **批量操作**: 减少交易次数
4. **事件替代存储**: 使用事件记录历史数据

## 常见问题

### Q: 如何处理众筹失败？
A: 众筹失败时，投资者可以调用 `getRefund()` 函数申请退款。

### Q: 创建者何时可以提取资金？
A: 只有在达到目标金额时，创建者才能提取资金。

### Q: 如何查看所有投资者？
A: 调用 `getContributors()` 函数获取所有投资者地址。

### Q: 众筹项目可以延期吗？
A: 当前版本不支持延期，截止时间在创建时确定。

## 扩展功能建议

1. **分阶段资金释放**: 根据项目进度分批释放资金
2. **投票治理**: 投资者对项目决策进行投票
3. **代币奖励**: 为投资者发放项目代币
4. **里程碑管理**: 设置项目里程碑和验证机制
5. **多币种支持**: 支持 ERC20 代币投资

## 许可证

MIT License 