/**
 * 登录页面动画配置
 */

import { keyframes } from '@emotion/react';

// 淡入动画
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// 滑入动画（从下方）
export const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 滑入动画（从上方）
export const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 滑入动画（从左侧）
export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 滑入动画（从右侧）
export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 缩放动画
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 弹性动画
export const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// 抖动动画（错误提示）
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

// 脉冲动画
export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// 旋转动画
export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 闪烁动画
export const blink = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
`;

// 波纹动画
export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// 加载动画
export const loading = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// 成功动画
export const success = keyframes`
  0% {
    transform: scale(0) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(45deg);
  }
`;

// 动画配置对象
export const ANIMATIONS = {
  // 入场动画
  entrance: {
    fadeIn: {
      name: fadeIn,
      duration: '0.3s ease-in-out',
    },
    slideUp: {
      name: slideUp,
      duration: '0.4s ease-out',
    },
    slideDown: {
      name: slideDown,
      duration: '0.4s ease-out',
    },
    slideInLeft: {
      name: slideInLeft,
      duration: '0.4s ease-out',
    },
    slideInRight: {
      name: slideInRight,
      duration: '0.4s ease-out',
    },
    scaleIn: {
      name: scaleIn,
      duration: '0.3s ease-out',
    },
    bounceIn: {
      name: bounceIn,
      duration: '0.6s ease-out',
    },
  },
  // 交互动画
  interaction: {
    shake: {
      name: shake,
      duration: '0.3s ease-in-out',
    },
    pulse: {
      name: pulse,
      duration: '2s ease-in-out infinite',
    },
    rotate: {
      name: rotate,
      duration: '1s linear infinite',
    },
    blink: {
      name: blink,
      duration: '1s ease-in-out infinite',
    },
  },
  // 状态动画
  status: {
    loading: {
      name: loading,
      duration: '1s linear infinite',
    },
    success: {
      name: success,
      duration: '0.4s ease-out',
    },
    ripple: {
      name: ripple,
      duration: '0.6s ease-out',
    },
  },
} as const;

// 动画工具函数
export const getAnimation = (
  type: keyof typeof ANIMATIONS,
  name: string
) => {
  const animation = ANIMATIONS[type]?.[name as keyof typeof ANIMATIONS[typeof type]];
  if (!animation) {
    console.warn(`Animation not found: ${type}.${name}`);
    return null;
  }

  return `${animation.name} ${animation.duration}`;
};

// 延迟动画生成器
export const createDelayedAnimation = (
  animation: ReturnType<typeof getAnimation>,
  delay: number
) => {
  if (!animation) return '';
  return `${animation} ${delay}s`;
};

// 序列动画生成器
export const createSequentialAnimations = (
  animations: Array<{
    animation: ReturnType<typeof getAnimation>;
    delay: number;
  }>
) => {
  return animations.map(({ animation, delay }) =>
    createDelayedAnimation(animation, delay)
  ).join(', ');
};

// 响应式动画配置
export const getResponsiveAnimation = (
  desktopAnimation: string,
  tabletAnimation?: string,
  mobileAnimation?: string
) => {
  return {
    desktop: desktopAnimation,
    tablet: tabletAnimation || desktopAnimation,
    mobile: mobileAnimation || tabletAnimation || desktopAnimation,
  };
};

// 动画hook辅助函数
export const createAnimationHook = (
  animationName: string,
  options: {
    duration?: number;
    delay?: number;
    easing?: string;
  } = {}
) => {
  const { duration = 300, delay = 0, easing = 'ease' } = options;

  return {
    animation: `${animationName} ${duration}ms ${easing} ${delay}ms`,
    animationFillMode: 'both' as const,
  };
};

// 预定义的动画样式
export const ANIMATION_STYLES = {
  // 卡片入场动画
  cardEntry: {
    animation: `${slideUp} 0.6s ease-out`,
    animationFillMode: 'both' as const,
  },

  // Tab切换动画
  tabSwitch: {
    animation: `${fadeIn} 0.3s ease-in-out`,
    animationFillMode: 'both' as const,
  },

  // 表单错误抖动
  errorShake: {
    animation: `${shake} 0.3s ease-in-out`,
  },

  // 按钮悬停效果
  buttonHover: {
    transition: 'all 0.2s ease',
  },

  // 输入框聚焦效果
  inputFocus: {
    transition: 'all 0.15s ease',
  },

  // 加载动画
  loadingSpinner: {
    animation: `${loading} 1s linear infinite`,
  },

  // 成功勾选动画
  successCheck: {
    animation: `${success} 0.4s ease-out`,
  },

  // 波纹效果
  rippleEffect: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.5)',
      transform: 'translate(-50%, -50%)',
      animation: `${ripple} 0.6s ease-out`,
    },
  },
} as const;

// 动画性能优化
export const optimizeAnimation = (
  element: HTMLElement,
  animationType: string
) => {
  // 添加will-change属性优化动画性能
  switch (animationType) {
    case 'transform':
      element.style.willChange = 'transform';
      break;
    case 'opacity':
      element.style.willChange = 'opacity';
      break;
    case 'transform-opacity':
      element.style.willChange = 'transform, opacity';
      break;
    default:
      break;
  }

  // 动画结束后清理will-change
  const handleAnimationEnd = () => {
    element.style.willChange = 'auto';
    element.removeEventListener('animationend', handleAnimationEnd);
  };

  element.addEventListener('animationend', handleAnimationEnd);
};