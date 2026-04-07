# Janus (Janus) - 第二记忆系统

> **Slogan**: "记忆太多？装匣子！"  
> **灰色幽默**: "别人忘，你不忘，因为有匣子"

Janus是 OpenClaw 的完整第二记忆系统，参考 Claude Code 的会话管理 + 粘贴管理 + 上下文管理，三大功能合并为一个统一系统。

## 📦 核心功能

### 1️⃣ 溯 (Su) - 会话历史记录

JSONL 格式存储会话历史，支持完整的 CRUD 操作。

**功能清单**：
- ✅ 追加/批量追加记录
- ✅ 按会话 ID 检索
- ✅ 时间范围过滤
- ✅ 关键词搜索
- ✅ 删除会话/清空
- ✅ 统计信息
- ✅ 导出会话（JSONL/JSON/TXT）

**存储位置**：`~/.openclaw/history.jsonl`

### 2️⃣ 匣 (Xia) - 粘贴内容管理

智能存储策略，小内容内联、大内容外部存储，支持内容复用。

**功能清单**：
- ✅ 小内容内联（<1024 字符）
- ✅ 大内容外部存储（`~/.openclaw/pastes/`）
- ✅ Hash 引用（MD5）
- ✅ 内容复用（相同内容只存一份）
- ✅ 减少 Token 消耗
- ✅ 批量存储/检索
- ✅ 清理未使用内容

**存储策略**：
```
内容长度 < 1024 字符 → 内联存储
内容长度 >= 1024 字符 → 外部存储 (按 MD5 hash 命名)
```

### 3️⃣ 窗 (Chuang) - 上下文窗口管理

智能控制上下文窗口大小，自动截断超长内容，保护重要信息。

**功能清单**：
- ✅ 控制上下文窗口大小
- ✅ 自动截断超长内容
- ✅ 优先级管理（重要内容保留）
- ✅ 可配置窗口大小
- ✅ Token 使用统计
- ✅ 滑动窗口
- ✅ 智能压缩

**默认配置**：
```javascript
{
  maxTokens: 8000,      // 最大 token 数
  maxMessages: 50,      // 最大消息数
  reserveImportant: true, // 保留重要内容
  tokenEstimateRatio: 4  // 字符到 token 估算比例
}
```

## 🚀 快速开始

### 安装

Janus是纯 JavaScript 模块，无需安装，直接使用：

```bash
cd ~/.openclaw/workspace/janus
```

### 基础用法

```javascript
const { Janus } = require('./janus.js');

// 创建实例
const janus = new Janus({
  historyPath: '~/.openclaw/history.jsonl',
  pastesDir: '~/.openclaw/pastes/',
  windowConfig: {
    maxTokens: 8000,
    maxMessages: 50
  }
});

// 1. 记录对话
janus.record({
  sessionId: 'session-001',
  role: 'user',
  content: '你好，Janus！'
});

// 2. 存储内容（自动选择内联或外部）
const ref = janus.store('这是一段内容');
console.log(ref); // { type: 'inline' | 'hash', value: '...', hash: '...' }

// 3. 获取会话历史
const history = await janus.getSession('session-001');

// 4. 压缩上下文
const compressed = janus.compressContext(messages);

// 5. 获取系统状态
const status = await janus.getStatus();
```

### 高级用法

```javascript
// 完整记录对话（自动处理存储和窗口）
const result = await janus.recordConversation('session-001', [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮你？' }
]);
// result: { recorded, compressed, messages, summary }

// 恢复会话（从历史 + 匣子）
const restored = await janus.restoreSession('session-001');

// 搜索历史
const results = await janus.search('关键词', 'session-001', 100);

// 标记消息优先级
const importantMsg = janus.markPriority(
  { role: 'user', content: '这是重要信息' },
  2  // 优先级：0=普通，1=重要，2=关键
);

// 检查是否超限
const check = janus.checkLimit(messages);
if (check.exceeds) {
  console.log('建议:', check.suggestions);
}
```

## 💻 CLI 工具

Janus提供完整的命令行工具。

### 用法

```bash
node janus-cli.js <command> [options]
```

### 命令列表

#### record - 追加记录

```bash
# 追加记录
node janus-cli.js record --session abc123 --role user --content "你好"

# 从文件读取内容
node janus-cli.js record --session abc123 --role user --file ./message.txt
```

#### search - 搜索历史

```bash
# 搜索关键词
node janus-cli.js search --keyword "设计"

# 限定会话搜索
node janus-cli.js search --keyword "设计" --session abc123 --limit 50
```

#### session - 会话管理

```bash
# 列出所有会话
node janus-cli.js session list

# 获取会话详情
node janus-cli.js session get abc123

# 删除会话
node janus-cli.js session delete abc123

# 清空所有历史
node janus-cli.js session clear
```

#### paste - 粘贴内容管理

```bash
# 存储内容
node janus-cli.js paste store "这是一段内容"

# 获取内容
node janus-cli.js paste get <hash>

# 存储统计
node janus-cli.js paste stats

# 清理未使用内容
node janus-cli.js paste cleanup
```

#### window - 窗口管理

```bash
# 检查配置
node janus-cli.js window check

# 更新配置
node janus-cli.js window set maxTokens 10000

# 测试截断
node janus-cli.js window test
```

#### stats - 系统统计

```bash
node janus-cli.js stats
```

#### export - 导出会话

```bash
# 导出为 JSONL
node janus-cli.js export --session abc123 --output ./backup.jsonl

# 导出为 JSON
node janus-cli.js export --session abc123 --output ./backup.json --format json

# 导出为文本
node janus-cli.js export --session abc123 --output ./backup.txt --format txt
```

#### help - 显示帮助

```bash
node janus-cli.js help
```

## 🧪 测试

运行自动化测试：

```bash
node test.js
```

测试覆盖：
- ✅ 溯模块（8 项测试）
- ✅ 匣模块（9 项测试）
- ✅ 窗模块（10 项测试）
- ✅ 高层 API（3 项测试）

## 📁 项目结构

```
janus/
├── janus.js              # 主入口，统一 API
├── janus-cli.js          # CLI 工具
├── test.js               # 测试脚本
├── README.md             # 使用文档
└── modules/
    ├── su.js             # 溯 - 会话历史管理
    ├── xia.js            # 匣 - 粘贴内容管理
    └── chuang.js         # 窗 - 上下文窗口管理
```

## 🔧 API 参考

### Janus 类

#### 构造函数

```javascript
new Janus(options?: {
  historyPath?: string,
  pastesDir?: string,
  windowConfig?: {
    maxTokens?: number,
    maxMessages?: number,
    reserveImportant?: boolean,
    tokenEstimateRatio?: number
  }
})
```

#### 溯 (Su) 方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `record` | `{sessionId, role, content, timestamp?, metadata?}` | `boolean` | 追加记录 |
| `batchRecord` | `records: Array` | `number` | 批量追加 |
| `getSession` | `sessionId: string` | `Promise<Array>` | 获取会话 |
| `search` | `keyword, sessionId?, limit?` | `Promise<Array>` | 搜索 |
| `getByTimeRange` | `startTime, endTime` | `Promise<Array>` | 时间范围查询 |
| `deleteSession` | `sessionId` | `Promise<number>` | 删除会话 |
| `clearHistory` | - | `Promise<number>` | 清空历史 |
| `getHistoryStats` | - | `Promise<Object>` | 统计信息 |
| `exportSession` | `sessionId, outputPath, format` | `Promise<boolean>` | 导出 |
| `listSessions` | - | `Promise<Array>` | 列出会话 |

#### 匣 (Xia) 方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `store` | `content: string` | `Object` | 存储内容 |
| `retrieve` | `ref: Object` | `string|null` | 获取内容 |
| `batchStore` | `contents: Array` | `Array` | 批量存储 |
| `batchRetrieve` | `refs: Array` | `Array` | 批量获取 |
| `contentExists` | `hash: string` | `boolean` | 检查存在 |
| `deleteContent` | `hash: string` | `boolean` | 删除内容 |
| `getPastesStats` | - | `Object` | 存储统计 |
| `cleanupPastes` | `usedHashes: Array` | `Object` | 清理 |
| `toTransport` | `content: string` | `Object` | 传输格式 |
| `fromTransport` | `obj: Object` | `string|null` | 恢复内容 |

#### 窗 (Chuang) 方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `truncateMessages` | `messages, config` | `Object` | 截断消息 |
| `compressContext` | `messages, config` | `Object` | 智能压缩 |
| `slidingWindow` | `messages, windowSize, options` | `Array` | 滑动窗口 |
| `markPriority` | `message, priority` | `Object` | 标记优先级 |
| `getTokenUsage` | `messages` | `Object` | Token 统计 |
| `checkLimit` | `messages, config` | `Object` | 限制检查 |
| `updateWindowConfig` | `newConfig` | `Object` | 更新配置 |
| `getConfig` | - | `Object` | 获取配置 |

#### 高层 API

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `recordConversation` | `sessionId, messages` | `Promise<Object>` | 完整记录对话 |
| `restoreSession` | `sessionId` | `Promise<Array>` | 恢复会话 |
| `getStatus` | - | `Promise<Object>` | 系统状态 |

## 📝 数据格式

### 历史记录格式 (JSONL)

```jsonl
{"sessionId":"abc123","role":"user","content":"你好","timestamp":1712400000000}
{"sessionId":"abc123","role":"assistant","content":"你好！有什么可以帮你？","timestamp":1712400001000}
```

### 内容引用格式

```javascript
// 内联引用（小内容）
{
  type: 'inline',
  value: '原始内容',
  hash: 'md5...',
  length: 100
}

// Hash 引用（大内容）
{
  type: 'hash',
  value: 'md5...',
  hash: 'md5...',
  length: 5000,
  reused: false
}
```

### 消息格式

```javascript
{
  role: 'user' | 'assistant' | 'system',
  content: string,
  timestamp?: number,
  priority?: number,  // 0=普通，1=重要，2=关键
  metadata?: Object
}
```

## 🎯 使用场景

### 场景 1: OpenClaw 会话管理

```javascript
// 每次对话自动记录
const janus = new Janus();

async function handleUserMessage(sessionId, content) {
  // 记录用户消息
  janus.record({ sessionId, role: 'user', content });
  
  // 生成回复
  const reply = await generateReply(content);
  
  // 记录回复
  janus.record({ sessionId, role: 'assistant', content: reply });
  
  return reply;
}
```

### 场景 2: 大内容优化

```javascript
// 自动将大内容存储到外部
const longCode = `...很长的代码...`;
const ref = janus.store(longCode);

// 在上下文中只传递 hash
const contextMessage = {
  role: 'user',
  content: ref.type === 'inline' ? longCode : `[code:${ref.hash}]`
};
```

### 场景 3: 上下文窗口控制

```javascript
// 对话前检查窗口
const check = janus.checkLimit(currentMessages);
if (check.exceeds) {
  console.log('需要压缩:', check.suggestions);
  const compressed = janus.compressContext(currentMessages);
  currentMessages = compressed.messages;
}
```

## 🔐 安全与隐私

- 所有数据存储在本地（`~/.openclaw/`）
- 不上传任何内容到外部
- 支持内容删除和清理
- Hash 引用避免重复存储

## 📊 性能优化

1. **JSONL 流式读取** - 大文件不一次性加载
2. **内容复用** - 相同内容只存一份
3. **智能截断** - 优先保留重要内容
4. **批量操作** - 减少 IO 次数

## 🤝 贡献

Janus是 OpenClaw 的内置系统，欢迎提交问题和改进建议。

---

**Janus (Janus) v1.0.0**  
*记忆太多？装匣子！*
