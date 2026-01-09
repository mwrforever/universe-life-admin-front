/**
 * Universe Life Admin - 交易订单Mock数据
 *
 * 企业级交易订单模拟数据生成器
 * 包含完整的订单生命周期和业务场景
 *
 * @author James
 * @version 1.0.0
 */

import {
  type Order,
  type OrderListResponse,
  OrderStatus,
  PaymentMethod,
  LogisticsStatus,
  OrderType,
  type Address,
  type OrderItem,
  type LogisticsInfo,
  type PaymentInfo,
  type OrderQueryParams
} from '../types/trade/index';

// 中文姓名库
const chineseSurnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '胡', '朱', '郭', '何', '高', '林', '罗'];
const chineseNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];

// 商品名称库
const productNames = [
  'Universe Life 会员套餐 - 月度版',
  'Universe Life 会员套餐 - 年度版',
  'Universe Cloud 存储空间 100GB',
  'Universe Cloud 存储空间 1TB',
  'Universe AI 助手服务包',
  'Universe Security 安全防护',
  'Universe Development 开发工具包',
  'Universe Analytics 数据分析服务',
  'Universe Communication 通讯套餐',
  'Universe Enterprise 企业版',
  'Universe Mobile 移动端授权',
  'Universe API 接口调用包',
  'Universe Backup 自动备份服务',
  'Universe CDN 内容分发网络',
  'Universe Database 数据库服务'
];

// 省市区域数据
const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '山东省', '河南省', '四川省', '湖北省', '湖南省'];
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '济南', '郑州', '成都', '武汉', '长沙', '重庆', '天津', '西安', '苏州'];
const districts = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '福田区', '西湖区', '滨江区', '建邺区', '鼓楼区'];

// 物流公司
const carriers = [
  { name: '顺丰速运', code: 'SF' },
  { name: '京东物流', code: 'JD' },
  { name: '中通快递', code: 'ZTO' },
  { name: '圆通速递', code: 'YTO' },
  { name: '韵达速递', code: 'YD' },
  { name: '申通快递', code: 'STO' },
  { name: '德邦快递', code: 'DP' },
  { name: '邮政EMS', code: 'EMS' }
];

// 生成随机ID的辅助函数
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// 生成订单号
const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                  (date.getMonth() + 1).toString().padStart(2, '0') +
                  date.getDate().toString().padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${dateStr}${randomStr}`;
};

// 生成随机日期
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// 生成中文姓名
const generateChineseName = (): string => {
  const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
  const givenName = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  return surname + givenName;
};

// 生成手机号
const generatePhoneNumber = (): string => {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.random().toString().substring(2, 10);
  return prefix + suffix;
};

// 生成邮箱
const generateEmail = (name: string): string => {
  const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', '126.com', 'sina.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = name.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000);
  return `${username}@${domain}`;
};

// 生成收货地址
const generateAddress = (): Address => {
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];

  return {
    id: generateId(),
    receiverName: generateChineseName(),
    receiverPhone: generatePhoneNumber(),
    province,
    city,
    district,
    street: `${Math.floor(Math.random() * 999)}号`,
    postalCode: Math.floor(Math.random() * 900000 + 100000).toString(),
    detailedAddress: `${province}${city}${district}${Math.floor(Math.random() * 999)}号${Math.floor(Math.random() * 50)}室`,
    isDefault: Math.random() > 0.7
  };
};

// 生成订单商品
const generateOrderItem = (index: number): OrderItem => {
  const productName = productNames[Math.floor(Math.random() * productNames.length)];
  const unitPrice = Math.floor(Math.random() * 9000 + 100);
  const quantity = Math.floor(Math.random() * 5 + 1);

  return {
    id: generateId(),
    productId: `PROD_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    productName,
    productImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    sku: `SKU_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    unitPrice,
    quantity,
    totalPrice: unitPrice * quantity,
    category: ['数字服务', '云存储', '会员服务', '安全防护'][Math.floor(Math.random() * 4)],
    brand: 'Universe Life',
    specifications: {
      version: ['基础版', '专业版', '企业版'][Math.floor(Math.random() * 3)],
      duration: ['1个月', '3个月', '1年', '永久'][Math.floor(Math.random() * 4)]
    },
    discount: Math.random() > 0.8 ? Math.floor(unitPrice * 0.1) : undefined,
    tax: unitPrice * quantity * 0.06
  };
};

// 生成物流信息
const generateLogisticsInfo = (): LogisticsInfo | undefined => {
  if (Math.random() > 0.3) return undefined; // 30%的订单没有物流信息（虚拟商品）

  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  const shippedAt = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  const status: LogisticsStatus[] = [LogisticsStatus.PENDING, LogisticsStatus.SHIPPED, LogisticsStatus.IN_TRANSIT, LogisticsStatus.OUT_FOR_DELIVERY, LogisticsStatus.DELIVERED];
  const currentStatus = status[Math.floor(Math.random() * status.length)];

  return {
    id: generateId(),
    trackingNumber: `${carrier.code}${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    carrier: carrier.name,
    carrierCode: carrier.code,
    status: currentStatus,
    shippedAt,
    estimatedDeliveryAt: new Date(new Date(shippedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: currentStatus === LogisticsStatus.DELIVERED ? randomDate(new Date(shippedAt), new Date()) : undefined,
    trackingUrl: `https://www.17track.com/en/track?nums=${carrier.code}${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    shippingAddress: generateAddress(),
    notes: Math.random() > 0.8 ? '小心轻放，易碎物品' : undefined,
    timeline: [
      {
        time: shippedAt,
        status: '已揽收',
        description: '快递员已取件',
        location: carrier.name
      },
      ...(currentStatus !== LogisticsStatus.PENDING ? [{
        time: randomDate(new Date(shippedAt), new Date()),
        status: '运输中',
        description: '包裹正在运输途中',
        location: '转运中心'
      }] : []),
      ...(currentStatus === LogisticsStatus.DELIVERED ? [{
        time: new Date(new Date(shippedAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: '已签收',
        description: '包裹已成功送达',
        location: '目的地'
      }] : [])
    ]
  };
};

// 生成支付信息
const generatePaymentInfo = (totalAmount: number): PaymentInfo | undefined => {
  if (Math.random() > 0.8) return undefined; // 20%的订单未支付

  const methods: PaymentMethod[] = [PaymentMethod.ALIPAY, PaymentMethod.WECHAT, PaymentMethod.BANK_CARD, PaymentMethod.BALANCE];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const paidAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

  return {
    id: generateId(),
    paymentId: `PAY_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    method,
    amount: totalAmount,
    currency: 'CNY',
    status: 'success',
    paidAt,
    transactionFee: totalAmount * 0.006, // 0.6%手续费
    gatewayResponse: {
      transaction_id: Math.random().toString(36).substring(2, 20),
      status: 'success',
      created_at: paidAt
    },
    ...(Math.random() > 0.95 ? { // 5%的订单有退款
      refundInfo: {
        refundId: `REF_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        amount: totalAmount * (Math.random() * 0.5 + 0.1),
        reason: ['用户申请退款', '商品质量问题', '服务不满意'][Math.floor(Math.random() * 3)],
        processedAt: randomDate(new Date(paidAt), new Date())
      }
    } : {})
  };
};

// 生成Mock订单数据
const generateMockOrder = (index: number): Order => {
  const itemCount = Math.floor(Math.random() * 3 + 1);
  const items = Array.from({ length: itemCount }, (_, i) => generateOrderItem(index + i));
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingFee = Math.random() > 0.5 ? Math.floor(Math.random() * 50 + 10) : 0;
  const tax = subtotal * 0.06;
  const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 100 + 20) : 0;
  const totalAmount = subtotal + shippingFee + tax - discount;

  const createdAt = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  const status: OrderStatus[] = [
    OrderStatus.CREATED, OrderStatus.PENDING_PAYMENT, OrderStatus.PAID,
    OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED,
    OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED
  ];

  const randomStatus = status[Math.floor(Math.random() * status.length)];
  const paymentInfo = generatePaymentInfo(totalAmount);
  const logisticsInfo = generateLogisticsInfo();

  return {
    id: generateId(),
    orderNumber: generateOrderNumber(),
    type: Object.values(OrderType)[Math.floor(Math.random() * Object.values(OrderType).length)],
    status: randomStatus,

    // 买家信息
    buyerId: `BUYER_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    buyerName: generateChineseName(),
    buyerEmail: generateEmail(`user${index}`),
    buyerPhone: generatePhoneNumber(),
    buyerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=buyer${index}`,

    // 金额信息
    subtotal,
    shippingFee,
    tax,
    discount,
    totalAmount,
    currency: 'CNY',

    // 商品信息
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),

    // 时间信息
    createdAt,
    updatedAt: new Date().toISOString(),
    expiredAt: randomStatus === OrderStatus.PENDING_PAYMENT ? new Date(new Date(createdAt).getTime() + 30 * 60 * 1000).toISOString() : undefined,
    paidAt: paymentInfo?.paidAt,
    shippedAt: logisticsInfo?.shippedAt,
    completedAt: randomStatus === OrderStatus.COMPLETED ? randomDate(new Date(createdAt), new Date()) : undefined,
    cancelledAt: randomStatus === OrderStatus.CANCELLED ? randomDate(new Date(createdAt), new Date()) : undefined,

    // 支付信息
    paymentInfo,

    // 物流信息
    logisticsInfo,

    // 地址信息
    shippingAddress: logisticsInfo?.shippingAddress || generateAddress(),
    billingAddress: Math.random() > 0.5 ? generateAddress() : undefined,

    // 评价信息
    rating: randomStatus === OrderStatus.COMPLETED && Math.random() > 0.3 ? Math.floor(Math.random() * 3 + 3) : undefined,
    review: randomStatus === OrderStatus.COMPLETED && Math.random() > 0.5 ? ['服务很好', '商品不错', '物流很快', '性价比高'][Math.floor(Math.random() * 4)] : undefined,
    reviewedAt: randomStatus === OrderStatus.COMPLETED && Math.random() > 0.4 ? randomDate(new Date(createdAt), new Date()) : undefined,

    // 退款信息
    refundAmount: paymentInfo?.refundInfo?.amount,
    refundReason: paymentInfo?.refundInfo?.reason,
    refundRequestedAt: paymentInfo?.refundInfo?.processedAt,

    // 备注信息
    buyerNotes: Math.random() > 0.8 ? ['请尽快发货', '需要发票', '小心包装'][Math.floor(Math.random() * 3)] : undefined,
    sellerNotes: Math.random() > 0.9 ? ['优质客户', 'VIP用户'][Math.floor(Math.random() * 2)] : undefined,
    internalNotes: Math.random() > 0.95 ? '重点关注的订单' : undefined,

    // 标签
    tags: Math.random() > 0.7 ? [['新客户', 'VIP', '急单', '大额订单'][Math.floor(Math.random() * 4)]] : undefined,

    // 风控标记
    riskLevel: Math.random() > 0.9 ? 'high' : (Math.random() > 0.7 ? 'medium' : 'low'),
    fraudScore: Math.random() * 100,
    isSuspicious: Math.random() > 0.95,

    // 来源信息
    source: ['web', 'mobile', 'app', 'api'][Math.floor(Math.random() * 4)] as any,
    sourceChannel: Math.random() > 0.5 ? ['搜索引擎', '社交媒体', '直接访问', '广告'][Math.floor(Math.random() * 4)] : undefined,

    // 优惠信息
    couponCode: Math.random() > 0.7 ? `SAVE${Math.floor(Math.random() * 50 + 10)}` : undefined,
    promotionDiscount: discount,
    loyaltyPointsUsed: Math.random() > 0.8 ? Math.floor(Math.random() * 1000 + 100) : undefined,
  };
};

// 生成Mock订单列表
export const generateMockOrders = (count: number): Order[] => {
  return Array.from({ length: count }, (_, index) => generateMockOrder(index));
};

// 预生成200个Mock订单
export const mockOrders = generateMockOrders(200);

// 模拟API调用 - 获取订单列表
export const mockGetOrderList = async (
  params: OrderQueryParams
): Promise<OrderListResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  let filteredOrders = [...mockOrders];

  // 关键词搜索（订单号、买家信息）
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredOrders = filteredOrders.filter(order =>
      order.orderNumber.toLowerCase().includes(keyword) ||
      order.buyerName.toLowerCase().includes(keyword) ||
      order.buyerEmail.toLowerCase().includes(keyword) ||
      order.buyerPhone.includes(keyword)
    );
  }

  // 状态筛选
  if (params.status) {
    if (Array.isArray(params.status)) {
      filteredOrders = filteredOrders.filter(order => params.status!.includes(order.status));
    } else {
      filteredOrders = filteredOrders.filter(order => order.status === params.status);
    }
  }

  // 订单类型筛选
  if (params.type) {
    if (Array.isArray(params.type)) {
      filteredOrders = filteredOrders.filter(order => params.type!.includes(order.type));
    } else {
      filteredOrders = filteredOrders.filter(order => order.type === params.type);
    }
  }

  // 支付方式筛选
  if (params.paymentMethod) {
    if (Array.isArray(params.paymentMethod)) {
      filteredOrders = filteredOrders.filter(order =>
        order.paymentInfo && params.paymentMethod!.includes(order.paymentInfo.method)
      );
    } else {
      filteredOrders = filteredOrders.filter(order =>
        order.paymentInfo && order.paymentInfo.method === params.paymentMethod
      );
    }
  }

  // 时间筛选
  if (params.createdAtStart) {
    filteredOrders = filteredOrders.filter(order =>
      new Date(order.createdAt) >= new Date(params.createdAtStart!)
    );
  }
  if (params.createdAtEnd) {
    filteredOrders = filteredOrders.filter(order =>
      new Date(order.createdAt) <= new Date(params.createdAtEnd!)
    );
  }

  // 金额筛选
  if (params.minAmount) {
    filteredOrders = filteredOrders.filter(order => order.totalAmount >= params.minAmount!);
  }
  if (params.maxAmount) {
    filteredOrders = filteredOrders.filter(order => order.totalAmount <= params.maxAmount!);
  }

  // 买家筛选
  if (params.buyerId) {
    filteredOrders = filteredOrders.filter(order => order.buyerId === params.buyerId);
  }
  if (params.buyerEmail) {
    filteredOrders = filteredOrders.filter(order =>
      order.buyerEmail.toLowerCase().includes(params.buyerEmail!.toLowerCase())
    );
  }
  if (params.buyerPhone) {
    filteredOrders = filteredOrders.filter(order => order.buyerPhone.includes(params.buyerPhone!));
  }

  // 风险等级筛选
  if (params.riskLevel) {
    filteredOrders = filteredOrders.filter(order => params.riskLevel!.includes(order.riskLevel));
  }

  if (params.isSuspicious !== undefined) {
    filteredOrders = filteredOrders.filter(order => order.isSuspicious === params.isSuspicious);
  }

  // 排序
  filteredOrders.sort((a, b) => {
    if (params.sortField) {
      switch (params.sortField) {
        case 'createdAt':
          return params.sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'totalAmount':
          return params.sortOrder === 'asc'
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        case 'orderNumber':
          return params.sortOrder === 'asc'
            ? a.orderNumber.localeCompare(b.orderNumber)
            : b.orderNumber.localeCompare(a.orderNumber);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 分页
  const current = params.current || 1;
  const pageSize = params.pageSize || 20;
  const total = filteredOrders.length;
  const startIndex = (current - 1) * pageSize;
  const data = filteredOrders.slice(startIndex, startIndex + pageSize);

  return {
    data,
    success: true,
    total,
    current,
    pageSize,
  };
};

// 导出订单统计信息
export const getOrderStatistics = () => {
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalRevenue / totalOrders;

  const ordersByStatus = mockOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const ordersByType = mockOrders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + 1;
    return acc;
  }, {} as Record<OrderType, number>);

  const paymentMethodsDistribution = mockOrders.reduce((acc, order) => {
    if (order.paymentInfo) {
      acc[order.paymentInfo.method] = (acc[order.paymentInfo.method] || 0) + 1;
    }
    return acc;
  }, {} as Record<PaymentMethod, number>);

  // 生成最近30天的趋势数据
  const recentTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];

    const dayOrders = mockOrders.filter(order =>
      order.createdAt.split('T')[0] === dateStr
    );

    return {
      date: dateStr,
      orderCount: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
  });

  // 热门商品统计
  const productSales = mockOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (acc[item.productName]) {
        acc[item.productName].quantity += item.quantity;
        acc[item.productName].revenue += item.totalPrice;
      } else {
        acc[item.productName] = {
          productName: item.productName,
          quantity: item.quantity,
          revenue: item.totalPrice
        };
      }
    });
    return acc;
  }, {} as Record<string, { productName: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // 地理分布统计
  const geoDistribution = mockOrders.reduce((acc, order) => {
    const province = order.shippingAddress?.province || '未知';
    if (acc[province]) {
      acc[province].orderCount++;
      acc[province].revenue += order.totalAmount;
    } else {
      acc[province] = {
        region: province,
        orderCount: 1,
        revenue: order.totalAmount
      };
    }
    return acc;
  }, {} as Record<string, { region: string; orderCount: number; revenue: number }>);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByStatus,
    ordersByType,
    paymentMethodsDistribution,
    recentTrend,
    topProducts,
    geographicDistribution: Object.values(geoDistribution)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10)
  };
};