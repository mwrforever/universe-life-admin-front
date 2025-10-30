@echo off
setlocal enabledelayedexpansion

REM 万象生活项目代码检查和清理工具
REM 专用于清理无用组件、解决项目警告、优化代码质量

echo 🚀 万象生活项目代码检查工具
echo ==================================================
echo 项目路径: %CD%
echo 检查时间: %date% %time%
echo.

REM 初始化计数器
set /a ERRORS=0
set /a WARNINGS=0
set /a UNUSED_FILES=0

REM 检查TypeScript编译
echo 🔍 检查项目警告和编译问题...
echo 📋 检查 TypeScript 编译...
npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ TypeScript 编译检查通过
) else (
    echo ⚠️ TypeScript 编译发现问题，请查看详细输出：
    npm run type-check
    set /a WARNINGS+=1
)

REM 检查ESLint
echo 📋 检查 ESLint 规则...
npm run lint:check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ESLint 检查通过
) else (
    echo ⚠️ ESLint 发现问题，建议运行 npm run lint 修复：
    npm run lint:check
    set /a WARNINGS+=1
)

REM 检查未使用的组件
echo.
echo 🧹 检查无用的组件和文件...

if not exist "src" (
    echo ⚠️ src 目录不存在
    set /a WARNINGS+=1
) else (
    echo ℹ️ 正在扫描组件文件...

    REM 简单检查一些可能未使用的文件模式
    if exist "src\components\*.test.*" (
        echo 🧹 发现测试文件，请确认是否需要清理：
        dir /b src\components\*.test.* 2>nul
        set /a UNUSED_FILES+=1
    )

    if exist "src\components\Test*" (
        echo 🧹 发现测试相关文件：
        dir /b src\components\Test* 2>nul
        set /a UNUSED_FILES+=1
    )

    if !UNUSED_FILES! equ 0 (
        echo ✅ 没有发现明显未使用的组件文件
    )
)

REM 检查依赖
echo.
echo 📦 检查可能的未使用依赖包...

if exist "package.json" (
    echo ℹ️ 依赖检查需要手动确认，以下是一些可能需要关注的包：

    REM 检查一些可能未常用的依赖
    findstr /C:"@types/lodash-es" package.json >nul 2>&1
    if !errorlevel! equ 0 (
        echo 🧹 请检查 @types/lodash-es 的使用情况
    )

    findstr /C:"framer-motion" package.json >nul 2>&1
    if !errorlevel! equ 0 (
        echo 🧹 请检查 framer-motion 的使用情况
    )

    findstr /C:"recharts" package.json >nul 2>&1
    if !errorlevel! equ 0 (
        echo 🧹 请检查 recharts 的使用情况
    )
) else (
    echo ⚠️ package.json 文件不存在
    set /a ERRORS+=1
)

REM 生成报告
echo.
echo 📊 代码检查报告
echo ==================================================
echo 📈 检查统计:
echo    错误: %ERRORS%
echo    警告: %WARNINGS%
echo    未使用文件: %UNUSED_FILES%
set /a TOTAL=ERRORS+WARNINGS+UNUSED_FILES
echo    总问题数: %TOTAL%

if %UNUSED_FILES% gtr 0 (
    echo.
    echo 🗑️ 可清理的文件数量: %UNUSED_FILES%
    echo 💡 修复建议:
    echo    1. 手动检查上述未使用的文件
    echo    2. 确认文件确实未被使用后删除
    echo    3. 运行 npm run lint 自动修复一些问题
    echo    4. 定期运行此检查工具保持代码质量
) else (
    echo.
    echo 💡 项目代码质量良好！
    echo    建议：定期运行此检查工具保持代码质量
)

echo.
if %ERRORS% gtr 0 (
    echo ❌ 检查完成，发现 %ERRORS% 个错误，请优先解决
    exit /b 1
) else (
    echo ✅ 代码检查完成！
    exit /b 0
)