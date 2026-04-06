/**
 * 剪贴板操作
 */

import { getAdapter } from '../adapter';
import { safeCallAsync } from '../utils';

/**
 * 复制文本到剪贴板
 */
export function copyText(text: string): Promise<void> {
  return safeCallAsync(() => getAdapter().clipboard.write(text), undefined, 'copyText');
}

/**
 * 读取剪贴板文本
 */
export function readText(): Promise<string> {
  return safeCallAsync(() => getAdapter().clipboard.read(), '', 'readText');
}
