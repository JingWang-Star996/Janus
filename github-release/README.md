# 王鲸游戏工作室 - OpenClaw 技能集

🎮 游戏开发相关的 AI 助手技能集合 | 🛡️ 包含 ClawGuard 安全工具

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Skills](https://img.shields.io/badge/skills-7+-green.svg)

---

## 📦 技能列表

### 游戏开发核心

| 技能 | 说明 | 安装 |
|------|------|------|
| **game-producer-wangjing** | 游戏制作人 AI Agent | [下载](skills/game-producer-wangjing.skill) |
| **pmo-project-manager** | 项目管理专员 | [下载](skills/pmo-project-manager.skill) |
| **weekly-report-master** | 周报处理 AI | [下载](skills/weekly-report-master.skill) |

### 飞书集成

| 技能 | 说明 | 安装 |
|------|------|------|
| **feishu-content-reviewer** | 飞书内容审查 | [下载](skills/feishu-content-reviewer.skill) |
| **feishu-sheet-formula** | 飞书表格公式助手 | [下载](skills/feishu-sheet-formula.skill) |
| **feishu-article-writer** | 飞书文章写作 | [下载](skills/feishu-article-writer.skill) |

### 自动化工具

| 技能 | 说明 | 安装 |
|------|------|------|
| **web-page-generator** | 网页生成器 | [下载](skills/web-page-generator.skill) |
| **bug-tracker-automation** | BUG 追踪自动化 | [下载](skills/bug-tracker-automation.skill) |
| **ai-onboarding-flow** | AI 入职流程 | [下载](skills/ai-onboarding-flow.skill) |
| **worldview-learner** | 世界观学习器 | [下载](skills/worldview-learner.skill) |

### 安全工具

| 工具 | 说明 | 安装 |
|------|------|------|
| **ClawGuard** | OpenClaw 安全审计工具 | [查看](clawguard/) |

---

## 🚀 快速开始

### 方法 1：手动安装（推荐新手）

```bash
# 1. 下载 .skill 文件
wget https://github.com/starmark996/openclaw-skills/raw/main/skills/game-producer-wangjing.skill

# 2. 放到 OpenClaw 技能目录
mv game-producer-wangjing.skill ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/

# 3. 重启 OpenClaw
openclaw gateway restart
```

### 方法 2：使用 ClawHub（推荐）

```bash
# 安装 ClawHub CLI
npm install -g clawhub

# 登录
clawhub login

# 安装技能
clawhub install game-producer-wangjing
clawhub install web-page-generator
```

### 方法 3：Git 克隆（开发者）

```bash
# 克隆整个仓库
git clone https://github.com/starmark996/openclaw-skills.git

# 进入目录
cd openclaw-skills/skills

# 复制所有技能
cp *.skill ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/
```

---

## 📖 使用文档

每个技能都有独立的文档：

- **技能源码**：`src/技能名/SKILL.md`
- **使用说明**：查看对应技能的 README
- **安全工具**：`clawguard/README.md`

---

## 🛠️ 开发指南

### 打包技能

```bash
# 打包单个技能
clawhub pack ./src/game-producer-wangjing

# 打包所有技能
./scripts/publish-all.sh
```

### 发布到 ClawHub

```bash
# 登录
clawhub login

# 发布
clawhub publish skills/game-producer-wangjing.skill
```

### 更新技能

```bash
# 修改代码后
git add .
git commit -m "v1.1.0: 修复 XXX 问题"
git push

# 更新 ClawHub
clawhub publish skills/xxx.skill --update
```

---

## 📊 技能统计

- **总技能数**：7+
- **总下载量**：统计中...
- **平均评分**：待评价
- **最后更新**：2026-03-21

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 📞 联系方式

- **作者**：王鲸（jing）
- **GitHub**：[@starmark996](https://github.com/starmark996)
- **小红书**：@王鲸的游戏制作笔记
- **邮箱**：nyale1024@gmail.com

---

## 🎯 核心目标

> 让游戏开发更高效，让 AI 助手更安全

**核心指标**：
- 次留（Day 1）：50%
- 7 日留存（Day 7）：20%
- 30 日留存（Day 30）：10%
- 广告 CVR：40%+

---

**Made with ❤️ by 王鲸游戏工作室**
