/**
 * Canvas 海报绘制工具
 * 通过 JSON 配置描述海报内容，自动适配 H5 和小程序环境
 */

import qrcode from 'qrcode-generator';

import { getAdapter } from '../adapter';
import type { GradientConfig, ShadowConfig } from '../adapter/types';
import { safeCallAsync } from '../utils';

// ==================== 类型定义 ====================

/** 海报配置 */
export interface PosterConfig {
  width: number;
  height: number;
  /** 小程序中页面 canvas 组件的 canvas-id，H5 中忽略 */
  canvasId?: string;
  backgroundColor?: string;
  backgroundGradient?: GradientConfig;
  backgroundImage?: string;
  /**
   * 图片代理地址，解决跨域问题
   * 使用 {url} 作为占位符，如: https://proxy.example.com?url={url}
   */
  imageProxy?: string;
  elements: PosterElement[];
}

/** 二维码元素 */
export interface QrcodeElement {
  type: 'qrcode';
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  /** 纠错等级 'L' | 'M' | 'Q' | 'H'，默认 'M' */
  level?: string;
  /** 二维码内边距模块数，默认 2 */
  padding?: number;
}

/** 海报元素联合类型 */
export type PosterElement = ImageElement | TextElement | RectElement | CircleElement | LineElement | QrcodeElement;

/** 图片元素 */
export interface ImageElement {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  borderRadius?: number;
  circle?: boolean;
  borderWidth?: number;
  borderColor?: string;
}

/** 文字元素 */
export interface TextElement {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  maxWidth?: number;
  maxLines?: number;
  shadow?: ShadowConfig;
}

/** 矩形元素 */
export interface RectElement {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  gradient?: GradientConfig;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: ShadowConfig;
}

/** 圆形元素 */
export interface CircleElement {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

/** 线条元素 */
export interface LineElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
}

// ==================== 绘制实现 ====================

/** 代理图片 URL */
function proxyUrl(src: string, proxy?: string): string {
  if (!proxy) return src;
  return proxy.replace('{url}', encodeURIComponent(src));
}

/**
 * 将图片 URL 转为 base64（仅 H5 可用，需要图片支持 CORS 或同域）
 */
export async function imageToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** 绘制背景 */
async function drawBackground(ctx: any, config: PosterConfig, adapter: any): Promise<void> {
  // 背景图优先（加载失败时降级到纯色/渐变）
  if (config.backgroundImage) {
    try {
      const img = await adapter.loadImage(proxyUrl(config.backgroundImage, config.imageProxy));
      if (img) {
        ctx.drawImage(img, 0, 0, config.width, config.height);
        return;
      }
    } catch {}
  }

  if (config.backgroundGradient) {
    const gradient = createGradient(
      ctx,
      config.backgroundGradient,
      0,
      0,
      config.width,
      config.height,
    );
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = config.backgroundColor || '#ffffff';
  }
  ctx.fillRect(0, 0, config.width, config.height);
}

/** 创建渐变 */
function createGradient(
  ctx: any,
  config: GradientConfig,
  defaultX0: number,
  defaultY0: number,
  defaultX1: number,
  defaultY1: number,
): any {
  const [x0, y0, x1, y1] = config.direction || [defaultX0, defaultY0, defaultX1, defaultY1];
  let gradient: any;

  if (config.type === 'radial') {
    const r = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 2;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else {
    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  }

  config.colors.forEach((color, i) => {
    const stop = config.stops?.[i] ?? i / (config.colors.length - 1);
    gradient.addColorStop(stop, color);
  });

  return gradient;
}

/** 设置阴影 */
function applyShadow(ctx: any, shadow: ShadowConfig | undefined): void {
  if (!shadow) return;
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetX = shadow.offsetX || 0;
  ctx.shadowOffsetY = shadow.offsetY || 0;
}

/** 清除阴影 */
function clearShadow(ctx: any): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** 绘制圆角矩形路径 */
function roundRectPath(ctx: any, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 绘制矩形元素 */
function drawRect(ctx: any, el: RectElement, canvasWidth: number, canvasHeight: number): void {
  ctx.save();
  applyShadow(ctx, el.shadow);

  const hasBorder = el.borderWidth && el.borderColor;
  const hasRadius = el.borderRadius && el.borderRadius > 0;

  if (hasRadius) {
    roundRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius!);
  } else {
    ctx.beginPath();
    ctx.rect(el.x, el.y, el.width, el.height);
  }

  if (el.gradient) {
    ctx.fillStyle = createGradient(ctx, el.gradient, el.x, el.y, el.x + el.width, el.y);
  } else {
    ctx.fillStyle = el.backgroundColor || '#ffffff';
  }
  ctx.fill();

  if (hasBorder) {
    clearShadow(ctx);
    ctx.strokeStyle = el.borderColor!;
    ctx.lineWidth = el.borderWidth!;
    ctx.stroke();
  }

  ctx.restore();
}

/** 绘制圆形元素 */
function drawCircle(ctx: any, el: CircleElement): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);

  if (el.backgroundColor) {
    ctx.fillStyle = el.backgroundColor;
    ctx.fill();
  }

  if (el.borderWidth && el.borderColor) {
    ctx.strokeStyle = el.borderColor;
    ctx.lineWidth = el.borderWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/** 绘制线条元素 */
function drawLine(ctx: any, el: LineElement): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(el.x1, el.y1);
  ctx.lineTo(el.x2, el.y2);
  ctx.strokeStyle = el.color || '#000000';
  ctx.lineWidth = el.width || 1;
  ctx.stroke();
  ctx.restore();
}

/** 绘制图片元素 */
async function drawImage(ctx: any, el: ImageElement, adapter: any, proxy?: string): Promise<void> {
  let img: any;
  try {
    img = await adapter.loadImage(proxyUrl(el.src, proxy));
  } catch {
    return;
  }
  if (!img) return;

  ctx.save();
  // 高质量缩放，减少模糊
  if (typeof ctx.imageSmoothingEnabled !== 'undefined') {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  // 圆形裁剪
  if (el.circle) {
    const r = Math.min(el.width, el.height) / 2;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  } else if (el.borderRadius && el.borderRadius > 0) {
    roundRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
    ctx.clip();
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  } else {
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  }

  // 边框
  if (el.borderWidth && el.borderColor) {
    clearShadow(ctx);
    if (el.circle) {
      const r = Math.min(el.width, el.height) / 2;
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (el.borderRadius && el.borderRadius > 0) {
      roundRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
    } else {
      ctx.beginPath();
      ctx.rect(el.x, el.y, el.width, el.height);
    }
    ctx.strokeStyle = el.borderColor;
    ctx.lineWidth = el.borderWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/** 文字换行分割 */
function splitTextLines(ctx: any, text: string, maxWidth: number, maxLines?: number): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      lines.push(currentLine);
      currentLine = '';
      continue;
    }
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (maxLines && lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    const last = truncated[maxLines - 1];
    truncated[maxLines - 1] = last.slice(0, -1) + '...';
    return truncated;
  }

  return lines;
}

/** 绘制文字元素 */
function drawText(ctx: any, el: TextElement): void {
  ctx.save();

  applyShadow(ctx, el.shadow);

  ctx.fillStyle = el.color || '#000000';
  ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 14}px ${el.fontFamily || 'sans-serif'}`;
  ctx.textAlign = el.textAlign || 'left';
  ctx.textBaseline = 'top';

  const lineHeight = el.lineHeight || (el.fontSize || 14) * 1.4;

  if (el.maxWidth) {
    const lines = splitTextLines(ctx, el.text, el.maxWidth, el.maxLines);
    lines.forEach((line, i) => {
      let x = el.x;
      if (el.textAlign === 'center') x = el.x + el.maxWidth! / 2;
      else if (el.textAlign === 'right') x = el.x + el.maxWidth!;
      ctx.fillText(line, x, el.y + i * lineHeight);
    });
  } else {
    ctx.fillText(el.text, el.x, el.y);
  }

  ctx.restore();
}

/** 绘制二维码元素 */
function drawQrcode(ctx: any, el: QrcodeElement): void {
  const size = el.size || 100;
  const margin = el.padding ?? 2;
  const level = (el.level || 'M') as 'L' | 'M' | 'Q' | 'H';

  const qr = qrcode(0, level);
  qr.addData(el.text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  // 取整 cellSize 避免亚像素抗锯齿模糊
  const cellSize = Math.floor(size / (moduleCount + margin * 2));
  const totalSize = cellSize * (moduleCount + margin * 2);

  ctx.save();

  // 背景
  if (el.backgroundColor !== 'transparent') {
    ctx.fillStyle = el.backgroundColor || '#ffffff';
    ctx.fillRect(el.x, el.y, totalSize, totalSize);
  }

  // 绘制模块（坐标全部取整）
  ctx.fillStyle = el.color || '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          el.x + (col + margin) * cellSize,
          el.y + (row + margin) * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
  }

  ctx.restore();
}

// ==================== 对外接口 ====================

/**
 * 绘制海报
 * @param config 海报配置
 * @returns 图片路径（H5 为 data URL，小程序为临时文件路径）
 */
export function drawPoster(config: PosterConfig): Promise<string> {
  return safeCallAsync(
    async () => {
      const adapter = getAdapter();
      const dpr = adapter.device.getInfo().pixelRatio || 1;
      const w = config.width * dpr;
      const h = config.height * dpr;

      const { canvas, ctx } = adapter.canvas.createContext(w, h, config.canvasId);

      if (!ctx) throw new Error('Failed to create canvas context');

      // 缩放绘制上下文，使后续所有绘制坐标仍使用逻辑像素
      if (typeof ctx.scale === 'function') {
        ctx.scale(dpr, dpr);
      }

      // 绘制背景
      await drawBackground(ctx, config, adapter.canvas);

      // 按顺序绘制元素
      for (const el of config.elements) {
        switch (el.type) {
          case 'rect':
            drawRect(ctx, el, config.width, config.height);
            break;
          case 'circle':
            drawCircle(ctx, el);
            break;
          case 'line':
            drawLine(ctx, el);
            break;
          case 'text':
            drawText(ctx, el);
            break;
          case 'image':
            await drawImage(ctx, el, adapter.canvas, config.imageProxy);
            break;
          case 'qrcode':
            drawQrcode(ctx, el);
            break;
        }
      }

      // 小程序 canvas 是命令队列模式，需要调用 draw() 提交绘制
      if (typeof ctx.draw === 'function') {
        await new Promise<void>((resolve) => {
          let done = false;
          const finish = () => { if (!done) { done = true; resolve(); } };
          try { ctx.draw(true, finish); } catch { finish(); }
          setTimeout(finish, 3000);
        });
      }

      // 导出图片（加超时保护）
      const imageResult = await Promise.race([
        adapter.canvas.toImage(canvas),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('toImage timeout')), 5000),
        ),
      ]);
      return imageResult;
    },
    '',
    'drawPoster',
  );
}
