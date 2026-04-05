import type { PlatformAdapter } from './types';

/**
 * Taro 适配器
 *
 * 使用方式：
 * ```ts
 * import Taro from '@tarojs/taro';
 * import { setAdapter } from 'h5-utils';
 * import { createTaroAdapter } from 'h5-utils/adapter/taro';
 *
 * setAdapter(createTaroAdapter(Taro));
 * ```
 */

export interface TaroInstance {
  getStorageSync(key: string): any;
  setStorageSync(key: string, value: any): void;
  removeStorageSync(key: string): void;
  clearStorageSync(): void;
  setClipboardData(options: { data: string }): Promise<{ data: string }>;
  getClipboardData(): Promise<{ data: string }>;
  eventCenter: {
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    trigger(event: string, ...args: any[]): void;
  };
  createSelectorQuery(): {
    select(selector: string): { node: () => any };
    selectAll(selector: string): { nodes: () => any[] };
    exec(): any[];
  };
  pageScrollTo(options: { scrollTop?: number; duration?: number }): Promise<void>;
  getSystemInfoSync(): {
    platform: string;
    system: string;
    brand: string;
    model: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    fontSizeSetting: number;
  };
  getNetworkType(): Promise<{ networkType: string }>;
  nextTick(callback: (...args: any[]) => any): void;
  navigateTo(options: { url: string }): Promise<void>;
  redirectTo(options: { url: string }): Promise<void>;
  switchTab(options: { url: string }): Promise<void>;
  reLaunch(options: { url: string }): Promise<void>;
  navigateBack(options: { delta?: number }): Promise<void>;
}

let _scrollLocked = false;

/**
 * 创建 Taro 适配器
 * @param taro Taro 实例，由用户传入以避免硬依赖
 */
/** 将 params 拼接到小程序 url 上（如 /pages/index?foo=bar） */
function buildMiniProgramUrl(url: string, params?: Record<string, any>): string {
  if (!params || !Object.keys(params).length) return url;
  const search = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  if (!search) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${search}`;
}

export function createTaroAdapter(taro: TaroInstance): PlatformAdapter {
  return {
    storage: {
      get(key: string): string | null {
        const value = taro.getStorageSync(key);
        return value !== '' && value !== undefined && value !== null ? String(value) : null;
      },
      set(key: string, value: string): void {
        taro.setStorageSync(key, value);
      },
      remove(key: string): void {
        taro.removeStorageSync(key);
      },
      clear(): void {
        taro.clearStorageSync();
      },
    },

    clipboard: {
      async write(text: string): Promise<void> {
        await taro.setClipboardData({ data: text });
      },
      async read(): Promise<string> {
        const res = await taro.getClipboardData();
        return res.data;
      },
    },

    event: {
      on(event: string, handler: (...args: any[]) => void): void {
        taro.eventCenter.on(event, handler);
      },
      off(event: string, handler: (...args: any[]) => void): void {
        taro.eventCenter.off(event, handler);
      },
      emit(event: string, ...args: any[]): void {
        taro.eventCenter.trigger(event, ...args);
      },
    },

    dom: {
      select(selector: string): Element | null {
        const query = taro.createSelectorQuery();
        const result = query.select(selector).node();
        query.exec();
        return result || null;
      },
      selectAll(selector: string): Element[] {
        const query = taro.createSelectorQuery();
        const result = query.selectAll(selector).nodes();
        query.exec();
        return Array.isArray(result) ? result : [];
      },
    },

    scroll: {
      scrollTo(options: { top?: number; left?: number; animated?: boolean }): void {
        taro.pageScrollTo({
          scrollTop: options.top ?? 0,
          duration: options.animated !== false ? 300 : 0,
        });
      },
      getScrollPosition(): { scrollTop: number; scrollLeft: number } {
        // Taro 需要通过 onPageScroll 事件获取，此处返回默认值
        // 实际项目中建议通过 Taro.usePageScroll hook 获取
        return { scrollTop: 0, scrollLeft: 0 };
      },
      lockScroll(): void {
        if (!_scrollLocked) {
          _scrollLocked = true;
          // 小程序中通过 CSS overflow 控制
        }
      },
      unlockScroll(): void {
        if (_scrollLocked) {
          _scrollLocked = false;
        }
      },
    },

    device: {
      getInfo() {
        const info = taro.getSystemInfoSync();
        const system = info.system || '';
        const isIOS = /ios/i.test(system) || /iPhone|iPad|iPod/i.test(info.model || '');
        const isAndroid = /android/i.test(system);
        return {
          ios: isIOS,
          android: isAndroid,
          mobile: isIOS || isAndroid,
          weChat: true,
          os: system.split(' ')[0] || info.platform || 'Unknown',
          brand: info.brand || '',
          model: info.model || '',
          screenWidth: info.screenWidth,
          screenHeight: info.screenHeight,
          pixelRatio: info.pixelRatio,
        };
      },
      async getNetworkType(): Promise<string> {
        const res = await taro.getNetworkType();
        return res.networkType;
      },
    },

    navigation: {
      async navigateTo(url, options) {
        await taro.navigateTo({ url: buildMiniProgramUrl(url, options?.params) });
      },
      async redirectTo(url, options) {
        await taro.redirectTo({ url: buildMiniProgramUrl(url, options?.params) });
      },
      async switchTab(url) {
        await taro.switchTab({ url });
      },
      async reLaunch(url) {
        await taro.reLaunch({ url });
      },
      async navigateBack(delta = 1) {
        await taro.navigateBack({ delta });
      },
    },
  };
}
