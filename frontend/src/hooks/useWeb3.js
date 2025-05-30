import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { CURRENT_NETWORK, FACTORY_ABI, CROWDFUNDING_ABI } from '../config/contracts';
import toast from 'react-hot-toast';

// 支持的钱包类型
const WALLET_TYPES = {
  METAMASK: 'metamask',
  OKX: 'okx',
  PHANTOM: 'phantom',
};

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  
  // 使用 ref 来存储最新的 connectWallet 函数引用
  const connectWalletRef = useRef();
  const hasAttemptedAutoConnect = useRef(false);

  // 检测可用的钱包
  const detectWallets = useCallback(() => {
    const wallets = [];
    
    if (typeof window !== 'undefined') {
      // 检测 MetaMask
      if (window.ethereum && window.ethereum.isMetaMask) {
        wallets.push({
          type: WALLET_TYPES.METAMASK,
          name: 'MetaMask',
          icon: '🦊',
          provider: window.ethereum
        });
      }
      
      // 检测 OKX Wallet
      if (window.okxwallet || (window.ethereum && window.ethereum.isOkxWallet)) {
        wallets.push({
          type: WALLET_TYPES.OKX,
          name: 'OKX Wallet',
          icon: '⭕',
          provider: window.okxwallet || window.ethereum
        });
      }
      
      // 检测 Phantom (主要用于 Solana，但也支持 Ethereum)
      if (window.phantom && window.phantom.ethereum) {
        wallets.push({
          type: WALLET_TYPES.PHANTOM,
          name: 'Phantom',
          icon: '👻',
          provider: window.phantom.ethereum
        });
      }
      
      // 如果没有检测到特定钱包，但存在 ethereum 对象，作为通用钱包
      if (wallets.length === 0 && window.ethereum) {
        wallets.push({
          type: 'generic',
          name: '通用钱包',
          icon: '💼',
          provider: window.ethereum
        });
      }
    }
    
    setAvailableWallets(wallets);
    return wallets;
  }, []); // 空依赖数组，因为这个函数不依赖任何状态

  // 检查是否有可用的钱包
  const hasWalletInstalled = () => {
    return availableWallets.length > 0;
  };

  // 连接指定钱包
  const connectWallet = useCallback(async (walletType = null) => {
    // 使用现有的 availableWallets 状态，而不是重新检测
    if (availableWallets.length === 0) {
      toast.error('未检测到任何 Web3 钱包，请安装 MetaMask、OKX Wallet 或 Phantom');
      return;
    }

    // 如果没有指定钱包类型，使用第一个可用的钱包
    let selectedWallet;
    if (walletType) {
      selectedWallet = availableWallets.find(w => w.type === walletType);
      if (!selectedWallet) {
        toast.error(`未找到 ${walletType} 钱包`);
        return;
      }
    } else {
      selectedWallet = availableWallets[0];
    }

    setIsConnecting(true);
    try {
      // 请求账户访问
      const accounts = await selectedWallet.provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('没有找到账户');
      }

      // 创建 provider 和 signer
      const web3Provider = new ethers.BrowserProvider(selectedWallet.provider);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      // 检查网络
      if (Number(network.chainId) !== CURRENT_NETWORK.chainId) {
        await switchToSepoliaNetwork(selectedWallet.provider);
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
      setConnectedWallet(selectedWallet);

      toast.success(`${selectedWallet.name} 连接成功！`);
    } catch (error) {
      console.error('连接钱包失败:', error);
      toast.error('连接钱包失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  }, [availableWallets]);

  // 更新 ref
  connectWalletRef.current = connectWallet;

  // 切换到 Sepolia 网络
  const switchToSepoliaNetwork = async (walletProvider = null) => {
    const provider = walletProvider || (connectedWallet && connectedWallet.provider) || window.ethereum;
    
    if (!provider) {
      toast.error('未找到钱包提供者');
      return;
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await provider.request({
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
    setConnectedWallet(null);
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
    if (availableWallets.length === 0 || !connectedWallet) return;

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
      }
    };

    // 只监听当前连接的钱包
    if (connectedWallet && connectedWallet.provider) {
      connectedWallet.provider.on('accountsChanged', handleAccountsChanged);
      connectedWallet.provider.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (connectedWallet && connectedWallet.provider && connectedWallet.provider.removeListener) {
        connectedWallet.provider.removeListener('accountsChanged', handleAccountsChanged);
        connectedWallet.provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, disconnectWallet, connectedWallet]);

  // 初始化：检测可用钱包
  useEffect(() => {
    detectWallets();
  }, [detectWallets]);

  // 自动连接（如果之前已连接）
  useEffect(() => {
    const autoConnect = async () => {
      // 如果已经尝试过自动连接，或者已经连接，或者正在连接，则不执行
      if (hasAttemptedAutoConnect.current || account || isConnecting) return;
      
      // 使用当前的 availableWallets 状态，而不是重新检测
      if (availableWallets.length === 0) return;

      // 标记已经尝试过自动连接
      hasAttemptedAutoConnect.current = true;

      // 尝试从每个钱包检查是否已连接
      for (const wallet of availableWallets) {
        try {
          const accounts = await wallet.provider.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            // 找到已连接的钱包，使用 ref 调用 connectWallet
            if (connectWalletRef.current) {
              connectWalletRef.current(wallet.type);
            }
            break;
          }
        } catch (error) {
          // 忽略错误，继续检查下一个钱包
          console.log(`检查 ${wallet.name} 连接状态失败:`, error);
        }
      }
    };

    // 只有在钱包列表可用且未连接时才尝试自动连接
    if (availableWallets.length > 0 && !account && !isConnecting && !hasAttemptedAutoConnect.current) {
      autoConnect();
    }
  }, [availableWallets, account, isConnecting]);

  return {
    account,
    provider,
    signer,
    factoryContract,
    isConnecting,
    chainId,
    connectedWallet,
    availableWallets,
    isConnected: !!account,
    isCorrectNetwork: chainId === CURRENT_NETWORK.chainId,
    hasWalletInstalled,
    connectWallet,
    disconnectWallet,
    getCrowdfundingContract,
    formatAddress,
    formatEther,
    parseEther,
    switchToSepoliaNetwork,
    detectWallets,
    WALLET_TYPES,
  };
}; 