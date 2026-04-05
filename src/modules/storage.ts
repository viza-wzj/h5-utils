/**
 * Storage 封装
 * 支持过期时间、JSON 自动序列化
 * 通过适配器支持跨端
 */

import { getAdapter } from '../adapter';
import type { StorageSetOptions } from '../adapter/types';
import { safeCall } from '../utils';

export type { StorageSetOptions };

interface StorageItem {
  value: unknown;
  expireAt: number | null;
}

/**
 * 获取存储值，支持 JSON 自动反序列化
 */
export function get<T = unknown>(key: string): T | null {
  return safeCall(
    () => {
      const raw = getAdapter().storage.get(key);
      if (raw === null) return null;
      try {
        const item: StorageItem = JSON.parse(raw);
        if (item.expireAt !== null && Date.now() > item.expireAt) {
          getAdapter().storage.remove(key);
          return null;
        }
        return item.value as T;
      } catch {
        return raw as unknown as T;
      }
    },
    null,
    'getStorage',
  );
}

/**
 * 设置存储值，支持过期时间
 */
export function set(key: string, value: unknown, options?: StorageSetOptions): void {
  safeCall(
    () => {
      const item: StorageItem = {
        value,
        expireAt: options?.expires ? Date.now() + options.expires : null,
      };
      getAdapter().storage.set(key, JSON.stringify(item), options);
    },
    undefined,
    'setStorage',
  );
}

/**
 * 删除存储值
 */
export function remove(key: string): void {
  safeCall(() => getAdapter().storage.remove(key), undefined, 'removeStorage');
}

/**
 * 清空所有存储
 */
export function clear(): void {
  safeCall(() => getAdapter().storage.clear(), undefined, 'clearStorage');
}
