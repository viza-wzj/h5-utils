import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

const [, , arg] = process.argv;

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
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

function bump(ver, idx) {
  const parts = ver.split('.').map(Number);
  parts[idx]++;
  for (let i = idx + 1; i < parts.length; i++) parts[i] = 0;
  return parts.join('.');
}

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(`  ${question}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  // 读取当前版本
  let pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const current = pkg.version;

  // 选择版本号
  let type;
  const options = {
    patch: bump(current, 2),
    minor: bump(current, 1),
    major: bump(current, 0),
  };

  if (arg && options[arg]) {
    type = arg;
  } else {
    console.log(`\n  当前版本: ${current}\n`);
    console.log('  请选择版本号:');
    console.log(`    1) patch  → ${options.patch}`);
    console.log(`    2) minor  → ${options.minor}`);
    console.log(`    3) major  → ${options.major}`);
    console.log(`    0) 取消\n`);

    type = await prompt('请输入选择 (1/2/3): ');
    const map = { '1': 'patch', '2': 'minor', '3': 'major' };
    type = map[type];
    if (!type) {
      console.log('  已取消');
      process.exit(0);
    }
  }

  const nextVer = options[type];
  const srcBranch = runQuiet('git branch --show-current');
  const hasRemote = runQuiet('git remote').length > 0;

  console.log(`\n  ${current} → ${nextVer} (${type})`);
  console.log(`  当前分支: ${srcBranch}`);

  // 输入改动描述
  const changelog = await prompt('\n  请输入本次改动描述: ');
  const tagMsg = changelog || `${type} release`;

  console.log();

  // [1/7] 提交未保存更改
  const status = runQuiet('git status --porcelain');
  if (status) {
    console.log('  [1/7] 提交未保存更改...');
    run('git add -A');
    const msg = arg || `chore: bump ${nextVer}`;
    run(`git commit -m "${msg}"`);
    console.log('  ✅ 已提交\n');
  } else {
    console.log('  [1/7] 无未保存更改');
  }

  // [2/7] 格式化代码
  console.log('\n  [2/7] 格式化代码...');
  run('npx prettier --write "src/**/*.ts"');

  // [3/7] 构建
  console.log('\n  [3/7] 构建项目...');
  run('npm run build');

  // [4/7] 写入 CHANGELOG
  console.log('\n  [4/7] 写入 CHANGELOG...');
  const date = new Date().toISOString().slice(0, 10);
  const entry = `## v${nextVer} (${date})\n\n${tagMsg}\n`;
  const oldLog = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf-8') : '';
  const header = '# Changelog\n\n';
  const body = oldLog.startsWith('# Changelog') ? oldLog.slice(header.length) : oldLog.replace(/^#.*\n?/, '');
  writeFileSync('CHANGELOG.md', header + entry + '\n' + body);

  // [5/7] 更新版本号
  console.log(`\n  [5/7] 更新版本号 ${nextVer}...`);
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

  // 提交版本号变更
  run('git add package.json package-lock.json CHANGELOG.md');
  run(`git commit -m "release: v${nextVer}"`);

  // [6/7] 发布
  console.log('\n  [6/7] 发布到 npm...');
  try {
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`\n  ✅ 发布成功! @i17hush/h5-utils@${nextVer}`);
  } catch {
    console.log('\n  ❌ 发布失败，回退版本号...');
    execSync(`npm version ${current} --no-git-tag-version`, { stdio: 'inherit' });
    run('git add package.json');
    run(`git commit -m "revert: version back to ${current}"`);
    process.exit(1);
  }

  // [7/7] 合并到 main + 打 tag
  console.log('\n  [7/7] 合并到 main 并打 tag...');
  if (!branchExists('main')) {
    run('git checkout -b main');
    run(`git checkout ${srcBranch}`);
  }

  run('git checkout main');

  try {
    run(`git merge ${srcBranch} --no-ff -m "merge: ${srcBranch} → main v${nextVer}"`);
  } catch {
    console.error('\n  ❌ 合并冲突! 请手动解决:');
    console.error('     git add . && git commit');
    process.exit(1);
  }

  // 打 tag
  if (tagExists(`v${nextVer}`)) {
    run(`git tag -d v${nextVer}`);
  }
  run(`git tag -a v${nextVer} -m "release: v${nextVer}\n\n${tagMsg}"`);

  // 推送
  if (hasRemote) {
    try {
      run('git push origin main --tags');
      run(`git push origin ${srcBranch}`);
    } catch {
      console.error('\n  ⚠️  推送失败，请手动推送:');
      console.error('     git push origin main --tags');
      console.error(`     git push origin ${srcBranch}`);
    }
  }

  // 切回原分支
  run(`git checkout ${srcBranch}`);

  console.log(`\n  ✅ 全部完成!`);
  console.log(`     发布: @i17hush/h5-utils@${nextVer}`);
  console.log(`     main: 已合并并打 tag v${nextVer}`);
  console.log(`     当前: 已切回 ${srcBranch}\n`);
}

main();
