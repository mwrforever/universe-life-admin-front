# React Hook Form + Zod 企业级复杂表单最佳实践指南

## 目录
1. [与Ant Design组件的深度集成](#1-与ant-design组件的深度集成)
2. [动态表单和条件验证](#2-动态表单和条件验证)
3. [复杂嵌套表单结构处理](#3-复杂嵌套表单结构处理)
4. [表单状态管理和性能优化](#4-表单状态管理和性能优化)
5. [自定义验证规则和错误处理](#5-自定义验证规则和错误处理)
6. [表单数据转换和格式化](#6-表单数据转换和格式化)
7. [多步骤表单和向导](#7-多步骤表单和向导)
8. [表单可访问性和国际化](#8-表单可访问性和国际化)
9. [完整企业级表单示例](#9-完整企业级表单示例)

## 1. 与Ant Design组件的深度集成

### 1.1 基础集成配置

```typescript
// 安装依赖
npm install react-hook-form @hookform/resolvers zod antd @ant-design/icons

// types/form.ts
import { z } from 'zod';

export interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
}

// components/form/FormItem.tsx
import React from 'react';
import { Form, FormItemProps } from 'antd';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { ZodType } from 'zod';

interface ControlledFormItemProps<T extends FieldValues> extends Omit<FormItemProps, 'children'> {
  control: Control<T>;
  name: FieldPath<T>;
  render: (field: any, fieldState: any) => React.ReactNode;
}

export function ControlledFormItem<T extends FieldValues>({
  control,
  name,
  render,
  ...formItemProps
}: ControlledFormItemProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          {...formItemProps}
          validateStatus={fieldState.error ? 'error' : ''}
          help={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </Form.Item>
      )}
    />
  );
}

// components/form/FormInput.tsx
import React from 'react';
import { Input, InputProps, Select, SelectProps, DatePicker, DatePickerProps } from 'antd';
import { ControlledFormItem } from './FormItem';
import { FormFieldProps } from '../../types/form';

interface FormInputProps<T extends FieldValues> extends FormFieldProps {
  control: Control<T>;
  type?: 'text' | 'password' | 'select' | 'date' | 'textarea';
  inputProps?: InputProps;
  selectProps?: SelectProps;
  datePickerProps?: DatePickerProps;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  placeholder,
  type = 'text',
  options,
  inputProps,
  selectProps,
  datePickerProps,
}: FormInputProps<T>) {
  const renderField = (field: any) => {
    switch (type) {
      case 'select':
        return (
          <Select
            placeholder={placeholder}
            options={options}
            {...field}
            {...selectProps}
          />
        );
      case 'date':
        return (
          <DatePicker
            style={{ width: '100%' }}
            placeholder={placeholder}
            {...field}
            {...datePickerProps}
          />
        );
      case 'textarea':
        return (
          <Input.TextArea
            placeholder={placeholder}
            {...field}
            {...inputProps}
          />
        );
      default:
        return (
          <Input
            placeholder={placeholder}
            type={type}
            {...field}
            {...inputProps}
          />
        );
    }
  };

  return (
    <ControlledFormItem
      control={control}
      name={name}
      label={label}
      required={required}
    >
      {renderField}
    </ControlledFormItem>
  );
}
```

### 1.2 高级Ant Design组件集成

```typescript
// components/form/FormUpload.tsx
import React from 'react';
import { Upload, UploadProps, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ControlledFormItem } from './FormItem';
import { FormFieldProps } from '../../types/form';

const { Dragger } = Upload;

interface FormUploadProps<T extends FieldValues> extends FormFieldProps {
  control: Control<T>;
  uploadProps?: UploadProps;
  maxCount?: number;
  maxSize?: number; // MB
}

export function FormUpload<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  uploadProps,
  maxCount = 1,
  maxSize = 5,
}: FormUploadProps<T>) {
  const beforeUpload = (file: File) => {
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB!`);
    }
    return isLtMaxSize;
  };

  const renderField = (field: any) => (
    <Dragger
      {...uploadProps}
      beforeUpload={beforeUpload}
      maxCount={maxCount}
      onChange={(info) => {
        field.onChange(info.fileList);
        uploadProps?.onChange?.(info);
      }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p className="ant-upload-hint">
        支持单个或批量上传。严禁上传公司数据或其他敏感信息。
      </p>
    </Dragger>
  );

  return (
    <ControlledFormItem
      control={control}
      name={name}
      label={label}
      required={required}
    >
      {renderField}
    </ControlledFormItem>
  );
}

// components/form/FormRangePicker.tsx
import React from 'react';
import { DatePicker, DatePickerProps } from 'antd';
import { ControlledFormItem } from './FormItem';
import { FormFieldProps } from '../../types/form';

const { RangePicker } = DatePicker;

interface FormRangePickerProps<T extends FieldValues> extends FormFieldProps {
  control: Control<T>;
  pickerProps?: DatePickerProps;
}

export function FormRangePicker<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  pickerProps,
}: FormRangePickerProps<T>) {
  const renderField = (field: any) => (
    <RangePicker
      style={{ width: '100%' }}
      {...field}
      {...pickerProps}
    />
  );

  return (
    <ControlledFormItem
      control={control}
      name={name}
      label={label}
      required={required}
    >
      {renderField}
    </ControlledFormItem>
  );
}
```

## 2. 动态表单和条件验证

### 2.1 动态字段管理

```typescript
// schemas/dynamicForm.ts
import { z } from 'zod';

export const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  street: z.string().min(1, '街道地址不能为空'),
  city: z.string().min(1, '城市不能为空'),
  province: z.string().min(1, '省份不能为空'),
  zipCode: z.string().regex(/^\d{6}$/, '邮政编码格式不正确'),
  isDefault: z.boolean().default(false),
});

export const contactSchema = z.object({
  type: z.enum(['phone', 'email', 'wechat']),
  value: z.string().min(1, '联系方式不能为空'),
  isPrimary: z.boolean().default(false),
});

export const dynamicFormSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  age: z.number().min(18, '年龄必须大于18岁').max(100, '年龄不能超过100岁'),
  hasAddresses: z.boolean(),
  addresses: z.array(addressSchema).optional(),
  hasContacts: z.boolean(),
  contacts: z.array(contactSchema).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, '紧急联系人姓名不能为空'),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    relationship: z.string().min(1, '关系不能为空'),
  }).optional(),
}).refine((data) => {
  if (data.hasAddresses && (!data.addresses || data.addresses.length === 0)) {
    return false;
  }
  return true;
}, {
  message: '请至少添加一个地址',
  path: ['addresses'],
}).refine((data) => {
  if (data.hasContacts && (!data.contacts || data.contacts.length === 0)) {
    return false;
  }
  return true;
}, {
  message: '请至少添加一个联系方式',
  path: ['contacts'],
}).refine((data) => {
  if (data.age < 60 && !data.emergencyContact) {
    return false;
  }
  return true;
}, {
  message: '60岁以下用户必须提供紧急联系人',
  path: ['emergencyContact'],
});

// components/dynamic/DynamicForm.tsx
import React from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { Button, Card, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInput } from '../form/FormInput';
import { ControlledFormItem } from '../form/FormItem';
import { z } from 'zod';

interface DynamicFormProps {
  control: Control<z.infer<typeof dynamicFormSchema>>;
  errors: any;
}

export function DynamicForm({ control, errors }: DynamicFormProps) {
  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'addresses',
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'contacts',
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="基本信息" size="small">
        <FormInput
          control={control}
          name="name"
          label="姓名"
          required
        />
        <FormInput
          control={control}
          name="age"
          label="年龄"
          type="number"
          required
        />
      </Card>

      <Card title="地址信息" size="small">
        <ControlledFormItem
          control={control}
          name="hasAddresses"
          label="是否添加地址"
        >
          {(field) => (
            <input type="checkbox" {...field} />
          )}
        </ControlledFormItem>

        {addressFields.map((field, index) => (
          <Card
            key={field.id}
            type="inner"
            title={`地址 ${index + 1}`}
            size="small"
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeAddress(index)}
              />
            }
          >
            <FormInput
              control={control}
              name={`addresses.${index}.type`}
              label="地址类型"
              type="select"
              options={[
                { label: '家庭', value: 'home' },
                { label: '工作', value: 'work' },
                { label: '其他', value: 'other' },
              ]}
              required
            />
            <FormInput
              control={control}
              name={`addresses.${index}.street`}
              label="街道地址"
              required
            />
            <FormInput
              control={control}
              name={`addresses.${index}.city`}
              label="城市"
              required
            />
            <FormInput
              control={control}
              name={`addresses.${index}.province`}
              label="省份"
              required
            />
            <FormInput
              control={control}
              name={`addresses.${index}.zipCode`}
              label="邮政编码"
              required
            />
            <ControlledFormItem
              control={control}
              name={`addresses.${index}.isDefault`}
              label="设为默认地址"
            >
              {(field) => (
                <input type="checkbox" {...field} />
              )}
            </ControlledFormItem>
          </Card>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => appendAddress({
            type: 'home',
            street: '',
            city: '',
            province: '',
            zipCode: '',
            isDefault: false,
          })}
          style={{ width: '100%' }}
        >
          添加地址
        </Button>
      </Card>

      <Card title="联系方式" size="small">
        <ControlledFormItem
          control={control}
          name="hasContacts"
          label="是否添加联系方式"
        >
          {(field) => (
            <input type="checkbox" {...field} />
          )}
        </ControlledFormItem>

        {contactFields.map((field, index) => (
          <Card
            key={field.id}
            type="inner"
            title={`联系方式 ${index + 1}`}
            size="small"
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeContact(index)}
              />
            }
          >
            <FormInput
              control={control}
              name={`contacts.${index}.type`}
              label="联系方式类型"
              type="select"
              options={[
                { label: '手机', value: 'phone' },
                { label: '邮箱', value: 'email' },
                { label: '微信', value: 'wechat' },
              ]}
              required
            />
            <FormInput
              control={control}
              name={`contacts.${index}.value`}
              label="联系方式"
              required
            />
            <ControlledFormItem
              control={control}
              name={`contacts.${index}.isPrimary`}
              label="设为主要联系方式"
            >
              {(field) => (
                <input type="checkbox" {...field} />
              )}
            </ControlledFormItem>
          </Card>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => appendContact({
            type: 'phone',
            value: '',
            isPrimary: false,
          })}
          style={{ width: '100%' }}
        >
          添加联系方式
        </Button>
      </Card>
    </Space>
  );
}
```

### 2.2 条件渲染Hook

```typescript
// hooks/useConditionalFields.ts
import { useFormContext } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useMemo } from 'react';

export function useConditionalFields() {
  const { control } = useFormContext();
  const watchedValues = useWatch({ control });

  const showAddresses = useMemo(() => {
    return watchedValues?.hasAddresses;
  }, [watchedValues?.hasAddresses]);

  const showContacts = useMemo(() => {
    return watchedValues?.hasContacts;
  }, [watchedValues?.hasContacts]);

  const showEmergencyContact = useMemo(() => {
    return watchedValues?.age < 60;
  }, [watchedValues?.age]);

  const primaryContactCount = useMemo(() => {
    return watchedValues?.contacts?.filter((contact: any) => contact?.isPrimary).length || 0;
  }, [watchedValues?.contacts]);

  const defaultAddressCount = useMemo(() => {
    return watchedValues?.addresses?.filter((address: any) => address?.isDefault).length || 0;
  }, [watchedValues?.addresses]);

  return {
    showAddresses,
    showContacts,
    showEmergencyContact,
    primaryContactCount,
    defaultAddressCount,
    watchedValues,
  };
}

// components/dynamic/ConditionalRenderer.tsx
import React from 'react';
import { useConditionalFields } from '../../hooks/useConditionalFields';

interface ConditionalRendererProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalRenderer({ children, condition, fallback }: ConditionalRendererProps) {
  if (condition) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
```

## 3. 复杂嵌套表单结构处理

### 3.1 深度嵌套Schema定义

```typescript
// schemas/nestedForm.ts
import { z } from 'zod';

// 基础schema定义
const phoneSchema = z.object({
  countryCode: z.string().default('+86'),
  number: z.string().regex(/^\d{11}$/, '手机号格式不正确'),
  isPrimary: z.boolean().default(false),
});

const emailSchema = z.object({
  address: z.string().email('邮箱格式不正确'),
  isPrimary: z.boolean().default(false),
});

const addressSchema = z.object({
  type: z.enum(['home', 'work', 'shipping', 'billing']),
  street: z.string().min(1, '街道地址不能为空'),
  city: z.string().min(1, '城市不能为空'),
  state: z.string().min(1, '省份不能为空'),
  zipCode: z.string().regex(/^\d{6}$/, '邮政编码格式不正确'),
  country: z.string().default('中国'),
  isDefault: z.boolean().default(false),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, '紧急联系人姓名不能为空'),
  relationship: z.string().min(1, '关系不能为空'),
  phone: phoneSchema,
});

const workExperienceSchema = z.object({
  company: z.string().min(1, '公司名称不能为空'),
  position: z.string().min(1, '职位不能为空'),
  startDate: z.string().min(1, '开始日期不能为空'),
  endDate: z.string().optional(),
  isCurrentJob: z.boolean().default(false),
  responsibilities: z.array(z.string().min(1, '职责描述不能为空')).min(1, '至少添加一项职责'),
  achievements: z.array(z.string().optional()),
  salary: z.object({
    currency: z.string().default('CNY'),
    amount: z.number().positive('薪资必须大于0'),
    period: z.enum(['monthly', 'yearly']).default('monthly'),
  }).optional(),
}).refine((data) => {
  if (!data.isCurrentJob && !data.endDate) {
    return false;
  }
  return true;
}, {
  message: '非当前工作必须提供结束日期',
  path: ['endDate'],
}).refine((data) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: '结束日期不能早于开始日期',
  path: ['endDate'],
});

const educationSchema = z.object({
  institution: z.string().min(1, '学校名称不能为空'),
  degree: z.string().min(1, '学位不能为空'),
  major: z.string().min(1, '专业不能为空'),
  startDate: z.string().min(1, '开始日期不能为空'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.number().min(0).max(4).optional(),
  achievements: z.array(z.string()).optional(),
}).refine((data) => {
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  return true;
}, {
  message: '非当前学业必须提供结束日期',
  path: ['endDate'],
});

const skillsSchema = z.object({
  category: z.string().min(1, '技能分类不能为空'),
  items: z.array(z.object({
    name: z.string().min(1, '技能名称不能为空'),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    yearsOfExperience: z.number().min(0).max(50),
    certifications: z.array(z.string()).optional(),
  })).min(1, '每个分类至少添加一个技能'),
});

// 主schema
export const complexNestedFormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, '名字不能为空'),
    lastName: z.string().min(1, '姓氏不能为空'),
    birthDate: z.string().min(1, '出生日期不能为空'),
    gender: z.enum(['male', 'female', 'other']),
    nationality: z.string().min(1, '国籍不能为空'),
    idNumber: z.string().regex(/^\d{17}[\dX]$/, '身份证号格式不正确'),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  }),

  contactInfo: z.object({
    phones: z.array(phoneSchema).min(1, '至少提供一个手机号'),
    emails: z.array(emailSchema).min(1, '至少提供一个邮箱'),
    addresses: z.array(addressSchema).min(1, '至少提供一个地址'),
    emergencyContacts: z.array(emergencyContactSchema).min(1, '至少提供一个紧急联系人'),
  }).refine((data) => {
    const primaryPhones = data.phones.filter(phone => phone.isPrimary);
    const primaryEmails = data.emails.filter(email => email.isPrimary);
    return primaryPhones.length === 1 && primaryEmails.length === 1;
  }, {
    message: '必须且只能有一个主要手机号和一个主要邮箱',
  }),

  professionalInfo: z.object({
    currentPosition: z.string().min(1, '当前职位不能为空'),
    industry: z.string().min(1, '行业不能为空'),
    yearsOfExperience: z.number().min(0, '工作经验年限不能为负数'),
    workExperiences: z.array(workExperienceSchema).min(1, '至少添加一条工作经历'),
    education: z.array(educationSchema).min(1, '至少添加一条教育经历'),
    skills: z.array(skillsSchema),
    portfolio: z.object({
      website: z.string().url().optional(),
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      otherLinks: z.array(z.object({
        title: z.string().min(1, '链接标题不能为空'),
        url: z.string().url('链接格式不正确'),
      })).optional(),
    }).optional(),
  }),

  preferences: z.object({
    preferredLocations: z.array(z.string()).min(1, '至少选择一个偏好地点'),
    expectedSalary: z.object({
      currency: z.string().default('CNY'),
      minAmount: z.number().positive('最低薪资必须大于0'),
      maxAmount: z.number().positive('最高薪资必须大于0'),
      period: z.enum(['monthly', 'yearly']).default('monthly'),
    }).refine((data) => data.maxAmount > data.minAmount, {
      message: '最高薪资必须大于最低薪资',
    }),
    workType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'remote']),
    workMode: z.enum(['onsite', 'hybrid', 'remote']),
    availability: z.enum(['immediately', 'two-weeks', 'one-month', 'two-months', 'negotiable']),
  }),
});

export type ComplexNestedFormType = z.infer<typeof complexNestedFormSchema>;
```

### 3.2 嵌套表单组件

```typescript
// components/nested/PersonalInfoForm.tsx
import React from 'react';
import { FormInput } from '../form/FormInput';
import { ControlledFormItem } from '../form/FormItem';
import { Control } from 'react-hook-form';
import { Radio, DatePicker } from 'antd';

interface PersonalInfoFormProps {
  control: Control<ComplexNestedFormType>;
}

export function PersonalInfoForm({ control }: PersonalInfoFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        control={control}
        name="personalInfo.firstName"
        label="名字"
        required
      />
      <FormInput
        control={control}
        name="personalInfo.lastName"
        label="姓氏"
        required
      />
      <ControlledFormItem
        control={control}
        name="personalInfo.birthDate"
        label="出生日期"
        required
      >
        {(field) => (
          <DatePicker style={{ width: '100%' }} {...field} />
        )}
      </ControlledFormItem>
      <ControlledFormItem
        control={control}
        name="personalInfo.gender"
        label="性别"
        required
      >
        {(field) => (
          <Radio.Group {...field}>
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </Radio.Group>
        )}
      </ControlledFormItem>
      <FormInput
        control={control}
        name="personalInfo.nationality"
        label="国籍"
        required
      />
      <FormInput
        control={control}
        name="personalInfo.idNumber"
        label="身份证号"
        required
      />
      <ControlledFormItem
        control={control}
        name="personalInfo.maritalStatus"
        label="婚姻状况"
        required
      >
        {(field) => (
          <Radio.Group {...field}>
            <Radio value="single">单身</Radio>
            <Radio value="married">已婚</Radio>
            <Radio value="divorced">离异</Radio>
            <Radio value="widowed">丧偶</Radio>
          </Radio.Group>
        )}
      </ControlledFormItem>
    </div>
  );
}

// components/nested/ContactInfoForm.tsx
import React from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { Card, Button, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInput } from '../form/FormInput';
import { ControlledFormItem } from '../form/FormItem';

interface ContactInfoFormProps {
  control: Control<ComplexNestedFormType>;
}

export function ContactInfoForm({ control }: ContactInfoFormProps) {
  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'contactInfo.phones',
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: 'contactInfo.emails',
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'contactInfo.addresses',
  });

  const {
    fields: emergencyFields,
    append: appendEmergency,
    remove: removeEmergency,
  } = useFieldArray({
    control,
    name: 'contactInfo.emergencyContacts',
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="手机号码" size="small">
        {phoneFields.map((field, index) => (
          <Card
            key={field.id}
            type="inner"
            size="small"
            title={`手机 ${index + 1}`}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removePhone(index)}
              />
            }
          >
            <FormInput
              control={control}
              name={`contactInfo.phones.${index}.countryCode`}
              label="国家代码"
            />
            <FormInput
              control={control}
              name={`contactInfo.phones.${index}.number`}
              label="手机号码"
              required
            />
            <ControlledFormItem
              control={control}
              name={`contactInfo.phones.${index}.isPrimary`}
              label="设为主要号码"
            >
              {(field) => (
                <input type="checkbox" {...field} />
              )}
            </ControlledFormItem>
          </Card>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => appendPhone({
            countryCode: '+86',
            number: '',
            isPrimary: false,
          })}
          style={{ width: '100%' }}
        >
          添加手机号
        </Button>
      </Card>

      <Card title="邮箱地址" size="small">
        {emailFields.map((field, index) => (
          <Card
            key={field.id}
            type="inner"
            size="small"
            title={`邮箱 ${index + 1}`}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeEmail(index)}
              />
            }
          >
            <FormInput
              control={control}
              name={`contactInfo.emails.${index}.address`}
              label="邮箱地址"
              required
            />
            <ControlledFormItem
              control={control}
              name={`contactInfo.emails.${index}.isPrimary`}
              label="设为主要邮箱"
            >
              {(field) => (
                <input type="checkbox" {...field} />
              )}
            </ControlledFormItem>
          </Card>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => appendEmail({
            address: '',
            isPrimary: false,
          })}
          style={{ width: '100%' }}
        >
          添加邮箱
        </Button>
      </Card>

      {/* 类似地添加地址和紧急联系人组件... */}
    </Space>
  );
}
```

## 4. 表单状态管理和性能优化

### 4.1 表单状态管理Hook

```typescript
// hooks/useFormState.ts
import { useFormState, useForm } from 'react-hook-form';
import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormStateOptions<T extends z.ZodType> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  mode?: 'onSubmit' | 'onBlur' | 'onChange';
  shouldUnregister?: boolean;
}

export function useFormState<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  mode = 'onSubmit',
  shouldUnregister = false,
}: UseFormStateOptions<T>) {
  const form = useForm<z.infer<T>>({
    resolver: async (data, context, options) => {
      try {
        const result = await schema.parseAsync(data);
        return { values: result, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            acc[path] = { message: err.message, type: err.code };
            return acc;
          }, {} as Record<string, any>);
          return { values: {}, errors };
        }
        return { values: {}, errors: {} };
      }
    },
    defaultValues,
    mode,
    shouldUnregister,
  });

  const { dirtyFields, touchedFields, isDirty, isValid, isSubmitting } = useFormState({
    control: form.control,
  });

  const [submitCount, setSubmitCount] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<Date | null>(null);

  const handleSubmit = useCallback(async (data: z.infer<T>) => {
    try {
      setSubmitCount(prev => prev + 1);
      setLastSubmitTime(new Date());
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }, [onSubmit]);

  const reset = useCallback((values?: Partial<z.infer<T>>) => {
    form.reset(values);
    setSubmitCount(0);
    setLastSubmitTime(null);
  }, [form]);

  const watch = useCallback((name?: string | string[]) => {
    return form.watch(name);
  }, [form]);

  const setValue = useCallback((name: string, value: any, options?: any) => {
    return form.setValue(name, value, options);
  }, [form]);

  const trigger = useCallback((name?: string | string[]) => {
    return form.trigger(name);
  }, [form]);

  return {
    ...form,
    dirtyFields,
    touchedFields,
    isDirty,
    isValid,
    isSubmitting,
    submitCount,
    lastSubmitTime,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
  };
}

// hooks/useFormPerformance.ts
import { useEffect, useRef, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

export function useFormPerformance(control: any, formName: string = 'form') {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const fieldUpdates = useRef<Record<string, number>>({});

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${formName}] Render #${renderCount.current}, Time since last: ${timeSinceLastRender}ms`);
    }

    lastRenderTime.current = now;
  });

  const watchedValues = useWatch({ control });

  const trackFieldUpdate = useCallback((fieldName: string) => {
    fieldUpdates.current[fieldName] = (fieldUpdates.current[fieldName] || 0) + 1;
  }, []);

  const getFieldUpdateStats = useCallback(() => {
    return {
      totalUpdates: Object.values(fieldUpdates.current).reduce((sum, count) => sum + count, 0),
      fieldStats: { ...fieldUpdates.current },
    };
  }, []);

  const resetStats = useCallback(() => {
    renderCount.current = 0;
    fieldUpdates.current = {};
  }, []);

  return {
    renderCount: renderCount.current,
    watchedValues,
    trackFieldUpdate,
    getFieldUpdateStats,
    resetStats,
  };
}

// hooks/useFormDebounce.ts
import { useState, useEffect, useCallback } from 'react';

export function useFormDebounce<T>(
  value: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [immediateValue, setImmediateValue] = useState<T>(value);

  const setDebounced = useCallback((newValue: T) => {
    setImmediateValue(newValue);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [immediateValue, delay]);

  useEffect(() => {
    setImmediateValue(value);
  }, [value]);

  return [debouncedValue, immediateValue, setDebounced];
}
```

### 4.2 性能优化组件

```typescript
// components/optimized/OptimizedFormInput.tsx
import React, { memo, useMemo } from 'react';
import { Input, InputProps } from 'antd';
import { Control, useController, FieldPath, FieldValues } from 'react-hook-form';
import { ControlledFormItem } from './FormItem';

interface OptimizedFormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'password' | 'textarea';
  debounceDelay?: number;
  inputProps?: InputProps;
}

const InputComponent = memo(Input);
const TextAreaComponent = memo(Input.TextArea);

export function OptimizedFormInput<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  placeholder,
  type = 'text',
  debounceDelay = 300,
  inputProps,
}: OptimizedFormInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const inputElement = useMemo(() => {
    const commonProps = {
      placeholder,
      ...field,
      ...inputProps,
    };

    switch (type) {
      case 'textarea':
        return <TextAreaComponent {...commonProps} />;
      default:
        return <InputComponent {...commonProps} />;
    }
  }, [field, inputProps, placeholder, type]);

  return (
    <ControlledFormItem
      control={control}
      name={name}
      label={label}
      required={required}
    >
      {() => inputElement}
    </ControlledFormItem>
  );
}

// components/optimized/VirtualizedFormList.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useFieldArray, Control } from 'react-hook-form';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface VirtualizedFormListProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  height: number;
  addNewItem: () => any;
}

const MemoizedCard = memo(Card);

export function VirtualizedFormList<T extends FieldValues>({
  control,
  name,
  renderItem,
  itemHeight,
  height,
  addNewItem,
}: VirtualizedFormListProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const handleAdd = useCallback(() => {
    append(addNewItem());
  }, [append, addNewItem]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const field = fields[index];
    return (
      <div style={style}>
        <MemoizedCard
          size="small"
          extra={
            <Button
              type="text"
              danger
              onClick={() => remove(index)}
            >
              删除
            </Button>
          }
        >
          {renderItem(field, index)}
        </MemoizedCard>
      </div>
    );
  }, [fields, remove, renderItem]);

  const listData = useMemo(() => fields, [fields]);

  return (
    <div>
      <List
        height={height}
        itemCount={listData.length}
        itemSize={itemHeight}
        itemData={listData}
      >
        {Row}
      </List>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ width: '100%', marginTop: 16 }}
      >
        添加项目
      </Button>
    </div>
  );
}
```

## 5. 自定义验证规则和错误处理

### 5.1 自定义验证器

```typescript
// validators/customValidators.ts
import { z } from 'zod';

// 中国手机号验证
export const chinesePhoneValidator = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的中国手机号');

// 身份证号验证
export const chineseIdCardValidator = z.string().regex(
  /^\d{17}[\dXx]$/,
  '请输入有效的18位身份证号'
).refine((idCard) => {
  // 简化的身份证校验算法
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }

  const checkCode = checkCodes[sum % 11];
  return idCard[17].toUpperCase() === checkCode;
}, '身份证号校验位错误');

// 密码强度验证
export const passwordStrengthValidator = z.string().min(8, '密码长度至少8位')
  .regex(/[A-Z]/, '密码必须包含大写字母')
  .regex(/[a-z]/, '密码必须包含小写字母')
  .regex(/\d/, '密码必须包含数字')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '密码必须包含特殊字符');

// 银行卡号验证
export const bankCardValidator = z.string().regex(/^\d{16,19}$/, '银行卡号格式不正确')
  .refine((cardNumber) => {
    // Luhn算法验证
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, '银行卡号无效');

// 自定义日期范围验证
export const createDateRangeValidator = (minAge?: number, maxAge?: number) => {
  return z.string().refine((dateStr) => {
    const birthDate = new Date(dateStr);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (minAge && age < minAge) return false;
    if (maxAge && age > maxAge) return false;

    return true;
  }, (data) => {
    const birthDate = new Date(data);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (minAge && age < minAge) {
      return { message: `年龄不能小于${minAge}岁` };
    }
    if (maxAge && age > maxAge) {
      return { message: `年龄不能大于${maxAge}岁` };
    }

    return { message: '日期范围无效' };
  });
};

// 文件类型验证
export const createFileValidator = (allowedTypes: string[], maxSizeMB: number = 5) => {
  return z.any().refine((file) => {
    if (!file || !(file instanceof File)) return false;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type =>
      fileExtension === type.toLowerCase() || file.type.includes(type)
    );

    return isValidType && file.size <= maxSizeMB * 1024 * 1024;
  }, (file) => {
    if (!file || !(file instanceof File)) {
      return { message: '请选择有效的文件' };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type =>
      fileExtension === type.toLowerCase() || file.type.includes(type)
    );

    if (!isValidType) {
      return { message: `文件类型不支持，支持的类型：${allowedTypes.join(', ')}` };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return { message: `文件大小不能超过${maxSizeMB}MB` };
    }

    return { message: '文件验证失败' };
  });
};

// 异步验证器
export const createAsyncValidator = async <T>(
  value: T,
  validator: (value: T) => Promise<boolean>,
  errorMessage: string
): Promise<boolean> => {
  try {
    const isValid = await validator(value);
    if (!isValid) {
      throw new Error(errorMessage);
    }
    return true;
  } catch (error) {
    throw new Error(errorMessage);
  }
};

// 邮箱唯一性验证示例
export const createEmailUniqueValidator = (checkEmailUniqueness: (email: string) => Promise<boolean>) => {
  return z.string().email('邮箱格式不正确').refine(
    async (email) => {
      try {
        const isUnique = await checkEmailUniqueness(email);
        return isUnique;
      } catch (error) {
        return false;
      }
    },
    { message: '该邮箱已被注册' }
  );
};
```

### 5.2 错误处理系统

```typescript
// utils/errorHandler.ts
import { ZodError } from 'zod';
import { FieldErrors } from 'react-hook-form';

export interface FormattedError {
  field: string;
  message: string;
  code: string;
  type: 'validation' | 'network' | 'system';
}

export class FormErrorHandler {
  static formatZodErrors(error: ZodError): FormattedError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      type: 'validation' as const,
    }));
  }

  static formatNetworkErrors(error: any): FormattedError[] {
    if (error.response?.data?.errors) {
      return Object.entries(error.response.data.errors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages.join(', ') : String(messages),
        code: 'NETWORK_ERROR',
        type: 'network' as const,
      }));
    }

    return [{
      field: 'root',
      message: error.message || '网络请求失败',
      code: 'NETWORK_ERROR',
      type: 'network' as const,
    }];
  }

  static formatSystemErrors(error: any): FormattedError[] {
    return [{
      field: 'root',
      message: '系统错误，请稍后重试',
      code: 'SYSTEM_ERROR',
      type: 'system' as const,
    }];
  }

  static handleFormError(error: any): FormattedError[] {
    if (error instanceof ZodError) {
      return this.formatZodErrors(error);
    }

    if (error.response || error.request) {
      return this.formatNetworkErrors(error);
    }

    return this.formatSystemErrors(error);
  }

  static groupErrorsByType(errors: FormattedError[]): Record<string, FormattedError[]> {
    return errors.reduce((groups, error) => {
      if (!groups[error.type]) {
        groups[error.type] = [];
      }
      groups[error.type].push(error);
      return groups;
    }, {} as Record<string, FormattedError[]>);
  }
}

// components/common/ErrorMessage.tsx
import React from 'react';
import { Alert, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ErrorMessageProps {
  errors: FormattedError[];
  showDetails?: boolean;
}

export function ErrorMessage({ errors, showDetails = false }: ErrorMessageProps) {
  if (errors.length === 0) return null;

  const errorGroups = FormErrorHandler.groupErrorsByType(errors);

  return (
    <div className="error-messages">
      {errors.length === 1 ? (
        <Alert
          message={errors[0].message}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      ) : (
        <Alert
          message={`发现 ${errors.length} 个错误`}
          type="error"
          showIcon
          description={
            <div>
              {Object.entries(errorGroups).map(([type, typeErrors]) => (
                <div key={type} style={{ marginBottom: 8 }}>
                  <Text strong>
                    {type === 'validation' && '验证错误'}
                    {type === 'network' && '网络错误'}
                    {type === 'system' && '系统错误'}
                  </Text>
                  <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                    {typeErrors.map((error, index) => (
                      <li key={index}>
                        {showDetails && error.field !== 'root' && (
                          <Text type="secondary">[{error.field}] </Text>
                        )}
                        <Text>{error.message}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          }
        />
      )}
    </div>
  );
}
```

## 6. 表单数据转换和格式化

### 6.1 数据转换工具

```typescript
// utils/dataTransform.ts
import { z } from 'zod';

// 日期格式转换
export const formatDate = (date: string | Date, format: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

// 数字格式化
export const formatCurrency = (amount: number, currency: string = 'CNY', locale: string = 'zh-CN'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// 字符串处理
export const formatPhoneNumber = (phone: string, country: string = 'CN'): string => {
  switch (country) {
    case 'CN':
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    case 'US':
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    default:
      return phone;
  }
};

export const formatIdCard = (idCard: string): string => {
  if (idCard.length !== 18) return idCard;
  return idCard.replace(/(\d{6})(\d{8})(\d{3}[\dXx])/, '$1********$3');
};

// Zod转换器
export const createStringToDateTransformer = () => {
  return z.string().transform((str) => new Date(str));
};

export const createNumberToCurrencyTransformer = (currency: string = 'CNY') => {
  return z.number().transform((num) => formatCurrency(num, currency));
};

export const createTrimStringTransformer = () => {
  return z.string().transform((str) => str.trim());
};

export const createUpperCaseTransformer = () => {
  return z.string().transform((str) => str.toUpperCase());
};

export const createLowerCaseTransformer = () => {
  return z.string().transform((str) => str.toLowerCase());
};

// 数组转换
export const createArrayToStringTransformer = (separator: string = ', ') => {
  return z.array(z.string()).transform((arr) => arr.join(separator));
};

export const createStringToArrayTransformer = (separator: string = ',') => {
  return z.string().transform((str) => str.split(separator).map(s => s.trim()));
};

// 对象转换
export const createFlattenObjectTransformer = () => {
  return z.object({}).transform((obj) => {
    const flattened: Record<string, any> = {};

    const flatten = (current: any, prefix: string = '') => {
      for (const key in current) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof current[key] === 'object' && current[key] !== null && !Array.isArray(current[key])) {
          flatten(current[key], newKey);
        } else {
          flattened[newKey] = current[key];
        }
      }
    };

    flatten(obj);
    return flattened;
  });
};

// 表单数据预处理和后处理
export interface FormTransformConfig {
  preProcess?: (data: any) => any;
  postProcess?: (data: any) => any;
  fieldTransforms?: Record<string, (value: any) => any>;
}

export class FormTransformer {
  private config: FormTransformConfig;

  constructor(config: FormTransformConfig = {}) {
    this.config = config;
  }

  transformForSubmit(data: any): any {
    let transformedData = { ...data };

    // 预处理
    if (this.config.preProcess) {
      transformedData = this.config.preProcess(transformedData);
    }

    // 字段级转换
    if (this.config.fieldTransforms) {
      for (const [fieldPath, transformer] of Object.entries(this.config.fieldTransforms)) {
        const value = this.getNestedValue(transformedData, fieldPath);
        if (value !== undefined) {
          const transformedValue = transformer(value);
          this.setNestedValue(transformedData, fieldPath, transformedValue);
        }
      }
    }

    // 后处理
    if (this.config.postProcess) {
      transformedData = this.config.postProcess(transformedData);
    }

    return transformedData;
  }

  transformForDisplay(data: any): any {
    // 与transformForSubmit相反的处理
    return data;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// 常用转换配置
export const commonFormTransformConfig: FormTransformConfig = {
  fieldTransforms: {
    'birthDate': (value) => formatDate(value),
    'salary.amount': (value) => formatCurrency(value),
    'phone.number': (value) => formatPhoneNumber(value),
    'idNumber': (value) => formatIdCard(value),
    'personalInfo.emails': (emails) => emails.map((email: any) => ({
      ...email,
      address: email.address.toLowerCase().trim(),
    })),
  },
  preProcess: (data) => {
    // 移除空字符串
    const removeEmptyStrings = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.filter(item => item !== '' && item !== null && item !== undefined).map(removeEmptyStrings);
      }

      const result: any = {};
      for (const key in obj) {
        if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
          result[key] = removeEmptyStrings(obj[key]);
        }
      }
      return result;
    };

    return removeEmptyStrings(data);
  },
  postProcess: (data) => {
    // 添加时间戳等元数据
    return {
      ...data,
      submittedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  },
};
```

## 7. 多步骤表单和向导

### 7.1 多步骤表单基础架构

```typescript
// types/wizard.ts
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  validation?: any;
  isOptional?: boolean;
  dependencies?: string[];
}

export interface WizardConfig {
  steps: WizardStep[];
  onFinish: (data: any) => Promise<void>;
  onCancel?: () => void;
  onStepChange?: (currentStep: number, direction: 'next' | 'prev') => void;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
}

export interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  completedSteps: Set<number>;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  canGoToStep: (step: number) => boolean;
}

// hooks/useWizard.ts
import { useState, useCallback, useMemo } from 'react';
import { WizardConfig, WizardContextType } from '../types/wizard';

export function useWizard(config: WizardConfig): WizardContextType & { config: WizardConfig } {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = config.steps.length;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      config.onStepChange?.(step, step > currentStep ? 'next' : 'prev');
    }
  }, [currentStep, totalSteps, config]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => new Set(prev).add(step));
  }, []);

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const canGoToStep = useCallback((step: number) => {
    if (step < 0 || step >= totalSteps) return false;

    const targetStep = config.steps[step];
    if (!targetStep) return false;

    // 检查依赖步骤是否完成
    if (targetStep.dependencies) {
      const allDependenciesCompleted = targetStep.dependencies.every(depStep =>
        completedSteps.has(depStep)
      );
      if (!allDependenciesCompleted) return false;
    }

    // 可选步骤可以跳过
    if (targetStep.isOptional && config.allowSkipOptional) {
      return true;
    }

    // 检查是否可以跳转到该步骤
    return step <= currentStep || isStepCompleted(step);
  }, [config, completedSteps, currentStep, isStepCompleted]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    completedSteps,
    markStepCompleted,
    isStepCompleted,
    canGoToStep,
    config,
  };
}

// components/wizard/WizardProvider.tsx
import React, { createContext, useContext } from 'react';
import { WizardContextType } from '../../types/wizard';

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children, value }: { children: React.ReactNode; value: WizardContextType }) {
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardContext(): WizardContextType {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
}
```

### 7.2 向导组件实现

```typescript
// components/wizard/Wizard.tsx
import React from 'react';
import { Card, Steps, Button, Space, Row, Col } from 'antd';
import { WizardProvider, useWizardContext } from './WizardProvider';
import { useWizard } from '../../hooks/useWizard';
import { WizardConfig } from '../../types/wizard';

interface WizardProps {
  config: WizardConfig;
  formData: any;
  onFormDataChange: (data: any) => void;
}

function WizardContent({ config, formData, onFormDataChange }: WizardProps) {
  const wizard = useWizard(config);
  const currentStepConfig = config.steps[wizard.currentStep];
  const CurrentStepComponent = currentStepConfig.component;

  const handleStepSubmit = async (stepData: any) => {
    const updatedFormData = { ...formData, ...stepData };
    onFormDataChange(updatedFormData);

    wizard.markStepCompleted(wizard.currentStep);

    if (wizard.isLastStep) {
      await config.onFinish(updatedFormData);
    } else {
      wizard.nextStep();
    }
  };

  const handleStepCancel = () => {
    config.onCancel?.();
  };

  return (
    <div className="wizard-container">
      {config.showProgress && (
        <Card size="small" style={{ marginBottom: 24 }}>
          <Steps
            current={wizard.currentStep}
            size="small"
            items={config.steps.map((step, index) => ({
              title: step.title,
              description: step.description,
              status: wizard.isStepCompleted(index) ? 'finish' :
                     wizard.currentStep === index ? 'process' : 'wait',
              disabled: !wizard.canGoToStep(index),
            }))}
            onChange={wizard.goToStep}
          />
        </Card>
      )}

      <Card>
        <div style={{ minHeight: 400 }}>
          <CurrentStepComponent
            data={formData}
            onSubmit={handleStepSubmit}
            onCancel={handleStepCancel}
            isFirstStep={wizard.isFirstStep}
            isLastStep={wizard.isLastStep}
            canGoNext={wizard.currentStep === 0 || wizard.isStepCompleted(wizard.currentStep - 1)}
            canGoPrev={wizard.currentStep > 0}
            goToPrev={wizard.prevStep}
            goToNext={wizard.nextStep}
            goToStep={wizard.goToStep}
            totalSteps={wizard.totalSteps}
            currentStep={wizard.currentStep}
          />
        </div>
      </Card>
    </div>
  );
}

export function Wizard({ config, formData, onFormDataChange }: WizardProps) {
  const wizard = useWizard(config);

  return (
    <WizardProvider value={wizard}>
      <WizardContent
        config={config}
        formData={formData}
        onFormDataChange={onFormDataChange}
      />
    </WizardProvider>
  );
}

// components/wizard/WizardStepActions.tsx
import React from 'react';
import { Button, Space } from 'antd';
import { LeftOutlined, RightOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface WizardStepActionsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  isSubmitting?: boolean;
  isValid?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function WizardStepActions({
  isFirstStep,
  isLastStep,
  canGoNext,
  canGoPrev,
  isSubmitting = false,
  isValid = true,
  onNext,
  onPrev,
  onSubmit,
  onCancel,
  onSkip,
  showSkip = false,
}: WizardStepActionsProps) {
  return (
    <div style={{ marginTop: 24, textAlign: 'right' }}>
      <Space>
        {!isFirstStep && (
          <Button
            icon={<LeftOutlined />}
            onClick={onPrev}
            disabled={!canGoPrev || isSubmitting}
          >
            上一步
          </Button>
        )}

        {showSkip && onSkip && (
          <Button onClick={onSkip} disabled={isSubmitting}>
            跳过
          </Button>
        )}

        {onCancel && (
          <Button
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!isValid}
          >
            提交
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={onNext}
            disabled={!canGoNext || !isValid || isSubmitting}
          >
            下一步
          </Button>
        )}
      </Space>
    </div>
  );
}
```

## 8. 表单可访问性和国际化

### 8.1 可访问性配置

```typescript
// hooks/useFormAccessibility.ts
import { useEffect, useRef } from 'react';

export function useFormAccessibility() {
  const firstErrorRef = useRef<HTMLElement | null>(null);

  const focusFirstError = useCallback(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.focus();
      firstErrorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, []);

  const announceError = useCallback((message: string) => {
    // 创建屏幕阅读器通知
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const setFieldErrorRef = useCallback((element: HTMLElement | null) => {
    if (element && !firstErrorRef.current) {
      firstErrorRef.current = element;
    }
  }, []);

  return {
    focusFirstError,
    announceError,
    setFieldErrorRef,
  };
}

// components/accessible/AccessibleFormInput.tsx
import React, { forwardRef } from 'react';
import { FormInput } from '../form/FormInput';
import { useFormAccessibility } from '../../hooks/useFormAccessibility';

interface AccessibleFormInputProps {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  errorId?: string;
  descriptionId?: string;
}

export const AccessibleFormInput = forwardRef<any, AccessibleFormInputProps>((props, ref) => {
  const { setFieldErrorRef } = useFormAccessibility();

  return (
    <FormInput
      ref={ref}
      inputProps={{
        ...props.inputProps,
        'aria-describedby': props['aria-describedby'],
        'aria-invalid': props['aria-invalid'],
        'aria-required': props['aria-required'],
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'],
      }}
      {...props}
    />
  );
});
```

### 8.2 国际化配置

```typescript
// i18n/formTranslations.ts
export const formTranslations = {
  'zh-CN': {
    validation: {
      required: '此字段为必填项',
      invalid_email: '请输入有效的邮箱地址',
      invalid_phone: '请输入有效的手机号码',
      min_length: '至少需要 {{min}} 个字符',
      max_length: '最多只能输入 {{max}} 个字符',
      invalid_date: '请输入有效的日期',
      password_too_weak: '密码强度不够',
      terms_required: '请同意服务条款',
      file_too_large: '文件大小超过限制',
      invalid_file_type: '不支持的文件类型',
    },
    actions: {
      submit: '提交',
      cancel: '取消',
      save: '保存',
      next: '下一步',
      prev: '上一步',
      skip: '跳过',
      reset: '重置',
      add: '添加',
      remove: '删除',
      edit: '编辑',
    },
    status: {
      loading: '加载中...',
      submitting: '提交中...',
      success: '提交成功',
      error: '提交失败',
      network_error: '网络错误，请稍后重试',
    },
  },
  'en-US': {
    validation: {
      required: 'This field is required',
      invalid_email: 'Please enter a valid email address',
      invalid_phone: 'Please enter a valid phone number',
      min_length: 'Must be at least {{min}} characters',
      max_length: 'Must be no more than {{max}} characters',
      invalid_date: 'Please enter a valid date',
      password_too_weak: 'Password is too weak',
      terms_required: 'Please accept the terms and conditions',
      file_too_large: 'File size exceeds limit',
      invalid_file_type: 'Unsupported file type',
    },
    actions: {
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      next: 'Next',
      prev: 'Previous',
      skip: 'Skip',
      reset: 'Reset',
      add: 'Add',
      remove: 'Remove',
      edit: 'Edit',
    },
    status: {
      loading: 'Loading...',
      submitting: 'Submitting...',
      success: 'Submitted successfully',
      error: 'Submission failed',
      network_error: 'Network error, please try again later',
    },
  },
};

// hooks/useFormI18n.ts
import { useMemo } from 'react';

export function useFormI18n(locale: string = 'zh-CN') {
  const translations = useMemo(() => {
    return formTranslations[locale as keyof typeof formTranslations] || formTranslations['zh-CN'];
  }, [locale]);

  const t = useCallback((key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value[k as keyof typeof value];
      if (typeof value !== 'object') break;
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }

    return value || key;
  }, [translations]);

  return { t };
}

// components/i18n/FormattedMessage.tsx
import React from 'react';
import { useFormI18n } from '../../hooks/useFormI18n';

interface FormattedMessageProps {
  id: string;
  values?: Record<string, any>;
  fallback?: string;
}

export function FormattedMessage({ id, values, fallback }: FormattedMessageProps) {
  const { t } = useFormI18n();

  const message = t(id, values);

  if (message === id && fallback) {
    return <>{fallback}</>;
  }

  return <>{message}</>;
}
```

## 9. 完整企业级表单示例

### 9.1 综合表单Schema

```typescript
// schemas/enterpriseForm.ts
import { z } from 'zod';
import {
  chinesePhoneValidator,
  chineseIdCardValidator,
  passwordStrengthValidator,
  createFileValidator,
  createEmailUniqueValidator
} from '../validators/customValidators';

// 模拟邮箱唯一性检查API
const checkEmailUniqueness = async (email: string): Promise<boolean> => {
  // 实际项目中这里会调用API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return !email.includes('taken');
};

export const enterpriseFormSchema = z.object({
  // 基本信息
  basicInfo: z.object({
    username: z.string()
      .min(3, '用户名至少3个字符')
      .max(20, '用户名最多20个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
    email: createEmailUniqueValidator(checkEmailUniqueness),
    password: passwordStrengthValidator,
    confirmPassword: z.string(),
    fullName: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
    gender: z.enum(['male', 'female', 'other']),
    birthDate: z.string().min(1, '请选择出生日期'),
    idNumber: chineseIdCardValidator,
    phone: chinesePhoneValidator,
  }).refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }),

  // 地址信息
  addressInfo: z.object({
    residentialAddress: z.object({
      province: z.string().min(1, '请选择省份'),
      city: z.string().min(1, '请选择城市'),
      district: z.string().min(1, '请选择区县'),
      street: z.string().min(5, '街道地址至少5个字符'),
      zipCode: z.string().regex(/^\d{6}$/, '邮政编码格式不正确'),
    }),
    isSameAsResidential: z.boolean().default(false),
    mailingAddress: z.object({
      province: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      street: z.string().optional(),
      zipCode: z.string().optional(),
    }).optional(),
  }),

  // 教育经历
  education: z.object({
    highestDegree: z.enum(['high_school', 'bachelor', 'master', 'phd', 'other']),
    major: z.string().min(2, '专业至少2个字符'),
    school: z.string().min(2, '学校名称至少2个字符'),
    graduationYear: z.number().min(1950).max(new Date().getFullYear() + 4),
    hasCertifications: z.boolean().default(false),
    certifications: z.array(z.object({
      name: z.string().min(1, '证书名称不能为空'),
      issuer: z.string().min(1, '颁发机构不能为空'),
      obtainedDate: z.string().min(1, '获得日期不能为空'),
      expiryDate: z.string().optional(),
      certificateFile: createFileValidator(['pdf', 'jpg', 'png'], 2).optional(),
    })).optional(),
  }).refine((data) => {
    if (data.hasCertifications && (!data.certifications || data.certifications.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: '请至少添加一个证书',
    path: ['certifications'],
  }),

  // 工作经历
  workExperience: z.object({
    hasWorkExperience: z.boolean().default(false),
    experiences: z.array(z.object({
      company: z.string().min(2, '公司名称至少2个字符'),
      position: z.string().min(2, '职位至少2个字符'),
      startDate: z.string().min(1, '开始日期不能为空'),
      endDate: z.string().optional(),
      isCurrentJob: z.boolean().default(false),
      description: z.string().min(10, '工作描述至少10个字符').max(500, '工作描述最多500个字符'),
      achievements: z.array(z.string().max(100, '成就描述最多100个字符')).optional(),
    })).optional(),
  }).refine((data) => {
    if (data.hasWorkExperience && (!data.experiences || data.experiences.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: '请至少添加一条工作经历',
    path: ['experiences'],
  }),

  // 附加信息
  additionalInfo: z.object({
    skills: z.array(z.string().min(1, '技能不能为空')).min(1, '至少添加一项技能'),
    languages: z.array(z.object({
      name: z.string().min(1, '语言名称不能为空'),
      proficiency: z.enum(['basic', 'intermediate', 'advanced', 'native']),
    })).min(1, '至少添加一项语言能力'),
    hobbies: z.array(z.string()).optional(),
    selfIntroduction: z.string().min(20, '自我介绍至少20个字符').max(1000, '自我介绍最多1000个字符'),
    references: z.array(z.object({
      name: z.string().min(1, '推荐人姓名不能为空'),
      relationship: z.string().min(1, '关系不能为空'),
      phone: chinesePhoneValidator,
      email: z.string().email('邮箱格式不正确'),
    })).optional(),
  }),

  // 文件上传
  documents: z.object({
    resume: createFileValidator(['pdf', 'doc', 'docx'], 5),
    transcript: createFileValidator(['pdf', 'jpg', 'png'], 3).optional(),
    idCardFront: createFileValidator(['jpg', 'jpeg', 'png'], 1),
    idCardBack: createFileValidator(['jpg', 'jpeg', 'png'], 1),
    additionalFiles: z.array(createFileValidator(['pdf', 'jpg', 'png'], 2)).max(5, '最多上传5个附加文件').optional(),
  }),

  // 同意条款
  agreements: z.object({
    termsAccepted: z.boolean().refine(val => val === true, {
      message: '请同意服务条款',
    }),
    privacyAccepted: z.boolean().refine(val => val === true, {
      message: '请同意隐私政策',
    }),
    marketingAccepted: z.boolean().default(false),
  }),
});

export type EnterpriseFormType = z.infer<typeof enterpriseFormSchema>;
```

### 9.2 完整表单组件

```typescript
// pages/EnterpriseForm.tsx
import React, { useState, useCallback } from 'react';
import { Form, Button, Steps, Card, message, Spin } from 'antd';
import { Wizard, WizardConfig } from '../components/wizard/Wizard';
import { useFormState } from '../hooks/useFormState';
import { enterpriseFormSchema, EnterpriseFormType } from '../schemas/enterpriseForm';
import { FormTransformer, commonFormTransformConfig } from '../utils/dataTransform';
import { FormErrorHandler } from '../utils/errorHandler';

// 导入步骤组件
import { BasicInfoStep } from '../components/steps/BasicInfoStep';
import { AddressInfoStep } from '../components/steps/AddressInfoStep';
import { EducationStep } from '../components/steps/EducationStep';
import { WorkExperienceStep } from '../components/steps/WorkExperienceStep';
import { AdditionalInfoStep } from '../components/steps/AdditionalInfoStep';
import { DocumentsStep } from '../components/steps/DocumentsStep';
import { AgreementsStep } from '../components/steps/AgreementsStep';

export default function EnterpriseFormPage() {
  const [formData, setFormData] = useState<Partial<EnterpriseFormType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: EnterpriseFormType) => {
    setIsSubmitting(true);

    try {
      const transformer = new FormTransformer(commonFormTransformConfig);
      const transformedData = transformer.transformForSubmit(data);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('提交的数据:', transformedData);
      message.success('表单提交成功！');

      // 这里可以跳转到成功页面
    } catch (error) {
      const errors = FormErrorHandler.handleFormError(error);
      console.error('提交错误:', errors);
      message.error('提交失败，请检查表单信息');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const wizardConfig: WizardConfig = {
    steps: [
      {
        id: 'basic-info',
        title: '基本信息',
        description: '填写个人基本信息',
        component: BasicInfoStep,
        validation: enterpriseFormSchema.shape.basicInfo,
      },
      {
        id: 'address-info',
        title: '地址信息',
        description: '填写居住和邮寄地址',
        component: AddressInfoStep,
        validation: enterpriseFormSchema.shape.addressInfo,
      },
      {
        id: 'education',
        title: '教育经历',
        description: '填写教育背景和证书',
        component: EducationStep,
        validation: enterpriseFormSchema.shape.education,
      },
      {
        id: 'work-experience',
        title: '工作经历',
        description: '填写相关工作经历',
        component: WorkExperienceStep,
        validation: enterpriseFormSchema.shape.workExperience,
        isOptional: true,
      },
      {
        id: 'additional-info',
        title: '附加信息',
        description: '技能、语言和自我介绍',
        component: AdditionalInfoStep,
        validation: enterpriseFormSchema.shape.additionalInfo,
      },
      {
        id: 'documents',
        title: '文件上传',
        description: '上传所需文档',
        component: DocumentsStep,
        validation: enterpriseFormSchema.shape.documents,
      },
      {
        id: 'agreements',
        title: '同意条款',
        description: '阅读并同意相关条款',
        component: AgreementsStep,
        validation: enterpriseFormSchema.shape.agreements,
      },
    ],
    onFinish: handleSubmit,
    showProgress: true,
    allowSkipOptional: true,
  };

  return (
    <div className="enterprise-form-page" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card title="企业级表单示例" style={{ marginBottom: 24 }}>
        <p>
          这是一个完整的企业级表单示例，展示了React Hook Form + Zod的最佳实践，
          包括复杂验证、动态字段、多步骤向导、错误处理等功能。
        </p>
      </Card>

      {isSubmitting && (
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>正在提交表单，请稍候...</div>
        </Card>
      )}

      <Wizard
        config={wizardConfig}
        formData={formData}
        onFormDataChange={setFormData}
      />
    </div>
  );
}

// components/steps/BasicInfoStep.tsx
import React from 'react';
import { Form, Row, Col, Radio, DatePicker, Input } from 'antd';
import { FormInput } from '../form/FormInput';
import { ControlledFormItem } from '../form/FormItem';
import { WizardStepActions } from '../wizard/WizardStepActions';

interface BasicInfoStepProps {
  data: any;
  onSubmit: (data: any) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  isSubmitting?: boolean;
  isValid?: boolean;
}

export function BasicInfoStep({
  data,
  onSubmit,
  isFirstStep,
  isLastStep,
  canGoNext,
  canGoPrev,
  isSubmitting,
  isValid = true,
}: BasicInfoStepProps) {
  return (
    <Form
      layout="vertical"
      onFinish={onSubmit}
      initialValues={data}
    >
      <Row gutter={16}>
        <Col span={12}>
          <FormInput
            name="basicInfo.username"
            label="用户名"
            required
            placeholder="请输入用户名"
          />
        </Col>
        <Col span={12}>
          <FormInput
            name="basicInfo.email"
            label="邮箱"
            required
            placeholder="请输入邮箱"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <FormInput
            name="basicInfo.password"
            label="密码"
            type="password"
            required
            placeholder="请输入密码"
          />
        </Col>
        <Col span={12}>
          <FormInput
            name="basicInfo.confirmPassword"
            label="确认密码"
            type="password"
            required
            placeholder="请再次输入密码"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <FormInput
            name="basicInfo.fullName"
            label="姓名"
            required
            placeholder="请输入真实姓名"
          />
        </Col>
        <Col span={12}>
          <ControlledFormItem
            name="basicInfo.gender"
            label="性别"
            required
          >
            {(field) => (
              <Radio.Group {...field}>
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
                <Radio value="other">其他</Radio>
              </Radio.Group>
            )}
          </ControlledFormItem>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <ControlledFormItem
            name="basicInfo.birthDate"
            label="出生日期"
            required
          >
            {(field) => (
              <DatePicker style={{ width: '100%' }} {...field} />
            )}
          </ControlledFormItem>
        </Col>
        <Col span={12}>
          <FormInput
            name="basicInfo.idNumber"
            label="身份证号"
            required
            placeholder="请输入18位身份证号"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <FormInput
            name="basicInfo.phone"
            label="手机号"
            required
            placeholder="请输入手机号"
          />
        </Col>
      </Row>

      <WizardStepActions
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        isSubmitting={isSubmitting}
        isValid={isValid}
      />
    </Form>
  );
}

// 其他步骤组件的实现类似...
```

## 总结

这个最佳实践指南涵盖了React Hook Form + Zod在企业级复杂表单开发中的各个方面：

### 核心优势

1. **类型安全**: 使用Zod提供完整的类型推断和验证
2. **性能优化**: 通过智能渲染和状态管理减少不必要的重渲染
3. **可维护性**: 模块化设计，易于扩展和维护
4. **用户体验**: 流畅的交互和友好的错误提示
5. **可访问性**: 支持屏幕阅读器和键盘导航
6. **国际化**: 内置多语言支持

### 关键特性

- **动态表单**: 支持根据条件动态显示/隐藏字段
- **嵌套结构**: 处理复杂的嵌套对象和数组
- **自定义验证**: 灵活的验证规则和错误处理
- **多步骤向导**: 分步骤填写复杂表单
- **文件上传**: 支持多种文件类型和大小验证
- **数据转换**: 自动格式化和转换表单数据

### 使用建议

1. **Schema优先**: 先定义完整的Zod schema，再构建UI
2. **组件化**: 将复杂表单拆分为可复用的组件
3. **渐进增强**: 从简单功能开始，逐步添加高级特性
4. **错误处理**: 实现完善的错误处理和用户反馈机制
5. **性能监控**: 在开发环境中监控渲染性能

这个指南为企业级React表单开发提供了完整的解决方案，可以根据具体项目需求进行调整和扩展。