import React from 'react';
import { Button, Space, Tag, message, Avatar } from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  KeyOutlined,
  SafetyOutlined,
  UserOutlined
} from '@ant-design/icons';

// 测试数据
const mockData = [
  {
    id: 'USER_0001',
    nickname: '张三',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    status: 'online',
    registrationTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 2 * 60 * 60 * 1000,
    role: '超级管理员',
    department: '技术部',
  },
  {
    id: 'USER_0002',
    nickname: '李四',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    phone: '13800138002',
    email: 'lisi@example.com',
    status: 'offline',
    registrationTime: Date.now() - 60 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 24 * 60 * 60 * 1000,
    role: '普通用户',
    department: '产品部',
  },
  {
    id: 'USER_0003',
    nickname: '王五',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
    phone: '13800138003',
    email: 'wangwu@example.com',
    status: 'frozen',
    registrationTime: Date.now() - 90 * 24 * 60 * 60 * 1000,
    lastLoginTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
    role: '管理员',
    department: '运营部',
  },
];

const UserManagementTest: React.FC = () => {
  // 处理函数
  const handleViewDetails = (user: any) => {
    message.info(`查看用户详情: ${user.nickname}`);
  };

  const handleResetPassword = (user: any) => {
    message.info(`重置密码: ${user.nickname}`);
  };

  const handleManagePermissions = (user: any) => {
    message.info(`管理权限: ${user.nickname}`);
  };

  const handleCreateUser = () => {
    message.info('新建用户');
  };

  const handleExportData = () => {
    message.info('导出数据');
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'offline': return '#d9d9d9';
      case 'frozen': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'frozen': return '冻结';
      default: return '未知';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>用户管理页面（测试版）</h1>

      {/* 工具栏 */}
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportData}
          >
            导出数据
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateUser}
          >
            新建用户
          </Button>
        </Space>
      </div>

      {/* 数据表格 */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>用户信息</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>手机号</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>邮箱</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>角色</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>部门</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>注册时间</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>最后登录</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((user, index) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff'
                }}
              >
                <td style={{ padding: '12px' }}>
                  <Space>
                    <Avatar
                      src={user.avatar}
                      icon={<UserOutlined />}
                      size="small"
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.nickname}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {user.id}
                      </div>
                    </div>
                  </Space>
                </td>
                <td style={{ padding: '12px' }}>{user.phone}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <Tag
                    color={getStatusColor(user.status)}
                    icon={<span style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'currentColor',
                      marginRight: 4
                    }} />}
                  >
                    {getStatusText(user.status)}
                  </Tag>
                </td>
                <td style={{ padding: '12px' }}>{user.role}</td>
                <td style={{ padding: '12px' }}>{user.department}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(user.registrationTime).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(user.lastLoginTime).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <Space>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(user)}
                    >
                      详情
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={<KeyOutlined />}
                      onClick={() => handleResetPassword(user)}
                    >
                      重置
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={<SafetyOutlined />}
                      onClick={() => handleManagePermissions(user)}
                    >
                      权限
                    </Button>
                  </Space>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTest;