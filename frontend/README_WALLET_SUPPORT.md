# 多钱包支持功能说明

## 概述

本众筹 DApp 现已支持多种 Web3 钱包，包括：

- 🦊 **MetaMask** - 最受欢迎的以太坊钱包
- ⭕ **OKX Wallet** - 多链钱包，支持多种加密货币
- 👻 **Phantom** - 支持 Solana 和以太坊的钱包
- 💼 **通用钱包** - 其他兼容 EIP-1193 标准的钱包

## 功能特性

### 1. 自动钱包检测
- 系统会自动检测用户浏览器中安装的钱包扩展
- 支持同时安装多个钱包的情况
- 智能识别钱包类型和提供者

### 2. 钱包选择器
- 当检测到多个钱包时，会显示钱包选择器
- 用户可以选择要连接的特定钱包
- 显示每个钱包的图标、名称和描述

### 3. 智能连接逻辑
- 如果只有一个钱包，直接连接
- 如果有多个钱包，显示选择界面
- 支持记住用户的钱包选择

### 4. 网络管理
- 自动检测当前网络
- 支持切换到 Sepolia 测试网
- 自动添加网络配置（如果不存在）

## 使用方法

### 基本连接
```javascript
import { useWeb3 } from '../hooks/useWeb3';

const MyComponent = () => {
  const { 
    connectWallet, 
    availableWallets, 
    connectedWallet,
    isConnected 
  } = useWeb3();

  // 连接默认钱包（第一个可用的）
  const handleConnect = () => {
    connectWallet();
  };

  // 连接特定钱包
  const handleConnectSpecific = (walletType) => {
    connectWallet(walletType);
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={handleConnect}>
          连接钱包
        </button>
      ) : (
        <div>
          已连接: {connectedWallet?.name}
        </div>
      )}
    </div>
  );
};
```

### 钱包选择器组件
```javascript
import WalletSelector from '../components/WalletSelector';

const App = () => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div>
      <button onClick={() => setShowSelector(true)}>
        选择钱包
      </button>
      
      {showSelector && (
        <WalletSelector 
          onClose={() => setShowSelector(false)} 
        />
      )}
    </div>
  );
};
```

## 钱包检测逻辑

### MetaMask 检测
```javascript
if (window.ethereum && window.ethereum.isMetaMask) {
  // MetaMask 已安装
}
```

### OKX Wallet 检测
```javascript
if (window.okxwallet || (window.ethereum && window.ethereum.isOkxWallet)) {
  // OKX Wallet 已安装
}
```

### Phantom 检测
```javascript
if (window.phantom && window.phantom.ethereum) {
  // Phantom 已安装且支持以太坊
}
```

### 通用钱包检测
```javascript
if (window.ethereum) {
  // 存在通用的以太坊提供者
}
```

## API 参考

### useWeb3 Hook 新增返回值

```javascript
const {
  // 原有属性...
  connectedWallet,      // 当前连接的钱包信息
  availableWallets,     // 可用钱包列表
  hasWalletInstalled,   // 检查是否有钱包安装
  detectWallets,        // 手动检测钱包
  WALLET_TYPES,         // 钱包类型常量
} = useWeb3();
```

### 钱包对象结构
```javascript
{
  type: 'metamask',           // 钱包类型
  name: 'MetaMask',          // 显示名称
  icon: '🦊',                // 图标
  provider: window.ethereum   // 钱包提供者对象
}
```

### 钱包类型常量
```javascript
const WALLET_TYPES = {
  METAMASK: 'metamask',
  OKX: 'okx',
  PHANTOM: 'phantom',
};
```

## 错误处理

### 常见错误情况
1. **未安装钱包**: 显示安装指引
2. **用户拒绝连接**: 提示用户授权
3. **网络错误**: 自动切换或提示切换网络
4. **钱包锁定**: 提示用户解锁钱包

### 错误处理示例
```javascript
try {
  await connectWallet('metamask');
} catch (error) {
  if (error.message.includes('user rejected')) {
    toast.error('用户取消了连接');
  } else if (error.message.includes('未找到')) {
    toast.error('请安装 MetaMask 钱包');
  }
}
```

## 最佳实践

### 1. 用户体验
- 优先显示用户最常用的钱包
- 提供清晰的钱包状态指示
- 在连接过程中显示加载状态

### 2. 错误处理
- 提供友好的错误消息
- 指导用户如何解决问题
- 支持重试机制

### 3. 性能优化
- 延迟加载钱包检测
- 缓存钱包连接状态
- 避免重复的网络请求

## 兼容性

### 支持的浏览器
- Chrome/Chromium 系列
- Firefox
- Safari (部分钱包)
- Edge

### 移动端支持
- 通过钱包应用的内置浏览器
- WalletConnect 协议（未来版本）

## 故障排除

### 常见问题

1. **钱包未被检测到**
   - 确保钱包扩展已启用
   - 刷新页面重新检测
   - 检查浏览器兼容性

2. **连接失败**
   - 检查网络连接
   - 确保钱包已解锁
   - 尝试重新连接

3. **网络切换失败**
   - 手动在钱包中切换网络
   - 检查网络配置是否正确

### 调试信息
在浏览器控制台中查看详细的连接日志和错误信息。

## 更新日志

### v2.0.0
- 添加多钱包支持
- 新增钱包选择器组件
- 改进错误处理机制
- 优化用户体验

### v1.0.0
- 基础 MetaMask 支持
- 基本连接功能 