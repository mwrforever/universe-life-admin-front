/**
 * 密码生成工具
 */

/**
 * 生成随机密码
 * @param length 密码长度，默认6位
 * @param options 配置选项
 * @returns 随机密码字符串
 */
export interface GeneratePasswordOptions {
  includeNumbers?: boolean;      // 包含数字
  includeLowercase?: boolean;     // 包含小写字母
  includeUppercase?: boolean;     // 包含大写字母
  includeSymbols?: boolean;       // 包含特殊字符
}

export const generateRandomPassword = (
  length: number = 6,
  options: GeneratePasswordOptions = {}
): string => {
  const {
    includeNumbers = true,
    includeLowercase = true,
    includeUppercase = false,
    includeSymbols = false,
  } = options;

  let chars = '';
  if (includeNumbers) chars += '0123456789';
  if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // 如果没有选择任何字符类型，默认使用数字和小写字母
  if (!chars) {
    chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  }

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
};

/**
 * 生成默认的6位随机密码（数字+小写字母）
 * @returns 6位随机密码
 */
export const generateDefaultPassword = (): string => {
  return generateRandomPassword(6, {
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: false,
    includeSymbols: false,
  });
};
