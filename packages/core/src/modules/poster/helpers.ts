import type { GradientConfig, ShadowConfig } from '../../adapter/types';

import type { PosterConfig } from './types';

/** 代理图片 URL */
export function proxyUrl(src: string, proxy?: string): string {
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

/** 创建渐变 */
export function createGradient(
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
export function applyShadow(ctx: any, shadow: ShadowConfig | undefined): void {
  if (!shadow) return;
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetX = shadow.offsetX || 0;
  ctx.shadowOffsetY = shadow.offsetY || 0;
}

/** 清除阴影 */
export function clearShadow(ctx: any): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** 绘制圆角矩形路径 */
export function roundRectPath(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const limitedRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + limitedRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, limitedRadius);
  ctx.arcTo(x + width, y + height, x, y + height, limitedRadius);
  ctx.arcTo(x, y + height, x, y, limitedRadius);
  ctx.arcTo(x, y, x + width, y, limitedRadius);
  ctx.closePath();
}

/** 文字换行分割 */
export function splitTextLines(
  ctx: any,
  text: string,
  maxWidth: number,
  maxLines?: number,
): string[] {
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

/** 绘制背景 */
export async function drawBackground(ctx: any, config: PosterConfig, canvasAdapter: any): Promise<void> {
  if (config.backgroundImage) {
    try {
      const img = await canvasAdapter.loadImage(proxyUrl(config.backgroundImage, config.imageProxy));
      if (img) {
        ctx.drawImage(img, 0, 0, config.width, config.height);
        return;
      }
    } catch {}
  }

  if (config.backgroundGradient) {
    ctx.fillStyle = createGradient(
      ctx,
      config.backgroundGradient,
      0,
      0,
      config.width,
      config.height,
    );
  } else {
    ctx.fillStyle = config.backgroundColor || '#ffffff';
  }

  ctx.fillRect(0, 0, config.width, config.height);
}
