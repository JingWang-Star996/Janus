#!/bin/bash
# 红薯包 - 小红书内容助手 快速启动脚本

AGENT_DIR="$HOME/.openclaw/agents/hongshubao"
SKILLS_DIR="$HOME/.openclaw/workspace/skills/xiaohongshu-skills"

echo "🍠 红薯包 - 小红书内容助手"
echo "================================"
echo ""

# 检查技能是否安装
if [ ! -d "$SKILLS_DIR" ]; then
    echo "❌ 小红书技能未安装"
    echo "正在安装..."
    mkdir -p "$HOME/.openclaw/workspace/skills/"
    git clone https://github.com/autoclaw-cc/xiaohongshu-skills.git "$SKILLS_DIR"
    cd "$SKILLS_DIR"
    export PATH="$HOME/.local/bin:$PATH"
    uv sync
fi

# 检查 Chrome
if ! command -v chromium-browser &> /dev/null && ! command -v google-chrome &> /dev/null; then
    echo "⚠️  未检测到 Chrome/Chromium 浏览器"
    echo "发布功能需要浏览器，请安装："
    echo "  sudo apt-get install -y chromium-browser"
    echo ""
fi

echo "✅ 红薯包已就绪！"
echo ""
echo "你可以对我说："
echo "  - 帮我写一篇小红书笔记，主题是 XXX"
echo "  - 给我的产品写个种草文案"
echo "  - 分析一下这个领域的爆款笔记"
echo "  - 规划一周的发布内容"
echo ""
echo "================================"
