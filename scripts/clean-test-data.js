const { ethers } = require("hardhat");

async function main() {
    console.log("🧹 清理测试数据脚本\n");
    
    console.log("ℹ️  注意：由于区块链的不可变性，已部署的合约无法直接删除。");
    console.log("   但您可以选择以下操作：\n");
    
    console.log("1. 📋 重新部署新的工厂合约");
    console.log("2. 🔄 在现有合约上创建新的测试项目");
    console.log("3. 📝 更新前端配置以使用新的合约地址\n");
    
    // 获取网络信息
    const network = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();
    
    console.log("📡 当前网络:", network.name);
    console.log("👤 部署账户:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(balance), "ETH\n");
    
    // 提供选择
    console.log("🚀 推荐操作:");
    console.log("1. 重新部署（推荐）:");
    console.log("   npx hardhat run scripts/deploy-sepolia.js --network sepolia");
    console.log("\n2. 如果要使用现有合约，请在前端更新图片链接或使用空字符串");
    console.log("\n3. 前端配置文件位置:");
    console.log("   frontend/src/config/contracts.js");
    
    console.log("\n💡 提示:");
    console.log("- 新部署的合约将使用修复后的图片链接");
    console.log("- 前端已有错误处理，会自动显示默认图片");
    console.log("- 建议重新部署以获得最佳体验");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 脚本执行失败:", error);
        process.exit(1);
    }); 