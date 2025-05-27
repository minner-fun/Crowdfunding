import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import MyProjectsPage from './pages/MyProjectsPage';
import ProjectModal from './components/ProjectModal';
import ContributeModal from './components/ContributeModal';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

  // 处理查看项目详情
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  // 处理投资项目
  const handleContribute = (project) => {
    setSelectedProject(project);
    setShowContributeModal(true);
  };

  // 关闭模态框
  const closeModals = () => {
    setShowProjectModal(false);
    setShowContributeModal(false);
    setSelectedProject(null);
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onContribute={handleContribute}
            onViewDetails={handleViewDetails}
          />
        );
      case 'create':
        return <CreateProjectPage />;
      case 'my-projects':
        return (
          <MyProjectsPage
            onContribute={handleContribute}
            onViewDetails={handleViewDetails}
          />
        );
      default:
        return (
          <HomePage
            onContribute={handleContribute}
            onViewDetails={handleViewDetails}
          />
        );
    }
  };

  return (
    <div className="App">
      {/* 全局通知 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />

      {/* 页面头部 */}
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* 主要内容 */}
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      {/* 项目详情模态框 */}
      {showProjectModal && selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={closeModals}
          onContribute={() => {
            setShowProjectModal(false);
            setShowContributeModal(true);
          }}
        />
      )}

      {/* 投资模态框 */}
      {showContributeModal && selectedProject && (
        <ContributeModal
          project={selectedProject}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            // 可以在这里触发数据刷新
          }}
        />
      )}
    </div>
  );
}

export default App; 