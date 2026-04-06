/**
 * 设备/浏览器检测工具
 */

import { getAdapter } from '../adapter';
import { safeCall } from '../utils';

/**
 * 是否为 iOS
 */
export function isIOS(): boolean {
  return safeCall(() => getAdapter().device.getInfo().ios, false, 'isIOS');
}

/**
 * 是否为 Android
 */
export function isAndroid(): boolean {
  return safeCall(() => getAdapter().device.getInfo().android, false, 'isAndroid');
}

/**
 * 是否为微信浏览器
 */
export function isWeChat(): boolean {
  return safeCall(() => getAdapter().device.getInfo().weChat, false, 'isWeChat');
}

/**
 * 是否为移动端
 */
export function isMobile(): boolean {
  return safeCall(() => getAdapter().device.getInfo().mobile, false, 'isMobile');
}

export type BrowserType =
  | 'weixin'
  | 'qq'
  | 'uc'
  | 'safari'
  | 'chrome'
  | 'firefox'
  | 'edge'
  | 'ie'
  | 'unknown';

/**
 * 获取浏览器类型（H5 专用）
 */
export function getBrowserType(): BrowserType {
  return safeCall(
    () => {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      if (/MicroMessenger/i.test(ua)) return 'weixin';
      if (/\bQQ\//i.test(ua)) return 'qq';
      if (/UCBrowser/i.test(ua)) return 'uc';
      if (/Edg/i.test(ua)) return 'edge';
      if (/Firefox/i.test(ua)) return 'firefox';
      if (/MSIE|Trident/i.test(ua)) return 'ie';
      if (/Chrome/i.test(ua)) return 'chrome';
      if (/Safari/i.test(ua)) return 'safari';
      return 'unknown';
    },
    'unknown',
    'getBrowserType',
  );
}

/**
 * 获取操作系统信息
 */
export function getOS(): string {
  return safeCall(() => getAdapter().device.getInfo().os, 'Unknown', 'getOS');
}

/**
 * 获取完整设备信息
 */
export function getDeviceInfo() {
  return safeCall(
    () => getAdapter().device.getInfo(),
    {
      ios: false,
      android: false,
      mobile: false,
      weChat: false,
      os: 'Unknown',
      brand: '',
      model: '',
      screenWidth: 0,
      screenHeight: 0,
      pixelRatio: 1,
    },
    'getDeviceInfo',
  );
}
