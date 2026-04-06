/**
 * 内部错误处理工具
 */

const PREFIX = '[h5-utils]';

/**
 * 安全执行函数，出错时打印错误并返回默认值
 */
export function safeCall<T>(fn: () => T, fallback: T, method: string): T {
  try {
    return fn();
  } catch (e: any) {
    console.error(`${PREFIX} ${method} error:`, e?.message || e);
    return fallback;
  }
}

/**
 * 安全执行异步函数
 */
export async function safeCallAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  method: string,
): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    console.error(`${PREFIX} ${method} error:`, e?.message || e);
    return fallback;
  }
}

/**
 * 拼接 URL 查询参数
 */
export function appendUrlParams(url: string, params?: Record<string, any>): string {
  if (!params || !Object.keys(params).length) return url;
  const search = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  if (!search) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${search}`;
}
