import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CURRENT_NETWORK, FACTORY_ABI, CROWDFUNDING_ABI } from '../config/contracts';
import toast from 'react-hot-toast';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  // 检查是否安装了 MetaMask
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('请安装 MetaMask 钱包');
      return;
    }

    setIsConnecting(true);
    try {
      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('没有找到账户');
      }

      // 创建 provider 和 signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      // 检查网络
      if (Number(network.chainId) !== CURRENT_NETWORK.chainId) {
        await switchToSepoliaNetwork();
        return;
      }

      // 创建工厂合约实例
      const factory = new ethers.Contract(
        CURRENT_NETWORK.factoryAddress,
        FACTORY_ABI,
        web3Signer
      );

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setFactoryContract(factory);
      setChainId(Number(network.chainId));

      toast.success('钱包连接成功！');
    } catch (error) {
      console.error('连接钱包失败:', error);
      toast.error('连接钱包失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 切换到 Sepolia 网络
  const switchToSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
                chainName: CURRENT_NETWORK.name,
                rpcUrls: [CURRENT_NETWORK.rpcUrl],
                blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('添加网络失败:', addError);
          toast.error('添加网络失败');
        }
      } else {
        console.error('切换网络失败:', switchError);
        toast.error('请手动切换到 Sepolia 测试网');
      }
    }
  };

  // 断开钱包连接
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setFactoryContract(null);
    setChainId(null);
    toast.success('钱包已断开连接');
  }, []);

  // 获取众筹合约实例
  const getCrowdfundingContract = useCallback((address) => {
    if (!signer) return null;
    return new ethers.Contract(address, CROWDFUNDING_ABI, signer);
  }, [signer]);

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化 ETH 数量
  const formatEther = (value) => {
    try {
      return ethers.formatEther(value);
    } catch {
      return '0';
    }
  };

  // 解析 ETH 数量
  const parseEther = (value) => {
    try {
      return ethers.parseEther(value.toString());
    } catch {
      return ethers.parseEther('0');
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast.info('账户已切换');
      }
    };

    const handleChainChanged = (chainId) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      
      if (newChainId !== CURRENT_NETWORK.chainId) {
        toast.error('请切换到 Sepolia 测试网');
        disconnectWallet();
      } else {
        // 重新连接
        connectWallet();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, connectWallet, disconnectWallet]);

  // 自动连接（如果之前已连接）
  useEffect(() => {
    const autoConnect = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          connectWallet();
        }
      } catch (error) {
        console.error('自动连接失败:', error);
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    account,
    provider,
    signer,
    factoryContract,
    isConnecting,
    chainId,
    isConnected: !!account,
    isCorrectNetwork: chainId === CURRENT_NETWORK.chainId,
    connectWallet,
    disconnectWallet,
    getCrowdfundingContract,
    formatAddress,
    formatEther,
    parseEther,
    switchToSepoliaNetwork,
  };
}; 