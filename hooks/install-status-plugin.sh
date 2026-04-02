#!/bin/bash
# OpenClaw 状态监控插件安装脚本

echo "🔧 OpenClaw 状态监控插件安装程序"
echo "================================"
echo ""

# 检查 OpenClaw 安装路径
OPENCLAW_DIR="$HOME/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw"
PLUGINS_DIR="$OPENCLAW_DIR/plugins"
HOOKS_DIR="$OPENCLAW_DIR/hooks"

echo "检查 OpenClaw 安装..."
if [ ! -d "$OPENCLAW_DIR" ]; then
    echo "❌ OpenClaw 未安装在预期路径：$OPENCLAW_DIR"
    echo "请确认 OpenClaw 已安装"
    exit 1
fi

echo "✅ OpenClaw 已安装：$OPENCLAW_DIR"
echo ""

# 创建插件目录
echo "创建插件目录..."
mkdir -p "$PLUGINS_DIR"
mkdir -p "$HOOKS_DIR"
echo "✅ 目录已创建"
echo ""

# 复制插件文件
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_HOOKS="/home/z3129119/.openclaw/workspace/hooks"

echo "复制插件文件..."
cp "$WORKSPACE_HOOKS/openclaw-status-plugin.py" "$HOOKS_DIR/"
cp "$WORKSPACE_HOOKS/auto-status-hook.py" "$HOOKS_DIR/"
echo "✅ 插件已复制"
echo ""

# 添加到 OpenClaw 配置
echo "更新 OpenClaw 配置..."
CONFIG_FILE="$HOME/.openclaw/openclaw.json"

if [ -f "$CONFIG_FILE" ]; then
    # 备份配置
    cp "$CONFIG_FILE" "$CONFIG_FILE.bak"
    echo "✅ 配置已备份：$CONFIG_FILE.bak"
    
    # 添加插件配置（需要手动编辑）
    echo ""
    echo "⚠️  需要手动编辑配置文件"
    echo ""
    echo "请打开：$CONFIG_FILE"
    echo ""
    echo "在 \"plugins\" 数组中添加：\"status-monitor\""
    echo ""
    echo "示例："
    echo '{'
    echo '  "plugins": ['
    echo '    "status-monitor"'
    echo '  ]'
    echo '}'
    echo ""
else
    echo "⚠️  配置文件不存在：$CONFIG_FILE"
    echo "请先运行：openclaw onboard"
fi

echo ""
echo "================================"
echo "✅ 安装完成！"
echo ""
echo "下一步："
echo "1. 编辑配置文件：$CONFIG_FILE"
echo "2. 添加插件：\"status-monitor\""
echo "3. 重启 Gateway: openclaw gateway restart"
echo "4. 测试：对 AI 说'开始任务：测试'"
echo "5. 刷新网页查看状态"
echo ""
