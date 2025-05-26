const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始众筹合约交互演示...\n");
    
    // 获取账户
    const [owner, user1, user2, user3] = await ethers.getSigners();
    console.log("📋 账户信息:");
    console.log("创建者:", owner.address);
    console.log("用户1:", user1.address);
    console.log("用户2:", user2.address);
    console.log("用户3:", user3.address);
    
    // 部署工厂合约
    console.log("\n🏭 部署众筹工厂合约...");
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    const factory = await CrowdfundingFactory.deploy();
    await factory.waitForDeployment();
    console.log("工厂合约地址:", await factory.getAddress());
    
    // 创建第一个众筹项目
    console.log("\n📝 创建第一个众筹项目...");
    const goal1 = ethers.parseEther("5"); // 5 ETH
    const duration1 = 30; // 30 天
    
    const tx1 = await factory.createCrowdfunding(
        goal1,
        duration1,
        "区块链学习平台",
        "一个帮助开发者学习区块链技术的在线平台",
        "https://example.com/blockchain.jpg"
    );
    
    const receipt1 = await tx1.wait();
    const event1 = receipt1.logs.find(log => {
        try {
            return factory.interface.parseLog(log).name === "CrowdfundingCreated";
        } catch {
            return false;
        }
    });
    
    const crowdfunding1Address = factory.interface.parseLog(event1).args[1];
    console.log("项目1地址:", crowdfunding1Address);
    
    // 获取众筹合约实例
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    const crowdfunding1 = Crowdfunding.attach(crowdfunding1Address);
    
    // 创建第二个众筹项目
    console.log("\n📝 创建第二个众筹项目...");
    const goal2 = ethers.parseEther("3"); // 3 ETH
    const duration2 = 15; // 15 天
    
    await factory.connect(user1).createCrowdfunding(
        goal2,
        duration2,
        "DeFi 工具集",
        "开源的去中心化金融工具集合",
        "https://example.com/defi.jpg"
    );
    
    // 显示所有项目
    console.log("\n📊 查看所有众筹项目...");
    const allProjects = await factory.getAllCrowdfundings();
    console.log("总项目数:", allProjects.length);
    
    for (let i = 0; i < allProjects.length; i++) {
        const projectInfo = await factory.getProjectInfo(allProjects[i]);
        console.log(`项目 ${i + 1}:`);
        console.log("  标题:", projectInfo[0]);
        console.log("  描述:", projectInfo[1]);
        console.log("  创建者:", projectInfo[4]);
        console.log("  地址:", allProjects[i]);
    }
    
    // 用户投资演示
    console.log("\n💰 用户投资演示...");
    
    // 用户1投资 2 ETH
    console.log("用户1投资 2 ETH...");
    await crowdfunding1.connect(user1).contribute({ value: ethers.parseEther("2") });
    
    // 用户2投资 1.5 ETH
    console.log("用户2投资 1.5 ETH...");
    await crowdfunding1.connect(user2).contribute({ value: ethers.parseEther("1.5") });
    
    // 用户3投资 1 ETH
    console.log("用户3投资 1 ETH...");
    await crowdfunding1.connect(user3).contribute({ value: ethers.parseEther("1") });
    
    // 查看项目状态
    console.log("\n📈 查看项目状态...");
    const info = await crowdfunding1.getCrowdfundingInfo();
    console.log("创建者:", info[0]);
    console.log("目标金额:", ethers.formatEther(info[1]), "ETH");
    console.log("当前金额:", ethers.formatEther(info[3]), "ETH");
    console.log("投资者数量:", info[5].toString());
    
    const progress = await crowdfunding1.getProgress();
    console.log("完成进度:", progress.toString(), "%");
    
    const timeLeft = await crowdfunding1.getTimeLeft();
    console.log("剩余时间:", timeLeft.toString(), "秒");
    
    // 查看投资者列表
    console.log("\n👥 投资者列表:");
    const contributors = await crowdfunding1.getContributors();
    for (let i = 0; i < contributors.length; i++) {
        const contribution = await crowdfunding1.contributions(contributors[i]);
        console.log(`投资者 ${i + 1}: ${contributors[i]} - ${ethers.formatEther(contribution)} ETH`);
    }
    
    // 再投资达到目标
    console.log("\n🎯 用户1再投资 0.5 ETH 达到目标...");
    await crowdfunding1.connect(user1).contribute({ value: ethers.parseEther("0.5") });
    
    // 检查状态更新
    const finalInfo = await crowdfunding1.getCrowdfundingInfo();
    console.log("最终金额:", ethers.formatEther(finalInfo[3]), "ETH");
    console.log("众筹状态:", finalInfo[4].toString()); // 应该是 1 (Successful)
    
    const isSuccessful = await crowdfunding1.isSuccessful();
    console.log("是否成功:", isSuccessful);
    
    // 创建者提取资金
    console.log("\n💸 创建者提取资金...");
    const balanceBefore = await ethers.provider.getBalance(owner.address);
    console.log("提取前余额:", ethers.formatEther(balanceBefore), "ETH");
    
    await factory.withdrawFundsFromProject(crowdfunding1Address);
    
    const balanceAfter = await ethers.provider.getBalance(owner.address);
    console.log("提取后余额:", ethers.formatEther(balanceAfter), "ETH");
    
    // 查看工厂合约统计
    console.log("\n📊 工厂合约统计:");
    const totalCount = await factory.getCrowdfundingsCount();
    console.log("总项目数:", totalCount.toString());
    
    const activeProjects = await factory.getActiveCrowdfundings();
    console.log("活跃项目数:", activeProjects.length);
    
    const successfulProjects = await factory.getSuccessfulCrowdfundings();
    console.log("成功项目数:", successfulProjects.length);
    
    // 查看创建者的项目
    const ownerProjects = await factory.getCrowdfundingsByCreator(owner.address);
    console.log("创建者的项目数:", ownerProjects.length);
    
    const user1Projects = await factory.getCrowdfundingsByCreator(user1.address);
    console.log("用户1的项目数:", user1Projects.length);
    
    console.log("\n✅ 众筹合约交互演示完成！");
    console.log("\n🎉 恭喜！你已经成功体验了完整的众筹流程：");
    console.log("   1. 创建众筹项目");
    console.log("   2. 用户投资");
    console.log("   3. 达到目标");
    console.log("   4. 提取资金");
    console.log("   5. 查看统计信息");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("交互演示失败:", error);
        process.exit(1);
    }); 