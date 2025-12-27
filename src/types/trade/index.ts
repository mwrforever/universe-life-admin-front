/**
 * Universe Life Admin - 交易订单类型定义
 *
 * 企业级交易订单管理系统类型定义
 * 支持完整的订单生命周期管理
 *
 * @author James
 * @version 1.0.0
 */

// 订单状态枚举
export enum OrderStatus {
  CREATED = 'created',           // 已创建
  PENDING_PAYMENT = 'pending_payment', // 待支付
  PAID = 'paid',                 // 已支付
  PROCESSING = 'processing',     // 处理中
  SHIPPED = 'shipped',           // 已发货
  DELIVERED = 'delivered',       // 已送达
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded',         // 已退款
  DISPUTED = 'disputed',         // 争议中
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',             // 支付宝
  WECHAT = 'wechat',             // 微信支付
  BANK_CARD = 'bank_card',       // 银行卡
  BALANCE = 'balance',           // 余额支付
  CREDIT = 'credit',             // 信用支付
  CRYPTOCURRENCY = 'crypto',     // 数字货币
}

// 物流状态枚举
export enum LogisticsStatus {
  PENDING = 'pending',           // 待发货
  SHIPPED = 'shipped',           // 已发货
  IN_TRANSIT = 'in_transit',     // 运输中
  OUT_FOR_DELIVERY = 'out_for_delivery', // 派送中
  DELIVERED = 'delivered',       // 已送达
  FAILED = 'failed',             // 投递失败
  RETURNED = 'returned',         // 已退回
}

// 订单类型枚举
export enum OrderType {
  PURCHASE = 'purchase',         // 购买订单
  SUBSCRIPTION = 'subscription', // 订阅订单
  SERVICE = 'service',           // 服务订单
  VIRTUAL = 'virtual',           // 虚拟商品
  PHYSICAL = 'physical',         // 实物商品
}

// 收货地址接口
export interface Address {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  postalCode: string;
  detailedAddress: string;
  isDefault: boolean;
}

// 订单商品接口
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  category: string;
  brand?: string;
  specifications?: Record<string, unknown>;
  discount?: number;
  tax?: number;
}

// 物流信息接口
export interface LogisticsInfo {
  id: string;
  trackingNumber: string;
  carrier: string;
  carrierCode: string;
  status: LogisticsStatus;
  shippedAt: string;
  estimatedDeliveryAt: string;
  deliveredAt?: string;
  trackingUrl?: string;
  shippingAddress: Address;
  notes?: string;
  timeline: Array<{
    time: string;
    status: string;
    description: string;
    location?: string;
  }>;
}

// 支付信息接口
export interface PaymentInfo {
  id: string;
  paymentId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  paidAt?: string;
  refundInfo?: {
    refundId: string;
    amount: number;
    reason: string;
    processedAt: string;
  };
  transactionFee?: number;
  gatewayResponse?: Record<string, unknown>;
}

// 订单操作日志
export interface OrderLog {
  id: string;
  orderId: string;
  action: string;
  description: string;
  operator: string;
  operatorType: 'system' | 'admin' | 'customer' | 'merchant';
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// 主订单接口
export interface Order {
  // 基础信息
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;

  // 用户信息
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAvatar?: string;

  // 金额信息
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;

  // 商品信息
  items: OrderItem[];
  itemCount: number;

  // 时间信息
  createdAt: string;
  updatedAt: string;
  expiredAt?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  // 支付信息
  paymentInfo?: PaymentInfo;

  // 物流信息
  logisticsInfo?: LogisticsInfo;

  // 地址信息
  billingAddress?: Address;
  shippingAddress?: Address;

  // 评价信息
  rating?: number;
  review?: string;
  reviewedAt?: string;

  // 退款信息
  refundAmount?: number;
  refundReason?: string;
  refundRequestedAt?: string;

  // 备注信息
  buyerNotes?: string;
  sellerNotes?: string;
  internalNotes?: string;

  // 标签
  tags?: string[];

  // 风控标记
  riskLevel: 'low' | 'medium' | 'high';
  fraudScore: number;
  isSuspicious: boolean;

  // 来源信息
  source: 'web' | 'mobile' | 'app' | 'api' | 'third_party';
  sourceChannel?: string;

  // 优惠信息
  couponCode?: string;
  promotionDiscount?: number;
  loyaltyPointsUsed?: number;
}

// 订单查询参数接口
export interface OrderQueryParams {
  current?: number;
  pageSize?: number;

  // 基础筛选
  keyword?: string; // 订单号、买家信息
  status?: OrderStatus | OrderStatus[];
  type?: OrderType | OrderType[];
  paymentMethod?: PaymentMethod | PaymentMethod[];

  // 时间筛选
  createdAtStart?: string;
  createdAtEnd?: string;
  paidAtStart?: string;
  paidAtEnd?: string;

  // 金额筛选
  minAmount?: number;
  maxAmount?: number;

  // 买家筛选
  buyerId?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  // 商品筛选
  productId?: string;
  productName?: string;

  // 物流筛选
  logisticsStatus?: LogisticsStatus | LogisticsStatus[];
  trackingNumber?: string;

  // 风险筛选
  riskLevel?: ('low' | 'medium' | 'high')[];
  isSuspicious?: boolean;

  // 排序
  sortField?: string;
  sortOrder?: 'asc' | 'desc';

  // 标签筛选
  tags?: string[];
}

// 订单列表响应接口
export interface OrderListResponse {
  data: Order[];
  success: boolean;
  total: number;
  current: number;
  pageSize: number;
}

// 订单统计信息接口
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByType: Record<OrderType, number>;
  paymentMethodsDistribution: Record<PaymentMethod, number>;
  recentTrend: Array<{
    date: string;
    orderCount: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    orderCount: number;
    revenue: number;
  }>;
}

// 批量操作参数接口
export interface BatchOrderOperationParams {
  orderIds: string[];
  action: 'confirm_payment' | 'ship' | 'cancel' | 'refund' | 'mark_suspicious' | 'add_tags' | 'export';
  params?: {
    reason?: string;
    trackingNumber?: string;
    carrier?: string;
    refundAmount?: number;
    refundReason?: string;
    tags?: string[];
    exportFormat?: 'excel' | 'csv' | 'pdf';
  };
}

// 订单表单数据接口（用于创建/编辑）
export interface OrderFormData {
  buyerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    customPrice?: number;
  }>;
  shippingAddress: Address;
  billingAddress?: Address;
  couponCode?: string;
  notes?: string;
  tags?: string[];
}

// 订单导出配置接口
export interface OrderExportParams {
  format: 'excel' | 'csv' | 'json' | 'pdf';
  fields: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Partial<OrderQueryParams>;
  includeDetails?: boolean;
  includePaymentInfo?: boolean;
  includeLogisticsInfo?: boolean;
}