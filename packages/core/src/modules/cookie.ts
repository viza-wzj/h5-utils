/**
 * Cookie 读写删工具
 */

import { safeCall } from '../utils';

export interface CookieOptions {
  /** 过期天数 */
  days?: number;
  /** 域名 */
  domain?: string;
  /** 路径 */
  path?: string;
  /** 仅 HTTPS */
  secure?: boolean;
  /** SameSite 策略 */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * 获取 Cookie 值
 */
export function get(name: string): string | null {
  return safeCall(
    () => {
      const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`),
      );
      return match ? decodeURIComponent(match[1]) : null;
    },
    null,
    'getCookie',
  );
}

/**
 * 设置 Cookie
 */
export function set(name: string, value: string, options: CookieOptions = {}): void {
  safeCall(
    () => {
      const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
      if (options.days) {
        const expires = new Date(Date.now() + options.days * 864e5).toUTCString();
        parts.push(`expires=${expires}`);
      }
      if (options.path) parts.push(`path=${options.path}`);
      if (options.domain) parts.push(`domain=${options.domain}`);
      if (options.secure) parts.push('secure');
      if (options.sameSite) parts.push(`samesite=${options.sameSite}`);
      document.cookie = parts.join('; ');
    },
    undefined,
    'setCookie',
  );
}

/**
 * 删除 Cookie
 */
export function remove(name: string, options: CookieOptions = {}): void {
  set(name, '', { ...options, days: -1 });
}
