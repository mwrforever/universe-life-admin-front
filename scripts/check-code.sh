#!/bin/bash

# 万象生活项目代码检查和清理工具
# 专用于清理无用组件、解决项目警告、优化代码质量

set -e

echo "🚀 万象生活项目代码检查工具"
echo "=================================================="
echo "项目路径: $(pwd)"
echo "检查时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 计数器
ERRORS=0
WARNINGS=0
UNUSED_FILES=0

# 日志函数
log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
    ((WARNINGS++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

log_cleanup() {
    echo -e "${PURPLE}🧹 $1${NC}"
}

# 检查TypeScript编译
echo "🔍 检查项目警告和编译问题..."
echo "📋 检查 TypeScript 编译..."
if npm run type-check > /dev/null 2>&1; then
    log_success "TypeScript 编译检查通过"
else
    log_warning "TypeScript 编译发现问题，请查看详细输出："
    npm run type-check || true
fi

# 检查ESLint
echo "📋 检查 ESLint 规则..."
if npm run lint:check > /dev/null 2>&1; then
    log_success "ESLint 检查通过"
else
    log_warning "ESLint 发现问题，建议运行 npm run lint 修复："
    npm run lint:check || true
fi

# 检查未使用的组件
echo ""
echo "🧹 检查无用的组件和文件..."

if [ ! -d "src" ]; then
    log_warning "src 目录不存在"
else
    # 查找可能未使用的文件
    UNUSED_FILE_LIST=()

    # 检查组件目录
    if [ -d "src/components" ]; then
        for file in src/components/**/*.{ts,tsx,js,jsx}; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                # 跳过重要文件
                if [[ "$filename" == "index.tsx" ]] || [[ "$filename" == "index.ts" ]]; then
                    continue
                fi

                # 简单检查：如果文件名没有在其他文件中被引用
                if ! grep -r "$filename" src/ --include="*.{ts,tsx,js,jsx}" > /dev/null 2>&1; then
                    UNUSED_FILE_LIST+=("$file")
                    log_cleanup "未使用的文件: $file"
                    ((UNUSED_FILES++))
                fi
            fi
        done
    fi

    if [ $UNUSED_FILES -eq 0 ]; then
        log_success "没有发现明显未使用的组件文件"
    fi
fi

# 检查package.json中的依赖
echo ""
echo "📦 检查可能的未使用依赖包..."

if [ -f "package.json" ]; then
    # 这里只是简单检查，实际使用可能更复杂
    log_info "依赖检查需要更复杂的分析，建议手动确认以下包的使用情况："

    # 检查一些可能未常用的依赖
    DEPS_TO_CHECK=("@types/lodash-es" "framer-motion" "recharts" "i18next" "react-i18next")

    for dep in "${DEPS_TO_CHECK[@]}"; do
        if grep -q "$dep" package.json; then
            if ! grep -r "from.*$dep" src/ --include="*.{ts,tsx,js,jsx}" > /dev/null 2>&1; then
                log_cleanup "可能未使用的依赖: $dep"
            fi
        fi
    done
fi

# 生成报告
echo ""
echo "📊 代码检查报告"
echo "=================================================="
echo "📈 检查统计:"
echo "   错误: $ERRORS"
echo "   警告: $WARNINGS"
echo "   未使用文件: $UNUSED_FILES"
echo "   总问题数: $((ERRORS + WARNINGS + UNUSED_FILES))"

if [ $UNUSED_FILES -gt 0 ]; then
    echo ""
    echo "🗑️ 可清理的文件数量: $UNUSED_FILES"
    echo "💡 修复建议:"
    echo "   1. 手动检查上述未使用的文件"
    echo "   2. 确认文件确实未被使用后删除"
    echo "   3. 运行 npm run lint 自动修复一些问题"
    echo "   4. 定期运行此检查工具保持代码质量"
else
    echo ""
    echo "💡 项目代码质量良好！"
    echo "   建议：定期运行此检查工具保持代码质量"
fi

echo ""
if [ $ERRORS -gt 0 ]; then
    log_error "检查完成，发现 $ERRORS 个错误，请优先解决"
    exit 1
else
    log_success "代码检查完成！"
    exit 0
fi