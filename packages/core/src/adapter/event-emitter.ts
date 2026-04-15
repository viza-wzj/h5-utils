import type { EventEmitterAdapter } from './types';

type Handler = (...args: any[]) => void;

function createMemoryEventEmitter(): EventEmitterAdapter {
  const listeners = new Map<string, Set<Handler>>();

  return {
    on(event: string, handler: Handler): void {
      const handlers = listeners.get(event) ?? new Set<Handler>();
      handlers.add(handler);
      listeners.set(event, handlers);
    },
    off(event: string, handler: Handler): void {
      const handlers = listeners.get(event);
      if (!handlers) return;
      handlers.delete(handler);
      if (handlers.size === 0) {
        listeners.delete(event);
      }
    },
    emit(event: string, ...args: any[]): void {
      const handlers = listeners.get(event);
      if (!handlers) return;
      handlers.forEach((handler) => handler(...args));
    },
  };
}

export function createEventEmitterAdapter(): EventEmitterAdapter {
  if (typeof EventTarget === 'undefined') {
    return createMemoryEventEmitter();
  }

  const target = new EventTarget();
  const wrappedHandlers = new WeakMap<Handler, EventListener>();

  return {
    on(event: string, handler: Handler): void {
      let wrapped = wrappedHandlers.get(handler);
      if (!wrapped) {
        wrapped = ((customEvent: Event) => {
          const detail = (customEvent as CustomEvent).detail;
          if (Array.isArray(detail)) {
            handler(...detail);
            return;
          }
          if (detail !== undefined) {
            handler(detail);
            return;
          }
          handler();
        }) as EventListener;
        wrappedHandlers.set(handler, wrapped);
      }
      target.addEventListener(event, wrapped);
    },
    off(event: string, handler: Handler): void {
      const wrapped = wrappedHandlers.get(handler);
      if (!wrapped) return;
      target.removeEventListener(event, wrapped);
    },
    emit(event: string, ...args: any[]): void {
      target.dispatchEvent(new CustomEvent(event, { detail: args }));
    },
  };
}
