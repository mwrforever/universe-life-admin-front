import React, { useRef, useState, useMemo } from 'react';
import { Button, Dropdown, Space, message, Avatar, Tag, Badge, Input, Select, DatePicker, Card, Row, Col } from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  KeyOutlined,
  SafetyOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UnlockOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useTheme } from '@/context/ThemeContext';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

// 用户类型定义
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'online' | 'offline' | 'frozen';
  registrationTime: number;
  lastLoginTime: number;
  role: string;
  department: string;
  loginCount: number;
  userLevel: 'vip' | 'premium' | 'standard';
}

// 样式组件
const UserCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== '$isDark' && prop !== 'selected',
})<{ $isDark: boolean; selected: boolean }>`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$isDark
      ? '0 20px 40px rgba(0, 0, 0, 0.4)'
      : '0 20px 40px rgba(0, 0, 0, 0.1)'};
  }

  .ant-card-body {
    padding: 24px;
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.9), rgba(26, 32, 44, 0.9))'
      : 'linear-gradient(135deg, #ffffff, #f8fafc)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`;

const StatusBadge = styled(Tag)<{ status: string }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  ${props => {
    switch (props.status) {
      case 'online':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        `;
      case 'offline':
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        `;
      case 'frozen':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        `;
      default:
        return '';
    }
  }}
`;

const LevelBadge = styled(Tag)<{ level: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.level) {
      case 'vip':
        return `
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
          color: #d97706;
          border: 1px solid rgba(251, 191, 36, 0.3);
        `;
      case 'premium':
        return `
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2));
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      default:
        return `
          background: rgba(156, 163, 175, 0.1);
          color: #6b7280;
        `;
    }
  }}
`;

const ActionButton = styled(Button)<{ $isDark: boolean }>`
  border-radius: 8px;
  height: 32px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$isDark
      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
      : '0 4px 12px rgba(59, 130, 246, 0.2)'};
  }
`;

const FilterContainer = styled.div<{ isDark: boolean }>`
  background: ${props => props.isDark
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
    : 'linear-gradient(135deg, #ffffff, #f8fafc)'};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  backdrop-filter: blur(10px);
`;

// 状态枚举
const statusOptions = [
  { label: '在线', value: 'online', color: '#22c55e' },
  { label: '离线', value: 'offline', color: '#6b7280' },
  { label: '冻结', value: 'frozen', color: '#ef4444' },
];

const levelOptions = [
  { label: 'VIP用户', value: 'vip', icon: <CrownOutlined /> },
  { label: '高级用户', value: 'premium', icon: <StarOutlined /> },
  { label: '普通用户', value: 'standard', icon: <StarOutlined /> },
];

// Mock 数据
const generateMockUsers = (count: number): User[] => {
  const roles = ['超级管理员', '产品经理', 'UI设计师', '前端工程师', '后端工程师', '数据分析师'];
  const departments = ['产品部', '技术部', '设计部', '运营部', '市场部'];
  const statuses: User['status'][] = ['online', 'offline', 'frozen'];
  const levels: User['userLevel'][] = ['vip', 'premium', 'standard'];
  const nicknames = [
    '张小明', '李雨萱', '王建国', '刘美丽', '陈志强', '赵晓雯',
    '周文轩', '吴诗雅', '郑浩然', '冯梦婷', '沈星辰', '韩宇轩'
  ];

  return Array.from({ length: count }, (_, index) => {
    const nickname = nicknames[index % nicknames.length];
    return {
      id: `U${String(100000 + index).padStart(6, '0')}`,
      nickname: `${nickname}${index >= nicknames.length ? index + 1 : ''}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}${index}`,
      phone: `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      email: `${nickname.toLowerCase().replace(/\s/g, '')}${index}@company.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      registrationTime: Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000),
      lastLoginTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      loginCount: Math.floor(Math.random() * 1000) + 1,
      userLevel: levels[Math.floor(Math.random() * levels.length)],
    };
  });
};

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { isDarkMode } = useTheme();
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    userLevel: '',
    department: '',
    dateRange: null as [Date, Date] | null,
  });

  const mockData = useMemo(() => generateMockUsers(24), []);

  // 过滤数据
  const filteredData = useMemo(() => {
    return mockData.filter(user => {
      if (filters.search && !user.nickname.toLowerCase().includes(filters.search.toLowerCase()) &&
          !user.phone.includes(filters.search)) {
        return false;
      }
      if (filters.status && user.status !== filters.status) {
        return false;
      }
      if (filters.userLevel && user.userLevel !== filters.userLevel) {
        return false;
      }
      if (filters.department && !user.department.includes(filters.department)) {
        return false;
      }
      return true;
    });
  }, [mockData, filters]);

  // 操作处理
  const handleViewDetails = (user: User) => {
    message.info(`查看 ${user.nickname} 的详细信息`);
  };

  const handleEditUser = (user: User) => {
    message.info(`编辑用户：${user.nickname}`);
  };

  const handleResetPassword = (user: User) => {
    message.success(`已向 ${user.email} 发送密码重置邮件`);
  };

  const handleDeleteUser = (user: User) => {
    message.warning(`删除用户操作需要二次确认：${user.nickname}`);
  };

  const handleExportData = () => {
    message.success('正在导出数据...');
    setTimeout(() => message.success('数据导出成功！'), 1500);
  };

  // 渲染用户卡片
  const renderUserCard = (user: User) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <UserCard
        key={user.id}
        $isDark={isDarkMode}
        selected={selectedRows.some(row => row.id === user.id)}
        onClick={() => {
          const isSelected = selectedRows.some(row => row.id === user.id);
          if (isSelected) {
            setSelectedRows(selectedRows.filter(row => row.id !== user.id));
          } else {
            setSelectedRows([...selectedRows, user]);
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              src={user.avatar}
              size={48}
              style={{
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            />
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {user.nickname}
                <LevelBadge level={user.userLevel}>
                  {levelOptions.find(opt => opt.value === user.userLevel)?.icon}
                  {levelOptions.find(opt => opt.value === user.userLevel)?.label}
                </LevelBadge>
              </div>
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                marginBottom: 2
              }}>
                ID: {user.id}
              </div>
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#6b7280' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <MailOutlined style={{ fontSize: '10px' }} />
                {user.email}
              </div>
            </div>
          </div>

          <StatusBadge status={user.status}>
            {statusOptions.find(opt => opt.value === user.status)?.label}
          </StatusBadge>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: '13px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <PhoneOutlined style={{ fontSize: '12px' }} />
            {user.phone}
          </div>
          <div style={{
            fontSize: '13px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{user.role}</span>
            <span style={{ fontSize: '11px' }}>{user.department}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
              登录次数
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: isDarkMode ? '#ffffff' : '#1a1a1a'
            }}>
              {user.loginCount}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
              最后登录
            </div>
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              {new Date(user.lastLoginTime).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
        }}>
          <ActionButton
            $isDark={isDarkMode}
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(user);
            }}
          >
            详情
          </ActionButton>
          <ActionButton
            $isDark={isDarkMode}
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(user);
            }}
          >
            编辑
          </ActionButton>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'reset-password',
                  icon: <KeyOutlined />,
                  label: '重置密码',
                  onClick: () => handleResetPassword(user),
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除用户',
                  danger: true,
                  onClick: () => handleDeleteUser(user),
                },
              ],
            }}
            trigger={['click']}
          >
            <ActionButton
              $isDark={isDarkMode}
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      </UserCard>
    </motion.div>
  );

  return (
    <div style={{
      padding: '24px',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f172a, #1e293b)'
        : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      minHeight: '100vh'
    }}>
      {/* 头部操作区域 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <UserOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
            用户管理
            <Badge
              count={filteredData.length}
              style={{ backgroundColor: '#3b82f6' }}
            />
          </h1>
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            margin: '8px 0 0 0'
          }}>
            管理系统中的所有用户账户和权限设置
          </p>
        </div>

        <Space size={12}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => message.success('数据已刷新')}
            style={{ borderRadius: 8 }}
          >
            刷新
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportData}
            style={{ borderRadius: 8 }}
          >
            导出数据
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('打开新建用户对话框')}
            style={{
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            新建用户
          </Button>
        </Space>
      </div>

      {/* 筛选器 */}
      <FilterContainer isDark={isDarkMode}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索用户名或手机号..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="用户状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%', borderRadius: 8 }}
              allowClear
            >
              {statusOptions.map(status => (
                <Select.Option key={status.value} value={status.value}>
                  <Space>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: status.color,
                      display: 'inline-block'
                    }} />
                    {status.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="用户等级"
              value={filters.userLevel}
              onChange={(value) => setFilters({ ...filters, userLevel: value })}
              style={{ width: '100%', borderRadius: 8 }}
              allowClear
            >
              {levelOptions.map(level => (
                <Select.Option key={level.value} value={level.value}>
                  <Space>
                    {level.icon}
                    {level.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索部门..."
              prefix={<UserOutlined />}
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>
      </FilterContainer>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>
                {mockData.filter(u => u.status === 'online').length}
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                在线用户
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginBottom: 4 }}>
                {mockData.filter(u => u.userLevel === 'vip').length}
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                VIP用户
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>
                {filteredData.length}
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                筛选结果
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{
              borderRadius: 12,
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>
                {mockData.length}
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                总用户数
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 用户卡片网格 */}
      <Row gutter={[16, 16]}>
        <AnimatePresence>
          {filteredData.map((user) => (
            <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
              {renderUserCard(user)}
            </Col>
          ))}
        </AnimatePresence>
      </Row>

      {/* 空状态 */}
      {filteredData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }}>
          <UserOutlined style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5 }} />
          <div style={{ fontSize: '18px', marginBottom: 8 }}>
            没有找到符合条件的用户
          </div>
          <div style={{ fontSize: '14px' }}>
            尝试调整筛选条件或清空筛选器
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;