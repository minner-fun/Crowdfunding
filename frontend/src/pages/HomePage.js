import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, TrendingUp, Users, Target } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { useWeb3 } from '../hooks/useWeb3';
import toast from 'react-hot-toast';

const HomePage = ({ onContribute, onViewDetails }) => {
  const { factoryContract, formatEther, isConnected } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: '0',
    activeProjects: 0
  });

  // 加载项目数据
  const loadProjects = useCallback(async () => {
    if (!factoryContract) return;

    setLoading(true);
    try {
      // 获取所有众筹合约地址
      const crowdfundingAddresses = await factoryContract.getAllCrowdfundings();
      
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
      
      // 计算统计数据
      const totalRaised = validProjects.reduce((sum, project) => {
        return sum + Number(project.amountRaised);
      }, 0);
      
      const activeCount = validProjects.filter(project => project.state === 0).length;
      
      setStats({
        totalProjects: validProjects.length,
        totalRaised: formatEther(totalRaised.toString()),
        activeProjects: activeCount
      });
      
    } catch (error) {
      console.error('加载项目失败:', error);
      toast.error('加载项目失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [factoryContract, formatEther]);

  // 过滤和搜索项目
  useEffect(() => {
    let filtered = projects;

    // 状态过滤
    if (filterState !== 'all') {
      const stateValue = parseInt(filterState);
      filtered = filtered.filter(project => project.state === stateValue);
    }

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterState]);

  // 初始加载
  useEffect(() => {
    if (isConnected && factoryContract) {
      loadProjects();
    }
  }, [isConnected, factoryContract, loadProjects]);

  const filterOptions = [
    { value: 'all', label: '全部项目' },
    { value: '0', label: '进行中' },
    { value: '1', label: '成功' },
    { value: '2', label: '失败' },
    { value: '3', label: '已关闭' }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎来到众筹 DApp</h2>
          <p className="text-gray-600 mb-6">请连接您的钱包以查看和参与众筹项目</p>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">平台特色</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 去中心化众筹平台</li>
              <li>• 智能合约保障资金安全</li>
              <li>• 透明的资金流向</li>
              <li>• 自动退款机制</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 统计面板 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Target className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-blue-100">总项目数</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-green-100">总筹集金额</p>
                  <p className="text-2xl font-bold">{parseFloat(stats.totalRaised).toFixed(4)} ETH</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Users className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-purple-100">进行中项目</p>
                  <p className="text-2xl font-bold">{stats.activeProjects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索项目标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 状态过滤 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 刷新按钮 */}
          <button
            onClick={loadProjects}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>

        {/* 项目列表 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
            <p className="text-gray-500">
              {searchTerm || filterState !== 'all' 
                ? '没有找到符合条件的项目' 
                : '还没有创建任何众筹项目'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
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

export default HomePage; 