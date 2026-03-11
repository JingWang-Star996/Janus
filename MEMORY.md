# MEMORY.md - 长期记忆

**最后更新**：2026-03-11

---

## 📌 重要决策与原则

### Token 优化原则（2026-03-11）⭐

**来源**：用户 jing 明确要求

**内容**：
> 交互过程中注意减少不必要的 token 消耗

**具体要求**：
1. **简洁回复** - 避免冗长、重复、废话
2. **精准工具调用** - 只调用必要的工具，避免重复调用
3. **合理分块** - 大文件分块读取，避免一次性加载过多内容
4. **避免冗余上下文** - 不重复已知信息，引用而非复制
5. **优化 Prompt** - 给子代理的指令简洁明确

**为什么重要**：
- 降低 API 成本
- 提高响应速度
- 减少上下文窗口占用
- 提升整体效率

**如何执行**：
- ✅ 能一句话说清楚的，不用两段
- ✅ 能用引用/链接的，不复制全文
- ✅ 能合并的工具调用，不分开
- ✅ 能跳过的步骤，不执行
- ❌ 避免" mental notes"（记在脑子里）→ 写文件
- ❌ 避免重复已知上下文
- ❌ 避免过度解释

**优先级**：高（用户明确要求）

---

## 📋 项目与任务

### 王鲸游戏制作人 Agent（2026-03-11）

- ✅ 创建技能：`game-producer-wangjing`
- ✅ 打包发布：`skills-public/game-producer-wangjing.skill`
- ✅ 创建聊天界面：`outputs/wangjing-chat.html`
- ✅ 生成分享网页：`outputs/wangjing-game-advice-full.html`
- ⚠️ 独立聊天室方案不可行（OpenClaw CLI 限制）
- ✅ 技术复盘报告：`docs/王鲸聊天室 - 技术复盘报告.md`

### 网页生成器技能（2026-03-11）

- ✅ 创建技能：`web-page-generator`
- ✅ 打包发布：`skills-public/web-page-generator.skill`
- ✅ 触发词："做成一个网页发给我"、"生成分享页面"

### 工作区整理（2026-03-11）

- ✅ 创建文件夹规范：`FOLDER-RULES.md`
- ✅ 创建 README：`README.md`
- ✅ 分类目录：projects/, games/, outputs/, skills/, skills-public/, docs/, temp/
- ✅ 清理临时文件
- ✅ Git 提交

---

## 👤 用户信息

### jing（starmark996）

- **称呼**：jing
- **项目**：游戏开发（考虑中）
- **偏好**：
  - 内容完整优先（不要过度简化）
  - 移动端分享网页（截图友好）
  - Token 优化（减少不必要消耗）
- **时间**：Asia/Shanghai

---

## 🛠️ 技术笔记

### OpenClaw 限制

1. **sessions send 命令不存在**
   - `openclaw sessions` 只有 `list` 和 `cleanup`
   - 无法从外部脚本发送消息到指定会话

2. **子代理会话限制**
   - webchat 渠道不支持 `thread=true`
   - 子代理会话 ID 不被 `openclaw agent --session-id` 接受

3. **本地模式需要 API key**
   - `openclaw agent --local` 需要配置模型 provider
   - 当前使用阿里云百炼（bailian/qwen3.5-plus）

4. **WSL2 浏览器问题**
   - 缺少中文字体 → 显示方框
   - 解决方案：用 Windows 本机 Chrome

### 最佳实践

1. **文件队列方案**（最可靠）
   - 网页 → 写入文件 → 主会话查看 → 人工回复
   - 简单、可靠、100% 可用

2. **直接扮演**（最简单）
   - 在当前会话用王鲸身份回复
   - 无需复杂集成

3. **本机 Chrome**
   - WSL2 浏览器字体问题 → 用 Windows Chrome
   - 访问 `file:///home/z3129119/.openclaw/workspace/xxx.html`

---

## 📊 数据指标（王鲸）

### 核心目标
- 次留（Day 1）：50%
- 7 日留存（Day 7）：20%
- 30 日留存（Day 30）：10%
- 广告 CVR：40%+

### 团队规模建议
| 团队 | 类型 | 周期 | 预算 |
|------|------|------|------|
| 1 人 | 休闲、解谜 | 1-3 月 | 0-5 万 |
| 2-5 人 | 独立、roguelike | 3-6 月 | 5-20 万 |
| 5-20 人 | 卡牌、放置 | 6-12 月 | 50-200 万 |
| 20+ 人 | 重度 SLG、MMO | 1-3 年 | 500 万+ |

---

## 💡 经验教训

### 游戏开发
- 移动优先：用户报告 breakout 游戏在移动端不工作（2026-03-10）
- 小团队做大品类，死得快
- 先验证核心玩法（2 周原型），再扩展

### 技术方案
- 简单优于复杂：人工转发比复杂自动化更可靠
- 先验证 CLI 能力：设计前用 `--help` 确认命令支持
- 渠道限制要注意：webchat 功能有限

### Token 优化
- 简洁回复 > 冗长解释
- 引用链接 > 复制全文
- 合并工具调用 > 分开多次
- 写文件 > "mental notes"

---

## 🔗 重要链接

- 王鲸技能：`skills-public/game-producer-wangjing.skill`
- 网页生成器：`skills-public/web-page-generator.skill`
- 文件夹规范：`FOLDER-RULES.md`
- 技术复盘：`docs/王鲸聊天室 - 技术复盘报告.md`

---

**持续更新中...**
