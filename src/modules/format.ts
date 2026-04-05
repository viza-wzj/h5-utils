/**
 * 格式化工具
 */

import { safeCall } from '../utils';

/**
 * 日期格式化
 * @example formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
 */
export function formatDate(date: Date | number | string, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  return safeCall(
    () => {
      const d = new Date(date);
      const map: Record<string, string> = {
        YYYY: String(d.getFullYear()),
        MM: String(d.getMonth() + 1).padStart(2, '0'),
        DD: String(d.getDate()).padStart(2, '0'),
        HH: String(d.getHours()).padStart(2, '0'),
        mm: String(d.getMinutes()).padStart(2, '0'),
        ss: String(d.getSeconds()).padStart(2, '0'),
      };
      let result = fmt;
      for (const [key, val] of Object.entries(map)) {
        result = result.replace(key, val);
      }
      return result;
    },
    '',
    'formatDate',
  );
}

/**
 * 数字格式化（千分位等）
 */
export function formatNumber(
  num: number,
  options: { precision?: number; separator?: string } = {},
): string {
  return safeCall(
    () => {
      const { precision, separator = ',' } = options;
      let str = precision !== undefined ? num.toFixed(precision) : String(num);
      const [intPart, decPart] = str.split('.');
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
    },
    String(num),
    'formatNumber',
  );
}

/**
 * 手机号格式化 (xxx xxxx xxxx)
 */
export function formatPhone(phone: string): string {
  return safeCall(
    () =>
      phone.replace(/(\d{3})(\d{0,4})(\d{0,4})/, (_, a, b, c) => {
        let result = a;
        if (b) result += ` ${b}`;
        if (c) result += ` ${c}`;
        return result;
      }),
    phone,
    'formatPhone',
  );
}

/**
 * 金额格式化
 */
export function formatMoney(amount: number, precision = 2): string {
  return safeCall(() => formatNumber(amount, { precision }), String(amount), 'formatMoney');
}

/**
 * 节流
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let last = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      try {
        fn.apply(this, args);
      } catch (e: any) {
        console.error('[h5-utils] throttle error:', e?.message || e);
      }
    }
  } as T;
}

/**
 * 防抖
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        fn.apply(this, args);
      } catch (e: any) {
        console.error('[h5-utils] debounce error:', e?.message || e);
      }
    }, delay);
  } as T;
}
