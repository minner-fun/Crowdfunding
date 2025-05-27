import React, { useState } from 'react';
import { Plus, Image, Calendar, Target, FileText, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import toast from 'react-hot-toast';

const CreateProjectPage = () => {
  const { factoryContract, parseEther, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    duration: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('请输入项目标题');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('请输入项目描述');
      return false;
    }
    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      toast.error('请输入有效的目标金额');
      return false;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast.error('请输入有效的众筹天数');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const goalInWei = parseEther(formData.goal);
      const durationInDays = parseInt(formData.duration);
      
      const tx = await factoryContract.createCrowdfunding(
        goalInWei,
        durationInDays,
        formData.title,
        formData.description,
        formData.imageUrl || ''
      );

      toast.loading('创建项目中...', { id: 'create' });
      
      const receipt = await tx.wait();
      
      // 解析事件获取项目地址
      const event = receipt.logs.find(log => {
        try {
          return factoryContract.interface.parseLog(log).name === 'CrowdfundingCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = factoryContract.interface.parseLog(event);
        const projectAddress = parsedEvent.args[1];
        
        toast.success(
          `项目创建成功！地址: ${projectAddress.slice(0, 10)}...`,
          { id: 'create', duration: 5000 }
        );
      } else {
        toast.success('项目创建成功！', { id: 'create' });
      }

      // 重置表单
      setFormData({
        title: '',
        description: '',
        goal: '',
        duration: '',
        imageUrl: ''
      });

    } catch (error) {
      console.error('创建项目失败:', error);
      
      let errorMessage = '创建项目失败';
      if (error.message.includes('user rejected')) {
        errorMessage = '用户取消了交易';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '余额不足支付 Gas 费用';
      }
      
      toast.error(errorMessage, { id: 'create' });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">创建众筹项目</h2>
          <p className="text-gray-600 mb-6">请连接您的钱包以创建众筹项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创建众筹项目</h1>
          <p className="text-gray-600">发起您的创意项目，获得社区支持</p>
        </div>

        {/* 创建表单 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 项目标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                项目标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="输入您的项目标题"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 字符
              </p>
            </div>

            {/* 项目描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                项目描述 *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="详细描述您的项目，包括目标、用途、预期成果等"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 字符
              </p>
            </div>

            {/* 目标金额和众筹天数 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  目标金额 (ETH) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="1.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                />
                <p className="text-xs text-gray-500 mt-1">
                  最小金额: 0.001 ETH
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  众筹天数 *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1-365 天
                </p>
              </div>
            </div>

            {/* 项目图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                项目图片 URL (可选)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
              <p className="text-xs text-gray-500 mt-1">
                支持 HTTPS 图片链接
              </p>
            </div>

            {/* 预览区域 */}
            {formData.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片预览
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <img
                    src={formData.imageUrl}
                    alt="项目预览"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* 费用说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">创建费用说明</p>
                  <ul className="text-xs space-y-1">
                    <li>• 创建项目需要支付 Gas 费用（约 0.003-0.01 ETH）</li>
                    <li>• 平台不收取额外费用</li>
                    <li>• 项目创建后无法修改，请仔细检查信息</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    goal: '',
                    duration: '',
                    imageUrl: ''
                  });
                }}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                重置表单
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-gradient"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    创建项目
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 创建指南 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">创建指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">项目标题</h4>
              <ul className="space-y-1">
                <li>• 简洁明了，突出项目特色</li>
                <li>• 避免使用特殊字符</li>
                <li>• 建议 10-50 字符</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">项目描述</h4>
              <ul className="space-y-1">
                <li>• 详细说明项目目标和用途</li>
                <li>• 包含预期成果和时间计划</li>
                <li>• 提供联系方式（可选）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">目标金额</h4>
              <ul className="space-y-1">
                <li>• 根据实际需求设定</li>
                <li>• 考虑 Gas 费用成本</li>
                <li>• 建议设定合理的目标</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">众筹时间</h4>
              <ul className="space-y-1">
                <li>• 根据项目复杂度设定</li>
                <li>• 一般建议 7-90 天</li>
                <li>• 时间过短可能影响筹款</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 