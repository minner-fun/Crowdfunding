// 合约配置
export const CONTRACT_CONFIG = {
  // Sepolia 测试网配置
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
    factoryAddress: "0xD67f4Ae056520Ad36456298D6F8714C9c899454C",
    deploymentBlock: 8415239
  }
};

// 当前使用的网络
export const CURRENT_NETWORK = CONTRACT_CONFIG.sepolia;

// 工厂合约 ABI - 使用正确的函数签名
export const FACTORY_ABI = [
  "function createCrowdfunding(uint256 _goal, uint256 _durationInDays, string memory _title, string memory _description, string memory _imageUrl) external returns (address)",
  "function getCrowdfundingsCount() external view returns (uint256)",
  "function getAllCrowdfundings() external view returns (address[])",
  "function getActiveCrowdfundings() external view returns (address[])",
  "function getCrowdfundingsByCreator(address _creator) external view returns (address[])",
  "function getProjectInfo(address _crowdfunding) external view returns (string memory title, string memory description, string memory imageUrl, uint256 createdAt, address creator)",
  "function getCrowdfundingStats(address payable _crowdfunding) external view returns (uint256 goal, uint256 amountRaised, uint256 contributorsCount, uint256 timeLeft, uint256 progress, uint8 state)",
  "event CrowdfundingCreated(address indexed creator, address indexed crowdfundingAddress, string title, uint256 goal, uint256 duration)"
];

// 众筹合约 ABI - 使用正确的函数签名
export const CROWDFUNDING_ABI = [
  "function contribute() external payable",
  "function withdrawFunds() external",
  "function getRefund() external",
  "function getContributors() external view returns (address[], uint256[])",
  "function contributions(address) external view returns (uint256)",
  "function creator() external view returns (address)",
  "function goal() external view returns (uint256)",
  "function deadline() external view returns (uint256)",
  "function amountRaised() external view returns (uint256)",
  "function state() external view returns (uint8)",
  "function checkAndUpdateState() external",
  "event ContributionReceived(address indexed contributor, uint256 amount)",
  "event GoalReached(uint256 totalAmount)",
  "event FundsWithdrawn(address indexed creator, uint256 amount)",
  "event RefundIssued(address indexed contributor, uint256 amount)"
];

// 众筹状态枚举
export const CROWDFUNDING_STATE = {
  0: "Active",
  1: "Successful", 
  2: "Failed",
  3: "Closed"
};

// 状态中文映射
export const STATE_LABELS = {
  0: "进行中",
  1: "成功",
  2: "失败", 
  3: "已关闭"
};

// 状态颜色映射
export const STATE_COLORS = {
  0: "bg-blue-100 text-blue-800",
  1: "bg-green-100 text-green-800",
  2: "bg-red-100 text-red-800",
  3: "bg-gray-100 text-gray-800"
}; 