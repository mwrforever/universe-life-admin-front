# useTableLocalRefresh 迁移指南

本指南帮助你将现有的表格页面迁移到使用 `useTableLocalRefresh` Hook，实现局部刷新功能。

## 迁移概述

### 迁移前后对比

| 特性 | 迁移前 | 迁移后 |
|------|--------|--------|
| 删除后刷新 | 重新请求整页数据 | 本地移除 + 冗余池补位 |
| 编辑后刷新 | 重新请求整页数据 | 本地更新 + 置顶显示 |
| 新增后刷新 | 重新请求整页数据 | 本地插入头部 |
| 响应速度 | 依赖网络延迟 | <100ms 本地响应 |
| 网络异常处理 | 手动处理 | 自动回滚 |
| 代码量 | 较多状态管理代码 | 简洁的 Hook 调用 |

## 迁移步骤

### 步骤 1：识别需要迁移的代码

在现有组件中，找到以下模式的代码：

```tsx
// 需要迁移的状态
const [loading, setLoading] = useState(false);
const [data, setData] = useState<T[]>([]);
const [total, setTotal] = useState(0);
const [params, setParams] = useState({ page: 1, size: 10 });

// 需要迁移的数据请求函数
const fetchData = async () => {
  setLoading(true);
  try {
    const res = await api.getList(params);
    setData(res.data?.records || []);
    setTotal(res.data?.total || 0);
  } finally {
    setLoading(false);
  }
};

// 需要迁移的 CRUD 操作
const handleDelete = async (id: string) => {
  await api.delete(id);
  fetchData(); // 重新请求整页
};
```

### 步骤 2：引入 Hook

```tsx
import { useTableLocalRefresh } from '@/hooks/useTableLocalRefresh';
```

### 步骤 3：替换状态管理

**迁移前：**
```tsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState<DepartmentListVO[]>([]);
const [total, setTotal] = useState(0);
const [params, setParams] = useState<DepartmentListParams>({ page: 1, size: 10 });
```

**迁移后：**
```tsx
const {
  displayData,
  loading,
  pagination,
  handleDelete,
  handleUpdate,
  handleCreate,
  handlePageChange,
  handleFilterChange,
} = useTableLocalRefresh<DepartmentListVO>({
  primaryKey: 'id',
  fetchList: async (params) => {
    const res = await departmentApi.getDepartmentList(params);
    return {
      records: res.data?.records || [],
      total: res.data?.total || 0,
    };
  },
  deleteItem: departmentApi.deleteDepartment,
  updateItem: async (id, data) => {
    await departmentApi.updateDepartment(id, data);
    const res = await departmentApi.getDepartmentById(id);
    return res.data;
  },
  createItem: async (data) => {
    const res = await departmentApi.createDepartment(data);
    return res.data;
  },
});
```

### 步骤 4：更新 Table 组件

**迁移前：**
```tsx
<Table
  dataSource={data}
  loading={loading}
  pagination={{
    current: params.page,
    pageSize: params.size,
    total,
    onChange: (page, size) => setParams({ ...params, page, size }),
  }}
/>
```

**迁移后：**
```tsx
<Table
  dataSource={displayData}
  loading={loading}
  pagination={{
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    onChange: handlePageChange,
  }}
/>
```

### 步骤 5：更新 CRUD 操作

**迁移前：**
```tsx
const handleDeleteClick = async (id: string) => {
  try {
    await departmentApi.deleteDepartment(id);
    message.success('删除成功');
    fetchData(); // 重新请求整页
  } catch (error) {
    message.error('删除失败');
  }
};
```

**迁移后：**
```tsx
const handleDeleteClick = async (id: string) => {
  try {
    await handleDelete(id);
    message.success('删除成功');
    // 无需手动刷新，Hook 自动处理
  } catch (error) {
    message.error('删除失败');
    // 无需手动回滚，Hook 自动处理
  }
};
```

### 步骤 6：更新筛选逻辑

**迁移前：**
```tsx
const handleSearch = (values: any) => {
  setParams({ ...params, ...values, page: 1 });
};
```

**迁移后：**
```tsx
const handleSearch = (values: any) => {
  handleFilterChange(values);
  // 页码会自动重置为1
};
```

### 步骤 7：添加筛选验证函数（可选）

如果编辑后的数据可能不再满足当前筛选条件，需要添加 `filterValidator`：

```tsx
const { ... } = useTableLocalRefresh<DepartmentListVO>({
  // ...其他配置
  filterValidator: (item, filters) => {
    // 状态筛选
    if (filters.status !== undefined && item.status !== filters.status) {
      return false;
    }
    // 关键字筛选
    if (filters.keyword && !item.departmentName.includes(filters.keyword)) {
      return false;
    }
    return true;
  },
});
```

### 步骤 8：删除不再需要的代码

迁移完成后，可以删除以下代码：

```tsx
// 删除这些状态
// const [loading, setLoading] = useState(false);
// const [data, setData] = useState<T[]>([]);
// const [total, setTotal] = useState(0);
// const [params, setParams] = useState({ page: 1, size: 10 });

// 删除 fetchData 函数
// const fetchData = async () => { ... };

// 删除 useEffect 中的 fetchData 调用
// useEffect(() => { fetchData(); }, [params]);
```

---

## 完整迁移示例：部门管理页面

### 迁移前代码

```tsx
const DepartmentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DepartmentListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DepartmentListParams>({ page: 1, size: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getDepartmentList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const handleDelete = async (id: string) => {
    try {
      await departmentApi.deleteDepartment(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await departmentApi.updateDepartmentStatus(id, status);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSearch = (values: any) => {
    setParams({ ...params, ...values, page: 1 });
  };

  return (
    <Table
      dataSource={data}
      loading={loading}
      pagination={{
        current: params.page,
        pageSize: params.size,
        total,
        onChange: (page, size) => setParams({ ...params, page, size }),
      }}
    />
  );
};
```

### 迁移后代码

```tsx
import { useTableLocalRefresh } from '@/hooks/useTableLocalRefresh';

const DepartmentManagement: React.FC = () => {
  const {
    displayData,
    loading,
    pagination,
    handleDelete: hookHandleDelete,
    handleUpdate,
    handleCreate,
    handlePageChange,
    handleFilterChange,
  } = useTableLocalRefresh<DepartmentListVO>({
    primaryKey: 'id',
    fetchList: async (params) => {
      const res = await departmentApi.getDepartmentList(params);
      return {
        records: res.data?.records || [],
        total: res.data?.total || 0,
      };
    },
    deleteItem: departmentApi.deleteDepartment,
    updateItem: async (id, data) => {
      await departmentApi.updateDepartment(id, data);
      const res = await departmentApi.getDepartmentById(id);
      return res.data;
    },
    createItem: async (data) => {
      const res = await departmentApi.createDepartment(data);
      return res.data;
    },
    filterValidator: (item, filters) => {
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      if (filters.keyword && !item.departmentName.includes(filters.keyword)) {
        return false;
      }
      return true;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await hookHandleDelete(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await handleUpdate(id, { status });
      message.success('状态更新成功');
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSearch = (values: any) => {
    handleFilterChange(values);
  };

  return (
    <Table
      dataSource={displayData}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handlePageChange,
      }}
    />
  );
};
```

---

## 其他页面迁移清单

以下页面可以按照相同的模式进行迁移：

### 1. 角色管理 (RoleManagement)

```tsx
useTableLocalRefresh<RoleListVO>({
  primaryKey: 'id',
  fetchList: roleApi.getRoleList,
  deleteItem: roleApi.deleteRole,
  updateItem: roleApi.updateRole,
  createItem: roleApi.createRole,
  filterValidator: (item, filters) => {
    if (filters.status !== undefined && item.status !== filters.status) return false;
    if (filters.keyword && !item.roleName.includes(filters.keyword)) return false;
    return true;
  },
});
```

### 2. 员工管理 (EmployeeManagement)

```tsx
useTableLocalRefresh<EmployeeListVO>({
  primaryKey: 'id',
  fetchList: employeeApi.getEmployeeList,
  deleteItem: employeeApi.deleteEmployee,
  updateItem: employeeApi.updateEmployee,
  createItem: employeeApi.createEmployee,
  filterValidator: (item, filters) => {
    if (filters.status !== undefined && item.status !== filters.status) return false;
    if (filters.departmentId && item.departmentId !== filters.departmentId) return false;
    if (filters.keyword && !item.realName.includes(filters.keyword)) return false;
    return true;
  },
});
```

### 3. 资源管理 (ResourceManagement)

```tsx
useTableLocalRefresh<ResourceListVO>({
  primaryKey: 'id',
  fetchList: resourceApi.getResourceList,
  deleteItem: resourceApi.deleteResource,
  updateItem: resourceApi.updateResource,
  createItem: resourceApi.createResource,
  filterValidator: (item, filters) => {
    if (filters.type !== undefined && item.type !== filters.type) return false;
    if (filters.keyword && !item.resourceName.includes(filters.keyword)) return false;
    return true;
  },
});
```

---

## 常见问题

### Q: 后端接口返回格式不一致怎么办？

A: 在 `fetchList` 中进行适配：

```tsx
fetchList: async (params) => {
  const res = await api.getList(params);
  // 适配不同的返回格式
  return {
    records: res.data?.list || res.data?.records || [],
    total: res.data?.total || res.data?.count || 0,
  };
},
```

### Q: updateItem 需要返回完整数据，但后端只返回成功状态怎么办？

A: 在更新后重新获取详情：

```tsx
updateItem: async (id, data) => {
  await api.update(id, data);
  // 重新获取完整数据
  const res = await api.getById(id);
  return res.data;
},
```

### Q: 如何处理复杂的筛选条件？

A: 在 `filterValidator` 中实现完整的验证逻辑：

```tsx
filterValidator: (item, filters) => {
  // 时间范围筛选
  if (filters.startTime && new Date(item.createdAt) < new Date(filters.startTime)) {
    return false;
  }
  if (filters.endTime && new Date(item.createdAt) > new Date(filters.endTime)) {
    return false;
  }
  // 多选筛选
  if (filters.types?.length > 0 && !filters.types.includes(item.type)) {
    return false;
  }
  return true;
},
```

### Q: 如何在删除时传递额外参数（如密码确认）？

A: `handleDelete` 支持额外参数：

```tsx
// 配置
deleteItem: (id, password) => api.delete(id, { password }),

// 使用
await handleDelete(id, userPassword);
```

---

## 迁移检查清单

- [ ] 引入 `useTableLocalRefresh` Hook
- [ ] 配置 `primaryKey`（主键字段）
- [ ] 实现 `fetchList` 函数（返回 `{ records, total }`）
- [ ] 实现 `deleteItem` 函数（如需删除功能）
- [ ] 实现 `updateItem` 函数（如需编辑功能，需返回完整数据）
- [ ] 实现 `createItem` 函数（如需新增功能，需返回完整数据）
- [ ] 实现 `filterValidator` 函数（如有筛选功能）
- [ ] 更新 Table 的 `dataSource` 为 `displayData`
- [ ] 更新 Table 的 `pagination` 配置
- [ ] 更新 CRUD 操作调用
- [ ] 更新筛选逻辑调用 `handleFilterChange`
- [ ] 删除不再需要的状态和函数
- [ ] 测试所有功能正常工作
