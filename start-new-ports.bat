@echo off
REM Socket.IO聊天系统启动脚本 (新端口配置)
REM WebSocket服务器: 5050端口, API代理: 5000端口

echo 🚀 启动Socket.IO高并发聊天系统 (新端口配置)...

echo 📦 启动WebSocket服务器 (5050端口)...
start "WebSocket Server" cmd /k "node simple-socket-server.js"

timeout /t 2 /nobreak >nul

echo 🌐 启动API代理服务器 (5000端口)...
start "API Proxy Server" cmd /k "node simple-proxy-server.js"

timeout /t 2 /nobreak >nul

echo ⏳ 等待服务启动...
timeout /t 3 /nobreak >nul

echo 🔍 检查服务状态...

REM 检查WebSocket服务器
curl -f http://localhost:5050/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ WebSocket服务器运行正常 (http://localhost:5050)
) else (
    echo ❌ WebSocket服务器启动失败
)

REM 检查API代理服务器
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API代理服务器运行正常 (http://localhost:5000)
) else (
    echo ❌ API代理服务器启动失败
)

echo.
echo 🎉 Socket.IO聊天系统启动成功！
echo.
echo 📋 服务信息：
echo    WebSocket服务器: http://localhost:5050
echo    API代理服务器: http://localhost:5000
echo    健康检查: http://localhost:5000/health
echo    系统统计: http://localhost:5000/api/stats
echo.
echo 🚀 启动前端开发服务器：
echo    npm run dev
echo.
echo 📝 测试步骤：
echo    1. 在浏览器中打开前端应用 (通常是 http://localhost:5173)
echo    2. 点击仪表板中的"进入聊天室"按钮
echo    3. 使用任意用户名和密码登录（用户名至少3个字符，密码至少6个字符）
echo    4. 加入或创建聊天室开始测试
echo.
echo 🛑 停止服务：
echo    关闭各个服务窗口或按 Ctrl+C
echo.
echo 📊 端口配置：
echo    前端应用: 5173端口
echo    API代理: 5000端口
echo    WebSocket服务: 5050端口
echo.
pause