import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Users, Calendar, Target, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { STATE_LABELS, STATE_COLORS, CURRENT_NETWORK } from '../config/contracts';
import { useWeb3 } from '../hooks/useWeb3';

const ProjectModal = ({ project, onClose, onContribute }) => {
  const { getCrowdfundingContract, formatEther, formatAddress } = useWeb3();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    crowdfundingAddress,
    creator,
    goal,
    deadline,
    title,
    description,
    imageUrl,
    state,
    amountRaised
  } = project;

  // 加载投资者信息
  const loadContributors = async () => {
    setLoading(true);
    try {
      const contract = getCrowdfundingContract(crowdfundingAddress);
      if (contract) {
        const [addresses, amounts] = await contract.getContributors();
        const contributorList = addresses.map((address, index) => ({
          address,
          amount: amounts[index]
        }));
        setContributors(contributorList);
      }
    } catch (error) {
      console.error('加载投资者失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributors();
  }, [crowdfundingAddress]);

  // 计算进度百分比
  const progressPercentage = goal > 0 ? Math.min((Number(amountRaised) / Number(goal)) * 100, 100) : 0;
  
  // 计算剩余时间
  const deadlineDate = new Date(Number(deadline) * 1000);
  const isExpired = deadlineDate < new Date();
  const timeLeft = isExpired ? '已结束' : formatDistanceToNow(deadlineDate, { 
    addSuffix: true, 
    locale: zhCN 
  });

  // 获取状态样式
  const stateClass = STATE_COLORS[state] || 'bg-gray-100 text-gray-800';
  const stateLabel = STATE_LABELS[state] || '未知';

  // 默认图片
  const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3E众筹项目%3C/text%3E%3C/svg%3E";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden fade-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">项目详情</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* 项目图片和基本信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 图片 */}
              <div className="relative">
                <img
                  src={imageUrl || defaultImage}
                  alt={title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateClass}`}>
                    {stateLabel}
                  </span>
                </div>
              </div>

              {/* 基本信息 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
                
                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">筹款进度</span>
                    <span className="text-sm text-gray-500">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">已筹集</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {parseFloat(formatEther(amountRaised)).toFixed(4)} ETH
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">目标金额</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {parseFloat(formatEther(goal)).toFixed(4)} ETH
                    </p>
                  </div>
                </div>

                {/* 时间和创建者 */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{timeLeft}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>创建者: {formatAddress(creator)}</span>
                    <a
                      href={`${CURRENT_NETWORK.blockExplorer}/address/${creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 项目描述 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">项目描述</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
              </div>
            </div>

            {/* 投资者列表 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                投资者列表 ({contributors.length})
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="loading-spinner" />
                  </div>
                ) : contributors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无投资者</p>
                ) : (
                  <div className="space-y-2">
                    {contributors.map((contributor, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">
                            {formatAddress(contributor.address)}
                          </span>
                          <a
                            href={`${CURRENT_NETWORK.blockExplorer}/address/${contributor.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {parseFloat(formatEther(contributor.amount)).toFixed(4)} ETH
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 合约信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">合约信息</h4>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>合约地址: {formatAddress(crowdfundingAddress)}</span>
                <a
                  href={`${CURRENT_NETWORK.blockExplorer}/address/${crowdfundingAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex items-center"
                >
                  在 Etherscan 查看
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
              {state === 0 && !isExpired && (
                <button
                  onClick={onContribute}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  立即投资
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal; 