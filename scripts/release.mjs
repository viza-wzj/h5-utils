import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const current = pkg.version;

const [, , arg] = process.argv;

function bump(ver, idx) {
  const parts = ver.split('.').map(Number);
  parts[idx]++;
  for (let i = idx + 1; i < parts.length; i++) parts[i] = 0;
  return parts.join('.');
}

const options = {
  patch: bump(current, 2),
  minor: bump(current, 1),
  major: bump(current, 0),
};

async function prompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question('  请输入选择 (1/2/3): ', (answer) => {
      rl.close();
      const map = { '1': 'patch', '2': 'minor', '3': 'major' };
      resolve(map[answer.trim()]);
    });
  });
}

async function main() {
  let type;
  if (arg && options[arg]) {
    type = arg;
  } else {
    console.log(`\n  当前版本: ${current}\n`);
    console.log('  请选择版本号:');
    console.log(`    1) patch  → ${options.patch}`);
    console.log(`    2) minor  → ${options.minor}`);
    console.log(`    3) major  → ${options.major}`);
    console.log(`    0) 取消\n`);

    type = await prompt();
    if (!type) {
      console.log('  已取消');
      process.exit(0);
    }
  }

  const nextVer = options[type];
  console.log(`\n  ${current} → ${nextVer} (${type})\n`);

  // 1. 格式化代码
  console.log('  [1/4] 格式化代码...');
  execSync('npx prettier --write "src/**/*.ts"', { stdio: 'inherit' });

  // 2. 构建
  console.log('\n  [2/4] 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. 更新版本号
  console.log(`\n  [3/4] 更新版本号 ${nextVer}...`);
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

  // 4. 发布
  console.log('\n  [4/4] 发布到 npm...');
  try {
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`\n  ✅ 发布成功! @i17hush/h5-utils@${nextVer}\n`);
  } catch {
    console.log('\n  ❌ 发布失败\n');
    process.exit(1);
  }
}

main();
