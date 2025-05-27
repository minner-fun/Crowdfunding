const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署到 Sepolia 测试网...\n");
    
    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    console.log("📡 网络信息:");
    console.log("  网络名称:", network.name);
    console.log("  链 ID:", network.chainId.toString());
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("\n👤 部署账户:", deployer.address);
    
    // 检查账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  警告: 余额可能不足以完成部署");
        console.log("   建议至少有 0.05 ETH 用于部署和测试");
        console.log("   请访问 Sepolia 水龙头获取测试 ETH:");
        console.log("   - https://sepoliafaucet.com/");
        console.log("   - https://faucets.chain.link/");
    }
    
    // 获取当前 gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log("⛽ Gas 信息:");
    console.log("  Gas Price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "Gwei");
    console.log("  Max Fee:", ethers.formatUnits(gasPrice.maxFeePerGas, "gwei"), "Gwei");
    
    console.log("\n🏭 开始部署众筹工厂合约...");
    
    // 部署工厂合约
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    
    console.log("📝 估算部署成本...");
    const deploymentData = CrowdfundingFactory.interface.encodeDeploy([]);
    const estimatedGas = await ethers.provider.estimateGas({
        data: deploymentData
    });
    const estimatedCost = estimatedGas * gasPrice.gasPrice;
    console.log("  预估 Gas:", estimatedGas.toString());
    console.log("  预估成本:", ethers.formatEther(estimatedCost), "ETH");
    
    // 确认部署
    console.log("\n⏳ 正在部署合约...");
    const crowdfundingFactory = await CrowdfundingFactory.deploy();
    
    console.log("📋 部署交易已发送");
    console.log("  交易哈希:", crowdfundingFactory.deploymentTransaction().hash);
    
    // 等待部署确认
    console.log("⏳ 等待交易确认...");
    await crowdfundingFactory.waitForDeployment();
    
    const factoryAddress = await crowdfundingFactory.getAddress();
    console.log("✅ 工厂合约部署成功!");
    console.log("📍 合约地址:", factoryAddress);
    
    // 获取部署交易详情
    const deployTx = await ethers.provider.getTransaction(crowdfundingFactory.deploymentTransaction().hash);
    const receipt = await ethers.provider.getTransactionReceipt(crowdfundingFactory.deploymentTransaction().hash);
    
    console.log("\n📊 部署统计:");
    console.log("  实际 Gas 使用:", receipt.gasUsed.toString());
    console.log("  实际成本:", ethers.formatEther(receipt.gasUsed * deployTx.gasPrice), "ETH");
    console.log("  区块号:", receipt.blockNumber);
    
    // 验证部署
    console.log("\n🔍 验证部署...");
    try {
        const count = await crowdfundingFactory.getCrowdfundingsCount();
        console.log("✅ 合约功能正常，当前项目数:", count.toString());
    } catch (error) {
        console.log("❌ 合约验证失败:", error.message);
    }
    
    // 创建示例项目
    console.log("\n📝 创建示例众筹项目...");
    try {
        const goal = ethers.parseEther("1"); // 1 ETH (测试网用较小金额)
        const duration = 7; // 7 天
        const title = "Sepolia 测试项目";
        const description = "这是一个在 Sepolia 测试网上的示例众筹项目";
        const imageUrl = "https://example.com/test-project.jpg";
        
        console.log("⏳ 创建项目交易中...");
        const createTx = await crowdfundingFactory.createCrowdfunding(
            goal,
            duration,
            title,
            description,
            imageUrl
        );
        
        console.log("📋 创建交易哈希:", createTx.hash);
        const createReceipt = await createTx.wait();
        
        // 解析事件获取项目地址
        const event = createReceipt.logs.find(log => {
            try {
                return crowdfundingFactory.interface.parseLog(log).name === "CrowdfundingCreated";
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsedEvent = crowdfundingFactory.interface.parseLog(event);
            const projectAddress = parsedEvent.args[1];
            console.log("✅ 示例项目创建成功!");
            console.log("📍 项目地址:", projectAddress);
            console.log("🎯 目标金额:", ethers.formatEther(goal), "ETH");
            console.log("⏰ 持续时间:", duration, "天");
        }
        
    } catch (error) {
        console.log("⚠️  创建示例项目失败:", error.message);
    }
    
    // 输出重要信息
    console.log("\n" + "=".repeat(60));
    console.log("🎉 部署完成!");
    console.log("=".repeat(60));
    console.log("📍 工厂合约地址:", factoryAddress);
    console.log("🌐 Etherscan 链接:");
    console.log("   https://sepolia.etherscan.io/address/" + factoryAddress);
    console.log("\n📋 保存以下信息用于前端集成:");
    console.log("```json");
    console.log("{");
    console.log(`  "network": "sepolia",`);
    console.log(`  "chainId": ${network.chainId},`);
    console.log(`  "factoryAddress": "${factoryAddress}",`);
    console.log(`  "deploymentBlock": ${receipt.blockNumber},`);
    console.log(`  "deploymentTx": "${crowdfundingFactory.deploymentTransaction().hash}"`);
    console.log("}");
    console.log("```");
    
    // 验证指令
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("\n🔍 合约验证指令:");
        console.log(`npx hardhat verify --network sepolia ${factoryAddress}`);
    } else {
        console.log("\n💡 提示: 设置 ETHERSCAN_API_KEY 环境变量以启用合约验证");
    }
    
    // 下一步指引
    console.log("\n🚀 下一步操作:");
    console.log("1. 在 Etherscan 上查看合约");
    console.log("2. 验证合约源码 (如果有 API key)");
    console.log("3. 测试合约功能:");
    console.log("   npx hardhat run scripts/interact.js --network sepolia");
    console.log("4. 在前端应用中集成合约地址");
    
    console.log("\n✨ 恭喜！你的众筹合约已成功部署到 Sepolia 测试网！");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ 部署失败:");
        console.error(error);
        
        // 提供故障排除建议
        console.log("\n🛠️  故障排除建议:");
        if (error.message.includes("insufficient funds")) {
            console.log("- 账户余额不足，请从水龙头获取更多 Sepolia ETH");
        }
        if (error.message.includes("nonce")) {
            console.log("- Nonce 问题，请重置 MetaMask 账户或等待网络同步");
        }
        if (error.message.includes("gas")) {
            console.log("- Gas 相关问题，请检查网络状况或增加 gas limit");
        }
        if (error.message.includes("network")) {
            console.log("- 网络连接问题，请检查 RPC URL 和网络配置");
        }
        
        process.exit(1);
    }); 