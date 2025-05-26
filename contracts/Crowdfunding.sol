// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Crowdfunding
 * @dev 一个功能完整的众筹合约demo，包含Solidity常用功能
 * @author Your Name
 */
contract Crowdfunding {
    // ============ 状态变量 ============
    
    // 众筹创建者
    address public immutable creator;
    
    // 众筹目标金额 (wei)
    uint256 public immutable goal;
    
    // 众筹截止时间
    uint256 public immutable deadline;
    
    // 当前筹集金额
    uint256 public amountRaised;
    
    // 众筹状态枚举
    enum CrowdfundingState {
        Active,     // 进行中
        Successful, // 成功
        Failed,     // 失败
        Closed      // 已关闭
    }
    
    // 众筹状态
    CrowdfundingState public state;
    
    // 投资者地址到投资金额的映射
    mapping(address => uint256) public contributions;
    
    // 投资者地址数组
    address[] public contributors;
    
    // 记录地址是否已经投资过
    mapping(address => bool) public hasContributed;
    
    // ============ 事件定义 ============
    
    event ContributionReceived(address indexed contributor, uint256 amount); // 投资事件 indexed 索引化
    event GoalReached(uint256 totalAmount); // 达到目标事件
    event FundsWithdrawn(address indexed creator, uint256 amount); // 提取资金事件
    event RefundIssued(address indexed contributor, uint256 amount); // 退款事件
    event CrowdfundingClosed(); // 众筹关闭事件
    
    // ============ 自定义错误 ============
    
    error CrowdfundingEnded(); // 众筹结束错误
    error CrowdfundingNotEnded(); // 众筹未结束错误
    error GoalNotReached(); // 目标未达到错误
    error GoalAlreadyReached(); // 目标已达到错误
    error OnlyCreator(); // 仅创建者错误
    error InvalidAmount(); // 无效金额错误
    error NoContribution(); // 没有投资错误
    error AlreadyClosed(); // 已关闭错误
    error TransferFailed(); // 转账失败错误
    
    // ============ 修饰符 ============
    
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator(); // 仅创建者错误
        _;
    }
    
    modifier onlyActive() {
        if (state != CrowdfundingState.Active) revert AlreadyClosed(); // 已关闭错误
        _;
    }
    
    modifier onlyAfterDeadline() {
        if (block.timestamp < deadline) revert CrowdfundingNotEnded(); // 众筹未结束错误
        _;
    }
    
    modifier onlyBeforeDeadline() {
        if (block.timestamp >= deadline) revert CrowdfundingEnded();
        _;
    }
    
    // ============ 构造函数 ============
    
    /**
     * @dev 构造函数
     * @param _goal 众筹目标金额 (wei)
     * @param _durationInDays 众筹持续天数
     */
    constructor(uint256 _goal, uint256 _durationInDays) {
        if (_goal == 0) revert InvalidAmount(); // 无效金额错误
        if (_durationInDays == 0) revert InvalidAmount(); // 无效金额错误
        
        creator = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        state = CrowdfundingState.Active;
    }
    
    // ============ 主要功能函数 ============
    
    /**
     * @dev 投资函数
     */
    function contribute() external payable onlyActive onlyBeforeDeadline {
        if (msg.value == 0) revert InvalidAmount();
        
        // 记录投资
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;
        
        // 如果是新投资者，添加到数组中
        if (!hasContributed[msg.sender]) {
            contributors.push(msg.sender);
            hasContributed[msg.sender] = true;
        }
        
        emit ContributionReceived(msg.sender, msg.value);
        
        // 检查是否达到目标
        if (amountRaised >= goal && state == CrowdfundingState.Active) {
            state = CrowdfundingState.Successful;
            emit GoalReached(amountRaised);
        }
    }
    
    /**
     * @dev 创建者提取资金 (仅在成功时)
     */
    function withdrawFunds() external onlyCreator {
        if (state != CrowdfundingState.Successful && 
            (state != CrowdfundingState.Active || block.timestamp < deadline || amountRaised < goal)) {
            revert GoalNotReached();
        }
        
        if (state == CrowdfundingState.Active) {
            state = CrowdfundingState.Successful;
        }
        
        uint256 amount = address(this).balance;
        state = CrowdfundingState.Closed;
        
        (bool success, ) = payable(creator).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(creator, amount);
        emit CrowdfundingClosed();
    }
    
    /**
     * @dev 投资者申请退款 (仅在失败时)
     */
    function getRefund() external {
        // 检查众筹是否失败
        if (block.timestamp < deadline) revert CrowdfundingNotEnded();
        if (amountRaised >= goal) revert GoalAlreadyReached();
        
        uint256 contributedAmount = contributions[msg.sender];
        if (contributedAmount == 0) revert NoContribution();
        
        // 更新状态
        if (state == CrowdfundingState.Active) {
            state = CrowdfundingState.Failed;
        }
        
        contributions[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: contributedAmount}("");
        if (!success) revert TransferFailed();
        
        emit RefundIssued(msg.sender, contributedAmount);
    }
    
    /**
     * @dev 检查众筹状态并更新
     */
    function checkAndUpdateState() external {
        if (state != CrowdfundingState.Active) return;
        
        if (block.timestamp >= deadline) {
            if (amountRaised >= goal) {
                state = CrowdfundingState.Successful;
                emit GoalReached(amountRaised);
            } else {
                state = CrowdfundingState.Failed;
            }
        }
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取投资者数量
     */
    function getContributorsCount() external view returns (uint256) {
        return contributors.length;
    }
    
    /**
     * @dev 获取所有投资者地址
     */
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }
    
    /**
     * @dev 获取剩余时间 (秒)
     */
    function getTimeLeft() external view returns (uint256) {
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }
    
    /**
     * @dev 获取众筹进度百分比 (基于100)
     */
    function getProgress() external view returns (uint256) {
        if (goal == 0) return 0;
        return (amountRaised * 100) / goal;
    }
    
    /**
     * @dev 检查众筹是否成功
     */
    function isSuccessful() external view returns (bool) {
        return amountRaised >= goal;
    }
    
    /**
     * @dev 检查众筹是否结束
     */
    function isEnded() external view returns (bool) {
        return block.timestamp >= deadline || state == CrowdfundingState.Closed;
    }
    
    /**
     * @dev 获取合约详细信息
     */
    function getCrowdfundingInfo() external view returns (
        address _creator,
        uint256 _goal,
        uint256 _deadline,
        uint256 _amountRaised,
        CrowdfundingState _state,
        uint256 _contributorsCount
    ) {
        return (
            creator,
            goal,
            deadline,
            amountRaised,
            state,
            contributors.length
        );
    }
    
    // ============ 接收以太币 ============
    
    /**
     * @dev 接收以太币的回退函数
     */
    receive() external payable {
        if (msg.value > 0 && state == CrowdfundingState.Active && block.timestamp < deadline) {
            // 记录投资
            contributions[msg.sender] += msg.value;
            amountRaised += msg.value;
            
            // 如果是新投资者，添加到数组中
            if (!hasContributed[msg.sender]) {
                contributors.push(msg.sender);
                hasContributed[msg.sender] = true;
            }
            
            emit ContributionReceived(msg.sender, msg.value);
            
            // 检查是否达到目标
            if (amountRaised >= goal && state == CrowdfundingState.Active) {
                state = CrowdfundingState.Successful;
                emit GoalReached(amountRaised);
            }
        }
    }
    
    /**
     * @dev 回退函数
     */
    fallback() external payable {
        if (msg.value > 0 && state == CrowdfundingState.Active && block.timestamp < deadline) {
            // 记录投资
            contributions[msg.sender] += msg.value;
            amountRaised += msg.value;
            
            // 如果是新投资者，添加到数组中
            if (!hasContributed[msg.sender]) {
                contributors.push(msg.sender);
                hasContributed[msg.sender] = true;
            }
            
            emit ContributionReceived(msg.sender, msg.value);
            
            // 检查是否达到目标
            if (amountRaised >= goal && state == CrowdfundingState.Active) {
                state = CrowdfundingState.Successful;
                emit GoalReached(amountRaised);
            }
        }
    }
} 