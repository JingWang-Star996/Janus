# 🦞 龙虾自动进化计划

## 目标

每天自动搜索 OpenClaw 最新技能/玩法，评估是否可一键学习，整理总结后推送给用户。

---

## 工作流程

### 1. 每日搜索（定时任务）

```bash
# 探索最新技能
clawhub explore --limit 20

# 搜索热门技能
clawhub search "trending" --limit 10

# 搜索特定类别
clawhub search "browser automation" --limit 10
clawhub search "calendar" --limit 10
clawhub search "task management" --limit 10
```

### 2. 技能评估

对每个新技能检查：
- ✅ **可安装性**：是否有依赖冲突
- ✅ **实用性**：是否对当前工作流有价值
- ✅ **兼容性**：是否与现有技能冲突
- ✅ **维护状态**：最后更新时间、作者活跃度

### 3. 一键学习

```bash
# 查看技能详情（不安装）
clawhub inspect <slug>

# 安装技能
clawhub install <slug>

# 更新所有技能
clawhub update --all
```

### 4. 总结推送

每日报告格式：
```
🦞 龙虾进化日报 - 2026-03-14

🆕 发现新技能：3 个
⭐ 推荐安装：2 个
⚠️  需要确认：1 个

【推荐安装】
1. 技能名称 - 简介
   - 用途：xxx
   - 依赖：xxx
   - 推荐理由：xxx

【需要确认】
1. 技能名称 - 简介
   - 用途：xxx
   - 需要确认：是否需要 xxx 权限

【指令模板】
安装推荐技能：
clawhub install skill-1 skill-2

查看详情：
clawhub inspect skill-3
```

---

## 自动化方案

### 方案 A：Cron 定时任务（推荐）

```json
{
  "name": "龙虾每日进化",
  "schedule": { "kind": "cron", "expr": "0 9 * * *", "tz": "Asia/Shanghai" },
  "payload": { 
    "kind": "agentTurn", 
    "message": "执行龙虾进化计划：搜索最新技能，评估并整理报告" 
  },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce" }
}
```

**优点**：
- 自动执行，无需人工干预
- 固定时间推送（每天上午 9 点）
- 隔离会话，不干扰主会话

**缺点**：
- 需要配置 cron
- 需要 API key（web_search）

### 方案 B：Heartbeat 心跳检查

在 `HEARTBEAT.md` 中添加：
```markdown
- 检查是否有新技能（clawhub explore）
- 每周执行一次（避免频繁调用）
```

**优点**：
- 配置简单
- 与现有心跳机制集成

**缺点**：
- 时间不固定
- 可能过于频繁

### 方案 C：人工触发

用户发送命令：
```
/龙虾进化
/搜索新技能
/更新技能
```

**优点**：
- 完全可控
- 按需执行

**缺点**：
- 需要人工记忆

---

## 依赖检查

### 必需
- ✅ clawhub CLI（已安装，v0.7.0）
- ⚠️  Brave Search API Key（web_search 需要）
- ✅ 网络连接

### 可选
- 浏览器（用于查看技能演示）
- GitHub API（查看技能源码）

---

## 执行指令

### 用户指令集

```bash
# 查看最新技能
/龙虾探索

# 安装推荐技能
/龙虾安装 <skill-name>

# 更新所有技能
/龙虾更新

# 查看技能详情
/龙虾详情 <skill-name>

# 查看进化日志
/龙虾日志
```

### AI 自动执行

```bash
# 1. 探索最新
clawhub explore --limit 20

# 2. 搜索热门
clawhub search "popular" --limit 10

# 3. 查看详情
clawhub inspect <slug>

# 4. 安装技能
clawhub install <slug>

# 5. 更新全部
clawhub update --all
```

---

## 输出示例

### 每日报告（飞书消息）

```
🦞 龙虾进化日报 - 2026-03-14

📊 今日扫描：15 个技能
🆕 新增技能：3 个
⭐ 推荐安装：2 个

【🌟 强烈推荐】
1. feishu-doc-advanced - 飞书文档高级操作
   - 用途：批量处理飞书文档、插入媒体、评论管理
   - 依赖：feishu OAuth
   - 理由：增强现有飞书集成能力

2. web-automation-pro - 网页自动化增强
   - 用途：自动填写表单、截图、数据抓取
   - 依赖：Playwright
   - 理由：补充 browser 工具不足

【⚠️ 需要确认】
1. email-sender - 邮件发送技能
   - 用途：SMTP 发送邮件
   - 需要：配置 SMTP 服务器
   - 问：是否需要配置？

【📦 已安装技能】
总计：12 个技能
本周更新：3 个

【🔧 一键指令】
安装推荐：clawhub install feishu-doc-advanced web-automation-pro
查看详情：clawhub inspect email-sender
```

---

## 下一步

1. ✅ 方案设计（完成）
2. ⏳ 配置 Brave API Key（需要）
3. ⏳ 创建 cron 任务
4. ⏳ 测试执行流程
5. ⏳ 优化报告格式

---

## 注意事项

1. **速率限制**：clawhub API 有速率限制，避免频繁调用
2. **依赖冲突**：安装前检查技能依赖
3. **备份**：更新前备份现有技能
4. **回滚**：保留旧版本以便回滚

---

**创建时间**：2026-03-14
**版本**：v1.0
