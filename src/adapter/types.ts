/**
 * 适配器接口定义
 * 跨端差异化的操作通过适配器抽象，浏览器和 Taro 各自实现
 */

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string, options?: StorageSetOptions): void;
  remove(key: string): void;
  clear(): void;
}

export interface StorageSetOptions {
  /** 过期时间（毫秒） */
  expires?: number;
}

export interface ClipboardAdapter {
  write(text: string): Promise<void>;
  read(): Promise<string>;
}

export interface EventEmitterAdapter {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

export interface DomAdapter {
  select(selector: string): Element | null;
  selectAll(selector: string): Element[];
}

export interface ScrollAdapter {
  /** 滚动到指定位置 */
  scrollTo(options: { top?: number; left?: number; animated?: boolean }): void;
  /** 获取当前滚动位置 */
  getScrollPosition(): { scrollTop: number; scrollLeft: number };
  /** 锁定滚动 */
  lockScroll(): void;
  /** 解锁滚动 */
  unlockScroll(): void;
}

export interface DeviceInfo {
  /** 是否 iOS */
  ios: boolean;
  /** 是否 Android */
  android: boolean;
  /** 是否移动端 */
  mobile: boolean;
  /** 是否微信 */
  weChat: boolean;
  /** 系统信息 */
  os: string;
  /** 品牌 */
  brand: string;
  /** 型号 */
  model: string;
  /** 屏幕宽度 */
  screenWidth: number;
  /** 屏幕高度 */
  screenHeight: number;
  /** 像素比 */
  pixelRatio: number;
}

export interface DeviceAdapter {
  /** 获取设备信息 */
  getInfo(): DeviceInfo;
  /** 获取网络类型 */
  getNetworkType(): Promise<string>;
}

export interface NavigationAdapter {
  /** 保留当前页面，跳转到新页面 */
  navigateTo(url: string, options?: { params?: Record<string, any> }): Promise<void>;
  /** 关闭当前页面，跳转到新页面 */
  redirectTo(url: string, options?: { params?: Record<string, any> }): Promise<void>;
  /** 跳转到 tabBar 页面 */
  switchTab(url: string): Promise<void>;
  /** 关闭所有页面，打开某个页面 */
  reLaunch(url: string): Promise<void>;
  /** 返回上一页 */
  navigateBack(delta?: number): Promise<void>;
}

export interface PlatformAdapter {
  storage: StorageAdapter;
  clipboard: ClipboardAdapter;
  event: EventEmitterAdapter;
  dom: DomAdapter;
  scroll: ScrollAdapter;
  device: DeviceAdapter;
  navigation: NavigationAdapter;
}
