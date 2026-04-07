#!/bin/bash

# 忆匣 (YiXia) 快速推送到 GitHub 脚本
# 使用方法：./QUICK_PUSH.sh <github-username> <repo-name>

set -e

REPO_OWNER="${1:-openclaw}"
REPO_NAME="${2:-janus}"
REMOTE_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.git"

echo "🚀 准备推送忆匣 (YiXia) 到 GitHub"
echo "======================================"
echo "仓库：${REPO_OWNER}/${REPO_NAME}"
echo "URL: ${REMOTE_URL}"
echo ""

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是 git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的更改"
    git status --short
    echo ""
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 已取消"
        exit 1
    fi
    echo "📝 提交未提交的更改..."
    git add -A
    git commit -m "chore: 发布前最后更新"
fi

# 检查远程仓库是否已设置
if ! git remote | grep -q "^origin$"; then
    echo "📍 添加远程仓库..."
    git remote add origin "${REMOTE_URL}"
else
    echo "📍 更新远程仓库 URL..."
    git remote set-url origin "${REMOTE_URL}"
fi

echo ""
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo ""
echo "🏷️  推送标签..."
git push origin v2.0.0

echo ""
echo "✅ 推送完成！"
echo ""
echo "======================================"
echo "📋 下一步:"
echo "1. 访问 https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo "2. 创建 Release: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/new"
echo "   - Tag: v2.0.0"
echo "   - Title: 忆匣 (YiXia) v2.0.0 - 完整第二记忆系统"
echo "   - 描述：复制 GITHUB_RELEASE.md 内容"
echo ""
echo "🎉 祝发布顺利！"
