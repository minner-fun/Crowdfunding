# 🚀 Sepolia 测试网部署指南

## 📋 准备清单

### 1. 创建 `.env` 文件

在项目根目录创建 `.env` 文件（注意：这个文件不会被提交到 Git）：

```bash
# 私钥 (从 MetaMask 导出)
PRIVATE_KEY=0x你的私钥

# Infura 或 Alchemy RPC URL
SEPOLIA_URL=https://sepolia.infura.io/v3/你的项目ID

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=你的Etherscan_API_Key
```

### 2. 获取私钥

**从 MetaMask 导出私钥：**
1. 打开 MetaMask
2. 点击账户名称旁边的三个点
3. 选择 "账户详情"
4. 点击 "导出私钥"
5. 输入密码确认
6. 复制私钥（以 0x 开头的 64 位字符串）

⚠️ **安全提醒：** 
- 永远不要分享你的私钥
- 不要在主网使用测试用的私钥
- 建议为测试网创建专门的钱包

### 3. 获取 Sepolia ETH

**方法一：官方水龙头**
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet)

**方法二：社区水龙头**
- [Chainlink Faucet](https://faucets.chain.link/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

**需要的 ETH 数量：**
- 部署工厂合约：约 0.01-0.02 ETH
- 创建众筹项目：约 0.005-0.01 ETH
- 总计建议：0.05 ETH（包含余量）

### 4. 获取 RPC URL

**选项一：Infura**
1. 访问 [Infura.io](https://infura.io/)
2. 注册账户并创建项目
3. 选择 "Ethereum" 网络
4. 复制 Sepolia 端点 URL

**选项二：Alchemy**
1. 访问 [Alchemy.com](https://www.alchemy.com/)
2. 注册账户并创建应用
3. 选择 "Ethereum Sepolia" 网络
4. 复制 HTTPS URL

**选项三：公共 RPC（不推荐生产使用）**
```
https://rpc.sepolia.org
https://sepolia.gateway.tenderly.co
```

### 5. 获取 Etherscan API Key（可选）

用于合约验证：
1. 访问 [Etherscan.io](https://etherscan.io/)
2. 注册账户
3. 进入 "API Keys" 页面
4. 创建新的 API Key
5. 复制 API Key

## 🚀 部署步骤

### 1. 配置环境变量

创建 `.env` 文件：
```bash
PRIVATE_KEY=0x你的私钥
SEPOLIA_URL=https://sepolia.infura.io/v3/你的项目ID
ETHERSCAN_API_KEY=你的API密钥
```

### 2. 检查配置

验证网络配置：
```bash
npx hardhat console --network sepolia
```

### 3. 部署合约

```bash
npm run deploy:sepolia
```

### 4. 验证合约（可选）

```bash
npx hardhat verify --network sepolia <工厂合约地址>
```

## 📊 部署成本估算

| 操作 | Gas 消耗 | 成本 (约) |
|------|----------|-----------|
| 部署工厂合约 | ~2,000,000 | 0.01-0.02 ETH |
| 创建众筹项目 | ~500,000 | 0.003-0.005 ETH |
| 投资操作 | ~100,000 | 0.0005-0.001 ETH |
| 提取资金 | ~50,000 | 0.0003-0.0005 ETH |

*成本基于 Gas Price 20-50 Gwei*

## 🔍 部署后验证

### 1. 检查合约状态

```javascript
// 在 Hardhat console 中
const factory = await ethers.getContractAt("CrowdfundingFactory", "合约地址");
console.log("工厂合约地址:", await factory.getAddress());
console.log("项目总数:", await factory.getCrowdfundingsCount());
```

### 2. 在 Etherscan 上查看

访问：`https://sepolia.etherscan.io/address/你的合约地址`

### 3. 创建测试项目

```bash
# 运行交互脚本（修改为 sepolia 网络）
npx hardhat run scripts/interact.js --network sepolia
```

## 🛠️ 故障排除

### 常见错误及解决方案

**1. "insufficient funds for intrinsic transaction cost"**
- 解决：确保账户有足够的 Sepolia ETH

**2. "nonce too high"**
- 解决：重置 MetaMask 账户或等待网络同步

**3. "replacement transaction underpriced"**
- 解决：增加 gas price 或等待之前的交易完成

**4. "invalid project id"**
- 解决：检查 Infura/Alchemy 项目 ID 是否正确

### 调试命令

```bash
# 检查账户余额
npx hardhat console --network sepolia
> const balance = await ethers.provider.getBalance("你的地址");
> console.log(ethers.formatEther(balance));

# 检查网络连接
npx hardhat console --network sepolia
> const network = await ethers.provider.getNetwork();
> console.log(network);
```

## 📱 前端集成

部署成功后，你可以：

1. **记录合约地址** - 保存工厂合约地址
2. **更新前端配置** - 在前端应用中使用合约地址
3. **测试功能** - 通过前端界面测试所有功能

## 🔐 安全最佳实践

1. **使用专用测试钱包** - 不要使用主钱包的私钥
2. **限制资金** - 测试钱包只存放必要的 ETH
3. **定期轮换** - 定期更换测试用私钥
4. **监控活动** - 定期检查钱包活动
5. **备份重要信息** - 保存合约地址和交易哈希

## 📚 相关资源

- [Sepolia 测试网信息](https://sepolia.dev/)
- [Hardhat 部署文档](https://hardhat.org/tutorial/deploying-to-a-live-network.html)
- [MetaMask 使用指南](https://metamask.io/faqs/)
- [Etherscan 验证指南](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)

---

🎉 **准备好了吗？按照这个指南，你就可以成功部署到 Sepolia 测试网了！** 