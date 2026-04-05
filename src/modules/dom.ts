/**
 * DOM 操作工具
 */

import { getAdapter } from '../adapter';
import { safeCall } from '../utils';

/**
 * 查询单个元素
 */
export function $<T extends Element = Element>(selector: string): T | null {
  return safeCall(() => getAdapter().dom.select(selector) as T | null, null, '$');
}

/**
 * 查询多个元素
 */
export function $$<T extends Element = Element>(selector: string): T[] {
  return safeCall(() => getAdapter().dom.selectAll(selector) as T[], [], '$$');
}

/**
 * 添加 class
 */
export function addClass(el: Element, cls: string): void {
  safeCall(() => el.classList.add(cls), undefined, 'addClass');
}

/**
 * 移除 class
 */
export function removeClass(el: Element, cls: string): void {
  safeCall(() => el.classList.remove(cls), undefined, 'removeClass');
}

/**
 * 切换 class
 */
export function toggleClass(el: Element, cls: string): void {
  safeCall(() => el.classList.toggle(cls), undefined, 'toggleClass');
}

/**
 * 判断是否包含 class
 */
export function hasClass(el: Element, cls: string): boolean {
  return safeCall(() => el.classList.contains(cls), false, 'hasClass');
}

/**
 * 获取元素样式
 */
export function getStyle(el: Element, prop: string): string {
  return safeCall(
    () =>
      (el as HTMLElement).style.getPropertyValue(prop) ||
      getComputedStyle(el).getPropertyValue(prop),
    '',
    'getStyle',
  );
}

/**
 * 判断元素是否在可视区域内
 */
export function isInViewport(el: Element): boolean {
  return safeCall(
    () => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    false,
    'isInViewport',
  );
}
