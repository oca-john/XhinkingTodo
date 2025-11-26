/**
 * 版本号同步脚本
 * 
 * 从 src/version.ts 读取版本号，并自动同步到所有配置文件：
 * - package.json
 * - src-tauri/Cargo.toml
 * - src-tauri/tauri.conf.json
 * - README.md
 * 
 * 使用方法：node scripts/sync-version.js
 */

const fs = require('fs');
const path = require('path');

// 读取 version.ts 文件
function readVersion() {
  const versionFile = path.join(__dirname, '../src/version.ts');
  const content = fs.readFileSync(versionFile, 'utf-8');
  
  // 使用正则表达式提取版本号
  const versionMatch = content.match(/export const APP_VERSION = "(.+?)"/);
  
  if (!versionMatch) {
    throw new Error('无法从 version.ts 中提取版本号');
  }
  
  return versionMatch[1];
}

// 更新 package.json
function updatePackageJson(version) {
  const filePath = path.join(__dirname, '../package.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  content.version = version;
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
  console.log(`✅ 已更新 package.json 版本号为: ${version}`);
}

// 更新 Cargo.toml
function updateCargoToml(version) {
  const filePath = path.join(__dirname, '../src-tauri/Cargo.toml');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 替换版本号
  content = content.replace(
    /^version = ".+?"$/m,
    `version = "${version}"`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已更新 Cargo.toml 版本号为: ${version}`);
}

// 更新 tauri.conf.json
function updateTauriConfig(version) {
  const filePath = path.join(__dirname, '../src-tauri/tauri.conf.json');
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  content.package.version = version;
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
  console.log(`✅ 已更新 tauri.conf.json 版本号为: ${version}`);
}

// 更新 README.md
function updateReadme(version) {
  const filePath = path.join(__dirname, '../README.md');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 更新版本徽章
  content = content.replace(
    /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-.+?-blue\.svg\)/,
    `![Version](https://img.shields.io/badge/version-${version}-blue.svg)`
  );
  
  // 更新底部版本号
  content = content.replace(
    /\*\*XhinkingTodo [\d.]+\*\* \| 思考\. 记录\. 创造/,
    `**XhinkingTodo ${version}** | 思考. 记录. 创造`
  );
  
  // 更新示例代码中的版本号
  content = content.replace(
    /export const APP_VERSION = "[\d.]+";  \/\/ 只需修改这里/,
    `export const APP_VERSION = "${version}";  // 只需修改这里`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 已更新 README.md 版本号为: ${version}`);
}

// 主函数
function main() {
  try {
    console.log('🔄 开始同步版本号...\n');
    
    const version = readVersion();
    console.log(`📦 从 version.ts 读取版本号: ${version}\n`);
    
    updatePackageJson(version);
    updateCargoToml(version);
    updateTauriConfig(version);
    updateReadme(version);
    
    console.log('\n✨ 版本号同步完成！');
    console.log('\n💡 提示：');
    console.log('   - 前端代码已自动引用 version.ts');
    console.log('   - 构建配置文件已更新');
    console.log('   - 现在只需修改 src/version.ts 即可更新所有版本号');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
