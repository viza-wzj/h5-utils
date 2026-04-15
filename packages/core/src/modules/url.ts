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
      const base =
        typeof window !== 'undefined' && window.location?.href
          ? window.location.href
          : 'http://localhost';
      const parsed = new URL(url, base);
      const query: Record<string, string> = {};
      if (parsed.search) {
        parsed.search
          .slice(1)
          .split('&')
          .forEach((pair) => {
            const [key, val] = pair.split('=');
            if (key) query[decodeURIComponent(key)] = decodeURIComponent(val || '');
          });
      }
      return {
        protocol: parsed.protocol,
        host: parsed.host,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
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
 * 从任意 URL 中获取指定查询参数
 */
export function getQueryParamFromUrl(url: string, name: string): string | null {
  return safeCall(
    () => new URL(url, 'http://localhost').searchParams.get(name),
    null,
    'getQueryParamFromUrl',
  );
}

/**
 * 从任意 URL 中获取全部查询参数
 */
export function getAllQueryParamsFromUrl(url: string): Record<string, string> {
  return safeCall(
    () => {
      const params: Record<string, string> = {};
      new URL(url, 'http://localhost').searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    },
    {},
    'getAllQueryParamsFromUrl',
  );
}

/**
 * 获取当前页面指定查询参数（H5 专用）
 */
export function getQueryParam(name: string): string | null {
  return safeCall(
    () => getQueryParamFromUrl(window.location.href, name),
    null,
    'getQueryParam',
  );
}

/**
 * 获取当前页面所有查询参数（H5 专用）
 */
export function getAllQueryParams(): Record<string, string> {
  return safeCall(() => getAllQueryParamsFromUrl(window.location.href), {}, 'getAllQueryParams');
}
