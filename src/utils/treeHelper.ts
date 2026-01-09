/**
 * Universe Life Admin - 树形数据转换工具
 *
 * 提供通用的树形结构数据转换函数
 *
 * @author James
 * @version 1.0.0
 */

import type { TreeNode } from '../types/common';

/**
 * 将部门树形数据转换为 Ant Design Tree 组件所需格式
 * @param nodes - 部门树形节点数组
 * @returns 转换后的树形数据
 */
export const convertDepartmentTreeData = (nodes: Array<{
  id: string;
  departmentName: string;
  children?: Array<{
    id: string;
    departmentName: string;
    children?: any[];
  }>;
}>): TreeNode[] => {
  return nodes.map((node) => ({
    title: node.departmentName,
    key: node.id,
    value: node.id,
    children: node.children ? convertDepartmentTreeData(node.children) : undefined,
  }));
};

/**
 * 将资源树形数据转换为 Ant Design Tree 组件所需格式
 * @param nodes - 资源树形节点数组
 * @returns 转换后的树形数据
 */
export const convertResourceTreeData = (nodes: Array<{
  id: string;
  resourceName: string;
  children?: Array<{
    id: string;
    resourceName: string;
    children?: any[];
  }>;
}>): TreeNode[] => {
  return nodes.map((node) => ({
    title: node.resourceName,
    key: node.id,
    value: node.id,
    children: node.children ? convertResourceTreeData(node.children) : undefined,
  }));
};
