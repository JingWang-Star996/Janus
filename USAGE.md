# 忆匣 (YiXia) 使用文档

## 快速开始

### 1. 初始化

```javascript
const { YiXia } = require('./yixia/src');

// 创建忆匣实例
const yixia = new YiXia({
  dataDir: './data',  // 数据存储目录
  context: {
    maxSize: 4000  // 上下文窗口最大 token 数
  }
});
```

### 2. 会话管理（溯）

```javascript
// 创建新会话
const sessionId = await yixia.session.create('项目讨论', {
  tags: ['项目', '重要']
});

// 添加消息
await yixia.session.addMessage(sessionId, {
  role: 'user',
  content: '今天讨论了什么？'
});

await yixia.session.addMessage(sessionId, {
  role: 'assistant',
  content: '讨论了忆匣系统的设计方案。'
});

// 检索消息
const messages = await yixia.session.search(sessionId, {
  keyword: '忆匣'
});

// 获取会话列表
const sessions = await yixia.session.list();

// 导出会话
const exported = await yixia.session.export(sessionId);

// 删除会话
await yixia.session.delete(sessionId);
```

### 3. 粘贴管理（匣）

```javascript
// 存储内容
const clipId = await yixia.clipboard.store({
  content: '大段文本内容...',
  type: 'text',  // text|code|image|file
  tags: ['重要', '参考'],
  title: '会议记录'
});

// 获取内容
const content = await yixia.clipboard.get(clipId);

// 检索内容（按标签）
const clips = await yixia.clipboard.search({
  tag: '重要'
});

// 检索内容（按关键词）
const clips = await yixia.clipboard.search({
  keyword: '会议'
});

// 智能存储（自动去重）
const result = await yixia.clipboard.smartStore({
  content: '内容...',
  type: 'text'
});
// result.isDuplicate 表示是否重复
// result.id 返回内容 ID（新的或已有的）

// 获取统计
const stats = await yixia.clipboard.getStats();
console.log(stats.total);      // 总内容数
console.log(stats.totalSize);  // 总大小
console.log(stats.totalTokens); // 估算 token 数

// 删除内容
await yixia.clipboard.delete(clipId);
```

### 4. 上下文管理（窗）

```javascript
// 添加上下文
await yixia.context.add({
  id: 'ctx_1',
  type: 'note',  // note|message|file|reference
  content: '重要的背景信息',
  priority: 8    // 1-10，10 最高
});

// 获取优化后的上下文
const context = await yixia.context.getContext();

// 查看窗口状态
const status = yixia.context.getStatus();
console.log(status.usage);  // 使用率，如 "75%"

// 提升优先级
await yixia.context.prioritize('ctx_1', 10);

// 标记为已访问（防止被优化掉）
await yixia.context.touch('ctx_1');

// 删除上下文
await yixia.context.remove('ctx_1');

// 清空窗口
await yixia.context.clear();
```

### 5. 高级功能

#### 快速存储（会话 + 匣子联动）

```javascript
// 自动将大内容存储到匣子，并在会话中记录引用
await yixia.quickStore(sessionId, {
  role: 'user',
  content: '非常长的内容...'  // 超过 500 字符自动存匣
}, true);
```

#### 备份与恢复

```javascript
// 导出完整备份
await yixia.exportBackup('./backup-2026-04-06.json');

// 从备份导入
await yixia.importBackup('./backup-2026-04-06.json');
```

#### 系统统计

```javascript
const stats = await yixia.getStats();
console.log(stats.sessions.total);     // 会话总数
console.log(stats.clipboard.total);    // 粘贴内容总数
console.log(stats.context.itemCount);  // 上下文项数
```

## 命令行使用

```bash
# 查看帮助
node src/index.js

# 查看系统统计
node src/index.js stats

# 运行演示
node src/index.js demo

# 运行测试
npm test
```

## 最佳实践

### 1. Token 优化

```javascript
// ❌ 避免：在会话中存储大段内容
await session.addMessage(sessionId, {
  role: 'user',
  content: 'x'.repeat(10000)  // 浪费 token
});

// ✅ 推荐：使用匣子存储，会话中只存引用
const clipId = await clipboard.store({
  content: 'x'.repeat(10000),
  type: 'text'
});
await session.addMessage(sessionId, {
  role: 'user',
  content: `[参考内容：${clipId}]`
});
```

### 2. 上下文管理

```javascript
// 高优先级内容（不易被优化掉）
await context.add({
  id: 'core_context',
  type: 'note',
  content: '核心背景信息',
  priority: 10
});

// 低优先级内容（可能被优化掉）
await context.add({
  id: 'temp_note',
  type: 'note',
  content: '临时笔记',
  priority: 2
});
```

### 3. 标签管理

```javascript
// 使用标签分类内容
await clipboard.store({
  content: '...',
  tags: ['会议', '2026-04', '重要']
});

// 按标签检索
const meetings = await clipboard.search({ tag: '会议' });
const april = await clipboard.search({ tag: '2026-04' });
```

### 4. 定期清理

```javascript
// 清理 30 天前的会话
await session.cleanup(30);

// 清理 30 天未访问的粘贴内容
await clipboard.cleanup(30);
```

## 数据格式

### 会话记录 (JSONL)

每条消息一行 JSON：
```json
{"role":"user","content":"你好","timestamp":1712400000000}
{"role":"assistant","content":"你好！","timestamp":1712400001000}
```

### 元数据 (meta.json)

```json
{
  "sessions": [
    {
      "id": "sess_xxx",
      "title": "会话标题",
      "file": "sess_xxx.jsonl",
      "created": 1712400000000,
      "updated": 1712400000000,
      "messageCount": 10,
      "tags": ["tag1", "tag2"]
    }
  ],
  "clips": [
    {
      "id": "clip_xxx",
      "title": "内容标题",
      "type": "text",
      "size": 1024,
      "hash": "sha256...",
      "tags": ["tag1"],
      "created": 1712400000000,
      "accessed": 1712400000000,
      "accessCount": 5
    }
  ]
}
```

## 常见问题

### Q: 如何迁移数据？
A: 使用 `exportBackup()` 和 `importBackup()` 方法。

### Q: 如何避免 token 超限？
A: 使用匣子存储大内容，会话中只存引用 ID。

### Q: 如何保证数据安全？
A: 定期使用 `exportBackup()` 创建备份。

### Q: 如何集成到现有项目？
A: 直接 `require('./yixia/src')` 即可使用所有功能。

## 许可证

MIT
