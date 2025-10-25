#!/bin/bash

# Socket.IO聊天系统启动脚本
# 用于快速启动开发环境进行测试

echo "🚀 启动Socket.IO高并发聊天系统..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  端口 $port 已被占用"
        return 1
    fi
    return 0
}

# 检查必要端口
for port in 3001 6379 27017; do
    if ! check_port $port; then
        echo "请先停止占用端口 $port 的服务"
        exit 1
    fi
done

echo "📦 启动后端服务..."

# 启动Socket.IO服务器和相关依赖
docker-compose -f docker-compose.dev.yml up -d socketio-server redis mongodb

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查Socket.IO服务器
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Socket.IO服务器运行正常 (http://localhost:3001)"
else
    echo "❌ Socket.IO服务器启动失败"
    docker-compose -f docker-compose.dev.yml logs socketio-server
    exit 1
fi

# 检查Redis
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis运行正常"
else
    echo "❌ Redis启动失败"
    exit 1
fi

# 检查MongoDB
if docker-compose -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB运行正常"
else
    echo "❌ MongoDB启动失败"
    exit 1
fi

echo ""
echo "🎉 Socket.IO聊天系统启动成功！"
echo ""
echo "📋 服务信息："
echo "   Socket.IO服务器: http://localhost:3001"
echo "   健康检查: http://localhost:3001/health"
echo "   系统统计: http://localhost:3001/api/stats"
echo "   Prometheus指标: http://localhost:3001/metrics"
echo ""
echo "🚀 启动前端开发服务器："
echo "   cd . && npm run dev"
echo ""
echo "📝 测试步骤："
echo "   1. 在浏览器中打开前端应用 (通常是 http://localhost:5173)"
echo "   2. 点击仪表板中的'进入聊天室'按钮"
echo "   3. 使用任意用户名和密码登录（开发环境）"
echo "   4. 加入或创建聊天室开始测试"
echo ""
echo "🛑 停止服务："
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
echo "📊 查看日志："
echo "   docker-compose -f docker-compose.dev.yml logs -f socketio-server"