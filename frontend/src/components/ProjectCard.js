import React from 'react';
import { Calendar, Target, TrendingUp, User, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { STATE_LABELS, STATE_COLORS, CURRENT_NETWORK } from '../config/contracts';
import { useWeb3 } from '../hooks/useWeb3';

const ProjectCard = ({ project, onContribute, onViewDetails }) => {
  const { formatEther, formatAddress } = useWeb3();

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* 项目图片 */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={imageUrl || defaultImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        {/* 状态标签 */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateClass}`}>
            {stateLabel}
          </span>
        </div>
      </div>

      {/* 项目信息 */}
      <div className="p-6">
        {/* 标题和描述 */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {description}
          </p>
        </div>

        {/* 创建者 */}
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <User className="w-4 h-4 mr-2" />
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

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">筹款进度</span>
            <span className="text-sm text-gray-500">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">已筹集</p>
              <p className="font-semibold text-gray-900">
                {parseFloat(formatEther(amountRaised)).toFixed(4)} ETH
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 text-blue-500 mr-2" />
            <div>
              <p className="text-xs text-gray-500">目标金额</p>
              <p className="font-semibold text-gray-900">
                {parseFloat(formatEther(goal)).toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>

        {/* 时间信息 */}
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{timeLeft}</span>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={() => onViewDetails(project)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            查看详情
          </button>
          {state === 0 && !isExpired && ( // 只有进行中且未过期的项目才能投资
            <button
              onClick={() => onContribute(project)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
            >
              立即投资
            </button>
          )}
        </div>

        {/* 合约地址 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>合约地址: {formatAddress(crowdfundingAddress)}</span>
            <a
              href={`${CURRENT_NETWORK.blockExplorer}/address/${crowdfundingAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 