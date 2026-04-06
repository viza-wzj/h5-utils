import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const commonPlugins = [resolve(), typescript({ tsconfig: './tsconfig.json' })];

export default [
  // 主入口
  {
    input: 'src/index.ts',
    external: ['@tarojs/taro'],
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins: commonPlugins,
  },
  // Taro 适配器独立入口
  {
    input: 'src/adapter/taro.ts',
    output: [
      { file: 'dist/adapter/taro.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' },
      { file: 'dist/adapter/taro.esm.js', format: 'esm', sourcemap: true },
    ],
    plugins: commonPlugins,
  },
  // 主入口类型声明
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts({ tsconfig: './tsconfig.dts.json' })],
  },
  // Taro 适配器类型声明
  {
    input: 'src/adapter/taro.ts',
    output: { file: 'dist/adapter/taro.d.ts', format: 'es' },
    plugins: [dts({ tsconfig: './tsconfig.dts.json' })],
  },
];
