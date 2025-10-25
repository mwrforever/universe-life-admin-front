@echo off
REM Socket.IO聊天系统启动脚本 (最终端口配置)
REM 前端应用: 5000端口, API代理: 8091端口, WebSocket: 8088端口(ws://)

echo 🚀 启动Socket.IO高并发聊天系统 (最终端口配置)...

REM 检查5000端口是否被占用
echo 🔍 检查5000端口是否被占用...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  5000端口被占用，正在尝试终止相关进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo   终止进程 %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo 📦 启动WebSocket服务器 (8088端口 - ws://协议)...
start "WebSocket Server" cmd /k "node simple-socket-server.js"

timeout /t 2 /nobreak >nul

echo 🌐 启动API代理服务器 (8091端口)...
start "API Proxy Server" cmd /k "node simple-proxy-server.js"

timeout /t 2 /nobreak >nul

echo 🎯 启动前端开发服务器 (5000端口)...
start "Frontend Server" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo 🔍 检查服务状态...

REM 检查WebSocket服务器 (8088端口)
curl -f http://localhost:8088/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ WebSocket服务器运行正常 (ws://localhost:8088)
) else (
    echo ❌ WebSocket服务器启动失败
)

REM 检查API代理服务器 (8091端口)
curl -f http://localhost:8091/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API代理服务器运行正常 (http://localhost:8091)
) else (
    echo ❌ API代理服务器启动失败
)

REM 检查前端应用 (5000端口)
curl -f http://localhost:5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端应用运行正常 (http://localhost:5000)
) else (
    echo ❌ 前端应用启动失败
)

echo.
echo 🎉 Socket.IO聊天系统启动成功！
echo.
echo 📋 服务信息：
echo    前端应用: http://localhost:5000
echo    API代理服务器: http://localhost:8091
echo    WebSocket服务器: ws://localhost:8088
echo.
echo 📊 服务检查：
echo    健康检查: http://localhost:8091/health
echo    系统统计: http://localhost:8091/api/stats
echo    WebSocket健康: http://localhost:8088/health
echo.
echo 📝 测试步骤：
echo    1. 在浏览器中打开 http://localhost:5000
echo    2. 点击仪表板中的"进入聊天室"按钮
echo    3. 使用任意用户名和密码登录（用户名至少3个字符，密码至少6个字符）
echo    4. 加入或创建聊天室开始测试实时聊天
echo.
echo 🔧 协议配置：
echo    - 前端应用: HTTP协议 (5000端口)
echo    - API调用: HTTP协议 (8091端口代理到8088)
echo    - WebSocket连接: WS协议 (8088端口)
echo.
echo 🛑 停止服务：
echo    关闭各个服务窗口或按 Ctrl+C
echo.
pause