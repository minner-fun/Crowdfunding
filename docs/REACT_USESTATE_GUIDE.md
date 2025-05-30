# React useState 详解

## 🔧 什么是 useState？

`useState` 是 React 提供的一个 **Hook**（钩子函数），用于在函数组件中添加状态管理功能。

### 基本概念

```javascript
import { useState } from 'react';

// 语法：const [状态变量, 更新函数] = useState(初始值);
const [count, setCount] = useState(0);
```

## 📝 useState(null) 详解

### 为什么使用 null 作为初始值？

`null` 在 JavaScript 中表示**"空值"**或**"没有值"**，在我们的钱包应用中很适合表示：

```javascript
const [account, setAccount] = useState(null);
// 意思：用户还没有连接钱包，所以账户信息是空的
```

## 🎯 在 useWeb3.js 中的具体应用

### 1. 钱包连接状态

```javascript
// 用户钱包地址，未连接时为 null
const [account, setAccount] = useState(null);

// 使用场景：
if (account === null) {
    console.log('用户还没有连接钱包');
} else {
    console.log('用户钱包地址:', account);
}
```

### 2. Web3 提供者对象

```javascript
// Web3 提供者，未连接时为 null
const [provider, setProvider] = useState(null);

// 使用场景：
if (provider === null) {
    console.log('没有 Web3 提供者');
} else {
    // 可以使用 provider 与区块链交互
    const balance = await provider.getBalance(account);
}
```

### 3. 签名器对象

```javascript
// 用于签名交易的对象，未连接时为 null
const [signer, setSigner] = useState(null);

// 使用场景：
if (signer === null) {
    console.log('无法发送交易');
} else {
    // 可以用 signer 发送交易
    const tx = await contract.connect(signer).someFunction();
}
```

### 4. 合约实例

```javascript
// 智能合约实例，未初始化时为 null
const [factoryContract, setFactoryContract] = useState(null);

// 使用场景：
if (factoryContract === null) {
    console.log('合约还没有初始化');
} else {
    // 可以调用合约方法
    const projectCount = await factoryContract.getCrowdfundingsCount();
}
```

### 5. 连接状态

```javascript
// 布尔值，表示是否正在连接
const [isConnecting, setIsConnecting] = useState(false);

// 使用场景：
if (isConnecting) {
    console.log('正在连接钱包...');
} else {
    console.log('连接过程已完成');
}
```

### 6. 网络链 ID

```javascript
// 当前网络的链 ID，未连接时为 null
const [chainId, setChainId] = useState(null);

// 使用场景：
if (chainId === null) {
    console.log('还不知道用户在哪个网络');
} else if (chainId === 11155111) {
    console.log('用户在 Sepolia 测试网');
} else {
    console.log('用户在其他网络');
}
```

### 7. 连接的钱包信息

```javascript
// 当前连接的钱包对象，未连接时为 null
const [connectedWallet, setConnectedWallet] = useState(null);

// 使用场景：
if (connectedWallet === null) {
    console.log('没有连接任何钱包');
} else {
    console.log('连接的钱包:', connectedWallet.name); // MetaMask, OKX 等
}
```

### 8. 可用钱包列表

```javascript
// 检测到的钱包列表，初始为空数组
const [availableWallets, setAvailableWallets] = useState([]);

// 使用场景：
if (availableWallets.length === 0) {
    console.log('没有检测到任何钱包');
} else {
    console.log('检测到的钱包:', availableWallets.map(w => w.name));
}
```

## 🔄 状态变化的生命周期

### 钱包连接过程中的状态变化

```javascript
// 1. 初始状态 - 所有值都是初始值
account: null
provider: null
signer: null
factoryContract: null
isConnecting: false
chainId: null
connectedWallet: null
availableWallets: []

// 2. 开始连接 - 设置连接状态
setIsConnecting(true);

// 3. 连接成功 - 更新所有相关状态
setAccount('0x1234...'); // 用户地址
setProvider(providerInstance); // Web3 提供者
setSigner(signerInstance); // 签名器
setFactoryContract(contractInstance); // 合约
setChainId(11155111); // Sepolia 链 ID
setConnectedWallet({ name: 'MetaMask', ... }); // 钱包信息
setIsConnecting(false); // 连接完成

// 4. 断开连接 - 重置为初始状态
setAccount(null);
setProvider(null);
setSigner(null);
setFactoryContract(null);
setChainId(null);
setConnectedWallet(null);
```

## 🎨 在 UI 中如何使用这些状态

### 1. 条件渲染

```jsx
const WalletButton = () => {
    const { account, isConnecting, connectWallet } = useWeb3();
    
    if (account === null) {
        return (
            <button onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? '连接中...' : '连接钱包'}
            </button>
        );
    } else {
        return (
            <div>
                已连接: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
        );
    }
};
```

### 2. 状态检查

```jsx
const ProjectList = () => {
    const { factoryContract, isConnected } = useWeb3();
    
    if (!isConnected) {
        return <div>请先连接钱包</div>;
    }
    
    if (factoryContract === null) {
        return <div>正在初始化合约...</div>;
    }
    
    return <div>显示项目列表</div>;
};
```

## 💡 为什么不直接用普通变量？

### 普通变量的问题

```javascript
// ❌ 错误的做法
let account = null;

function connectWallet() {
    account = '0x1234...'; // 修改变量
    // 但是 UI 不会重新渲染！
}
```

### useState 的优势

```javascript
// ✅ 正确的做法
const [account, setAccount] = useState(null);

function connectWallet() {
    setAccount('0x1234...'); // 使用 setter 函数
    // React 会自动重新渲染 UI！
}
```

## 🔍 常见的 useState 模式

### 1. 对象状态

```javascript
const [user, setUser] = useState({
    name: '',
    email: '',
    address: null
});

// 更新部分状态
setUser(prev => ({
    ...prev,
    address: '0x1234...'
}));
```

### 2. 数组状态

```javascript
const [projects, setProjects] = useState([]);

// 添加项目
setProjects(prev => [...prev, newProject]);

// 过滤项目
setProjects(prev => prev.filter(p => p.id !== projectId));
```

### 3. 计算属性

```javascript
const [account, setAccount] = useState(null);

// 基于状态计算的值
const isConnected = account !== null;
const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';
```

## 📚 总结

### 关键要点

1. **useState 是 React Hook**：用于在函数组件中管理状态
2. **useState(null)**：初始值为 null，表示"还没有值"
3. **状态更新触发重渲染**：当状态改变时，组件会重新渲染
4. **不可变更新**：必须使用 setter 函数，不能直接修改状态

### 在钱包应用中的意义

```javascript
// 每个状态都有明确的含义：
account: null          // 用户还没连接钱包
provider: null         // 没有 Web3 提供者
signer: null          // 无法发送交易
factoryContract: null // 合约还没初始化
isConnecting: false   // 不在连接过程中
chainId: null         // 不知道用户在哪个网络
connectedWallet: null // 没有连接的钱包信息
availableWallets: []  // 还没检测到钱包
```

这种设计让我们可以精确控制 UI 的显示状态，提供良好的用户体验！ 