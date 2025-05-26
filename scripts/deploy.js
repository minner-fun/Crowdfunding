const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署众筹合约...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    // 部署众筹工厂合约
    console.log("\n部署众筹工厂合约...");
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    const crowdfundingFactory = await CrowdfundingFactory.deploy();
    await crowdfundingFactory.waitForDeployment();
    
    const factoryAddress = await crowdfundingFactory.getAddress();
    console.log("众筹工厂合约地址:", factoryAddress);
    
    // 创建一个示例众筹项目
    console.log("\n创建示例众筹项目...");
    const goal = ethers.parseEther("10"); // 10 ETH
    const duration = 30; // 30 天
    const title = "区块链学习平台";
    const description = "一个帮助开发者学习区块链技术的在线平台，包含Solidity教程、智能合约实战项目等内容。";
    const imageUrl = "https://example.com/blockchain-learning.jpg";
    
    const createTx = await crowdfundingFactory.createCrowdfunding(
        goal,
        duration,
        title,
        description,
        imageUrl
    );
    
    const receipt = await createTx.wait();
    const event = receipt.logs.find(log => {
        try {
            return crowdfundingFactory.interface.parseLog(log).name === "CrowdfundingCreated";
        } catch {
            return false;
        }
    });
    
    if (event) {
        const parsedEvent = crowdfundingFactory.interface.parseLog(event);
        const crowdfundingAddress = parsedEvent.args[1];
        console.log("示例众筹项目地址:", crowdfundingAddress);
        console.log("项目标题:", parsedEvent.args[2]);
        console.log("目标金额:", ethers.formatEther(parsedEvent.args[3]), "ETH");
        console.log("持续时间:", parsedEvent.args[4].toString(), "天");
    }
    
    // 验证部署
    console.log("\n验证部署...");
    const crowdfundingsCount = await crowdfundingFactory.getCrowdfundingsCount();
    console.log("总众筹项目数:", crowdfundingsCount.toString());
    
    const allCrowdfundings = await crowdfundingFactory.getAllCrowdfundings();
    console.log("所有众筹项目地址:", allCrowdfundings);
    
    // 创建第二个示例项目
    console.log("\n创建第二个示例项目...");
    const goal2 = ethers.parseEther("5"); // 5 ETH
    const duration2 = 15; // 15 天
    const title2 = "开源DeFi工具";
    const description2 = "开发一套开源的DeFi工具集，包含流动性挖矿、收益聚合器等功能。";
    const imageUrl2 = "https://example.com/defi-tools.jpg";
    
    await crowdfundingFactory.createCrowdfunding(
        goal2,
        duration2,
        title2,
        description2,
        imageUrl2
    );
    
    const finalCount = await crowdfundingFactory.getCrowdfundingsCount();
    console.log("最终众筹项目数:", finalCount.toString());
    
    // 输出合约地址供前端使用
    console.log("\n=== 部署完成 ===");
    console.log("众筹工厂合约地址:", factoryAddress);
    console.log("请保存此地址用于前端集成");
    
    // 输出 ABI 文件路径提示
    console.log("\n=== 重要提示 ===");
    console.log("合约 ABI 文件位置:");
    console.log("- CrowdfundingFactory: artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json");
    console.log("- Crowdfunding: artifacts/contracts/Crowdfunding.sol/Crowdfunding.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    }); 