/**
 * 事件工具
 */

import { getAdapter } from '../adapter';
import { safeCall } from '../utils';

export type EventHandler = (...args: any[]) => void;

/**
 * 订阅跨端自定义事件
 */
export function onEvent(event: string, handler: EventHandler): void {
  safeCall(() => getAdapter().event.on(event, handler), undefined, 'onEvent');
}

/**
 * 取消订阅跨端自定义事件
 */
export function offEvent(event: string, handler: EventHandler): void {
  safeCall(() => getAdapter().event.off(event, handler), undefined, 'offEvent');
}

/**
 * 仅订阅一次跨端自定义事件
 */
export function onceEvent(event: string, handler: EventHandler): void {
  safeCall(
    () => {
      const wrapped: EventHandler = (...args) => {
        getAdapter().event.off(event, wrapped);
        handler(...args);
      };
      getAdapter().event.on(event, wrapped);
    },
    undefined,
    'onceEvent',
  );
}

/**
 * 触发跨端自定义事件
 */
export function emitEvent(event: string, ...args: any[]): void {
  safeCall(() => getAdapter().event.emit(event, ...args), undefined, 'emitEvent');
}

/**
 * 绑定 DOM 事件（H5 专用）
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
 * 解绑 DOM 事件（H5 专用）
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
 * 单次监听 DOM 事件（H5 专用）
 */
export function once(el: EventTarget, event: string, handler: EventListener): void {
  safeCall(() => el.addEventListener(event, handler, { once: true }), undefined, 'once');
}

/**
 * DOM 事件委托（H5 专用）
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
