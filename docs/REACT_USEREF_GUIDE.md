# React useRef 详解

## 🔧 什么是 useRef？

`useRef` 是 React 提供的一个 **Hook**，用于创建一个**可变的引用对象**，这个对象在组件的整个生命周期中都保持不变。

### 基本语法

```javascript
import { useRef } from 'react';

const myRef = useRef(initialValue);
// myRef.current = initialValue
```

## 🆚 useRef vs useState 核心区别

### useState：响应式状态

```javascript
const [count, setCount] = useState(0);

// 当 count 改变时：
// ✅ 组件会重新渲染
// ✅ UI 会更新
setCount(1); // 触发重新渲染
```

### useRef：非响应式引用

```javascript
const countRef = useRef(0);

// 当 countRef.current 改变时：
// ❌ 组件不会重新渲染
// ❌ UI 不会更新
countRef.current = 1; // 不触发重新渲染
```

## 🎯 在 useWeb3.js 中的具体应用

### 1. 存储函数引用 - connectWalletRef

```javascript
const connectWalletRef = useRef();

// 问题：为什么需要用 useRef 存储函数？
```

#### 问题背景：useEffect 依赖循环

```javascript
// ❌ 这样会造成无限循环
const connectWallet = useCallback(async (walletType) => {
    // ... 连接逻辑
}, [availableWallets]); // 依赖 availableWallets

useEffect(() => {
    // 自动连接逻辑
    if (needAutoConnect) {
        connectWallet(); // 调用 connectWallet
    }
}, [availableWallets, connectWallet]); // connectWallet 也是依赖

// 循环：availableWallets 变化 → connectWallet 重新创建 → useEffect 执行 → 可能再次改变 availableWallets
```

#### ✅ 解决方案：使用 useRef 打破循环

```javascript
// 1. 创建 ref 存储最新的函数
const connectWalletRef = useRef();

// 2. 函数正常定义
const connectWallet = useCallback(async (walletType) => {
    // ... 连接逻辑
}, [availableWallets]);

// 3. 更新 ref 的值
connectWalletRef.current = connectWallet;

// 4. 在 useEffect 中使用 ref，避免依赖
useEffect(() => {
    if (needAutoConnect && connectWalletRef.current) {
        connectWalletRef.current(); // 使用 ref 调用最新函数
    }
}, [availableWallets]); // 不需要依赖 connectWallet
```

### 2. 标记状态 - hasAttemptedAutoConnect

```javascript
const hasAttemptedAutoConnect = useRef(false);

// 问题：为什么不用 useState？
```

#### useState vs useRef 对比

```javascript
// ❌ 如果用 useState
const [hasAttempted, setHasAttempted] = useState(false);

useEffect(() => {
    if (!hasAttempted && needAutoConnect) {
        setHasAttempted(true); // 这会触发重新渲染！
        autoConnect();
    }
}, [hasAttempted, needAutoConnect]); // hasAttempted 变化会再次执行

// ✅ 使用 useRef
const hasAttemptedAutoConnect = useRef(false);

useEffect(() => {
    if (!hasAttemptedAutoConnect.current && needAutoConnect) {
        hasAttemptedAutoConnect.current = true; // 不触发重新渲染
        autoConnect();
    }
}, [needAutoConnect]); // 不需要依赖 hasAttemptedAutoConnect
```

## 🔍 useRef 的常见使用场景

### 1. 存储 DOM 元素引用

```jsx
const MyComponent = () => {
    const inputRef = useRef(null);
    
    const focusInput = () => {
        inputRef.current.focus(); // 直接操作 DOM
    };
    
    return (
        <div>
            <input ref={inputRef} />
            <button onClick={focusInput}>聚焦输入框</button>
        </div>
    );
};
```

### 2. 存储组件实例变量

```javascript
const Timer = () => {
    const [count, setCount] = useState(0);
    const intervalRef = useRef(null);
    
    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            setCount(prev => prev + 1);
        }, 1000);
    };
    
    const stopTimer = () => {
        clearInterval(intervalRef.current);
    };
    
    return (
        <div>
            <p>计数: {count}</p>
            <button onClick={startTimer}>开始</button>
            <button onClick={stopTimer}>停止</button>
        </div>
    );
};
```

### 3. 缓存昂贵的计算结果

```javascript
const ExpensiveComponent = ({ data }) => {
    const expensiveResultRef = useRef(null);
    const lastDataRef = useRef(null);
    
    // 只有当 data 真正改变时才重新计算
    if (data !== lastDataRef.current) {
        expensiveResultRef.current = expensiveCalculation(data);
        lastDataRef.current = data;
    }
    
    return <div>{expensiveResultRef.current}</div>;
};
```

### 4. 保存前一个状态值

```javascript
const usePrevious = (value) => {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    });
    
    return ref.current;
};

// 使用
const MyComponent = ({ count }) => {
    const prevCount = usePrevious(count);
    
    return (
        <div>
            <p>当前值: {count}</p>
            <p>前一个值: {prevCount}</p>
        </div>
    );
};
```

## 🎯 在钱包应用中的完整流程

### 自动连接逻辑的执行流程

```javascript
// 1. 组件初始化
const connectWalletRef = useRef(); // 创建函数引用
const hasAttemptedAutoConnect = useRef(false); // 创建标记

// 2. 检测钱包
useEffect(() => {
    detectWallets(); // 检测可用钱包
}, []);

// 3. 钱包检测完成后
availableWallets = [MetaMask, OKX]; // 状态更新

// 4. 自动连接逻辑触发
useEffect(() => {
    const autoConnect = async () => {
        // 检查标记，避免重复执行
        if (hasAttemptedAutoConnect.current) return;
        
        // 设置标记（不触发重新渲染）
        hasAttemptedAutoConnect.current = true;
        
        // 使用 ref 调用最新的函数
        if (connectWalletRef.current) {
            connectWalletRef.current(walletType);
        }
    };
    
    if (availableWallets.length > 0) {
        autoConnect();
    }
}, [availableWallets]);

// 5. 更新函数引用
connectWalletRef.current = connectWallet; // 始终保持最新
```

## 💡 什么时候用 useState，什么时候用 useRef？

### 使用 useState 当：

- ✅ 需要触发 UI 重新渲染
- ✅ 状态变化需要反映在界面上
- ✅ 需要响应式的数据

```javascript
const [account, setAccount] = useState(null); // UI 需要显示账户信息
const [isLoading, setIsLoading] = useState(false); // UI 需要显示加载状态
```

### 使用 useRef 当：

- ✅ 不需要触发重新渲染
- ✅ 存储实例变量或引用
- ✅ 避免依赖循环
- ✅ 缓存计算结果

```javascript
const timerRef = useRef(null); // 存储定时器 ID
const hasInitialized = useRef(false); // 标记是否已初始化
const latestCallback = useRef(callback); // 存储最新的回调函数
```

## 🔄 useRef 的特点总结

### 核心特点

1. **持久性**：在组件重新渲染时保持值不变
2. **可变性**：可以随时修改 `.current` 的值
3. **非响应式**：修改不会触发重新渲染
4. **引用稳定**：useRef 对象本身在组件生命周期中不变

### 在你的项目中的作用

```javascript
// useRef 解决了两个关键问题：

// 1. 避免函数依赖循环
connectWalletRef.current = connectWallet; // 总是指向最新函数
// 在 useEffect 中使用 ref，不需要添加函数依赖

// 2. 防止重复执行
hasAttemptedAutoConnect.current = true; // 标记已执行
// 修改这个值不会触发组件重新渲染和 useEffect 重新执行
```

## 📚 总结

### 关键区别

| 特性 | useState | useRef |
|------|----------|--------|
| 触发重新渲染 | ✅ 是 | ❌ 否 |
| 用于 UI 状态 | ✅ 是 | ❌ 否 |
| 保持引用稳定 | ❌ 否 | ✅ 是 |
| 存储实例变量 | ❌ 否 | ✅ 是 |
| 避免依赖循环 | ❌ 否 | ✅ 是 |

### 最佳实践

1. **UI 相关状态用 useState**
2. **实例变量和引用用 useRef**  
3. **需要打破依赖循环用 useRef**
4. **缓存和标记用 useRef**

你的项目中使用 useRef 是非常聪明的选择，它解决了自动连接逻辑中的依赖循环问题，确保了代码的稳定性和性能！ 