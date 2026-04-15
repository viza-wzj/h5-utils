/**
 * 滚动相关工具
 */

import { getAdapter } from '../adapter';
import { safeCall } from '../utils';

let scrollLockCount = 0;

/**
 * 滚动到页面顶部
 */
export function scrollToTop(smooth = true): void {
  safeCall(
    () => getAdapter().scroll.scrollTo({ top: 0, animated: smooth }),
    undefined,
    'scrollToTop',
  );
}

/**
 * 滚动到指定元素（H5 专用）
 */
export function scrollToElement(
  el: Element,
  options: { offset?: number; smooth?: boolean } = {},
): void {
  safeCall(
    () => {
      if (typeof window === 'undefined' || typeof el.getBoundingClientRect !== 'function') {
        throw new Error('scrollToElement is only available in browser DOM environments');
      }
      const { offset = 0, smooth = true } = options;
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top + offset;
      getAdapter().scroll.scrollTo({ top, animated: smooth });
    },
    undefined,
    'scrollToElement',
  );
}

/**
 * 锁定页面滚动
 */
export function lockScroll(): void {
  safeCall(
    () => {
      scrollLockCount++;
      if (scrollLockCount === 1) {
        getAdapter().scroll.lockScroll();
      }
    },
    undefined,
    'lockScroll',
  );
}

/**
 * 解锁页面滚动
 */
export function unlockScroll(): void {
  safeCall(
    () => {
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) {
        getAdapter().scroll.unlockScroll();
      }
    },
    undefined,
    'unlockScroll',
  );
}
