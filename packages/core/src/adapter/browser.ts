import type { PlatformAdapter } from './types';
import { createEventEmitterAdapter } from './event-emitter';
import { appendUrlParams } from '../utils';

/**
 * 浏览器环境适配器
 */
export const browserAdapter: PlatformAdapter = {
  storage: {
    get(key: string): string | null {
      return localStorage.getItem(key);
    },
    set(key: string, value: string): void {
      localStorage.setItem(key, value);
    },
    remove(key: string): void {
      localStorage.removeItem(key);
    },
    clear(): void {
      localStorage.clear();
    },
  },

  clipboard: {
    async write(text: string): Promise<void> {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    },
    async read(): Promise<string> {
      if (navigator.clipboard) {
        return await navigator.clipboard.readText();
      }
      throw new Error('Clipboard API not supported');
    },
  },

  event: createEventEmitterAdapter(),

  dom: {
    select(selector: string): Element | null {
      return document.querySelector(selector);
    },
    selectAll(selector: string): Element[] {
      return Array.from(document.querySelectorAll(selector));
    },
  },

  scroll: {
    scrollTo(options: { top?: number; left?: number; animated?: boolean }): void {
      window.scrollTo({
        top: options.top ?? 0,
        left: options.left ?? 0,
        behavior: options.animated !== false ? 'smooth' : 'auto',
      });
    },
    getScrollPosition(): { scrollTop: number; scrollLeft: number } {
      return {
        scrollTop: window.scrollY,
        scrollLeft: window.scrollX,
      };
    },
    lockScroll(): void {
      document.body.style.overflow = 'hidden';
    },
    unlockScroll(): void {
      document.body.style.overflow = '';
    },
  },

  device: {
    getInfo() {
      const ua = navigator.userAgent;
      return {
        ios: /iPhone|iPad|iPod/i.test(ua),
        android: /Android/i.test(ua),
        mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        weChat: /MicroMessenger/i.test(ua),
        os: getBrowserOS(ua),
        brand: '',
        model: '',
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      };
    },
    async getNetworkType(): Promise<string> {
      const conn =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      return conn?.effectiveType || 'unknown';
    },
  },

  navigation: {
    async navigateTo(url, options) {
      const fullUrl = appendUrlParams(url, options?.params);
      window.location.href = fullUrl;
    },
    async redirectTo(url, options) {
      const fullUrl = appendUrlParams(url, options?.params);
      window.location.replace(fullUrl);
    },
    async switchTab(url) {
      window.location.href = url;
    },
    async reLaunch(url) {
      window.location.replace(url);
    },
    async navigateBack(delta = 1) {
      if (delta <= 0) return;
      window.history.go(-delta);
    },
  },

  canvas: {
    createContext(width: number, height: number, _canvasId?: string) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return { canvas, ctx: canvas.getContext('2d') };
    },
    async toImage(canvas: any, options?: { quality?: number }) {
      return canvas.toDataURL('image/png', options?.quality);
    },
    async loadImage(src: string) {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    },
  },
};

function getBrowserOS(ua: string): string {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) {
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    return 'macOS';
  }
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}
