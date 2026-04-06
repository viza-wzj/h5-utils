# @i17hush/h5-utils

H5 常用工具库，封装前端开发高频方法，采用适配器模式支持浏览器与 Taro 多端切换。

## 安装

```bash
npm install @i17hush/h5-utils
```

## 快速使用

```typescript
import { formatDate, isEmail, getQueryParam } from '@i17hush/h5-utils';

formatDate(new Date(), 'YYYY-MM-DD'); // '2026-04-06'
isEmail('test@example.com');          // true
getQueryParam('id');                  // URL 中 id 参数值
```

## 功能模块

### URL - `parseUrl` `buildUrl` `getQueryParam` `getAllQueryParams`

```typescript
import { parseUrl, buildUrl, getQueryParam, getAllQueryParams } from '@i17hush/h5-utils';

parseUrl('https://example.com/path?foo=bar#hash');
// { protocol: 'https:', host: 'example.com', pathname: '/path', query: { foo: 'bar' }, hash: '#hash', ... }

buildUrl('https://example.com/api', { page: 1, size: 10 });
// 'https://example.com/api?page=1&size=10'

getAllQueryParams(); // 获取当前页面所有查询参数
```

### Storage - `getStorage` `setStorage` `removeStorage` `clearStorage`

支持 JSON 自动序列化和过期时间。

```typescript
import { getStorage, setStorage } from '@i17hush/h5-utils';

setStorage('user', { name: 'Tom' });                      // 自动 JSON 序列化
setStorage('token', 'abc123', { expires: 7 * 86400000 }); // 7天后过期
getStorage<{ name: string }>('user');                      // { name: 'Tom' }
```

### Cookie - `getCookie` `setCookie` `removeCookie`

```typescript
import { getCookie, setCookie, removeCookie } from '@i17hush/h5-utils';

setCookie('theme', 'dark', { days: 30, path: '/' });
getCookie('theme');  // 'dark'
removeCookie('theme');
```

### Device - `isIOS` `isAndroid` `isWeChat` `isMobile` `getBrowserType` `getOS`

```typescript
import { isIOS, isMobile, isWeChat, getBrowserType } from '@i17hush/h5-utils';

isIOS();           // boolean
isMobile();        // boolean
isWeChat();        // boolean
getBrowserType();  // 'chrome' | 'safari' | 'weixin' | 'firefox' | 'edge' | ...
```

### DOM - `$` `$$` `addClass` `removeClass` `toggleClass` `hasClass` `getStyle` `isInViewport`

```typescript
import { $, $$, addClass, removeClass, isInViewport } from '@i17hush/h5-utils';

const el = $<HTMLDivElement>('.container');
$$<HTMLElement>('.item').forEach(item => addClass(item, 'active'));
isInViewport(el); // 元素是否在可视区域内
```

### Event - `on` `off` `once` `delegate`

```typescript
import { on, off, once, delegate } from '@i17hush/h5-utils';

const handler = (e: Event) => console.log(e);
on(window, 'resize', handler);
off(window, 'resize', handler);
once(document, 'click', () => console.log('只触发一次'));

// 事件委托
delegate(document.body, '.btn', 'click', (el, e) => {
  console.log('点击了', el);
});
```

### Clipboard - `copyText` `readText`

```typescript
import { copyText, readText } from '@i17hush/h5-utils';

await copyText('Hello World');
const text = await readText();
```

### Scroll - `scrollToTop` `scrollToElement` `lockScroll` `unlockScroll`

```typescript
import { scrollToTop, scrollToElement, lockScroll, unlockScroll } from '@i17hush/h5-utils';

scrollToTop();                                    // 平滑滚到顶部
scrollToTop(false);                               // 立即滚到顶部
scrollToElement(el, { offset: -50 });             // 滚动到元素位置，偏移 -50px
lockScroll();                                     // 锁定页面滚动
unlockScroll();                                   // 解锁页面滚动
```

### Format - `formatDate` `formatNumber` `formatPhone` `formatMoney` `throttle` `debounce`

```typescript
import { formatDate, formatNumber, formatPhone, formatMoney, throttle, debounce } from '@i17hush/h5-utils';

formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss');   // '2026-04-06 14:30:00'
formatNumber(1234567.89, { precision: 2 });       // '1,234,567.89'
formatPhone('13812345678');                       // '138 1234 5678'
formatMoney(9999);                                // '9,999.00'

const throttled = throttle(() => {}, 200);
const debounced = debounce(() => {}, 300);
```

### Validator - `isMobilePhone` `isEmail` `isIdCard` `isUrl` `isChinese`

```typescript
import { isMobilePhone, isEmail, isIdCard, isUrl, isChinese } from '@i17hush/h5-utils';

isMobilePhone('13812345678'); // true
isEmail('a@b.com');           // true
isIdCard('110101199001011234'); // true（含校验位验证）
isUrl('https://example.com'); // true
isChinese('你好');             // true
```

## Taro 适配

库内置环境自动检测，**在 Taro 项目中无需任何配置，直接使用即可**。

Taro 构建时会自动注入 `process.env.TARO_ENV` 环境变量，库检测到后会自动切换到 Taro 适配器，对接 `Taro.getStorageSync`、`Taro.setClipboardData`、`Taro.pageScrollTo` 等 API。

### 在 Taro 项目中使用

```typescript
// 直接 import 使用，无需注册或初始化
import {
  getStorage, setStorage,
  copyText,
  isIOS, isMobile, getOS,
  scrollToTop,
  formatDate, formatPhone,
  isEmail, isMobilePhone,
} from '@i17hush/h5-utils';

// Storage - 自动使用 Taro.getStorageSync
setStorage('token', 'abc', { expires: 86400000 });
const token = getStorage<string>('token');

// 剪贴板 - 自动使用 Taro.setClipboardData
await copyText('Hello');

// 设备信息 - 自动使用 Taro.getSystemInfoSync
isIOS();    // boolean
isMobile(); // boolean
getOS();    // 'iOS' | 'Android' | ...

// 滚动 - 自动使用 Taro.pageScrollTo
scrollToTop();
```

### 跨端可用模块

| 模块 | H5 | Taro | 说明 |
|------|:---:|:----:|------|
| **Storage** | ✅ | ✅ | 过期时间、JSON 自动序列化 |
| **Clipboard** | ✅ | ✅ | 复制/读取文本 |
| **Scroll** | ✅ | ✅ | 滚动到顶部/位置 |
| **Device** | ✅ | ✅ | 设备检测、系统信息 |
| **Event** | ✅ | ✅ | 自定义事件（Taro 使用 eventCenter） |
| **Format** | ✅ | ✅ | 纯函数，无平台依赖 |
| **Validator** | ✅ | ✅ | 纯函数，无平台依赖 |
| **URL** | ✅ | ⚠️ | `getQueryParam`/`getAllQueryParams` 在小程序中不可用 |
| **Cookie** | ✅ | ❌ | 小程序无 Cookie，仅 H5 可用 |
| **DOM** | ✅ | ❌ | 小程序无 DOM，仅 H5 可用 |

## 构建

```bash
npm run build      # 生成 ESM + CJS + 类型声明
npm run typecheck  # TypeScript 类型检查
```

产物：

- `dist/index.esm.js` - ES Module
- `dist/index.cjs.js` - CommonJS
- `dist/index.d.ts` - 类型声明

## License

MIT
