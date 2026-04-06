/**
 * 事件工具
 */

import { safeCall } from '../utils';

/**
 * 绑定事件
 */
export function on(
  el: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
): void {
  safeCall(() => el.addEventListener(event, handler, options), undefined, 'on');
}

/**
 * 解绑事件
 */
export function off(
  el: EventTarget,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions,
): void {
  safeCall(() => el.removeEventListener(event, handler, options), undefined, 'off');
}

/**
 * 单次监听事件
 */
export function once(el: EventTarget, event: string, handler: EventListener): void {
  safeCall(() => el.addEventListener(event, handler, { once: true }), undefined, 'once');
}

/**
 * 事件委托
 * @param parent 父容器
 * @param selector 子元素选择器
 * @param event 事件名
 * @param handler 回调函数
 */
export function delegate(
  parent: EventTarget,
  selector: string,
  event: string,
  handler: (el: Element, e: Event) => void,
): void {
  safeCall(
    () => {
      const wrappedHandler = (e: Event) => {
        const target = (e.target as Element)?.closest(selector);
        if (target) {
          handler(target, e);
        }
      };
      (parent as EventTarget).addEventListener(event, wrappedHandler as EventListener);
    },
    undefined,
    'delegate',
  );
}
