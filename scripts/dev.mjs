import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const type = process.argv[2] || 'h5';
const dir = 'apps/taro-app';

const labels = { h5: 'H5 开发服务器', weapp: '微信小程序' };
console.log(`\n  启动开发模式...`);
console.log(`  工具库: packages/core (watch)`);
console.log(`  预览: Taro ${labels[type] || type}\n`);

const children = [];

function cleanup() {
  children.forEach((c) => {
    if (!c.killed) c.kill();
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 1. 工具库 watch 构建（先完整构建一次，再进入 watch 模式）
const lib = spawn('npx', ['rollup', '-c', '--watch'], {
  cwd: resolve(root, 'packages/core'),
  stdio: 'inherit',
});
children.push(lib);

// 2. Taro 预览
const taro = spawn('npx', ['taro', 'build', '--type', type, '--watch'], {
  cwd: resolve(root, dir),
  stdio: 'inherit',
});
children.push(taro);
