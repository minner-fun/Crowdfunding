// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CrowdfundingV2
 * @dev 增强版众筹合约，支持项目管理功能
 * @author Your Name
 */
contract CrowdfundingV2 {
    // ============ 状态变量 ============
    
    address public immutable creator;
    uint256 public immutable goal;
    uint256 public immutable deadline;
    uint256 public amountRaised;
    
    // 众筹状态枚举
    enum CrowdfundingState {
        Active,     // 进行中
        Successful, // 成功
        Failed,     // 失败
        Closed,     // 已关闭
        Archived    // 已归档（创建者主动归档）
    }
    
    CrowdfundingState public state;
    
    // 项目可见性控制
    bool public isVisible = true;  // 是否在公开列表中显示
    bool public isArchived = false; // 是否已归档
    
    // 项目元数据
    struct ProjectMetadata {
        string title;
        string description;
        string imageUrl;
        uint256 createdAt;
        uint256 archivedAt;
        string archiveReason;
    }
    
    ProjectMetadata public metadata;
    
    mapping(address => uint256) public contributions;
    address[] public contributors;
    mapping(address => bool) public hasContributed;
    
    // ============ 事件定义 ============
    
    event ContributionReceived(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalAmount);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundIssued(address indexed contributor, uint256 amount);
    event CrowdfundingClosed();
    event ProjectArchived(string reason, uint256 timestamp);
    event ProjectUnarchived(uint256 timestamp);
    event VisibilityChanged(bool isVisible);
    
    // ============ 修饰符 ============
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }
    
    modifier notArchived() {
        require(!isArchived, "Project is archived");
        _;
    }
    
    modifier onlyActive() {
        require(state == CrowdfundingState.Active, "Crowdfunding is not active");
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor(
        uint256 _goal,
        uint256 _durationInDays,
        string memory _title,
        string memory _description,
        string memory _imageUrl
    ) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        creator = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        state = CrowdfundingState.Active;
        
        metadata = ProjectMetadata({
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            createdAt: block.timestamp,
            archivedAt: 0,
            archiveReason: ""
        });
    }
    
    // ============ 项目管理功能 ============
    
    /**
     * @dev 归档项目（创建者可以主动归档已结束的项目）
     * @param reason 归档原因
     */
    function archiveProject(string memory reason) external onlyCreator {
        require(
            state == CrowdfundingState.Successful || 
            state == CrowdfundingState.Failed || 
            state == CrowdfundingState.Closed,
            "Can only archive finished projects"
        );
        require(!isArchived, "Project already archived");
        
        isArchived = true;
        isVisible = false; // 归档的项目默认不可见
        state = CrowdfundingState.Archived;
        metadata.archivedAt = block.timestamp;
        metadata.archiveReason = reason;
        
        emit ProjectArchived(reason, block.timestamp);
    }
    
    /**
     * @dev 取消归档项目
     */
    function unarchiveProject() external onlyCreator {
        require(isArchived, "Project is not archived");
        
        isArchived = false;
        isVisible = true;
        
        // 恢复到之前的状态
        if (block.timestamp > deadline) {
            if (amountRaised >= goal) {
                state = CrowdfundingState.Successful;
            } else {
                state = CrowdfundingState.Failed;
            }
        } else {
            state = CrowdfundingState.Active;
        }
        
        metadata.archivedAt = 0;
        metadata.archiveReason = "";
        
        emit ProjectUnarchived(block.timestamp);
    }
    
    /**
     * @dev 设置项目可见性
     * @param _isVisible 是否可见
     */
    function setVisibility(bool _isVisible) external onlyCreator {
        require(!isArchived, "Cannot change visibility of archived project");
        isVisible = _isVisible;
        emit VisibilityChanged(_isVisible);
    }
    
    /**
     * @dev 更新项目描述（仅限进行中的项目）
     * @param newDescription 新的描述
     */
    function updateDescription(string memory newDescription) external onlyCreator onlyActive notArchived {
        metadata.description = newDescription;
    }
    
    /**
     * @dev 更新项目图片（仅限进行中的项目）
     * @param newImageUrl 新的图片链接
     */
    function updateImage(string memory newImageUrl) external onlyCreator onlyActive notArchived {
        metadata.imageUrl = newImageUrl;
    }
    
    // ============ 查询功能 ============
    
    /**
     * @dev 获取项目完整信息
     */
    function getProjectInfo() external view returns (
        string memory title,
        string memory description,
        string memory imageUrl,
        uint256 createdAt,
        address projectCreator,
        bool visible,
        bool archived,
        string memory archiveReason,
        uint256 archivedAt
    ) {
        return (
            metadata.title,
            metadata.description,
            metadata.imageUrl,
            metadata.createdAt,
            creator,
            isVisible,
            isArchived,
            metadata.archiveReason,
            metadata.archivedAt
        );
    }
    
    /**
     * @dev 检查项目是否应该在公开列表中显示
     */
    function shouldShowInPublicList() external view returns (bool) {
        return isVisible && !isArchived;
    }
    
    // ============ 原有众筹功能 ============
    
    function contribute() external payable onlyActive notArchived {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(block.timestamp < deadline, "Crowdfunding has ended");
        
        if (!hasContributed[msg.sender]) {
            contributors.push(msg.sender);
            hasContributed[msg.sender] = true;
        }
        
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value);
        
        if (amountRaised >= goal) {
            state = CrowdfundingState.Successful;
            emit GoalReached(amountRaised);
        }
    }
    
    function withdrawFunds() external onlyCreator {
        require(state == CrowdfundingState.Successful, "Goal not reached");
        require(address(this).balance > 0, "No funds to withdraw");
        
        uint256 amount = address(this).balance;
        state = CrowdfundingState.Closed;
        
        (bool success, ) = payable(creator).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(creator, amount);
        emit CrowdfundingClosed();
    }
    
    function getRefund() external {
        require(
            state == CrowdfundingState.Failed || 
            (block.timestamp >= deadline && amountRaised < goal),
            "Refund not available"
        );
        require(contributions[msg.sender] > 0, "No contribution found");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        if (state != CrowdfundingState.Failed) {
            state = CrowdfundingState.Failed;
        }
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, amount);
    }
    
    function checkAndUpdateState() external {
        if (block.timestamp >= deadline && state == CrowdfundingState.Active) {
            if (amountRaised >= goal) {
                state = CrowdfundingState.Successful;
                emit GoalReached(amountRaised);
            } else {
                state = CrowdfundingState.Failed;
            }
        }
    }
    
    function getContributors() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory amounts = new uint256[](contributors.length);
        for (uint256 i = 0; i < contributors.length; i++) {
            amounts[i] = contributions[contributors[i]];
        }
        return (contributors, amounts);
    }
    
    // ============ 辅助函数 ============
    
    function getTimeLeft() external view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }
    
    function getProgress() external view returns (uint256) {
        if (goal == 0) return 0;
        return (amountRaised * 100) / goal;
    }
} 