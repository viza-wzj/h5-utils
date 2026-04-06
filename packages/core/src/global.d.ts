/**
 * 小程序平台全局变量类型声明
 * 仅用于类型检查，不会产生运行时代码
 */

declare const wx: any;
declare const my: any;
declare const tt: any;
declare const swan: any;
declare const qq: any;

/**
 * Node.js require 声明
 * adapter 自动检测中用于动态加载 @tarojs/taro
 */
declare function require(moduleName: string): any;

/**
 * process 声明
 * Taro H5 模式通过 process.env.TARO_ENV 标识环境
 */
declare const process: {
  env: Record<string, string | undefined>;
};
