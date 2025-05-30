import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

const WalletSelector = ({ onClose }) => {
  const { availableWallets, connectWallet, isConnecting } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState(null);

  const handleConnect = async (walletType) => {
    setSelectedWallet(walletType);
    await connectWallet(walletType);
    if (onClose) onClose();
  };

  if (availableWallets.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">未检测到钱包</h2>
          <p className="text-gray-600 mb-4">
            请安装以下任一钱包扩展程序：
          </p>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-3">🦊</span>
              <div>
                <div className="font-medium">MetaMask</div>
                <div className="text-sm text-gray-500">最受欢迎的以太坊钱包</div>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-3">⭕</span>
              <div>
                <div className="font-medium">OKX Wallet</div>
                <div className="text-sm text-gray-500">多链钱包，支持多种加密货币</div>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <span className="text-2xl mr-3">👻</span>
              <div>
                <div className="font-medium">Phantom</div>
                <div className="text-sm text-gray-500">支持 Solana 和以太坊</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">选择钱包</h2>
        <p className="text-gray-600 mb-4">
          选择您要连接的钱包：
        </p>
        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.type}
              onClick={() => handleConnect(wallet.type)}
              disabled={isConnecting && selectedWallet === wallet.type}
              className="w-full flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{wallet.name}</div>
                <div className="text-sm text-gray-500">
                  {wallet.type === 'metamask' && '最受欢迎的以太坊钱包'}
                  {wallet.type === 'okx' && '多链钱包，支持多种加密货币'}
                  {wallet.type === 'phantom' && '支持 Solana 和以太坊'}
                  {wallet.type === 'generic' && '通用 Web3 钱包'}
                </div>
              </div>
              {isConnecting && selectedWallet === wallet.type && (
                <div className="ml-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector; 