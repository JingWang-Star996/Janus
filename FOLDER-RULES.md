# 📁 Workspace 文件夹管理规范

**版本**：v1.0  
**创建日期**：2026-03-11  
**最后更新**：2026-03-11

---

## 📋 目录结构

```
workspace/
├── 📁 projects/          # 项目文件（代码、脚本、配置）
├── 📁 games/             # 游戏项目（HTML、JS 游戏文件）
├── 📁 outputs/           # 输出文件（生成的网页、文档、报告）
├── 📁 skills/            # 开发中的技能（未发布）
├── 📁 skills-public/     # 已发布的公共技能（.skill 文件）
├── 📁 docs/              # 文档（说明、报告、笔记）
├── 📁 temp/              # 临时文件（测试、缓存、日志）
├── 📁 agents/            # Agent 配置文件
├── 📁 memory/            # 记忆文件（日常笔记）
│
├── 📄 AGENTS.md          # 工作区指南
├── 📄 SOUL.md            # AI 人设
├── 📄 IDENTITY.md        # 身份信息
├── 📄 USER.md            # 用户信息
├── 📄 TOOLS.md           # 工具笔记
├── 📄 HEARTBEAT.md       # 心跳任务
├── 📄 FOLDER-RULES.md    # 文件夹规范（本文件）
│
└── 🖼️ avatar.png         # 头像文件
```

---

## 📂 各目录用途

### 1. `projects/` - 项目文件

**用途**：存放各类项目代码、脚本、配置文件

**示例**：
- `avatar-prompt.txt` - 头像生成提示词
- `generate_avatar.py` - 头像生成脚本
- `hongshubao.sh` - 小红书相关脚本
- `xxx-project/` - 项目文件夹

**规则**：
- ✅ 代码文件、脚本、配置文件
- ✅ 项目相关资源
- ❌ 不要放临时文件

---

### 2. `games/` - 游戏项目

**用途**：存放游戏相关文件（HTML、JS、游戏资源）

**示例**：
- `breakout.html` - 打砖块游戏
- `breakout-mobile.html` - 移动版打砖块
- `tetris.html` - 俄罗斯方块
- `tetris.js` - 俄罗斯方块逻辑

**规则**：
- ✅ 游戏 HTML、JS、CSS 文件
- ✅ 游戏资源（图片、音频）
- ❌ 不要放非游戏项目

---

### 3. `outputs/` - 输出文件

**用途**：存放生成的、用于分享/展示的文件

**示例**：
- `wangjing-game-advice.html` - 游戏建议网页
- `wangjing-game-advice-full.html` - 完整版游戏建议
- `wangjing-chat.html` - 王鲸聊天界面
- `report-20260311.html` - 生成的报告

**规则**：
- ✅ 生成的 HTML 网页
- ✅ 用于分享的文档
- ✅ 最终版本文件
- ❌ 不要放草稿、临时文件

---

### 4. `skills/` - 开发中技能

**用途**：存放正在开发、测试的技能（未发布）

**示例**：
- `game-producer-wangjing/` - 王鲸技能（开发中）
- `web-page-generator/` - 网页生成器（开发中）
- `xiaohongshu/` - 小红书技能
- `xiaohongshu-skills/` - 小红书技能集

**规则**：
- ✅ 技能开发目录
- ✅ 测试中的技能
- ✅ 包含 SKILL.md、scripts/、references/
- ❌ 不要放已打包的.skill 文件

---

### 5. `skills-public/` - 已发布技能

**用途**：存放已打包的.skill 文件，准备发布或已发布

**示例**：
- `game-producer-wangjing.skill` - 王鲸技能包
- `web-page-generator.skill` - 网页生成器技能包

**规则**：
- ✅ 已打包的.skill 文件
- ✅ 准备发布的技能
- ❌ 不要放未打包的技能目录

---

### 6. `docs/` - 文档

**用途**：存放说明文档、报告、笔记、教程

**示例**：
- `王鲸聊天室 - 使用说明.md` - 使用说明
- `王鲸聊天室 - 技术复盘报告.md` - 技术报告
- `model-router.md` - 模型路由文档
- `tutorial-xxx.md` - 教程文档

**规则**：
- ✅ Markdown 文档
- ✅ 使用说明、教程
- ✅ 技术报告、复盘
- ❌ 不要放代码文件

---

### 7. `temp/` - 临时文件

**用途**：存放临时文件、测试文件、日志、缓存

**示例**：
- `wangjing-server.py` - 临时服务器脚本
- `wangjing-monitor.py` - 临时监控脚本
- `wangjing-input.txt` - 临时输入文件
- `wangjing-output.txt` - 临时输出文件
- `*.log` - 日志文件
- `test-xxx.html` - 测试文件

**规则**：
- ✅ 临时文件、测试文件
- ✅ 日志、缓存
- ✅ 可以定期清理
- ❌ 不要放重要文件

**清理策略**：
- 每周清理一次
- 保留不超过 7 天的文件
- 重要文件及时移到其他目录

---

### 8. `agents/` - Agent 配置

**用途**：存放 Agent 相关配置文件

**示例**：
- `xxx-agent.json` - Agent 配置
- `prompts/` - 提示词模板

**规则**：
- ✅ Agent 配置文件
- ✅ 提示词模板
- ❌ 不要放其他内容

---

### 9. `memory/` - 记忆文件

**用途**：存放日常记忆笔记（按 AGENTS.md 规范）

**示例**：
- `2026-03-11.md` - 每日记忆
- `2026-03-10.md` - 每日记忆

**规则**：
- ✅ 日常记忆笔记
- ✅ 格式：`YYYY-MM-DD.md`
- ❌ 不要放其他文件

---

## 📝 文件命名规范

### 通用规则

1. **使用小写字母**
   - ✅ `wangjing-game-advice.html`
   - ❌ `WangjingGameAdvice.html`

2. **使用连字符分隔**
   - ✅ `game-advice.html`
   - ❌ `game_advice.html`
   - ❌ `gameAdvice.html`

3. **中文文件名（仅限 docs/）**
   - ✅ `王鲸聊天室 - 使用说明.md`
   - ✅ `技术复盘报告.md`

4. **包含日期（如适用）**
   - ✅ `report-20260311.html`
   - ✅ `backup-2026-03-11.zip`

---

### 各目录命名规范

#### `projects/`
```
[项目名].[扩展名]
[项目名]/  (项目文件夹)
```

示例：
- `generate_avatar.py`
- `hongshubao.sh`
- `avatar-prompt.txt`

#### `games/`
```
[游戏名]-[版本/平台].[扩展名]
```

示例：
- `breakout.html`
- `breakout-mobile.html`
- `breakout-v2.html`
- `tetris.js`

#### `outputs/`
```
[主题]-[描述]-[日期].[扩展名]
```

示例：
- `wangjing-game-advice.html`
- `wangjing-game-advice-full.html`
- `report-20260311.html`

#### `skills/`
```
[技能名]/  (技能目录)
```

示例：
- `game-producer-wangjing/`
- `web-page-generator/`

#### `skills-public/`
```
[技能名].skill
```

示例：
- `game-producer-wangjing.skill`
- `web-page-generator.skill`

#### `docs/`
```
[主题] - [类型].md
```

示例：
- `王鲸聊天室 - 使用说明.md`
- `王鲸聊天室 - 技术复盘报告.md`
- `model-router.md`

#### `temp/`
```
[临时名]-[日期].[扩展名]
```

示例：
- `wangjing-server.py`
- `test-20260311.html`
- `server.log`

---

## 🔄 文件流转规范

### 新项目创建流程

```
1. 在 projects/ 创建项目文件
   ↓
2. 开发测试（temp/ 可放临时文件）
   ↓
3. 完成后：
   - 游戏 → games/
   - 网页 → outputs/
   - 技能 → skills/ → skills-public/
   - 文档 → docs/
```

### 技能开发流程

```
1. 初始化技能 → skills/[技能名]/
   ↓
2. 开发测试 → skills/[技能名]/
   ↓
3. 打包技能 → skills-public/[技能名].skill
   ↓
4. 发布到 ClawHub（可选）
```

### 网页生成流程

```
1. 生成 HTML → temp/[临时名].html
   ↓
2. 审核修改 → outputs/[正式名].html
   ↓
3. 清理临时文件 → rm temp/[临时名].html
```

---

## 🧹 清理规范

### 每日清理
- `temp/` 中的日志文件（保留最近 3 天）
- 测试文件（test-*.html）

### 每周清理
- `temp/` 中超过 7 天的文件
- 无用的临时脚本

### 每月清理
- `outputs/` 中的旧版本（保留最新版）
- `skills-public/` 中的旧版本技能包

---

## 📌 快速参考

| 文件类型 | 存放位置 | 示例 |
|----------|----------|------|
| Python 脚本 | `projects/` | `generate_avatar.py` |
| Shell 脚本 | `projects/` | `hongshubao.sh` |
| 游戏 HTML | `games/` | `breakout.html` |
| 游戏 JS | `games/` | `tetris.js` |
| 分享网页 | `outputs/` | `wangjing-game-advice.html` |
| 技能目录 | `skills/` | `game-producer-wangjing/` |
| 技能包 | `skills-public/` | `game-producer-wangjing.skill` |
| 使用说明 | `docs/` | `使用说明.md` |
| 技术报告 | `docs/` | `技术复盘报告.md` |
| 临时文件 | `temp/` | `server.py`, `*.log` |
| 记忆笔记 | `memory/` | `2026-03-11.md` |

---

## ⚠️ 注意事项

1. **根目录保持整洁**
   - 只保留配置文件（AGENTS.md、SOUL.md 等）
   - 不要直接在根目录创建文件

2. **及时归档**
   - 完成的项目及时移到对应目录
   - 临时文件用完即删

3. **版本管理**
   - 重要文件使用 Git 管理
   - 生成文件标注日期或版本号

4. **中文文件名**
   - 仅在 `docs/` 使用中文文件名
   - 其他目录尽量用英文

---

## 🚀 使用示例

### 场景 1：生成分享网页

```bash
# 1. 生成到 temp/
生成文件 → temp/wangjing-advice.html

# 2. 审核后移到 outputs/
mv temp/wangjing-advice.html outputs/wangjing-game-advice.html

# 3. 清理临时文件
rm temp/wangjing-advice.html
```

### 场景 2：开发新技能

```bash
# 1. 初始化技能
mkdir skills/my-new-skill/

# 2. 开发
编辑 skills/my-new-skill/SKILL.md

# 3. 打包
package_skill.py skills/my-new-skill/
→ skills-public/my-new-skill.skill
```

### 场景 3：创建游戏项目

```bash
# 1. 开发游戏
生成文件 → games/my-game.html

# 2. 迭代版本
games/my-game-v2.html
games/my-game-mobile.html
```

---

## 📊 目录统计（定期更新）

| 目录 | 文件数 | 大小 | 最后更新 |
|------|--------|------|----------|
| `projects/` | - | - | - |
| `games/` | - | - | - |
| `outputs/` | - | - | - |
| `skills/` | - | - | - |
| `skills-public/` | - | - | - |
| `docs/` | - | - | - |
| `temp/` | - | - | - |

---

**遵守规范，保持整洁，提高效率！** 🎯
