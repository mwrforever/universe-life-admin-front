/**
 * Universe Life Admin - 用户管理页面
 *
 * 基于淘宝后台设计理念的专业级用户管理系统
 * 采用 ProTable 组件，强调信息密度与操作便捷性
 *
 * @author James
 * @version 2.0.0
 */

import React, { useState, useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  Button,
  Avatar,
  Tag,
  Space,
  message,
  Modal,
  Dropdown,
  Form,
  Input,
  Select,
  DatePicker,
  Badge,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  KeyOutlined,
  SafetyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import styled from '@emotion/styled';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 样式组件
const UserAvatar = styled(Avatar)<{ status?: 'online' | 'offline' | 'frozen' }>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid ${props => props.theme?.token?.colorBgContainer || (props.theme as any)?.token?.colorBgContainer || '#fff'};

    ${props => props.status === 'online' && `
      background-color: #52c41a;
    `}

    ${props => props.status === 'offline' && `
      background-color: #d9d9d9;
    `}

    ${props => props.status === 'frozen' && `
      background-color: #ff4d4f;
    `}
  }
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserTextInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme?.token?.colorText || (props.theme as any)?.token?.colorText || 'rgba(0, 0, 0, 0.88)'};
  font-size: 14px;
`;

const UserMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme?.token?.colorTextSecondary || (props.theme as any)?.token?.colorTextSecondary || 'rgba(0, 0, 0, 0.65)'};
`;

// 用户状态枚举
export const enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  FROZEN = 'frozen',
}

// 用户数据类型
interface UserItem {
  id: string;
  avatar: string;
  nickname: string;
  phone: string;
  email: string;
  status: UserStatus;
  level: number;
  registerTime: string;
  lastLoginTime: string;
  orderCount: number;
  totalSpent: number;
  ip: string;
  device: string;
}

// Mock 数据
const mockUsers: UserItem[] = [
  {
    id: 'U001',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    nickname: '张小明',
    phone: '138****1234',
    email: 'zhangxm@example.com',
    status: UserStatus.ONLINE,
    level: 5,
    registerTime: '2024-01-15 10:23:45',
    lastLoginTime: '2024-12-08 14:30:22',
    orderCount: 28,
    totalSpent: 15890.50,
    ip: '192.168.1.100',
    device: 'iOS 17.1'
  },
  {
    id: 'U002',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    nickname: '李美美',
    phone: '139****5678',
    email: 'limeimei@example.com',
    status: UserStatus.OFFLINE,
    level: 3,
    registerTime: '2024-03-22 16:45:12',
    lastLoginTime: '2024-12-07 09:15:33',
    orderCount: 15,
    totalSpent: 8234.00,
    ip: '192.168.1.101',
    device: 'Android 13'
  },
  {
    id: 'U003',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
    nickname: '王大锤',
    phone: '137****9012',
    email: 'wangdc@example.com',
    status: UserStatus.FROZEN,
    level: 2,
    registerTime: '2024-02-08 11:20:30',
    lastLoginTime: '2024-12-01 18:45:21',
    orderCount: 7,
    totalSpent: 3567.80,
    ip: '192.168.1.102',
    device: 'Windows 11'
  },
  {
    id: 'U004',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
    nickname: '刘晓晓',
    phone: '136****3456',
    email: 'liuxx@example.com',
    status: UserStatus.ONLINE,
    level: 4,
    registerTime: '2024-05-30 13:12:45',
    lastLoginTime: '2024-12-08 13:55:12',
    orderCount: 42,
    totalSpent: 28765.30,
    ip: '192.168.1.103',
    device: 'macOS Sonoma'
  },
  {
    id: 'U005',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=5',
    nickname: '陈一凡',
    phone: '135****7890',
    email: 'chenyf@example.com',
    status: UserStatus.OFFLINE,
    level: 6,
    registerTime: '2023-12-15 10:30:22',
    lastLoginTime: '2024-12-06 20:15:45',
    orderCount: 156,
    totalSpent: 95432.80,
    ip: '192.168.1.104',
    device: 'iPadOS 17'
  },
  {
    id: 'U006',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=6',
    nickname: '赵小雨',
    phone: '138****2468',
    email: 'zhaoxy@example.com',
    status: UserStatus.ONLINE,
    level: 1,
    registerTime: '2024-11-20 15:45:33',
    lastLoginTime: '2024-12-08 15:22:18',
    orderCount: 3,
    totalSpent: 568.00,
    ip: '192.168.1.105',
    device: 'iPhone 15 Pro'
  },
  {
    id: 'U007',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=7',
    nickname: '孙建国',
    phone: '139****1357',
    email: 'sunjg@example.com',
    status: UserStatus.OFFLINE,
    level: 7,
    registerTime: '2023-10-08 09:20:15',
    lastLoginTime: '2024-12-05 11:30:44',
    orderCount: 234,
    totalSpent: 187654.90,
    ip: '192.168.1.106',
    device: 'Android 14'
  },
  {
    id: 'U008',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=8',
    nickname: '周梦琪',
    phone: '137****8642',
    email: 'zhoumq@example.com',
    status: UserStatus.FROZEN,
    level: 2,
    registerTime: '2024-08-12 14:15:28',
    lastLoginTime: '2024-11-28 16:45:12',
    orderCount: 11,
    totalSpent: 6890.50,
    ip: '192.168.1.107',
    device: 'Windows 10'
  }
];

const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const actionRef = useRef<ActionType>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 生成更多 Mock 数据
  const generateMockData = (page: number, pageSize: number) => {
    const start = (page - 1) * pageSize;
    const data = [...mockUsers];

    // 如果需要更多数据，循环添加
    for (let i = mockUsers.length; i < start + pageSize; i++) {
      const user: UserItem = {
        id: `U${String(i + 1).padStart(3, '0')}`,
        avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i + 1}`,
        nickname: `用户${i + 1}`,
        phone: `13${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `user${i + 1}@example.com`,
        status: Object.values(UserStatus)[Math.floor(Math.random() * 3)],
        level: Math.floor(Math.random() * 7) + 1,
        registerTime: '2024-01-15 10:23:45',
        lastLoginTime: '2024-12-08 14:30:22',
        orderCount: Math.floor(Math.random() * 100),
        totalSpent: Math.floor(Math.random() * 100000),
        ip: `192.168.1.${100 + (i % 50)}`,
        device: ['iOS 17.1', 'Android 13', 'Windows 11', 'macOS Sonoma'][Math.floor(Math.random() * 4)]
      };
      data.push(user);
    }

    return data.slice(start, start + pageSize);
  };

  // 操作下拉菜单
  const createActionMenu = (record: UserItem) => [
    {
      key: 'detail',
      label: '用户详情',
      icon: <EyeOutlined />,
      onClick: () => handleUserDetail(record),
    },
    {
      key: 'reset-password',
      label: '重置密码',
      icon: <KeyOutlined />,
      onClick: () => handleResetPassword(record),
    },
    {
      key: 'permissions',
      label: '权限管理',
      icon: <SafetyOutlined />,
      onClick: () => handlePermissions(record),
    },
    {
      key: 'edit',
      label: '编辑资料',
      icon: <EditOutlined />,
      onClick: () => handleEditUser(record),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: '冻结账户',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleFreezeUser(record),
    },
  ];

  // 操作处理函数
  const handleUserDetail = (record: UserItem) => {
    message.info(`查看用户详情: ${record.nickname}`);
  };

  const handleResetPassword = (record: UserItem) => {
    Modal.confirm({
      title: '重置密码',
      icon: <ExclamationCircleOutlined />,
      content: `确定要重置用户 "${record.nickname}" 的密码吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        message.success('密码重置成功');
      },
    });
  };

  const handlePermissions = (record: UserItem) => {
    message.info(`管理用户权限: ${record.nickname}`);
  };

  const handleEditUser = (record: UserItem) => {
    message.info(`编辑用户资料: ${record.nickname}`);
  };

  const handleFreezeUser = (record: UserItem) => {
    Modal.confirm({
      title: '冻结账户',
      icon: <ExclamationCircleOutlined />,
      content: `确定要冻结用户 "${record.nickname}" 的账户吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        message.success('账户已冻结');
      },
    });
  };

  const handleExportData = () => {
    message.success('数据导出中...');
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '批量操作',
      icon: <ExclamationCircleOutlined />,
      content: `确定要对选中的 ${selectedRowKeys.length} 个用户进行操作吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        message.success('批量操作完成');
        setSelectedRowKeys([]);
      },
    });
  };

  // ProTable 列配置
  const columns: ProColumns<UserItem>[] = [
    {
      title: '用户信息',
      dataIndex: 'userInfo',
      hideInSearch: true,
      render: (_, record) => (
        <UserInfoContainer>
          <UserAvatar
            size={40}
            src={record.avatar}
            status={record.status}
            icon={<UserOutlined />}
          />
          <UserTextInfo>
            <UserName>{record.nickname}</UserName>
            <UserMeta>ID: {record.id}</UserMeta>
          </UserTextInfo>
        </UserInfoContainer>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [UserStatus.ONLINE]: {
          text: '在线',
          status: 'Success',
        },
        [UserStatus.OFFLINE]: {
          text: '离线',
          status: 'Default',
        },
        [UserStatus.FROZEN]: {
          text: '冻结',
          status: 'Error',
        },
      },
      render: (_, record) => {
        const statusMap = {
          [UserStatus.ONLINE]: { color: 'success', text: '在线' },
          [UserStatus.OFFLINE]: { color: 'default', text: '离线' },
          [UserStatus.FROZEN]: { color: 'error', text: '冻结' },
        };
        const status = statusMap[record.status];
        return (
          <Tag color={status.color}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: '用户等级',
      dataIndex: 'level',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
      render: (level) => (
        <Tag color="blue">Lv.{level}</Tag>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      width: 100,
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '消费金额',
      dataIndex: 'totalSpent',
      width: 120,
      hideInSearch: true,
      sorter: true,
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '登录设备',
      dataIndex: 'device',
      width: 120,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleUserDetail(record)}
        >
          详情
        </Button>,
        <Dropdown
          key="more"
          menu={{ items: createActionMenu(record) }}
          trigger={['click']}
        >
          <Button
            type="link"
            size="small"
            icon={<MoreOutlined />}
          >
            更多
          </Button>
        </Dropdown>,
      ],
    },
  ];

  return (
    <ProTable<UserItem>
      columns={columns}
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 'auto',
        filterType: 'light',
        collapsed: false,
        collapseRender: (collapsed) => (
          <Button
            type="link"
            size="small"
            onClick={() => {}}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
        ),
      }}
      request={async (params) => {
        const { current, pageSize, keyword, status, registerTime } = params;

        // 模拟 API 调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        let data = generateMockData(current || 1, pageSize || 10);

        // 应用搜索筛选
        if (keyword) {
          data = data.filter(item =>
            item.nickname.includes(keyword) ||
            item.phone.includes(keyword) ||
            item.email.includes(keyword) ||
            item.id.includes(keyword)
          );
        }

        if (status) {
          data = data.filter(item => item.status === status);
        }

        // 应用时间范围筛选（模拟）
        if (registerTime && Array.isArray(registerTime) && registerTime.length === 2) {
          data = data.filter(item => {
            const regDate = new Date(item.registerTime);
            return regDate >= registerTime[0] && regDate <= registerTime[1];
          });
        }

        return {
          data,
          success: true,
          total: 1000, // 模拟总数
        };
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
      }}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space size={24}>
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <Button type="link" size="small" onClick={onCleanSelected}>
              取消选择
            </Button>
          </span>
          <Button type="primary" size="small" onClick={handleBatchDelete}>
            批量操作
          </Button>
        </Space>
      )}
      toolBarRender={() => [
        <Button
          key="export"
          icon={<ExportOutlined />}
          onClick={handleExportData}
        >
          导出数据
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info('打开新建用户表单')}
        >
          新建用户
        </Button>,
      ]}
      pagination={{
        defaultPageSize: 10,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 1500 }}
      size="middle"
      options={{
        density: false,
        fullScreen: false,
        reload: true,
        setting: true,
      }}
    />
  );
};

export default UserManagement;