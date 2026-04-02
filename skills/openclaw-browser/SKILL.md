# OpenClaw 专属浏览器 - 使用规范

**创建日期**：2026-03-31  
**问题来源**：用户王鲸多次提醒（2026-03-25 首次要求，2026-03-31 再次提醒）

---

## 🔴 问题描述

**症状**：每次用户要求浏览网页时，AI 会忘记使用 OpenClaw 专属浏览器配置

**根本原因**：
1. 配置仅记录在 MEMORY.md 中，没有被主动加载
2. browser 工具调用时没有自动关联配置
3. 缺乏强制性的检查机制

---

## ✅ 解决方案

### 1. 浏览器配置（最高优先级）⭐

**浏览器类型**：OpenClaw 专属 Chrome（不是系统 Chrome！）

**配置参数**：
```
用户数据目录：~/.openclaw/browser/openclaw/user-data
调试端口：18800
启动命令：google-chrome --remote-debugging-port=18800 --user-data-dir=~/.openclaw/browser/openclaw/user-data
```

### 2. browser 工具调用规范

**每次调用 browser 工具前必须检查**：

```
调用 browser 工具
    ↓
检查配置 ✅
    - 端口：18800
    - 用户数据目录：~/.openclaw/browser/openclaw/user-data
    ↓
执行调用
```

**调用示例**：
```javascript
browser({
  action: "open",
  url: "https://example.com",
  // 确保使用 OpenClaw 专属浏览器配置
  // 端口 18800，用户数据目录 ~/.openclaw/browser/openclaw/user-data
})
```

### 3. 强制记忆机制

**触发条件**：
- 用户提到"浏览器"、"浏览网页"、"打开链接"、"查看页面"
- 任务需要访问 URL

**执行流程**：
```
收到网页浏览请求
    ↓
🔴 强制回忆：OpenClaw 专属浏览器配置
    ↓
确认配置正确
    ↓
调用 browser 工具
    ↓
回复用户（附带链接）
```

---

## 📝 检查清单

每次浏览网页前，心中默念：

- [ ] ✅ 使用 OpenClaw 专属浏览器
- [ ] ✅ 端口 18800
- [ ] ✅ 用户数据目录 ~/.openclaw/browser/openclaw/user-data
- [ ] ✅ 不是系统 Chrome
- [ ] ✅ 不是默认浏览器

---

## 🔐 为什么重要

1. **独立会话**：专属配置，不与系统 Chrome 混淆
2. **数据隔离**：独立的 Cookie、缓存、登录状态
3. **调试便利**：固定端口 18800，便于开发调试
4. **用户要求**：王鲸明确要求（2026-03-25）

---

## 💡 经验教训

### 问题复盘（2026-03-31）

**问题**：多次忘记使用专属浏览器配置

**原因**：
1. 配置仅存储在 MEMORY.md，没有主动加载
2. 缺乏强制性的检查机制
3. 没有形成条件反射

**解决方案**：
1. ✅ 创建独立 Skill 文档
2. ✅ 更新 MEMORY.md 记录
3. ✅ 建立检查清单
4. ✅ 每次调用前强制回忆

**防止再犯**：
- 将此 Skill 设为高优先级
- 用户提到"浏览器"时自动触发回忆
- 调用前默念检查清单

---

## 📋 相关配置

### OpenClaw 浏览器目录结构

```
~/.openclaw/
└── browser/
    └── openclaw/
        └── user-data/    # 专属用户数据
```

### 验证方法

```bash
# 检查浏览器进程
ps aux | grep chrome | grep 18800

# 检查用户数据目录
ls -la ~/.openclaw/browser/openclaw/user-data/
```

---

**优先级**：最高（用户多次提醒，必须永久记住）

**最后更新**：2026-03-31 15:05
