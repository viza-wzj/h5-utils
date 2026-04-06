import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CORE_PKG = resolve(ROOT, 'packages/core/package.json');

const pkg = JSON.parse(readFileSync(CORE_PKG, 'utf-8'));
const version = pkg.version;

const [, , arg] = process.argv;

function run(cmd, opts) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function runQuiet(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function branchExists(name) {
  const branches = runQuiet('git branch --list ' + name);
  return branches.includes(name);
}

function tagExists(name) {
  const tags = runQuiet('git tag -l ' + name);
  return tags.includes(name);
}

function main() {
  const branch = runQuiet('git branch --show-current');

  if (branch !== 'develop') {
    console.error(`\n  ❌ 请在 develop 分支上执行，当前分支: ${branch}\n`);
    process.exit(1);
  }

  // 检查未提交更改
  const status = runQuiet('git status --porcelain');
  if (status) {
    console.log('\n  ⚠️  有未提交的更改，先提交:');
    run('git add -A');
    const msg = arg || 'chore: update';
    run(`git commit -m "${msg}"`);
    console.log('  ✅ 已提交\n');
  }

  const hasRemote = runQuiet('git remote').length > 0;

  console.log(`  当前版本: v${version}`);
  console.log(`  分支: develop → main`);
  console.log(`  远程仓库: ${hasRemote ? '有' : '无'}\n`);

  // 1. 格式化 + 构建
  console.log('\n  [1/5] 格式化代码...');
  run('pnpm prettier --write "packages/core/src/**/*.ts"');

  console.log('\n  [2/5] 构建项目...');
  run('pnpm run build');

  // 2. 确保 main 分支存在
  console.log('\n  [3/5] 合并 develop → main...');
  if (!branchExists('main')) {
    run('git checkout -b main');
    run('git checkout develop');
  }

  run('git checkout main');

  try {
    run('git merge develop --no-ff -m "merge: develop → main"');
  } catch {
    console.error('\n  ❌ 合并冲突! 请手动解决:');
    console.error('     git add . && git commit');
    console.error('     然后重新运行 pnpm run merge\n');
    process.exit(1);
  }

  // 3. 打 tag
  console.log(`\n  [4/5] 打 tag v${version}...`);
  if (tagExists(`v${version}`)) {
    run(`git tag -d v${version}`);
    console.log(`  🔄 已删除旧 tag v${version}`);
  }
  run(`git tag -a v${version} -m "release: v${version}"`);

  // 4. 推送
  if (hasRemote) {
    console.log('\n  [5/5] 推送到远程...');
    try {
      run('git push origin main --tags');
      run('git push origin develop');
    } catch {
      console.error('\n  ⚠️  推送失败，请手动推送:');
      console.error('     git push origin main --tags');
      console.error('     git push origin develop\n');
    }
  } else {
    console.log('\n  [5/5] 无远程仓库，跳过推送');
  }

  // 切回 develop
  run('git checkout develop');

  console.log(`\n  ✅ 合并完成! v${version}`);
  console.log(`     main: 已合并并打 tag v${version}`);
  console.log(`     develop: 已切回\n`);
}

main();
