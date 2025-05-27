import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import toast from 'react-hot-toast';

const ContributeModal = ({ project, onClose, onSuccess }) => {
  const { getCrowdfundingContract, parseEther, formatEther, account } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContribute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效的投资金额');
      return;
    }

    if (!account) {
      toast.error('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const contract = getCrowdfundingContract(project.crowdfundingAddress);
      if (!contract) {
        throw new Error('无法获取合约实例');
      }

      const value = parseEther(amount);
      
      // 发送交易
      const tx = await contract.contribute({ value });
      
      toast.loading('交易处理中...', { id: 'contribute' });
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      toast.success(`投资成功！交易哈希: ${receipt.hash.slice(0, 10)}...`, { 
        id: 'contribute',
        duration: 5000 
      });
      
      onSuccess();
    } catch (error) {
      console.error('投资失败:', error);
      
      let errorMessage = '投资失败';
      if (error.message.includes('user rejected')) {
        errorMessage = '用户取消了交易';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '余额不足';
      } else if (error.message.includes('CrowdfundingEnded')) {
        errorMessage = '众筹已结束';
      } else if (error.message.includes('InvalidAmount')) {
        errorMessage = '投资金额无效';
      }
      
      toast.error(errorMessage, { id: 'contribute' });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = project.goal > 0 
    ? Math.min((Number(project.amountRaised) / Number(project.goal)) * 100, 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 fade-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">投资项目</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 项目信息 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">筹款进度</span>
                <span className="text-sm font-medium text-gray-900">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>已筹集: {parseFloat(formatEther(project.amountRaised)).toFixed(4)} ETH</span>
                <span>目标: {parseFloat(formatEther(project.goal)).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          {/* 投资金额输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投资金额 (ETH)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              最小投资金额: 0.001 ETH
            </p>
          </div>

          {/* 快速金额选择 */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">快速选择</p>
            <div className="grid grid-cols-4 gap-2">
              {['0.01', '0.05', '0.1', '0.5'].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {value} ETH
                </button>
              ))}
            </div>
          </div>

          {/* 风险提示 */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">投资风险提示</p>
                <ul className="text-xs space-y-1">
                  <li>• 众筹投资存在风险，请谨慎投资</li>
                  <li>• 只有达到目标金额才能提取资金</li>
                  <li>• 未达到目标可申请退款</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleContribute}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="loading-spinner mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              {loading ? '处理中...' : '确认投资'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributeModal; 