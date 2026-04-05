import type { PlatformAdapter } from './types';

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

  event: {
    on(event: string, handler: (...args: any[]) => void): void {
      window.addEventListener(event, handler as EventListener);
    },
    off(event: string, handler: (...args: any[]) => void): void {
      window.removeEventListener(event, handler as EventListener);
    },
    emit(event: string, ...args: any[]): void {
      window.dispatchEvent(new CustomEvent(event, { detail: args }));
    },
  },

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
      const fullUrl = appendParams(url, options?.params);
      window.location.href = fullUrl;
    },
    async redirectTo(url, options) {
      const fullUrl = appendParams(url, options?.params);
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
};

function appendParams(url: string, params?: Record<string, any>): string {
  if (!params || !Object.keys(params).length) return url;
  const search = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  if (!search) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${search}`;
}

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
