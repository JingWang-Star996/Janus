# 技能发布指南

**创建时间**：2026-03-21  
**适用对象**：王鲸游戏工作室 OpenClaw 技能

---

## 📦 可发布的技能清单

### 已完成打包的技能（`skills-public/`）

| 技能名 | 说明 | 状态 |
|--------|------|------|
| `game-producer-wangjing` | 游戏制作人 AI Agent | ✅ 已打包 |
| `web-page-generator` | 网页生成器 | ✅ 已打包 |
| `feishu-content-reviewer` | 飞书内容审查 | ✅ 已打包 |
| `feishu-sheet-formula` | 飞书表格公式助手 | ✅ 已打包 |
| `bug-tracker-automation` | BUG 追踪自动化 | ✅ 已打包 |
| `ai-onboarding-flow` | AI 入职流程 | ✅ 已打包 |
| `worldview-learner` | 世界观学习器 | ✅ 已打包 |

### 需要打包的技能（`skills/`）

| 技能名 | 说明 | 状态 |
|--------|------|------|
| `feishu-article-writer` | 飞书文章写作 | ⏳ 待打包 |
| `pmo-project-manager` | 项目管理专员 | ⏳ 待打包 |
| `weekly-report-master` | 周报处理 AI | ⏳ 待打包 |
| `xiaohongshu-*` | 小红书运营套件 | ⏳ 待打包 |

---

## 🚀 发布方案

### 方案 A：发布到 GitHub（推荐新手）

**优点**：
- ✅ 完全免费
- ✅ 代码公开透明
- ✅ 便于版本管理
- ✅ 可作为作品集

**缺点**：
- ❌ 需要用户手动下载安装
- ❌ 没有自动更新机制

#### 步骤

**1. 注册 GitHub 账号**
```
访问：https://github.com/signup
用户名建议：starmark996（和你的小红书一致）
```

**2. 创建公开仓库**
```
仓库名：openclaw-skills
描述：王鲸游戏工作室 - OpenClaw 技能集合
可见性：Public（公开）
初始化：勾选 "Add a README file"
```

**3. 准备发布文件**

在本地执行以下命令打包所有技能：

```bash
cd /home/z3129119/.openclaw/workspace

# 创建发布目录
mkdir -p github-release/skills

# 复制已打包的技能
cp skills-public/*.skill github-release/skills/

# 复制技能源码（可选，方便别人学习）
cp -r skills/ github-release/

# 生成技能清单
cat > github-release/README.md << 'EOF'
# 王鲸游戏工作室 - OpenClaw 技能集

🎮 游戏开发相关的 AI 助手技能集合

## 已发布技能

| 技能 | 说明 | 下载 |
|------|------|------|
| game-producer-wangjing | 游戏制作人 AI | [下载](skills/game-producer-wangjing.skill) |
| web-page-generator | 网页生成器 | [下载](skills/web-page-generator.skill) |
| feishu-content-reviewer | 飞书内容审查 | [下载](skills/feishu-content-reviewer.skill) |
| feishu-sheet-formula | 飞书表格公式 | [下载](skills/feishu-sheet-formula.skill) |
| bug-tracker-automation | BUG 追踪自动化 | [下载](skills/bug-tracker-automation.skill) |
| ai-onboarding-flow | AI 入职流程 | [下载](skills/ai-onboarding-flow.skill) |
| worldview-learner | 世界观学习器 | [下载](skills/worldview-learner.skill) |

## 安装方法

### 方法 1：手动安装
1. 下载 `.skill` 文件
2. 放到 OpenClaw 技能目录：`~/.openclaw/skills/`
3. 重启 OpenClaw

### 方法 2：使用 ClawHub（推荐）
\`\`\`bash
clawhub install starmark996/openclaw-skills/skill-name
\`\`\`

## 使用说明

每个技能都有独立的 SKILL.md 文件，包含详细的使用说明。

## 许可证

MIT License

## 联系

作者：王鲸（jing）
EOF
```

**4. 上传到 GitHub**

```bash
cd github-release

# 初始化 Git
git init
git add .
git commit -m "Initial release: 7 OpenClaw skills for game development"

# 关联远程仓库（创建仓库后替换 URL）
git remote add origin https://github.com/starmark996/openclaw-skills.git
git branch -M main
git push -u origin main
```

**5. 创建 GitHub Release（可选）**

访问：https://github.com/starmark996/openclaw-skills/releases
- 点击 "Create a new release"
- Tag version: `v1.0.0`
- Release title: `v1.0.0 - 初始发布`
- 描述：发布 7 个游戏开发相关技能
- 上传所有 `.skill` 文件作为附件

---

### 方案 B：发布到 ClawHub（官方市场）

**优点**：
- ✅ 用户可以直接 `clawhub install` 安装
- ✅ 支持自动更新
- ✅ 官方流量曝光

**缺点**：
- ❌ 需要注册 clawhub.com 账号
- ❌ 需要审核（通常很快）

#### 步骤

**1. 注册 ClawHub 账号**
```
访问：https://clawhub.com
点击 Sign Up 注册
```

**2. 登录 CLI**
```bash
clawhub login
# 会打开浏览器让你授权
```

**3. 发布技能**
```bash
cd /home/z3129119/.openclaw/workspace

# 逐个发布技能
clawhub publish skills-public/game-producer-wangjing.skill
clawhub publish skills-public/web-page-generator.skill
clawhub publish skills-public/feishu-content-reviewer.skill
# ... 其他技能
```

**4. 验证发布**
```bash
# 搜索你发布的技能
clawhub search wangjing

# 查看技能详情
clawhub info game-producer-wangjing
```

---

### 方案 C：两者都发（最佳实践）

**推荐流程**：
1. 先发布到 GitHub（作为代码仓库）
2. 再发布到 ClawHub（作为分发渠道）
3. GitHub README 中提供 ClawHub 安装命令
4. ClawHub 页面链接回 GitHub 仓库

---

## 📝 发布前检查清单

### 每个技能必须包含

- [ ] `SKILL.md` - 技能定义文件（必需）
- [ ] `README.md` - 使用说明（推荐）
- [ ] `_meta.json` - 元数据（可选，clawhub 需要）
- [ ] 许可证文件（推荐 MIT）

### 代码质量检查

- [ ] 移除敏感信息（API Key、密码等）
- [ ] 检查硬编码的路径（改为相对路径）
- [ ] 添加错误处理
- [ ] 测试基本功能

### 文档检查

- [ ] 技能名称清晰
- [ ] 使用场景说明
- [ ] 安装步骤完整
- [ ] 使用示例充分
- [ ] 常见问题 FAQ

---

## 🔧 自动化脚本

### 一键打包所有技能

创建脚本 `scripts/publish-all.sh`：

```bash
#!/bin/bash

WORKSPACE="/home/z3129119/.openclaw/workspace"
PUBLISH_DIR="$WORKSPACE/github-release"

echo "🚀 开始打包所有技能..."

# 清理旧文件
rm -rf "$PUBLISH_DIR"
mkdir -p "$PUBLISH_DIR/skills"

# 复制已打包的技能
cp "$WORKSPACE/skills-public"/*.skill "$PUBLISH_DIR/skills/"

# 复制源码
cp -r "$WORKSPACE/skills" "$PUBLISH_DIR/"

# 生成技能清单
echo "📋 生成技能清单..."
cd "$PUBLISH_DIR"
skill_count=$(ls skills/*.skill | wc -l)
echo "✅ 打包完成：$skill_count 个技能"

# 显示文件结构
echo ""
echo "📦 文件结构:"
tree -L 2 "$PUBLISH_DIR" || ls -R "$PUBLISH_DIR"

echo ""
echo "🎉 准备发布！"
echo "下一步："
echo "1. cd $PUBLISH_DIR"
echo "2. git init && git add . && git commit -m 'Release v1.0.0'"
echo "3. git remote add origin https://github.com/starmark996/openclaw-skills.git"
echo "4. git push -u origin main"
```

执行：
```bash
chmod +x scripts/publish-all.sh
./scripts/publish-all.sh
```

---

## 📊 发布后维护

### 版本更新流程

1. 修改技能代码
2. 更新 `_meta.json` 中的版本号
3. 重新打包：`clawhub pack ./skills/xxx`
4. 提交 Git：`git commit -m "v1.1.0: 修复 XXX 问题"`
5. 推送更新：`git push`
6. 更新 ClawHub：`clawhub publish ./skills/xxx.skill --update`

### 收集用户反馈

- GitHub Issues：收集 Bug 和建议
- ClawHub 评论：查看用户评价
- 定期更新：根据反馈改进

---

## 🎯 推荐发布顺序

**第一批（核心技能）**：
1. `game-producer-wangjing` - 你的招牌技能
2. `web-page-generator` - 实用工具

**第二批（飞书系列）**：
3. `feishu-content-reviewer`
4. `feishu-sheet-formula`

**第三批（自动化）**：
5. `bug-tracker-automation`
6. `ai-onboarding-flow`
7. `worldview-learner`

---

## ❓ 常见问题

**Q: 发布后别人怎么安装？**
```bash
# GitHub 方式
# 下载 .skill 文件，放到 ~/.openclaw/skills/

# ClawHub 方式
clawhub install game-producer-wangjing
```

**Q: 可以收费吗？**
A: ClawHub 支持付费技能，但需要设置价格。GitHub 完全免费。

**Q: 发布后能修改吗？**
A: 可以！修改后重新发布即可，ClawHub 支持版本更新。

**Q: 需要许可证吗？**
A: 建议添加 MIT 许可证，明确使用权限。

---

## 📞 需要帮助？

执行以下命令生成发布报告：
```bash
./scripts/generate-publish-report.sh
```

或者直接说："帮我发布 xxx 技能到 GitHub"

---

**最后更新**：2026-03-21  
**维护者**：王鲸游戏工作室
