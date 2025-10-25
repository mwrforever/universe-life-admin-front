@echo off
REM Socket.IO聊天系统启动脚本 (Windows版本)

echo 🚀 启动Socket.IO高并发聊天系统...

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未运行，请先启动Docker Desktop
    pause
    exit /b 1
)

echo 📦 启动后端服务...

REM 启动Socket.IO服务器和相关依赖
docker-compose -f docker-compose.dev.yml up -d socketio-server redis mongodb

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...

REM 检查Socket.IO服务器
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Socket.IO服务器运行正常 (http://localhost:3001)
) else (
    echo ❌ Socket.IO服务器启动失败
    docker-compose -f docker-compose.dev.yml logs socketio-server
    pause
    exit /b 1
)

echo.
echo 🎉 Socket.IO聊天系统启动成功！
echo.
echo 📋 服务信息：
echo    WebSocket服务器: http://localhost:5050
echo    API代理服务器: http://localhost:5000
echo    健康检查: http://localhost:5000/health
echo    系统统计: http://localhost:5000/api/stats
echo    Prometheus指标: http://localhost:3001/metrics
echo.
echo 🚀 启动前端开发服务器：
echo    npm run dev
echo.
echo 📝 测试步骤：
echo    1. 在浏览器中打开前端应用 (通常是 http://localhost:5173)
echo    2. 点击仪表板中的"进入聊天室"按钮
echo    3. 使用任意用户名和密码登录（开发环境）
echo    4. 加入或创建聊天室开始测试
echo.
echo 🛑 停止服务：
echo    按 Ctrl+C 停止各服务进程
echo.
echo 📊 查看日志：
echo    服务日志会显示在各自的终端窗口中
echo.
pause