import type { PlatformAdapter } from './types';
import { browserAdapter } from './browser';
import { createTaroAdapter } from './taro';

export type {
  PlatformAdapter,
  StorageAdapter,
  StorageSetOptions,
  ClipboardAdapter,
  EventEmitterAdapter,
  DomAdapter,
  ScrollAdapter,
  DeviceAdapter,
  DeviceInfo,
  NavigationAdapter,
  CanvasAdapter,
  GradientConfig,
  ShadowConfig,
} from './types';

let currentAdapter: PlatformAdapter | null = null;

/** 获取当前小程序平台的原生 API 对象 */
function getNativeAPI(): any {
  if (typeof wx !== 'undefined') return wx;
  if (typeof my !== 'undefined') return my;
  if (typeof tt !== 'undefined') return tt;
  if (typeof swan !== 'undefined') return swan;
  if (typeof qq !== 'undefined') return qq;
  return null;
}

/** 是否为小程序环境 */
function isMiniProgram(): boolean {
  return getNativeAPI() !== null;
}

/** 获取 Taro 实例（兼容 CJS / ESM） */
function getTaroInstance(): any {
  // 1. 尝试 CJS require
  try {
    return require('@tarojs/taro');
  } catch {}
  // 2. 尝试从全局获取（Taro 运行时可能挂载）
  const g =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};
  if (g.Taro) return g.Taro;
  return null;
}

/** 拼接小程序页面 URL 参数 */
function buildNativeUrl(url: string, params?: Record<string, any>): string {
  if (!params || !Object.keys(params).length) return url;
  const search = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  if (!search) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${search}`;
}

/** 用原生小程序 API 创建适配器 */
function createNativeAdapter(native: any): PlatformAdapter {
  let _scrollLocked = false;
  return {
    storage: {
      get(key: string): string | null {
        const val = native.getStorageSync(key);
        return val !== '' && val !== undefined && val !== null ? String(val) : null;
      },
      set(key: string, value: string): void {
        native.setStorageSync(key, value);
      },
      remove(key: string): void {
        native.removeStorageSync(key);
      },
      clear(): void {
        native.clearStorageSync();
      },
    },
    clipboard: {
      async write(text: string): Promise<void> {
        await native.setClipboardData({ data: text });
      },
      async read(): Promise<string> {
        const res = await native.getClipboardData();
        return res.data;
      },
    },
    event: {
      on(): void {},
      off(): void {},
      emit(): void {},
    },
    dom: {
      select(): null {
        return null;
      },
      selectAll(): [] {
        return [];
      },
    },
    scroll: {
      scrollTo(options: { top?: number; left?: number; animated?: boolean }): void {
        native.pageScrollTo({
          scrollTop: options.top ?? 0,
          duration: options.animated !== false ? 300 : 0,
        });
      },
      getScrollPosition(): { scrollTop: number; scrollLeft: number } {
        return { scrollTop: 0, scrollLeft: 0 };
      },
      lockScroll(): void {
        if (!_scrollLocked) _scrollLocked = true;
      },
      unlockScroll(): void {
        _scrollLocked = false;
      },
    },
    device: {
      getInfo() {
        const info = native.getSystemInfoSync();
        const system = info.system || '';
        return {
          ios: /ios/i.test(system),
          android: /android/i.test(system),
          mobile: true,
          weChat: typeof wx !== 'undefined',
          os: system.split(' ')[0] || info.platform || 'Unknown',
          brand: info.brand || '',
          model: info.model || '',
          screenWidth: info.screenWidth,
          screenHeight: info.screenHeight,
          pixelRatio: info.pixelRatio,
        };
      },
      async getNetworkType(): Promise<string> {
        if (native.getNetworkType) {
          const res = await new Promise<any>((resolve) => {
            native.getNetworkType({
              success: resolve,
              fail: () => resolve({ networkType: 'unknown' }),
            });
          });
          return res.networkType || 'unknown';
        }
        return 'unknown';
      },
    },
    navigation: {
      async navigateTo(url, options) {
        await native.navigateTo({ url: buildNativeUrl(url, options?.params) });
      },
      async redirectTo(url, options) {
        await native.redirectTo({ url: buildNativeUrl(url, options?.params) });
      },
      async switchTab(url) {
        await native.switchTab({ url });
      },
      async reLaunch(url) {
        await native.reLaunch({ url });
      },
      async navigateBack(delta = 1) {
        await native.navigateBack({ delta });
      },
    },
    canvas: {
      createContext(width: number, height: number) {
        const canvasId = `h5-utils-poster-${Date.now()}`;
        const ctx = native.createCanvasContext(canvasId);
        return { canvas: { canvasId, width, height }, ctx, canvasId };
      },
      async toImage(canvas: any, options?: { quality?: number }) {
        const res = await new Promise<{ tempFilePath: string }>((resolve, reject) => {
          native.canvasToTempFilePath({
            canvasId: canvas.canvasId,
            canvas,
            quality: options?.quality,
            success: resolve,
            fail: reject,
          });
        });
        return res.tempFilePath;
      },
      async loadImage(src: string) {
        const res = await new Promise<{ path: string; width: number; height: number }>(
          (resolve, reject) => {
            native.getImageInfo({ src, success: resolve, fail: reject });
          },
        );
        return res;
      },
    },
  };
}

/**
 * 自动检测运行环境并创建对应适配器
 */
function detectAdapter(): PlatformAdapter {
  // 1. 小程序环境
  if (isMiniProgram()) {
    // 优先使用 Taro（如果可用）
    const taro = getTaroInstance();
    if (taro) {
      try {
        return createTaroAdapter(taro);
      } catch {}
    }
    // 回退到原生小程序 API
    const native = getNativeAPI();
    if (native) {
      return createNativeAdapter(native);
    }
  }

  // 2. 检测 Taro 运行时标记
  const g =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};
  if ((g as any).__TARO || (g as any).__taro__) {
    const taro = getTaroInstance();
    if (taro) {
      try {
        return createTaroAdapter(taro);
      } catch {}
    }
  }

  // 3. process.env.TARO_ENV 补充（Taro H5 模式）
  if (typeof process !== 'undefined' && (process as any).env && (process as any).env.TARO_ENV) {
    const taro = getTaroInstance();
    if (taro) {
      try {
        return createTaroAdapter(taro);
      } catch {}
    }
  }

  // 4. 浏览器环境
  return browserAdapter;
}

/**
 * 获取当前平台适配器（自动检测，惰性初始化）
 */
export function getAdapter(): PlatformAdapter {
  if (!currentAdapter) {
    currentAdapter = detectAdapter();
  }
  return currentAdapter;
}

/**
 * 手动设置平台适配器（一般不需要调用，库会自动检测）
 */
export function setAdapter(adapter: PlatformAdapter): void {
  currentAdapter = adapter;
}
