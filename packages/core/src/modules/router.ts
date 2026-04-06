/**
 * 路由跳转工具
 * 统一封装 H5 和小程序的页面跳转，自动适配环境
 */

import { getAdapter } from '../adapter';
import { safeCallAsync } from '../utils';

function validateUrl(url: string, method: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error(`路由地址不能为空`);
  }
  const trimmed = url.trim();
  if (!trimmed || trimmed === '/') {
    throw new Error(`路由地址无效: "${url}"`);
  }
}

/**
 * 保留当前页面，跳转到新页面
 * - H5: window.location.href
 * - 小程序: wx.navigateTo / Taro.navigateTo
 */
export function navigateTo(url: string, options?: { params?: Record<string, any> }): Promise<void> {
  return safeCallAsync(
    () => {
      validateUrl(url, 'navigateTo');
      return getAdapter().navigation.navigateTo(url, options);
    },
    undefined,
    'navigateTo',
  );
}

/**
 * 关闭当前页面，跳转到新页面
 * - H5: window.location.replace
 * - 小程序: wx.redirectTo / Taro.redirectTo
 */
export function redirectTo(url: string, options?: { params?: Record<string, any> }): Promise<void> {
  return safeCallAsync(
    () => {
      validateUrl(url, 'redirectTo');
      return getAdapter().navigation.redirectTo(url, options);
    },
    undefined,
    'redirectTo',
  );
}

/**
 * 跳转到 tabBar 页面
 * - H5: window.location.href
 * - 小程序: wx.switchTab / Taro.switchTab
 */
export function switchTab(url: string): Promise<void> {
  return safeCallAsync(
    () => {
      validateUrl(url, 'switchTab');
      return getAdapter().navigation.switchTab(url);
    },
    undefined,
    'switchTab',
  );
}

/**
 * 关闭所有页面，打开某个页面
 * - H5: window.location.replace
 * - 小程序: wx.reLaunch / Taro.reLaunch
 */
export function reLaunch(url: string): Promise<void> {
  return safeCallAsync(
    () => {
      validateUrl(url, 'reLaunch');
      return getAdapter().navigation.reLaunch(url);
    },
    undefined,
    'reLaunch',
  );
}

/**
 * 返回上一页
 * - H5: history.back
 * - 小程序: wx.navigateBack / Taro.navigateBack
 */
export function navigateBack(delta = 1): Promise<void> {
  return safeCallAsync(
    () => getAdapter().navigation.navigateBack(delta),
    undefined,
    'navigateBack',
  );
}
