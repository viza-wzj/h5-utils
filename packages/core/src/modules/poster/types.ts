import type { GradientConfig, ShadowConfig } from '../../adapter/types';

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

/** 海报元素联合类型 */
export type PosterElement =
  | ImageElement
  | TextElement
  | RectElement
  | CircleElement
  | LineElement
  | QrcodeElement;
