import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, User, Target } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { useWeb3 } from '../hooks/useWeb3';
import toast from 'react-hot-toast';

const MyProjectsPage = ({ onContribute, onViewDetails }) => {
  const { factoryContract, account, isConnected } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载我的项目
  const loadMyProjects = useCallback(async () => {
    if (!factoryContract || !account) return;

    setLoading(true);
    try {
      // 获取我创建的众筹合约地址
      const crowdfundingAddresses = await factoryContract.getCrowdfundingsByCreator(account);
      
      // 为每个地址获取详细信息
      const projectsData = await Promise.all(
        crowdfundingAddresses.map(async (address) => {
          try {
            // 获取项目信息
            const [title, description, imageUrl, createdAt, creator] = await factoryContract.getProjectInfo(address);
            
            // 获取项目统计
            const [goal, amountRaised, contributorsCount, timeLeft, progress, state] = await factoryContract.getCrowdfundingStats(address);
            
            // 计算截止时间
            const deadline = Math.floor(Date.now() / 1000) + Number(timeLeft);
            
            return {
              crowdfundingAddress: address,
              creator,
              goal,
              deadline,
              title,
              description,
              imageUrl,
              state,
              amountRaised
            };
          } catch (error) {
            console.error(`获取项目 ${address} 信息失败:`, error);
            return null;
          }
        })
      );
      
      // 过滤掉失败的项目
      const validProjects = projectsData.filter(project => project !== null);
      setProjects(validProjects);
    } catch (error) {
      console.error('加载我的项目失败:', error);
      toast.error('加载我的项目失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [factoryContract, account]);

  // 初始加载
  useEffect(() => {
    if (isConnected && factoryContract && account) {
      loadMyProjects();
    }
  }, [isConnected, factoryContract, account, loadMyProjects]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">我的项目</h2>
          <p className="text-gray-600 mb-6">请连接您的钱包以查看您创建的项目</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的项目</h1>
            <p className="text-gray-600">管理您创建的众筹项目</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={loadMyProjects}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">总项目数</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">进行中项目</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.state === 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">成功项目</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.state === 1).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有创建项目</h3>
            <p className="text-gray-500 mb-6">创建您的第一个众筹项目，开始筹集资金</p>
            <button
              onClick={() => window.location.hash = '#create'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              创建项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.crowdfundingAddress}-${index}`}
                project={project}
                onContribute={onContribute}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage; 