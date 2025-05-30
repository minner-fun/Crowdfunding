# React useCallback 详解

## 🔧 什么是 useCallback？

`useCallback` 是 React 提供的一个 **Hook**，用于**缓存函数定义**，避免在每次组件重新渲染时都创建新的函数实例。

### 基本语法

```javascript
import { useCallback } from 'react';

const memoizedFunction = useCallback(
  () => {
    // 函数逻辑
  },
  [dependencies] // 依赖数组
);
```

## 🚨 为什么需要 useCallback？

### 问题：函数重复创建

```javascript
// ❌ 每次组件重新渲染都会创建新函数
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  // 每次渲染都创建新的 handleClick 函数
  const handleClick = () => {
    console.log('点击了');
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
};

// 子组件每次都会重新渲染，因为 handleClick 是新函数
const ExpensiveChild = ({ onClick }) => {
  console.log('ExpensiveChild 重新渲染了'); // 每次都执行
  return <button onClick={onClick}>子组件按钮</button>;
};
```

### ✅ 解决方案：使用 useCallback

```javascript
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  // 缓存函数，只有依赖变化时才重新创建
  const handleClick = useCallback(() => {
    console.log('点击了');
  }, []); // 空依赖数组，函数永远不变
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
};

// 配合 React.memo 使用，子组件不会无谓重新渲染
const ExpensiveChild = React.memo(({ onClick }) => {
  console.log('ExpensiveChild 重新渲染了'); // 只在必要时执行
  return <button onClick={onClick}>子组件按钮</button>;
});
```

## 🎯 在 useWeb3.js 中的具体应用

### detectWallets 函数的使用

```javascript
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
    
    // ... 其他钱包检测逻辑
  }
  
  setAvailableWallets(wallets);
  return wallets;
}, []); // 空依赖数组
```

### 为什么 detectWallets 需要 useCallback？

#### 1. 避免无限循环

```javascript
// ❌ 如果不使用 useCallback
const detectWallets = () => {
  // ... 检测逻辑
  setAvailableWallets(wallets);
};

useEffect(() => {
  detectWallets(); // 每次组件重新渲染，detectWallets 都是新函数
}, [detectWallets]); // detectWallets 变化 → useEffect 执行 → 可能触发状态更新 → 组件重新渲染 → detectWallets 又变成新函数 → 无限循环
```

#### 2. ✅ 使用 useCallback 稳定函数引用

```javascript
const detectWallets = useCallback(() => {
  // ... 检测逻辑
}, []); // 函数引用永远不变

useEffect(() => {
  detectWallets(); // detectWallets 引用稳定，不会触发无限循环
}, [detectWallets]); // 安全的依赖
```

### connectWallet 函数的使用

```javascript
// 连接指定钱包
const connectWallet = useCallback(async (walletType = null) => {
  // 使用现有的 availableWallets 状态
  if (availableWallets.length === 0) {
    toast.error('未检测到任何 Web3 钱包');
    return;
  }
  
  // ... 连接逻辑
}, [availableWallets]); // 依赖 availableWallets
```

#### 为什么依赖 availableWallets？

```javascript
// connectWallet 函数内部使用了 availableWallets
if (availableWallets.length === 0) { // 使用了外部状态
  // ...
}

const selectedWallet = availableWallets.find(w => w.type === walletType); // 使用了外部状态
```

当 `availableWallets` 变化时，`connectWallet` 函数需要重新创建以获取最新的钱包列表。

## 🔍 useCallback 的工作原理

### 内部机制

```javascript
// React 内部的简化实现
function useCallback(callback, dependencies) {
  const lastDependencies = useRef();
  const lastCallback = useRef();
  
  // 检查依赖是否变化
  const dependenciesChanged = !lastDependencies.current || 
    dependencies.some((dep, index) => dep !== lastDependencies.current[index]);
  
  if (dependenciesChanged) {
    lastCallback.current = callback; // 创建新函数
    lastDependencies.current = dependencies;
  }
  
  return lastCallback.current; // 返回缓存的函数
}
```

### 依赖数组的作用

```javascript
// 1. 空依赖数组 - 函数永远不变
const stableFunction = useCallback(() => {
  console.log('这个函数永远不变');
}, []);

// 2. 有依赖 - 依赖变化时重新创建函数
const [count, setCount] = useState(0);
const dynamicFunction = useCallback(() => {
  console.log('当前计数:', count); // 使用了 count
}, [count]); // count 变化时，函数重新创建

// 3. 无依赖数组 - 每次都创建新函数（等同于普通函数）
const alwaysNewFunction = useCallback(() => {
  console.log('每次都是新函数');
}); // 没有依赖数组，等同于普通函数
```

## 📊 useCallback vs 普通函数对比

### 性能测试示例

```javascript
const PerformanceTest = () => {
  const [count, setCount] = useState(0);
  const [rerenderTrigger, setRerenderTrigger] = useState(0);
  
  // 普通函数 - 每次重新创建
  const normalFunction = () => {
    console.log('普通函数');
  };
  
  // useCallback 函数 - 缓存
  const memoizedFunction = useCallback(() => {
    console.log('缓存函数');
  }, []);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>改变计数</button>
      <button onClick={() => setRerenderTrigger(rerenderTrigger + 1)}>
        触发重新渲染
      </button>
      
      {/* 每次重新渲染，normalFunction 都是新函数 */}
      <ChildComponent onClick={normalFunction} />
      
      {/* memoizedFunction 引用保持不变 */}
      <ChildComponent onClick={memoizedFunction} />
    </div>
  );
};
```

## 🎯 在钱包应用中的完整应用

### 1. 钱包检测函数

```javascript
const detectWallets = useCallback(() => {
  // 这个函数不依赖任何动态状态
  // 只是检测 window 对象上的钱包
  // 所以使用空依赖数组，函数永远不变
}, []);
```

### 2. 钱包连接函数

```javascript
const connectWallet = useCallback(async (walletType = null) => {
  // 这个函数依赖 availableWallets 状态
  // 当可用钱包列表变化时，函数需要重新创建
}, [availableWallets]);
```

### 3. 断开连接函数

```javascript
const disconnectWallet = useCallback(() => {
  setAccount(null);
  setProvider(null);
  setSigner(null);
  setFactoryContract(null);
  setChainId(null);
  setConnectedWallet(null);
  toast.success('钱包已断开连接');
}, []); // 只调用 setter 函数，不依赖任何状态
```

### 4. 获取合约实例函数

```javascript
const getCrowdfundingContract = useCallback((address) => {
  if (!signer) return null;
  return new ethers.Contract(address, CROWDFUNDING_ABI, signer);
}, [signer]); // 依赖 signer 状态
```

## 💡 何时使用 useCallback？

### ✅ 适合使用的场景

1. **传递给子组件的函数**
```javascript
<ChildComponent onClick={useCallback(() => {}, [])} />
```

2. **作为 useEffect 依赖的函数**
```javascript
const fetchData = useCallback(() => {}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

3. **昂贵的函数计算**
```javascript
const expensiveCalculation = useCallback(() => {
  // 复杂计算逻辑
}, [dependencies]);
```

### ❌ 不需要使用的场景

1. **简单的事件处理器（不传递给子组件）**
```javascript
// 不需要 useCallback
const handleClick = () => {
  setCount(count + 1);
};
```

2. **组件内部使用的简单函数**
```javascript
// 不需要 useCallback
const formatData = (data) => {
  return data.toString();
};
```

## 🔄 useCallback 最佳实践

### 1. 正确设置依赖

```javascript
// ✅ 正确：包含所有使用的外部变量
const handleSubmit = useCallback((data) => {
  if (isValid && user) { // 使用了 isValid 和 user
    submitData(data, user.id);
  }
}, [isValid, user]); // 正确的依赖

// ❌ 错误：遗漏依赖
const handleSubmit = useCallback((data) => {
  if (isValid && user) {
    submitData(data, user.id);
  }
}, []); // 缺少 isValid 和 user 依赖
```

### 2. 配合 React.memo 使用

```javascript
// 子组件使用 memo 优化
const ChildComponent = React.memo(({ onClick, data }) => {
  return <button onClick={onClick}>{data}</button>;
});

// 父组件使用 useCallback 稳定函数引用
const ParentComponent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('点击了');
  }, []);
  
  return <ChildComponent onClick={handleClick} data={count} />;
};
```

## 📚 总结

### 关键要点

1. **useCallback 缓存函数**：避免每次渲染都创建新函数
2. **依赖数组控制更新**：只有依赖变化时才重新创建函数
3. **性能优化工具**：主要用于优化子组件渲染和避免无限循环
4. **不是万能的**：过度使用反而可能影响性能

### 在钱包应用中的价值

```javascript
// useCallback 在你的项目中解决了：

// 1. 避免无限循环
const detectWallets = useCallback(() => {}, []); // 稳定的函数引用

// 2. 依赖追踪
const connectWallet = useCallback(() => {}, [availableWallets]); // 正确追踪依赖

// 3. 性能优化
// 传递给子组件的函数保持稳定，避免不必要的重新渲染
```

**useCallback 是 React 性能优化的重要工具，它确保函数引用的稳定性，避免不必要的重新渲染和依赖循环！** 