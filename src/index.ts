// 适配器
export { setAdapter, getAdapter } from './adapter';
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
} from './adapter';

// URL 模块
export { parseUrl, buildUrl, getQueryParam, getAllQueryParams } from './modules/url';
export type { ParsedUrl } from './modules/url';

// Storage 模块
export {
  get as getStorage,
  set as setStorage,
  remove as removeStorage,
  clear as clearStorage,
} from './modules/storage';

// Cookie 模块
export { get as getCookie, set as setCookie, remove as removeCookie } from './modules/cookie';
export type { CookieOptions } from './modules/cookie';

// Device 模块
export {
  isIOS,
  isAndroid,
  isWeChat,
  isMobile,
  getBrowserType,
  getOS,
  getDeviceInfo,
} from './modules/device';
export type { BrowserType } from './modules/device';

// DOM 模块
export {
  $,
  $$,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  getStyle,
  isInViewport,
} from './modules/dom';

// Event 模块
export { on, off, once, delegate } from './modules/event';

// Clipboard 模块
export { copyText, readText } from './modules/clipboard';

// Scroll 模块
export { scrollToTop, scrollToElement, lockScroll, unlockScroll } from './modules/scroll';

// Format 模块
export {
  formatDate,
  formatNumber,
  formatPhone,
  formatMoney,
  throttle,
  debounce,
} from './modules/format';

// Validator 模块
export { isMobilePhone, isEmail, isIdCard, isUrl, isChinese } from './modules/validator';

// Router 模块
export { navigateTo, redirectTo, switchTab, reLaunch, navigateBack } from './modules/router';

// Poster 模块
export { drawPoster } from './modules/poster';
export type {
  PosterConfig,
  PosterElement,
  ImageElement,
  TextElement,
  RectElement,
  CircleElement,
  LineElement,
} from './modules/poster';
