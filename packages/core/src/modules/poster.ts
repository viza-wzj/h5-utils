import { getAdapter } from '../adapter';
import { safeCallAsync } from '../utils';
import { drawCircle, drawImage, drawLine, drawQrcode, drawRect, drawText } from './poster/drawers';
import { drawBackground, imageToBase64 } from './poster/helpers';
import type { PosterConfig } from './poster/types';

export { imageToBase64 };
export type {
  PosterConfig,
  PosterElement,
  ImageElement,
  TextElement,
  RectElement,
  CircleElement,
  LineElement,
  QrcodeElement,
} from './poster/types';

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
            drawRect(ctx, el);
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
          const finish = () => {
            if (!done) {
              done = true;
              resolve();
            }
          };
          try {
            ctx.draw(true, finish);
          } catch {
            finish();
          }
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
