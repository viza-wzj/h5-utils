import qrcode from 'qrcode-generator';

import { applyShadow, clearShadow, createGradient, proxyUrl, roundRectPath, splitTextLines } from './helpers';
import type {
  CircleElement,
  ImageElement,
  LineElement,
  QrcodeElement,
  RectElement,
  TextElement,
} from './types';

/** 绘制矩形元素 */
export function drawRect(ctx: any, el: RectElement): void {
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
export function drawCircle(ctx: any, el: CircleElement): void {
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
export function drawLine(ctx: any, el: LineElement): void {
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
export async function drawImage(
  ctx: any,
  el: ImageElement,
  canvasAdapter: any,
  proxy?: string,
): Promise<void> {
  let img: any;
  try {
    img = await canvasAdapter.loadImage(proxyUrl(el.src, proxy));
  } catch {
    return;
  }

  if (!img) return;

  ctx.save();
  if (typeof ctx.imageSmoothingEnabled !== 'undefined') {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  if (el.circle) {
    const radius = Math.min(el.width, el.height) / 2;
    const centerX = el.x + el.width / 2;
    const centerY = el.y + el.height / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  } else if (el.borderRadius && el.borderRadius > 0) {
    roundRectPath(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
    ctx.clip();
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  } else {
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  }

  if (el.borderWidth && el.borderColor) {
    clearShadow(ctx);
    if (el.circle) {
      const radius = Math.min(el.width, el.height) / 2;
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
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

/** 绘制文字元素 */
export function drawText(ctx: any, el: TextElement): void {
  ctx.save();

  applyShadow(ctx, el.shadow);

  ctx.fillStyle = el.color || '#000000';
  ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 14}px ${el.fontFamily || 'sans-serif'}`;
  ctx.textAlign = el.textAlign || 'left';
  ctx.textBaseline = 'top';

  const lineHeight = el.lineHeight || (el.fontSize || 14) * 1.4;

  if (el.maxWidth) {
    const lines = splitTextLines(ctx, el.text, el.maxWidth, el.maxLines);
    lines.forEach((line, index) => {
      let x = el.x;
      if (el.textAlign === 'center') x = el.x + el.maxWidth! / 2;
      else if (el.textAlign === 'right') x = el.x + el.maxWidth!;
      ctx.fillText(line, x, el.y + index * lineHeight);
    });
  } else {
    ctx.fillText(el.text, el.x, el.y);
  }

  ctx.restore();
}

/** 绘制二维码元素 */
export function drawQrcode(ctx: any, el: QrcodeElement): void {
  const size = el.size || 100;
  const margin = el.padding ?? 2;
  const level = (el.level || 'M') as 'L' | 'M' | 'Q' | 'H';

  const qr = qrcode(0, level);
  qr.addData(el.text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = Math.floor(size / (moduleCount + margin * 2));
  const totalSize = cellSize * (moduleCount + margin * 2);

  ctx.save();

  if (el.backgroundColor !== 'transparent') {
    ctx.fillStyle = el.backgroundColor || '#ffffff';
    ctx.fillRect(el.x, el.y, totalSize, totalSize);
  }

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
