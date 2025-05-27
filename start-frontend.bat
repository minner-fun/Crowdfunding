@echo off
echo 🚀 启动众筹 DApp 前端...
echo.

cd frontend

echo 📦 检查依赖...
if not exist node_modules (
    echo 📥 安装依赖中...
    npm install
    echo.
    echo 🎨 安装 Tailwind CSS...
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    echo.
)

echo 🌟 启动开发服务器...
echo 📱 应用将在 http://localhost:3000 打开
echo.
echo 💡 提示：
echo    - 确保已安装 MetaMask 浏览器扩展
echo    - 切换到 Sepolia 测试网
echo    - 确保账户有足够的测试 ETH
echo.

npm start

pause 