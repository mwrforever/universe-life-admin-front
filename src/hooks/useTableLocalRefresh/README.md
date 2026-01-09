# useTableLocalRefresh Hook

通用的表格局部刷新解决方案，适用于所有 CRUD 表格页面。

> **一句话总结**：多查5条当备胎，删改本地秒级回显，网络异常一键回滚，页页稳如老狗。

## 核心特性

- ✅ **预载冗余数据**：每次请求额外获取5条数据作为备用
- ✅ **本地秒级响应**：删除、编辑、新增操作立即更新 UI（<100ms）
- ✅ **智能补充机制**：根据实际需要动态补充数据
- ✅ **自动回滚**：网络异常时自动恢复到操作前状态
- ✅ **数据清理**：及时清理不符合筛选条件的数据
- ✅ **通用可复用**：支持泛型，适用于所有表格页面
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **并发控制**：自动取消过期请求，防止竞态条件

## 快速开始

```tsx
import { useTableLocalRefresh } from '@/hooks/useTableLocalRefresh';
import type { AdminUserListVO } from '@/services/system';

function UserManagement() {
  const {
    displayData,
    loading,
    pagination,
    handleDelete,
    handleUpdate,
    handleCreate,
    handlePageChange,
    handleFilterChange,
  } = useTableLocalRefresh<AdminUserListVO>({
    primaryKey: 'id',
    fetchList: userApi.getUserList,
    deleteItem: userApi.deleteUser,
    updateItem: userApi.updateUser,
    createItem: userApi.createUser,
  });

  return (
    <Table
      dataSource={displayData}
      loading={loading}
      pagination={{
        ...pagination,
        onChange: handlePageChange,
      }}
    />
  );
}
```

## API 参考

### 配置参数 (TableLocalRefreshConfig)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `primaryKey` | `keyof T` | 否 | `'id'` | 主键字段名 |
| `spareCount` | `number` | 否 | `5` | 冗余数据条数（建议5-10） |
| `filterValidator` | `(item: T, filters: Record<string, any>) => boolean` | 否 | - | 筛选条件验证函数 |
| `fetchList` | `(params: FetchListParams) => Promise<PageResult<T>>` | 是 | - | 获取列表数据的 API 函数 |
| `deleteItem` | `(id: string, ...args: any[]) => Promise<void>` | 否 | - | 删除单条数据的 API 函数 |
| `batchDelete` | `(ids: string[], ...args: any[]) => Promise<void>` | 否 | - | 批量删除数据的 API 函数 |
| `updateItem` | `(id: string, data: Partial<T>) => Promise<T>` | 否 | - | 更新数据的 API 函数（需返回更新后的完整数据） |
| `createItem` | `(data: Partial<T>) => Promise<T>` | 否 | - | 创建数据的 API 函数（需返回创建后的完整数据） |
| `debounceDelay` | `number` | 否 | `300` | 防抖延迟（毫秒） |

### 返回值 (TableLocalRefreshReturn)

| 属性 | 类型 | 说明 |
|------|------|------|
| `displayData` | `T[]` | 显示数据（当前页面显示的数据） |
| `loading` | `boolean` | 加载状态 |
| `pagination` | `PaginationInfo` | 分页信息 `{ current, pageSize, total }` |
| `handleDelete` | `(id: string, ...args: any[]) => Promise<void>` | 删除单条数据 |
| `handleBatchDelete` | `(ids: string[], ...args: any[]) => Promise<void>` | 批量删除数据 |
| `handleUpdate` | `(id: string, data: Partial<T>) => Promise<void>` | 更新数据 |
| `handleCreate` | `(data: Partial<T>) => Promise<void>` | 创建数据 |
| `handlePageChange` | `(page: number, pageSize: number) => void` | 页码或页尺寸变更 |
| `handleFilterChange` | `(filters: Record<string, any>) => void` | 筛选条件变更 |
| `refresh` | `() => Promise<void>` | 手动刷新数据 |
| `sparePoolSize` | `number` | 冗余池大小（用于调试） |

## 使用示例

### 1. 基础 CRUD 表格

```tsx
import { useTableLocalRefresh } from '@/hooks/useTableLocalRefresh';
import { Table, Button, Space, message } from 'antd';

function ProductList() {
  const {
    displayData,
    loading,
    pagination,
    handleDelete,
    handleUpdate,
    handleCreate,
    handlePageChange,
  } = useTableLocalRefresh<Product>({
    primaryKey: 'id',
    fetchList: productApi.getList,
    deleteItem: productApi.delete,
    updateItem: productApi.update,
    createItem: productApi.create,
  });

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '价格', dataIndex: 'price' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>编辑</Button>
          <Button danger onClick={() => handleDeleteClick(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleDeleteClick = async (id: string) => {
    try {
      await handleDelete(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={displayData}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handlePageChange,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
}
```

### 2. 带筛选条件的表格

```tsx
function UserManagement() {
  const [searchForm] = Form.useForm();

  const {
    displayData,
    loading,
    pagination,
    handleDelete,
    handleUpdate,
    handlePageChange,
    handleFilterChange,
  } = useTableLocalRefresh<User>({
    primaryKey: 'id',
    fetchList: userApi.getList,
    deleteItem: userApi.delete,
    updateItem: userApi.update,
    // 筛选验证函数：确保编辑后的数据仍然符合当前筛选条件
    filterValidator: (item, filters) => {
      // 用户名模糊匹配
      if (filters.username && !item.username.includes(filters.username)) {
        return false;
      }
      // 状态精确匹配
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      // 性别精确匹配
      if (filters.gender !== undefined && item.gender !== filters.gender) {
        return false;
      }
      return true;
    },
  });

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    handleFilterChange(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    handleFilterChange({});
  };

  return (
    <div>
      {/* 搜索表单 */}
      <Form form={searchForm} layout="inline">
        <Form.Item name="username" label="用户名">
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" allowClear>
            <Option value={0}>正常</Option>
            <Option value={1}>禁用</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 数据表格 */}
      <Table
        rowKey="id"
        dataSource={displayData}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: handlePageChange,
        }}
      />
    </div>
  );
}
```

### 3. 批量删除

```tsx
function OrderList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const {
    displayData,
    loading,
    pagination,
    handleBatchDelete,
    handlePageChange,
  } = useTableLocalRefresh<Order>({
    primaryKey: 'id',
    fetchList: orderApi.getList,
    batchDelete: orderApi.batchDelete,
  });

  const handleBatchDeleteClick = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条数据吗？`,
      onOk: async () => {
        try {
          await handleBatchDelete(selectedRowKeys);
          setSelectedRowKeys([]);
          message.success('批量删除成功');
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  return (
    <div>
      <Button
        danger
        disabled={selectedRowKeys.length === 0}
        onClick={handleBatchDeleteClick}
      >
        批量删除 ({selectedRowKeys.length})
      </Button>

      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        dataSource={displayData}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: handlePageChange,
        }}
      />
    </div>
  );
}
```

### 4. 带额外参数的删除（如密码确认）

```tsx
function SensitiveDataList() {
  const {
    displayData,
    handleDelete,
  } = useTableLocalRefresh<SensitiveData>({
    primaryKey: 'id',
    fetchList: api.getList,
    // deleteItem 支持额外参数
    deleteItem: (id, password) => api.delete(id, { password }),
  });

  const handleDeleteClick = async (id: string) => {
    // 弹出密码确认框
    const password = await showPasswordModal();
    if (password) {
      try {
        // 传入额外的密码参数
        await handleDelete(id, password);
        message.success('删除成功');
      } catch (error) {
        message.error('删除失败，请检查密码');
      }
    }
  };

  // ...
}
```

### 5. 新增数据后自动置顶

```tsx
function ArticleList() {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const {
    displayData,
    handleCreate,
  } = useTableLocalRefresh<Article>({
    primaryKey: 'id',
    fetchList: articleApi.getList,
    createItem: articleApi.create,
  });

  const handleCreateSubmit = async (values: Partial<Article>) => {
    try {
      // 新增的数据会自动插入到列表头部
      await handleCreate(values);
      setCreateModalVisible(false);
      message.success('创建成功');
    } catch (error) {
      message.error('创建失败');
    }
  };

  // ...
}
```

## 工作原理

### 数据流程图

```
┌─────────────────────────────────────────────────────────────┐
│                      初始化请求                              │
│  请求 pageSize + spareCount 条数据                          │
│  例如：pageSize=10, spareCount=5 → 请求15条                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据分配                                │
│  前 pageSize 条 → displayData（显示数据）                   │
│  剩余数据 → sparePool（冗余池，最多10条）                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      用户操作                                │
│  删除/编辑/新增 → 本地立即更新 → 调用后端 API               │
│                              │                               │
│                    成功 ←────┴────→ 失败                    │
│                      │                  │                    │
│                  清除快照           恢复快照                 │
└─────────────────────────────────────────────────────────────┘
```

### 边界场景处理

| 场景 | 处理方式 |
|------|----------|
| 删除后冗余池 ≥5 条 | 不请求补充数据 |
| 删除后冗余池 <5 条且后端有数据 | 请求差值条数（最多5条） |
| 删除后冗余池 <5 条但后端无数据 | 不请求补充数据 |
| 编辑后数据不满足筛选条件 | 移除数据并从冗余池补位 |
| 编辑后数据满足筛选条件 | 置顶显示 |
| 新增数据超过 pageSize | 将最后一条移到冗余池 |
| 当前页数据被删空（非第一页） | 自动跳转到前一页 |
| 页码/页尺寸变更 | 清空冗余池，重新请求 |
| 筛选条件变更 | 清空冗余池，重置页码为1 |
| 网络异常 | 回滚到操作前状态 |
| 并发请求 | 自动取消旧请求 |

## 注意事项

### 后端接口要求

1. **列表接口**：需要支持 `page` 和 `size` 参数
   ```typescript
   interface FetchListParams {
     page: number;    // 页码，从1开始
     size: number;    // 每页条数（会请求 pageSize + spareCount）
     [key: string]: any;  // 其他筛选参数
   }
   ```

2. **返回格式**：
   ```typescript
   interface PageResult<T> {
     records: T[];    // 数据列表
     total: number;   // 总条数
   }
   ```

3. **更新/创建接口**：需要返回完整的更新后数据
   ```typescript
   // updateItem 需要返回更新后的完整数据
   updateItem: (id: string, data: Partial<T>) => Promise<T>
   
   // createItem 需要返回创建后的完整数据（包含后端生成的 id）
   createItem: (data: Partial<T>) => Promise<T>
   ```

### 最佳实践

1. **主键唯一性**：确保数据的主键字段唯一，避免重复数据导致的问题

2. **筛选验证函数**：如果提供了 `filterValidator`，确保逻辑与后端筛选逻辑一致

3. **错误处理**：在调用 CRUD 方法时使用 try-catch 处理错误
   ```tsx
   try {
     await handleDelete(id);
     message.success('删除成功');
   } catch (error) {
     message.error('删除失败');
   }
   ```

4. **性能优化**：对于大数据量场景，建议配合虚拟滚动使用

## 测试

```bash
# 运行单元测试
npm test -- useTableLocalRefresh.test

# 运行属性测试
npm test -- useTableLocalRefresh.property.test

# 运行集成测试
npm test -- UserManagement.integration.test
```

## 许可证

MIT
