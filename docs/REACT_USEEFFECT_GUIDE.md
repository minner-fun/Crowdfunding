# React useEffect 详解

## 🔧 什么是 useEffect？

`useEffect` 是 React 提供的一个 **Hook**，用于在函数组件中执行**副作用**操作。

### 基本语法

```javascript
import { useEffect } from 'react';

useEffect(() => {
  // 副作用逻辑
  
  return () => {
    // 清理函数（可选）
  };
}, [dependencies]); // 依赖数组（可选）
```

## 🤔 什么是"副作用"？

### 副作用的定义

**副作用**是指那些**不直接参与渲染**，但需要在组件生命周期中执行的操作：

```javascript
// ✅ 这些都是副作用：
- 数据获取（API 调用）
- 事件监听器的添加/移除
- 定时器的创建/清除
- 手动修改 DOM
- 订阅外部数据源
- 日志记录
```

### 为什么需要 useEffect？

```javascript
// ❌ 错误：直接在组件中执行副作用
const MyComponent = () => {
  const [data, setData] = useState(null);
  
  // 这样会在每次渲染时都执行！
  fetch('/api/data').then(res => setData(res.data));
  
  return <div>{data}</div>;
};

// ✅ 正确：使用 useEffect 控制副作用
const MyComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(res => setData(res.data));
  }, []); // 只在组件挂载时执行一次
  
  return <div>{data}</div>;
};
```

## 🎯 useEffect 的三种模式

### 1. 无依赖数组 - 每次渲染都执行

```javascript
useEffect(() => {
  console.log('每次渲染都执行');
}); // 没有依赖数组
```

### 2. 空依赖数组 - 只执行一次

```javascript
useEffect(() => {
  console.log('只在组件挂载时执行一次');
}, []); // 空依赖数组
```

### 3. 有依赖数组 - 依赖变化时执行

```javascript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('count 变化时执行');
}, [count]); // count 变化时执行
```

## 🎯 在 useWeb3.js 中的具体应用

### 1. 监听账户变化

```javascript
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

  // 添加事件监听器
  if (connectedWallet && connectedWallet.provider) {
    connectedWallet.provider.on('accountsChanged', handleAccountsChanged);
    connectedWallet.provider.on('chainChanged', handleChainChanged);
  }

  // 清理函数：移除事件监听器
  return () => {
    if (connectedWallet && connectedWallet.provider && connectedWallet.provider.removeListener) {
      connectedWallet.provider.removeListener('accountsChanged', handleAccountsChanged);
      connectedWallet.provider.removeListener('chainChanged', handleChainChanged);
    }
  };
}, [account, disconnectWallet, connectedWallet]); // 依赖这些状态
```

### 为什么这个 useEffect 这样设计？

#### 1. 副作用：事件监听

```javascript
// 这是副作用操作 - 添加事件监听器
connectedWallet.provider.on('accountsChanged', handleAccountsChanged);
connectedWallet.provider.on('chainChanged', handleChainChanged);
```

#### 2. 依赖追踪

```javascript
// 当这些值变化时，需要重新设置监听器
}, [account, disconnectWallet, connectedWallet]);
```

#### 3. 清理函数

```javascript
// 返回清理函数，移除旧的监听器
return () => {
  if (connectedWallet && connectedWallet.provider) {
    connectedWallet.provider.removeListener('accountsChanged', handleAccountsChanged);
    connectedWallet.provider.removeListener('chainChanged', handleChainChanged);
  }
};
```

### 2. 初始化：检测可用钱包

```javascript
// 初始化：检测可用钱包
useEffect(() => {
  detectWallets();
}, [detectWallets]);
```

这个 useEffect：
- **目的**：在组件挂载时检测可用钱包
- **依赖**：`detectWallets` 函数
- **执行时机**：组件挂载时和 `detectWallets` 函数变化时

### 3. 自动连接逻辑

```javascript
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
```

这个 useEffect：
- **目的**：检查用户是否之前已连接钱包，如果是则自动连接
- **依赖**：`availableWallets`, `account`, `isConnecting`
- **逻辑**：当钱包列表可用时，检查是否有已连接的钱包

## 🔍 useEffect 的工作原理

### 生命周期对应关系

```javascript
// 类组件的生命周期方法 → useEffect 对应关系

// componentDidMount - 组件挂载后
useEffect(() => {
  console.log('组件挂载了');
}, []);

// componentDidUpdate - 组件更新后
useEffect(() => {
  console.log('组件更新了');
}); // 没有依赖数组

// componentWillUnmount - 组件卸载前
useEffect(() => {
  return () => {
    console.log('组件即将卸载');
  };
}, []);

// 特定状态变化时
useEffect(() => {
  console.log('count 变化了');
}, [count]);
```

### 执行时机

```javascript
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  console.log('1. 组件渲染'); // 每次渲染都执行
  
  useEffect(() => {
    console.log('2. useEffect 执行'); // 渲染完成后执行
  });
  
  const handleClick = () => {
    console.log('3. 事件处理器执行'); // 用户交互时执行
    setCount(count + 1);
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>点击</button>
    </div>
  );
};

// 执行顺序：1 → 2 → 用户点击 → 3 → 1 → 2
```

## 📚 useEffect 的常见使用场景

### 1. 数据获取

```javascript
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('获取用户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]); // userId 变化时重新获取
  
  if (loading) return <div>加载中...</div>;
  return <div>{user?.name}</div>;
};
```

### 2. 事件监听

```javascript
const WindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数：移除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 只在挂载时设置一次
  
  return <div>{windowSize.width} x {windowSize.height}</div>;
};
```

### 3. 定时器

```javascript
const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    
    // 清理函数：清除定时器
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]); // isActive 变化时重新设置定时器
  
  return (
    <div>
      <p>时间: {seconds}s</p>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? '暂停' : '开始'}
      </button>
    </div>
  );
};
```

### 4. 订阅和取消订阅

```javascript
const ChatRoom = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // 订阅聊天室
    const subscription = chatAPI.subscribe(roomId, (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // 清理函数：取消订阅
    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]); // roomId 变化时重新订阅
  
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
};
```

## ⚠️ useEffect 常见陷阱

### 1. 忘记清理副作用

```javascript
// ❌ 错误：没有清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器执行');
  }, 1000);
  // 没有清理，会导致内存泄漏
}, []);

// ✅ 正确：清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器执行');
  }, 1000);
  
  return () => clearInterval(timer); // 清理定时器
}, []);
```

### 2. 依赖数组不正确

```javascript
// ❌ 错误：遗漏依赖
const [count, setCount] = useState(0);
const [name, setName] = useState('');

useEffect(() => {
  console.log(`${name} 的计数是 ${count}`); // 使用了 name 和 count
}, [count]); // 遗漏了 name 依赖

// ✅ 正确：包含所有依赖
useEffect(() => {
  console.log(`${name} 的计数是 ${count}`);
}, [name, count]); // 包含所有使用的变量
```

### 3. 无限循环

```javascript
// ❌ 错误：会造成无限循环
const [data, setData] = useState([]);

useEffect(() => {
  fetchData().then(result => setData(result));
}, [data]); // data 变化 → useEffect 执行 → setData → data 变化 → 无限循环

// ✅ 正确：只在挂载时获取数据
useEffect(() => {
  fetchData().then(result => setData(result));
}, []); // 空依赖数组
```

## 🎯 在钱包应用中的完整流程

### 钱包事件监听的生命周期

```javascript
// 1. 组件挂载
// ↓
// 2. useEffect 执行 - 检测钱包
useEffect(() => {
  detectWallets();
}, [detectWallets]);

// ↓
// 3. 钱包检测完成，availableWallets 更新
// ↓
// 4. useEffect 执行 - 自动连接
useEffect(() => {
  // 尝试自动连接之前连接过的钱包
}, [availableWallets, account, isConnecting]);

// ↓
// 5. 如果连接成功，connectedWallet 更新
// ↓
// 6. useEffect 执行 - 监听钱包事件
useEffect(() => {
  // 添加 accountsChanged 和 chainChanged 监听器
  
  return () => {
    // 组件卸载或依赖变化时，移除监听器
  };
}, [account, disconnectWallet, connectedWallet]);
```

## 💡 useEffect 最佳实践

### 1. 正确设置依赖

```javascript
// ✅ 包含所有使用的外部变量
useEffect(() => {
  if (user && isLoggedIn) {
    fetchUserData(user.id);
  }
}, [user, isLoggedIn]); // 包含所有依赖
```

### 2. 适当的清理

```javascript
// ✅ 清理所有副作用
useEffect(() => {
  const subscription = subscribe();
  const timer = setInterval(() => {}, 1000);
  
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);
```

### 3. 拆分多个 useEffect

```javascript
// ✅ 按功能拆分 useEffect
const UserProfile = ({ userId }) => {
  // 获取用户数据
  useEffect(() => {
    fetchUserData(userId);
  }, [userId]);
  
  // 监听在线状态
  useEffect(() => {
    const subscription = subscribeToOnlineStatus(userId);
    return () => subscription.unsubscribe();
  }, [userId]);
  
  // 定时刷新数据
  useEffect(() => {
    const timer = setInterval(refreshData, 30000);
    return () => clearInterval(timer);
  }, []);
};
```

## 📚 总结

### 关键要点

1. **useEffect 处理副作用**：数据获取、事件监听、定时器等
2. **依赖数组控制执行**：无依赖数组每次执行，空数组只执行一次，有依赖按需执行
3. **清理函数防止泄漏**：移除事件监听器、清除定时器、取消订阅等
4. **执行时机是渲染后**：不会阻塞页面渲染

### 在钱包应用中的价值

```javascript
// useEffect 在你的项目中解决了：

// 1. 初始化逻辑
useEffect(() => {
  detectWallets(); // 检测可用钱包
}, [detectWallets]);

// 2. 事件监听
useEffect(() => {
  // 监听钱包账户和网络变化
  // 返回清理函数移除监听器
}, [connectedWallet]);

// 3. 自动连接
useEffect(() => {
  // 检查是否有之前连接的钱包并自动连接
}, [availableWallets, account, isConnecting]);
```

**useEffect 是 React 中处理副作用的核心工具，它让你能够在正确的时机执行异步操作和清理资源！** 