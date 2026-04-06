/**
 * 校验器工具
 */

import { safeCall } from '../utils';

const patterns = {
  mobile: /^1[3-9]\d{9}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  idCard: /^\d{17}[\dXx]$/,
  url: /^https?:\/\/.+/,
  chinese: /^[\u4e00-\u9fa5]+$/,
};

/**
 * 手机号格式校验
 */
export function isMobilePhone(str: string): boolean {
  return safeCall(() => patterns.mobile.test(str), false, 'isMobilePhone');
}

/**
 * 邮箱校验
 */
export function isEmail(str: string): boolean {
  return safeCall(() => patterns.email.test(str), false, 'isEmail');
}

/**
 * 身份证号校验（18位）
 */
export function isIdCard(str: string): boolean {
  return safeCall(
    () => {
      if (!patterns.idCard.test(str)) return false;
      const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        sum += parseInt(str[i], 10) * weights[i];
      }
      return checkCodes[sum % 11] === str[17].toUpperCase();
    },
    false,
    'isIdCard',
  );
}

/**
 * URL 校验
 */
export function isUrl(str: string): boolean {
  return safeCall(() => patterns.url.test(str), false, 'isUrl');
}

/**
 * 中文校验
 */
export function isChinese(str: string): boolean {
  return safeCall(() => patterns.chinese.test(str), false, 'isChinese');
}
