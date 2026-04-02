# feishu-image-send - 飞书图片发送技能

**版本**：v1.0  
**创建时间**：2026-03-31  
**来源**：实际问题复盘（豆包登录截图发送失败教训）

---

## 🎯 技能描述

在飞书群聊/私聊中正确发送图片消息，避免混淆"IM 消息图片"和"云空间文件"。

---

## ⚠️ 核心原则（最高优先级）

### ✅ 正确方式：直接发送本地图片

```json
{
  "action": "send",
  "channel": "feishu",
  "file_path": "/home/z3129119/.openclaw/media/browser/xxx.png",
  "target": "chat:oc_xxx"
}
```

**适用场景**：
- 群里发图片消息
- 私聊发图片
- 截图分享
- 临时图片传输

**特点**：
- ✅ 接收者直接看到图片
- ✅ 支持预览、保存、转发
- ✅ 符合 IM 聊天体验

---

### ❌ 错误方式：上传云空间后发链接

```json
// ❌ 不要这样做！
{
  "action": "upload",
  "file_path": "/path/to/image.png"
}
// 然后发送云空间链接 → 接收者打不开！
```

**问题**：
- ❌ 云空间链接是**文件管理链接**，不是图片消息
- ❌ 接收者需要权限才能访问
- ❌ 体验差，像发文档而不是图片

**适用场景**（仅限）：
- 需要长期存档的图片
- 需要多人协作编辑的文档
- 大文件（>20MB）分享

---

## 📋 操作流程

### 场景 1：浏览器截图 → 发送飞书

```bash
# 1. 浏览器截图（自动保存到本地）
browser(action=screenshot, targetId=xxx, type=png)

# 2. 获取截图路径（通常在 /home/z3129119/.openclaw/media/browser/）
exec(command="ls -lt /home/z3129119/.openclaw/media/browser/ | head -1")

# 3. 直接发送图片消息
message(action=send, channel=feishu, media=/path/to/screenshot.png, target=chat:xxx)
```

### 场景 2：本地图片 → 发送飞书

```json
{
  "action": "send",
  "channel": "feishu",
  "media": "/absolute/path/to/image.png",
  "target": "chat:oc_xxx"  // 或 omit 自动发送到当前会话
}
```

### 场景 3：需要存档 → 同时上传云空间

```bash
# 1. 先发送图片消息（保证接收者能看到）
message(action=send, channel=feishu, media=/path/to/image.png)

# 2. 再上传云空间（用于存档）
feishu_drive_file(action=upload, file_path=/path/to/image.png)

# 3. 可选：发送云空间链接（说明这是存档链接）
message(action=send, channel=feishu, message="存档链接：https://xxx.feishu.cn/file/xxx")
```

---

## 🔧 工具对比

| 工具 | 用途 | 发送后效果 | 使用场景 |
|------|------|-----------|---------|
| `message` + `media` | IM 图片消息 | 接收者直接看到图片 | 日常聊天、截图分享 |
| `feishu_drive_file` + `upload` | 云空间文件 | 生成文件链接 | 长期存档、大文件 |
| `feishu_doc_media` + `insert` | 插入云文档 | 图片嵌入文档 | 文档编辑 |

---

## 💡 常见问题

### Q1: 图片发送后显示"链接"而不是图片？
**原因**：用了云空间链接而不是 `message` 工具的 `media` 参数  
**解决**：改用 `message(action=send, media=/本地路径)`

### Q2: 云空间上传成功了，为什么发出去是链接？
**原因**：`feishu_drive_file` 是文件管理工具，不是 IM 消息工具  
**解决**：先 `message` 发图片，再 `feishu_drive_file` 上传存档

### Q3: 如何确认图片发送成功？
**检查**：
1. `message` 工具返回 `ok: true`
2. 有 `messageId` 和 `chatId`
3. 群里能看到图片（不是链接）

---

## 📝 历史教训

**问题**：2026-03-31 豆包登录截图发送失败  
**原因**：混淆了"飞书云空间文件"和"IM 消息图片"  
**解决**：直接用 `message` 工具发送本地图片路径  
**复盘**：创建此 Skill，避免重复犯错

---

## ✅ 检查清单

发送图片前快速确认：
- [ ] 图片在本地路径（不是云空间链接）
- [ ] 使用 `message` 工具（不是 `feishu_drive_file`）
- [ ] 参数是 `media`（不是 `file` 或 `buffer`）
- [ ] 路径是绝对路径（不是相对路径）

---

**最后更新**：2026-03-31  
**维护者**：王鲸 AI 团队
