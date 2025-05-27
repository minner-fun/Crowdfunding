import React from 'react';
import { Wallet, Globe, User } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

const Header = ({ currentPage, setCurrentPage }) => {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    isCorrectNetwork,
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    switchToSepoliaNetwork 
  } = useWeb3();

  const navItems = [
    { id: 'home', label: '首页', icon: Globe },
    { id: 'create', label: '创建项目', icon: User },
    { id: 'my-projects', label: '我的项目', icon: User }
  ];

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">众筹 DApp</h1>
              <p className="text-xs text-gray-500">去中心化众筹平台</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {isCorrectNetwork ? 'Sepolia' : '错误网络'}
                </span>
              </div>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? '连接中...' : '连接钱包'}</span>
              </button>
            ) : !isCorrectNetwork ? (
              <button
                onClick={switchToSepoliaNetwork}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>切换网络</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  title="断开连接"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-2">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex-1 flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 