/**
 * URL 解析与操作工具
 */

import { safeCall } from '../utils';

export interface ParsedUrl {
  protocol: string;
  host: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  query: Record<string, string>;
}

/**
 * 解析 URL 为结构化对象
 */
export function parseUrl(url: string): ParsedUrl {
  return safeCall(
    () => {
      const a = document.createElement('a');
      a.href = url;
      const query: Record<string, string> = {};
      if (a.search) {
        a.search
          .slice(1)
          .split('&')
          .forEach((pair) => {
            const [key, val] = pair.split('=');
            if (key) query[decodeURIComponent(key)] = decodeURIComponent(val || '');
          });
      }
      return {
        protocol: a.protocol,
        host: a.host,
        port: a.port,
        pathname: a.pathname,
        search: a.search,
        hash: a.hash,
        query,
      };
    },
    { protocol: '', host: '', port: '', pathname: '', search: '', hash: '', query: {} },
    'parseUrl',
  );
}

/**
 * 拼接带查询参数的 URL
 */
export function buildUrl(base: string, params: Record<string, string | number | boolean>): string {
  return safeCall(
    () => {
      const search = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (!search) return base;
      const separator = base.includes('?') ? '&' : '?';
      return `${base}${separator}${search}`;
    },
    base,
    'buildUrl',
  );
}

/**
 * 获取当前页面指定查询参数
 */
export function getQueryParam(name: string): string | null {
  return safeCall(
    () => new URLSearchParams(window.location.search).get(name),
    null,
    'getQueryParam',
  );
}

/**
 * 获取当前页面所有查询参数
 */
export function getAllQueryParams(): Record<string, string> {
  return safeCall(
    () => {
      const params: Record<string, string> = {};
      new URLSearchParams(window.location.search).forEach((value, key) => {
        params[key] = value;
      });
      return params;
    },
    {},
    'getAllQueryParams',
  );
}
