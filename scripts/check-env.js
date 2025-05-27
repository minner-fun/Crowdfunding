const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 检查 Sepolia 部署环境配置...\n");
    
    // 检查环境变量
    console.log("📋 环境变量检查:");
    
    const privateKey = process.env.PRIVATE_KEY;
    const sepoliaUrl = process.env.SEPOLIA_URL;
    const etherscanKey = process.env.ETHERSCAN_API_KEY;
    
    console.log("✅ PRIVATE_KEY:", privateKey ? "已设置" : "❌ 未设置");
    console.log("✅ SEPOLIA_URL:", sepoliaUrl ? "已设置" : "❌ 未设置");
    console.log("✅ ETHERSCAN_API_KEY:", etherscanKey ? "已设置" : "⚠️  未设置 (可选)");
    
    if (!privateKey || !sepoliaUrl) {
        console.log("\n❌ 缺少必要的环境变量!");
        console.log("请创建 .env 文件并设置以下变量:");
        console.log("PRIVATE_KEY=0x你的私钥");
        console.log("SEPOLIA_URL=https://sepolia.infura.io/v3/你的项目ID");
        console.log("ETHERSCAN_API_KEY=你的API密钥 (可选)");
        return;
    }
    
    try {
        // 检查网络连接
        console.log("\n🌐 网络连接检查:");
        const network = await ethers.provider.getNetwork();
        console.log("✅ 网络名称:", network.name);
        console.log("✅ 链 ID:", network.chainId.toString());
        
        if (network.chainId !== 11155111n) {
            console.log("⚠️  警告: 当前网络不是 Sepolia (链 ID 应该是 11155111)");
        }
        
        // 检查账户
        console.log("\n👤 账户检查:");
        const [signer] = await ethers.getSigners();
        const address = await signer.getAddress();
        console.log("✅ 账户地址:", address);
        
        // 检查余额
        const balance = await ethers.provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        console.log("💰 账户余额:", balanceEth, "ETH");
        
        if (parseFloat(balanceEth) < 0.01) {
            console.log("⚠️  警告: 余额可能不足以完成部署");
            console.log("   建议至少有 0.05 ETH");
            console.log("   请访问以下水龙头获取测试 ETH:");
            console.log("   - https://sepoliafaucet.com/");
            console.log("   - https://faucets.chain.link/");
        } else if (parseFloat(balanceEth) >= 0.05) {
            console.log("✅ 余额充足，可以进行部署");
        } else {
            console.log("⚠️  余额较少，建议获取更多测试 ETH");
        }
        
        // 检查 Gas 价格
        console.log("\n⛽ Gas 价格检查:");
        const feeData = await ethers.provider.getFeeData();
        console.log("✅ Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "Gwei");
        console.log("✅ Max Fee:", ethers.formatUnits(feeData.maxFeePerGas, "gwei"), "Gwei");
        
        // 估算部署成本
        console.log("\n💰 部署成本估算:");
        const estimatedGas = 2500000n; // 估算的 gas 使用量
        const estimatedCost = estimatedGas * feeData.gasPrice;
        console.log("✅ 预估 Gas 使用:", estimatedGas.toString());
        console.log("✅ 预估部署成本:", ethers.formatEther(estimatedCost), "ETH");
        
        // 检查合约编译
        console.log("\n🔨 合约编译检查:");
        try {
            const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
            console.log("✅ CrowdfundingFactory 合约已编译");
            
            const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
            console.log("✅ Crowdfunding 合约已编译");
        } catch (error) {
            console.log("❌ 合约编译失败:", error.message);
            console.log("   请运行: npm run compile");
        }
        
        console.log("\n" + "=".repeat(50));
        console.log("🎉 环境检查完成!");
        console.log("=".repeat(50));
        
        if (parseFloat(balanceEth) >= 0.01) {
            console.log("✅ 环境配置正确，可以开始部署!");
            console.log("\n🚀 部署命令:");
            console.log("npm run deploy:sepolia-detailed");
        } else {
            console.log("⚠️  请先获取足够的 Sepolia ETH 再进行部署");
        }
        
    } catch (error) {
        console.log("\n❌ 环境检查失败:");
        console.error(error.message);
        
        if (error.message.includes("could not detect network")) {
            console.log("\n💡 可能的解决方案:");
            console.log("- 检查 SEPOLIA_URL 是否正确");
            console.log("- 确认网络连接正常");
            console.log("- 验证 Infura/Alchemy 项目 ID");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("检查失败:", error);
        process.exit(1);
    }); 