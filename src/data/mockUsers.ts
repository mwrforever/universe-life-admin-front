/**
 * Universe Life Admin - 用户管理Mock数据
 *
 * 高质量的企业级模拟数据，包含各种用户状态和场景
 *
 * @author James
 * @version 1.0.0
 */

import type {
  UserListResponse,
  User
} from '../types/user';
import { UserStatus, UserRole, AuthStatus, Gender } from '../types/user';

// 生成随机ID的辅助函数
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// 生成随机日期的辅助函数
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// 生成随机IP地址
const randomIP = (): string => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
};

// 中文姓名库
const chineseSurnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '胡', '朱', '郭', '何', '高', '林', '罗'];
const chineseNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];

// 生成中文姓名
const generateChineseName = (): string => {
  const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
  const givenName = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  return surname + givenName;
};

// 生成英文名
const generateEnglishName = (): string => {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// 城市列表
const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京', '天津', '苏州', '东莞', '青岛', '厦门', '长沙', '郑州', '佛山', '济南', '宁波'];

// 爱好标签
const tags = [
  '科技爱好者', '摄影', '音乐', '运动健身', '美食', '旅行', '阅读', '电影', '游戏', '编程',
  '设计', '创业', '投资', '教育', '艺术', '宠物', '汽车', '时尚', '美妆', '健康',
  '环保', '公益', '心理学', '历史', '文学', '外语', '烹饪', '园艺', '手工', '收藏'
];

// Mock用户数据生成函数
const generateMockUser = (index: number): User => {
  const isActive = Math.random() > 0.2;
  const isVerified = Math.random() > 0.3;
  const hasTwoFactor = Math.random() > 0.7;
  const isSuspicious = Math.random() > 0.9;

  const createdAt = randomDate(new Date(2020, 0, 1), new Date());
  const lastLoginAt = Math.random() > 0.1 ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : undefined;

  const randomTags: string[] = [];
  const tagCount = Math.floor(Math.random() * 4);
  for (let i = 0; i < tagCount; i++) {
    const tag = tags[Math.floor(Math.random() * tags.length)];
    if (!randomTags.includes(tag)) {
      randomTags.push(tag);
    }
  }

  return {
    id: generateId(),
    username: `user${index.toString().padStart(4, '0')}`,
    email: `user${index}@example.com`,
    phone: `1${Math.floor(Math.random() * 9) + 1}${Math.random().toString().substring(2, 11)}`,
    realName: generateChineseName(),
    nickname: `${generateChineseName()}_${Math.floor(Math.random() * 9999)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,

    status: isActive ? (isSuspicious ? UserStatus.SUSPENDED : UserStatus.ACTIVE) : UserStatus.INACTIVE,
    role: index === 0 ? UserRole.SUPER_ADMIN :
          index < 5 ? UserRole.ADMIN :
          index < 20 ? UserRole.MANAGER :
          index < 50 ? UserRole.OPERATOR : UserRole.USER,
    authStatus: isVerified ? AuthStatus.VERIFIED : (Math.random() > 0.5 ? AuthStatus.PENDING : AuthStatus.UNVERIFIED),

    gender: Object.values(Gender)[Math.floor(Math.random() * Object.values(Gender).length)],
    birthday: randomDate(new Date(1970, 0, 1), new Date(2005, 0, 1)),
    bio: `这是用户${index}的个人简介，喜欢探索新技术，热爱生活。`,
    location: cities[Math.floor(Math.random() * cities.length)],
    website: Math.random() > 0.7 ? `https://user${index}.example.com` : undefined,

    createdAt,
    updatedAt: randomDate(new Date(createdAt), new Date()),
    lastLoginAt,
    lastLoginIP: lastLoginAt ? randomIP() : undefined,
    registrationIP: randomIP(),

    loginCount: Math.floor(Math.random() * 1000),
    postCount: Math.floor(Math.random() * 200),
    followerCount: Math.floor(Math.random() * 5000),
    followingCount: Math.floor(Math.random() * 1000),

    emailVerified: isVerified || Math.random() > 0.5,
    phoneVerified: isVerified || Math.random() > 0.6,
    identityVerified: isVerified && Math.random() > 0.3,

    twoFactorEnabled: hasTwoFactor,
    loginNotifications: Math.random() > 0.4,

    language: 'zh-CN',
    timezone: 'Asia/Shanghai',

    tags: randomTags,
    internalNotes: Math.random() > 0.8 ? `内部备注：用户${index}的特殊情况说明` : undefined,

    riskLevel: isSuspicious ? 'high' : (Math.random() > 0.8 ? 'medium' : 'low'),
    suspiciousActivity: isSuspicious,
  };
};

// 生成Mock用户列表
export const generateMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, index) => generateMockUser(index));
};

// 预生成100个Mock用户
export const mockUsers = generateMockUsers(100);

// 模拟API调用 - 获取用户列表
export const mockGetUserList = async (
  params: {
    current?: number;
    pageSize?: number;
    keyword?: string;
    status?: UserStatus | UserStatus[];
    role?: UserRole | UserRole[];
    authStatus?: AuthStatus | AuthStatus[];
    gender?: Gender | Gender[];
  }
): Promise<UserListResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  let filteredUsers = [...mockUsers];

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.realName?.toLowerCase().includes(keyword) ||
      user.nickname?.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword)
    );
  }

  // 状态筛选
  if (params.status) {
    if (Array.isArray(params.status)) {
      filteredUsers = filteredUsers.filter(user => params.status!.includes(user.status));
    } else {
      filteredUsers = filteredUsers.filter(user => user.status === params.status);
    }
  }

  // 角色筛选
  if (params.role) {
    if (Array.isArray(params.role)) {
      filteredUsers = filteredUsers.filter(user => params.role!.includes(user.role));
    } else {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }
  }

  // 认证状态筛选
  if (params.authStatus) {
    if (Array.isArray(params.authStatus)) {
      filteredUsers = filteredUsers.filter(user => params.authStatus!.includes(user.authStatus));
    } else {
      filteredUsers = filteredUsers.filter(user => user.authStatus === params.authStatus);
    }
  }

  // 性别筛选
  if (params.gender) {
    if (Array.isArray(params.gender)) {
      filteredUsers = filteredUsers.filter(user => params.gender!.includes(user.gender!));
    } else {
      filteredUsers = filteredUsers.filter(user => user.gender === params.gender);
    }
  }

  // 排序
  filteredUsers.sort((a, b) => {
    if (params.keyword) {
      // 搜索时按相关性排序
      return a.username.localeCompare(b.username);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const current = params.current || 1;
  const pageSize = params.pageSize || 10;
  const total = filteredUsers.length;
  const startIndex = (current - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = filteredUsers.slice(startIndex, endIndex);

  return {
    data,
    success: true,
    total,
    current,
    pageSize,
  };
};

// 导出用户统计信息
export const getUserStatistics = () => {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(user => user.status === UserStatus.ACTIVE).length;
  const newUsersToday = mockUsers.filter(user => {
    const today = new Date().toDateString();
    return new Date(user.createdAt).toDateString() === today;
  }).length;
  const newUsersThisMonth = mockUsers.filter(user => {
    const thisMonth = new Date().getMonth();
    return new Date(user.createdAt).getMonth() === thisMonth;
  }).length;
  const verifiedUsers = mockUsers.filter(user => user.authStatus === AuthStatus.VERIFIED).length;
  const suspendedUsers = mockUsers.filter(user => user.status === UserStatus.SUSPENDED).length;
  const bannedUsers = mockUsers.filter(user => user.status === UserStatus.BANNED).length;
  const highRiskUsers = mockUsers.filter(user => user.riskLevel === 'high').length;

  const usersByRole = {
    [UserRole.SUPER_ADMIN]: mockUsers.filter(user => user.role === UserRole.SUPER_ADMIN).length,
    [UserRole.ADMIN]: mockUsers.filter(user => user.role === UserRole.ADMIN).length,
    [UserRole.MANAGER]: mockUsers.filter(user => user.role === UserRole.MANAGER).length,
    [UserRole.OPERATOR]: mockUsers.filter(user => user.role === UserRole.OPERATOR).length,
    [UserRole.USER]: mockUsers.filter(user => user.role === UserRole.USER).length,
  };

  const usersByStatus = {
    [UserStatus.ACTIVE]: mockUsers.filter(user => user.status === UserStatus.ACTIVE).length,
    [UserStatus.INACTIVE]: mockUsers.filter(user => user.status === UserStatus.INACTIVE).length,
    [UserStatus.SUSPENDED]: mockUsers.filter(user => user.status === UserStatus.SUSPENDED).length,
    [UserStatus.PENDING]: mockUsers.filter(user => user.status === UserStatus.PENDING).length,
    [UserStatus.BANNED]: mockUsers.filter(user => user.status === UserStatus.BANNED).length,
  };

  return {
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersThisMonth,
    verifiedUsers,
    suspendedUsers,
    bannedUsers,
    highRiskUsers,
    usersByRole,
    usersByStatus,
  };
};