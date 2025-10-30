#!/usr/bin/env node

/**
 * 万象生活项目代码检查和清理工具
 * 专用于清理无用组件、解决项目警告、优化代码质量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.srcDir = path.join(this.projectRoot, 'src');
    this.issues = [];
    this.unusedFiles = [];
    this.warnings = [];
  }

  // 记录问题
  logIssue(type, message, filePath = null) {
    const issue = {
      type,
      message,
      filePath,
      timestamp: new Date().toISOString()
    };
    this.issues.push(issue);

    const icon = this.getTypeIcon(type);
    const location = filePath ? ` (${path.relative(this.projectRoot, filePath)})` : '';
    console.log(`${icon} ${message}${location}`);
  }

  // 获取问题类型图标
  getTypeIcon(type) {
    const icons = {
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️',
      'success': '✅',
      'cleanup': '🧹'
    };
    return icons[type] || '📝';
  }

  // 检查项目警告
  async checkWarnings() {
    console.log('\n🔍 检查项目警告和编译问题...');

    try {
      // 检查 TypeScript 编译
      console.log('📋 检查 TypeScript 编译...');
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: this.projectRoot });
        this.logIssue('success', 'TypeScript 编译检查通过');
      } catch (tscError) {
        const output = tscError.stderr ? tscError.stderr.toString() : tscError.stdout.toString();
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('error') || line.includes('warning')) {
            this.logIssue('warning', line.trim());
          }
        });
      }

      // 检查 ESLint 警告
      console.log('📋 检查 ESLint 规则...');
      try {
        execSync('npm run lint', { stdio: 'pipe', cwd: this.projectRoot });
        this.logIssue('success', 'ESLint 检查通过');
      } catch (lintError) {
        const output = lintError.stdout ? lintError.stdout.toString() : lintError.stderr.toString();
        const lines = output.split('\n').filter(line => line.trim() && line.includes('⚠'));
        lines.forEach(line => {
          this.logIssue('warning', line.trim());
        });
      }

    } catch (error) {
      this.logIssue('error', `检查过程中出现错误: ${error.message}`);
    }
  }

  // 递归扫描目录获取所有文件
  getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // 检查文件是否被引用
  isFileReferenced(filePath) {
    const relativePath = path.relative(this.srcDir, filePath);
    const possibleImports = [
      relativePath,
      relativePath.replace(/\.(tsx?|jsx?)$/, ''),
      relativePath.replace(/\.(tsx?|jsx?)$/, '.js'),
      relativePath.replace(/\.(tsx?|jsx?)$/, '.ts'),
      relativePath.replace(/\.(tsx?|jsx?)$/, '.jsx'),
      relativePath.replace(/\.(tsx?|jsx?)$/, '.tsx'),
      `./${relativePath}`,
      `../${relativePath}`,
      `@/${relativePath.replace(/\\/g, '/')}`,
    ];

    const allFiles = this.getAllFiles(this.srcDir);

    for (const file of allFiles) {
      if (file === filePath) continue;

      try {
        const content = fs.readFileSync(file, 'utf8');

        for (const importPath of possibleImports) {
          const normalizedImport = importPath.replace(/\\/g, '/');
          const normalizedRelative = relativePath.replace(/\\/g, '/');

          if (content.includes(normalizedImport) ||
              content.includes(normalizedRelative) ||
              content.includes(path.basename(relativePath, path.extname(relativePath)))) {
            return true;
          }
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return false;
  }

  // 检查无用组件和文件
  async checkUnusedComponents() {
    console.log('\n🧹 检查无用的组件和文件...');

    if (!fs.existsSync(this.srcDir)) {
      this.logIssue('warning', 'src 目录不存在');
      return;
    }

    const allFiles = this.getAllFiles(this.srcDir);
    const componentFiles = allFiles.filter(file =>
      file.includes('components') ||
      file.includes('pages') ||
      file.includes('layouts') ||
      file.includes('hooks') ||
      file.includes('utils') ||
      file.includes('services')
    );

    for (const file of componentFiles) {
      // 跳过一些特殊文件
      if (file.includes('index.tsx') ||
          file.includes('index.ts') ||
          file.includes('main.tsx') ||
          file.includes('App.tsx') ||
          file.includes('vite-env')) {
        continue;
      }

      const isReferenced = this.isFileReferenced(file);

      if (!isReferenced) {
        const relativePath = path.relative(this.projectRoot, file);
        this.unusedFiles.push({
          path: file,
          relativePath,
          size: fs.statSync(file).size
        });
        this.logIssue('cleanup', `未使用的文件: ${relativePath}`, file);
      }
    }

    if (this.unusedFiles.length === 0) {
      this.logIssue('success', '没有发现未使用的组件文件');
    }
  }

  // 检查 package.json 中的无用依赖
  async checkUnusedDependencies() {
    console.log('\n📦 检查未使用的依赖包...');

    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const allDeps = [...dependencies, ...devDependencies];
      const unusedDeps = [];

      for (const dep of allDeps) {
        if (dep.startsWith('@types/')) continue; // 跳过类型定义

        const isUsed = this.isDependencyUsed(dep);
        if (!isUsed) {
          unusedDeps.push(dep);
          this.logIssue('cleanup', `可能未使用的依赖: ${dep}`);
        }
      }

      if (unusedDeps.length === 0) {
        this.logIssue('success', '所有依赖包都在使用中');
      }

    } catch (error) {
      this.logIssue('error', `检查依赖包时出错: ${error.message}`);
    }
  }

  // 检查依赖是否被使用
  isDependencyUsed(depName) {
    const allFiles = this.getAllFiles(this.srcDir, ['.ts', '.tsx', '.js', '.jsx', '.json']);

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // 检查 import 语句
        if (content.includes(`from '${depName}'`) ||
            content.includes(`from "${depName}"`) ||
            content.includes(`require('${depName}')`) ||
            content.includes(`require("${depName}")`) ||
            content.includes(`import * as ${depName}`) ||
            content.includes(`import ${depName}`)) {
          return true;
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    return false;
  }

  // 生成清理报告
  generateReport() {
    console.log('\n📊 代码检查报告');
    console.log('='.repeat(50));

    const summary = {
      totalIssues: this.issues.length,
      errors: this.issues.filter(i => i.type === 'error').length,
      warnings: this.issues.filter(i => i.type === 'warning').length,
      unusedFiles: this.unusedFiles.length,
      cleanupIssues: this.issues.filter(i => i.type === 'cleanup').length
    };

    console.log(`📈 检查统计:`);
    console.log(`   总问题数: ${summary.totalIssues}`);
    console.log(`   错误: ${summary.errors}`);
    console.log(`   警告: ${summary.warnings}`);
    console.log(`   未使用文件: ${summary.unusedFiles}`);
    console.log(`   清理项: ${summary.cleanupIssues}`);

    if (this.unusedFiles.length > 0) {
      console.log('\n🗑️ 可清理的文件:');
      const totalSize = this.unusedFiles.reduce((sum, file) => sum + file.size, 0);
      console.log(`   文件数量: ${this.unusedFiles.length}`);
      console.log(`   可节省空间: ${(totalSize / 1024).toFixed(2)} KB`);

      this.unusedFiles.forEach(file => {
        console.log(`   - ${file.relativePath}`);
      });
    }

    // 生成修复建议
    console.log('\n💡 修复建议:');
    if (summary.errors > 0) {
      console.log('   1. 优先解决所有错误，确保项目可以正常编译');
    }
    if (summary.warnings > 0) {
      console.log('   2. 修复警告，提高代码质量');
    }
    if (this.unusedFiles.length > 0) {
      console.log('   3. 删除未使用的文件，保持代码库整洁');
      console.log('   4. 运行 npm run lint:fix 自动修复一些 ESLint 问题');
    }
    console.log('   5. 定期运行此检查工具保持代码质量');
  }

  // 自动清理功能（需要用户确认）
  async autoCleanup() {
    if (this.unusedFiles.length === 0) {
      console.log('\n✅ 没有需要清理的文件');
      return;
    }

    console.log('\n⚠️ 自动清理功能');
    console.log('以下文件将被永久删除:');

    this.unusedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.relativePath}`);
    });

    console.log('\n请确认是否要删除这些文件? (y/N)');

    // 由于是脚本，我们提供备份建议而不是直接删除
    console.log('💡 建议手动删除这些文件，或者先创建备份:');
    console.log('   git add . && git commit -m "备份：清理前提交"');
    console.log('   然后逐个检查并删除未使用的文件');
  }

  // 主执行方法
  async run() {
    console.log('🚀 万象生活项目代码检查工具');
    console.log('='.repeat(50));
    console.log(`项目路径: ${this.projectRoot}`);
    console.log(`检查时间: ${new Date().toLocaleString()}`);

    await this.checkWarnings();
    await this.checkUnusedComponents();
    await this.checkUnusedDependencies();

    this.generateReport();
    await this.autoCleanup();

    console.log('\n✅ 代码检查完成！');
    process.exit(this.issues.filter(i => i.type === 'error').length > 0 ? 1 : 0);
  }
}

// 运行检查器
if (require.main === module) {
  const checker = new CodeChecker();
  checker.run().catch(error => {
    console.error('❌ 检查过程中出现错误:', error);
    process.exit(1);
  });
}

module.exports = CodeChecker;