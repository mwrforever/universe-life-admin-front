// MongoDB初始化脚本
// 为Socket.IO聊天系统创建必要的数据库和集合

// 切换到socketio数据库
db = db.getSiblingDB('socketio');

// 创建用户集合
db.createCollection('users');

// 创建聊天室集合
db.createCollection('rooms');

// 创建消息集合
db.createCollection('messages');

// 创建系统统计集合
db.createCollection('stats');

// 创建索引
db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.rooms.createIndex({ "roomId": 1 }, { unique: true });
db.rooms.createIndex({ "createdAt": 1 });

db.messages.createIndex({ "roomId": 1, "timestamp": -1 });
db.messages.createIndex({ "userId": 1 });
db.messages.createIndex({ "timestamp": 1 });

// 创建TTL索引，7天后自动删除消息
db.messages.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 604800 });

// 插入一些初始数据
// 创建系统管理员用户
db.users.insertOne({
    userId: "system_admin",
    username: "admin",
    email: "admin@socketio.local",
    role: "admin",
    permissions: ["read", "write", "admin"],
    createdAt: new Date(),
    lastLogin: null,
    isActive: true
});

// 创建默认聊天室
db.rooms.insertOne({
    roomId: "general",
    name: "公共聊天室",
    description: "大家都可以聊天的公共空间",
    isPrivate: false,
    maxMembers: 500,
    currentMemberCount: 0,
    createdBy: "system_admin",
    createdAt: new Date(),
    lastActivity: new Date(),
    tags: ["公共", "默认"],
    settings: {
        allowAnonymous: false,
        requireApproval: false,
        messageRetention: 7 // days
    }
});

db.rooms.insertOne({
    roomId: "tech",
    name: "技术交流",
    description: "讨论技术问题和分享经验",
    isPrivate: false,
    maxMembers: 200,
    currentMemberCount: 0,
    createdBy: "system_admin",
    createdAt: new Date(),
    lastActivity: new Date(),
    tags: ["技术", "开发"],
    settings: {
        allowAnonymous: false,
        requireApproval: false,
        messageRetention: 30 // days
    }
});

db.rooms.insertOne({
    roomId: "random",
    name: "随机聊天",
    description: "随机话题，轻松聊天",
    isPrivate: false,
    maxMembers: 1000,
    currentMemberCount: 0,
    createdBy: "system_admin",
    createdAt: new Date(),
    lastActivity: new Date(),
    tags: ["休闲", "娱乐"],
    settings: {
        allowAnonymous: true,
        requireApproval: false,
        messageRetention: 1 // day
    }
});

// 插入初始统计数据
db.stats.insertOne({
    type: "system_stats",
    timestamp: new Date(),
    data: {
        totalUsers: 1,
        totalRooms: 3,
        totalMessages: 0,
        activeConnections: 0,
        systemUptime: 0,
        memoryUsage: 0,
        cpuUsage: 0
    }
});

// 创建测试消息
db.messages.insertOne({
    messageId: "msg_welcome_001",
    roomId: "general",
    userId: "system_admin",
    username: "System",
    content: "欢迎来到Socket.IO高并发聊天系统！这是一个测试消息。",
    type: "system",
    timestamp: new Date(),
    metadata: {
        isSystemMessage: true,
        priority: "normal"
    }
});

print("MongoDB初始化完成！");
print("创建了以下集合：");
print("- users (用户集合)");
print("- rooms (聊天室集合)");
print("- messages (消息集合)");
print("- stats (统计集合)");
print("");
print("插入了默认聊天室：");
print("- general (公共聊天室)");
print("- tech (技术交流)");
print("- random (随机聊天)");