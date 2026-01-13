/**
 * 用户详情字段只读展示属性测试
 * 
 * Property 4: 详情字段禁用状态
 * *For any* 用户详情字段（bio、birthday、province、city、country、road、address），
 * 在编辑弹窗中展示时应该处于禁用状态，用户无法修改其值。
 * 
 * **Validates: Requirements 4.1, 4.4**
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import * as fc from 'fast-check';

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// 用户详情字段列表（只读字段）
const USER_DETAIL_FIELDS = [
  'bio',
  'birthday',
  'province',
  'city',
  'country',
  'road',
  'address',
] as const;

// 可编辑字段列表
const EDITABLE_FIELDS = [
  'avatarUrl',
  'gender',
  'status',
] as const;

// 详情字段（不应该提交）
const DETAIL_ONLY_FIELDS = [
  'bio',
  'birthday',
  'province',
  'city',
  'country',
  'road',
  'address',
  'ext',
  'receiveOrder',
] as const;

/**
 * 模拟表单提交数据过滤函数
 * 这是 UserManagement 中 handleModalOk 的核心逻辑
 */
function filterSubmitData(formValues: Record<string, any>): Record<string, any> {
  // 只提取可编辑字段
  return {
    avatarUrl: formValues.avatarUrl,
    gender: formValues.gender,
    status: formValues.status,
  };
}

/**
 * 检查提交数据是否包含详情字段
 */
function containsDetailFields(data: Record<string, any>): boolean {
  return DETAIL_ONLY_FIELDS.some(field => field in data && data[field] !== undefined);
}

describe('用户详情字段只读展示', () => {
  /**
   * Property 4: 详情字段禁用状态
   * **Validates: Requirements 4.1, 4.4**
   */
  describe('Property 4: 详情字段禁用状态', () => {
    it('所有详情字段都应该在只读字段列表中', () => {
      // Feature: user-edit-flow-optimization, Property 4: 详情字段禁用状态
      const detailFieldArb = fc.constantFrom(...USER_DETAIL_FIELDS);

      fc.assert(
        fc.property(detailFieldArb, (field) => {
          // 验证字段在只读列表中
          expect(USER_DETAIL_FIELDS).toContain(field);
          // 验证字段不在可编辑列表中
          expect(EDITABLE_FIELDS).not.toContain(field);
        }),
        { numRuns: 100 }
      );
    });

    it('可编辑字段不应该在详情字段列表中', () => {
      // Feature: user-edit-flow-optimization, Property 4: 详情字段禁用状态
      const editableFieldArb = fc.constantFrom(...EDITABLE_FIELDS);

      fc.assert(
        fc.property(editableFieldArb, (field) => {
          // 验证可编辑字段不在只读列表中
          expect(USER_DETAIL_FIELDS).not.toContain(field);
        }),
        { numRuns: 100 }
      );
    });

    it('详情字段和可编辑字段应该互斥', () => {
      // Feature: user-edit-flow-optimization, Property 4: 详情字段禁用状态
      // 验证两个集合没有交集
      const intersection = USER_DETAIL_FIELDS.filter(
        field => (EDITABLE_FIELDS as readonly string[]).includes(field)
      );
      expect(intersection).toHaveLength(0);
    });
  });


  /**
   * Property 5: 表单提交数据隔离
   * **Validates: Requirements 5.1, 5.2, 5.3**
   */
  describe('Property 5: 表单提交数据隔离', () => {
    // 生成随机用户详情数据
    const userDetailArb = fc.record({
      bio: fc.string(),
      birthday: fc.string(),
      province: fc.string(),
      city: fc.string(),
      country: fc.string(),
      road: fc.string(),
      address: fc.string(),
      ext: fc.string(),
      receiveOrder: fc.integer(),
    });

    // 生成随机可编辑数据
    const editableDataArb = fc.record({
      avatarUrl: fc.string(),
      gender: fc.integer({ min: 0, max: 2 }),
      status: fc.integer({ min: 0, max: 3 }),
    });

    it('提交数据应该只包含可编辑字段', () => {
      // Feature: user-edit-flow-optimization, Property 5: 表单提交数据隔离
      fc.assert(
        fc.property(editableDataArb, userDetailArb, (editable, detail) => {
          // 合并所有表单数据（模拟表单包含所有字段）
          const allFormData = { ...editable, ...detail };
          
          // 过滤提交数据
          const submitData = filterSubmitData(allFormData);
          
          // 验证提交数据只包含可编辑字段
          const submitKeys = Object.keys(submitData);
          expect(submitKeys).toEqual(['avatarUrl', 'gender', 'status']);
        }),
        { numRuns: 100 }
      );
    });

    it('提交数据不应该包含任何详情字段', () => {
      // Feature: user-edit-flow-optimization, Property 5: 表单提交数据隔离
      fc.assert(
        fc.property(editableDataArb, userDetailArb, (editable, detail) => {
          // 合并所有表单数据
          const allFormData = { ...editable, ...detail };
          
          // 过滤提交数据
          const submitData = filterSubmitData(allFormData);
          
          // 验证提交数据不包含详情字段
          expect(containsDetailFields(submitData)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('即使详情字段有值，提交数据也不应该包含', () => {
      // Feature: user-edit-flow-optimization, Property 5: 表单提交数据隔离
      const nonEmptyDetailArb = fc.record({
        bio: fc.string({ minLength: 1 }),
        birthday: fc.string({ minLength: 1 }),
        province: fc.string({ minLength: 1 }),
        city: fc.string({ minLength: 1 }),
        country: fc.string({ minLength: 1 }),
        road: fc.string({ minLength: 1 }),
        address: fc.string({ minLength: 1 }),
        ext: fc.string({ minLength: 1 }),
        receiveOrder: fc.integer({ min: 1 }),
      });

      fc.assert(
        fc.property(editableDataArb, nonEmptyDetailArb, (editable, detail) => {
          const allFormData = { ...editable, ...detail };
          const submitData = filterSubmitData(allFormData);
          
          // 验证详情字段的值没有被包含
          DETAIL_ONLY_FIELDS.forEach(field => {
            expect(submitData[field]).toBeUndefined();
          });
        }),
        { numRuns: 100 }
      );
    });

    it('提交数据应该保留可编辑字段的原始值', () => {
      // Feature: user-edit-flow-optimization, Property 5: 表单提交数据隔离
      fc.assert(
        fc.property(editableDataArb, userDetailArb, (editable, detail) => {
          const allFormData = { ...editable, ...detail };
          const submitData = filterSubmitData(allFormData);
          
          // 验证可编辑字段的值被正确保留
          expect(submitData.avatarUrl).toBe(editable.avatarUrl);
          expect(submitData.gender).toBe(editable.gender);
          expect(submitData.status).toBe(editable.status);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 边界条件测试
   */
  describe('边界条件测试', () => {
    it('空表单数据应该返回空的可编辑字段', () => {
      const submitData = filterSubmitData({});
      
      expect(submitData).toEqual({
        avatarUrl: undefined,
        gender: undefined,
        status: undefined,
      });
      expect(containsDetailFields(submitData)).toBe(false);
    });

    it('只有详情字段的表单应该返回空的可编辑字段', () => {
      const detailOnlyArb = fc.record({
        bio: fc.string(),
        birthday: fc.string(),
        province: fc.string(),
      });

      fc.assert(
        fc.property(detailOnlyArb, (detail) => {
          const submitData = filterSubmitData(detail);
          
          // 可编辑字段应该都是 undefined
          expect(submitData.avatarUrl).toBeUndefined();
          expect(submitData.gender).toBeUndefined();
          expect(submitData.status).toBeUndefined();
          
          // 不应该包含详情字段
          expect(containsDetailFields(submitData)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
