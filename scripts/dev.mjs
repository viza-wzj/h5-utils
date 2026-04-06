import { execSync } from 'child_process';

const type = process.argv[2] || 'h5';
const dir = 'examples/taro-app';

const labels = { h5: 'H5 开发服务器', weapp: '微信小程序' };
console.log(`\n  启动 Taro ${labels[type] || type} 预览...`);
console.log(`  目录: ${dir}\n`);

try {
  process.chdir(dir);
} catch {
  console.error('  请先运行 npm run setup 安装 taro-app 依赖');
  process.exit(1);
}

execSync(`npx taro build --type ${type} --watch`, { stdio: 'inherit' });
