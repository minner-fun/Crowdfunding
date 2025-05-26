// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Crowdfunding.sol";

/**
 * @title CrowdfundingFactory
 * @dev 众筹工厂合约，用于创建和管理多个众筹项目
 */
contract CrowdfundingFactory {
    // ============ 状态变量 ============
    
    // 所有众筹合约地址
    address[] public crowdfundings;
    
    // 创建者到其众筹合约的映射
    mapping(address => address[]) public creatorToCrowdfundings;
    
    // 众筹合约地址到创建者的映射
    mapping(address => address) public crowdfundingToCreator;
    
    // 众筹合约地址到项目信息的映射
    mapping(address => ProjectInfo) public projectInfos;
    
    // 项目信息结构体
    struct ProjectInfo {
        string title;
        string description;
        string imageUrl;
        uint256 createdAt;
        bool exists;
    }
    
    // ============ 事件定义 ============
    
    event CrowdfundingCreated(
        address indexed creator,
        address indexed crowdfundingAddress,
        string title,
        uint256 goal,
        uint256 duration
    );
    
    // ============ 自定义错误 ============
    
    error InvalidParameters();
    error ProjectNotFound();
    
    // ============ 主要功能函数 ============
    
    /**
     * @dev 创建新的众筹项目
     * @param _goal 众筹目标金额 (wei)
     * @param _durationInDays 众筹持续天数
     * @param _title 项目标题
     * @param _description 项目描述
     * @param _imageUrl 项目图片URL
     */
    function createCrowdfunding(
        uint256 _goal,
        uint256 _durationInDays,
        string memory _title,
        string memory _description,
        string memory _imageUrl
    ) external returns (address) {
        if (_goal == 0 || _durationInDays == 0 || bytes(_title).length == 0) {
            revert InvalidParameters();
        }
        
        // 创建新的众筹合约
        Crowdfunding newCrowdfunding = new Crowdfunding(_goal, _durationInDays);
        address crowdfundingAddress = address(newCrowdfunding);
        
        // 记录合约信息
        crowdfundings.push(crowdfundingAddress);
        creatorToCrowdfundings[msg.sender].push(crowdfundingAddress);
        crowdfundingToCreator[crowdfundingAddress] = msg.sender;
        
        // 保存项目信息
        projectInfos[crowdfundingAddress] = ProjectInfo({
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit CrowdfundingCreated(
            msg.sender,
            crowdfundingAddress,
            _title,
            _goal,
            _durationInDays
        );
        
        return crowdfundingAddress;
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取所有众筹合约地址
     */
    function getAllCrowdfundings() external view returns (address[] memory) {
        return crowdfundings;
    }
    
    /**
     * @dev 获取众筹合约总数
     */
    function getCrowdfundingsCount() external view returns (uint256) {
        return crowdfundings.length;
    }
    
    /**
     * @dev 获取指定创建者的所有众筹合约
     */
    function getCrowdfundingsByCreator(address _creator) external view returns (address[] memory) {
        return creatorToCrowdfundings[_creator];
    }
    
    /**
     * @dev 获取项目信息
     */
    function getProjectInfo(address _crowdfunding) external view returns (
        string memory title,
        string memory description,
        string memory imageUrl,
        uint256 createdAt,
        address creator
    ) {
        ProjectInfo memory info = projectInfos[_crowdfunding];
        if (!info.exists) revert ProjectNotFound();
        
        return (
            info.title,
            info.description,
            info.imageUrl,
            info.createdAt,
            crowdfundingToCreator[_crowdfunding]
        );
    }
    
    /**
     * @dev 获取活跃的众筹项目
     */
    function getActiveCrowdfundings() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // 首先计算活跃项目数量
        for (uint256 i = 0; i < crowdfundings.length; i++) {
            Crowdfunding crowdfunding = Crowdfunding(payable(crowdfundings[i]));
            if (crowdfunding.state() == Crowdfunding.CrowdfundingState.Active) {
                activeCount++;
            }
        }
        
        // 创建结果数组
        address[] memory activeCrowdfundings = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < crowdfundings.length; i++) {
            Crowdfunding crowdfunding = Crowdfunding(payable(crowdfundings[i]));
            if (crowdfunding.state() == Crowdfunding.CrowdfundingState.Active) {
                activeCrowdfundings[currentIndex] = crowdfundings[i];
                currentIndex++;
            }
        }
        
        return activeCrowdfundings;
    }
    
    /**
     * @dev 获取成功的众筹项目
     */
    function getSuccessfulCrowdfundings() external view returns (address[] memory) {
        uint256 successfulCount = 0;
        
        // 首先计算成功项目数量
        for (uint256 i = 0; i < crowdfundings.length; i++) {
            Crowdfunding crowdfunding = Crowdfunding(payable(crowdfundings[i]));
            if (crowdfunding.state() == Crowdfunding.CrowdfundingState.Successful) {
                successfulCount++;
            }
        }
        
        // 创建结果数组
        address[] memory successfulCrowdfundings = new address[](successfulCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < crowdfundings.length; i++) {
            Crowdfunding crowdfunding = Crowdfunding(payable(crowdfundings[i]));
            if (crowdfunding.state() == Crowdfunding.CrowdfundingState.Successful) {
                successfulCrowdfundings[currentIndex] = crowdfundings[i];
                currentIndex++;
            }
        }
        
        return successfulCrowdfundings;
    }
    
    /**
     * @dev 获取众筹项目的详细统计信息
     */
    function getCrowdfundingStats(address payable _crowdfunding) external view returns (
        uint256 goal,
        uint256 amountRaised,
        uint256 contributorsCount,
        uint256 timeLeft,
        uint256 progress,
        Crowdfunding.CrowdfundingState state
    ) {
        Crowdfunding crowdfunding = Crowdfunding(_crowdfunding);
        
        return (
            crowdfunding.goal(),
            crowdfunding.amountRaised(),
            crowdfunding.getContributorsCount(),
            crowdfunding.getTimeLeft(),
            crowdfunding.getProgress(),
            crowdfunding.state()
        );
    }
    
    /**
     * @dev 项目创建者通过工厂合约提取资金
     */
    function withdrawFundsFromProject(address payable _crowdfunding) external {
        // 检查调用者是否是项目的真实创建者
        if (crowdfundingToCreator[_crowdfunding] != msg.sender) {
            revert InvalidParameters();
        }
        
        Crowdfunding crowdfunding = Crowdfunding(_crowdfunding);
        
        // 调用众筹合约的提取资金函数
        crowdfunding.withdrawFunds();
        
        // 将资金转给真实的创建者
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(msg.sender).call{value: balance}("");
            if (!success) revert InvalidParameters();
        }
    }
    
    // 接收以太币
    receive() external payable {}
} 