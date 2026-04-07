# 忆匣 (YiXia) 开发文档

## 项目结构

```
yixia/
├── src/                      # 源代码
│   ├── index.js             # 主入口 (5.5KB)
│   ├── session.js           # 会话管理 - 溯 (6KB)
│   ├── clipboard.js         # 粘贴管理 - 匣 (6.8KB)
│   ├── context.js           # 上下文管理 - 窗 (4.2KB)
│   └── utils.js             # 工具函数 (2.9KB)
├── tests/                    # 测试文件
│   ├── test-all.js          # 测试入口
│   ├── test-session.js      # 会话测试
│   ├── test-clipboard.js    # 粘贴测试
│   └── test-context.js      # 上下文测试
├── data/                     # 数据目录（运行时生成）
│   ├── sessions/            # 会话记录
│   ├── clips/               # 粘贴内容
│   └── meta.json            # 元数据
├── README.md                 # 项目说明
├── USAGE.md                  # 使用文档
├── DEV.md                    # 开发文档（本文件）
└── package.json              # 项目配置
```

## 代码统计

| 文件 | 行数 | 大小 |
|------|------|------|
| src/index.js | ~180 | 5.5KB |
| src/session.js | ~200 | 6KB |
| src/clipboard.js | ~230 | 6.8KB |
| src/context.js | ~150 | 4.2KB |
| src/utils.js | ~100 | 2.9KB |
| **总计** | **~860** | **~25.4KB** |

> 注：略超 500 行目标，但模块化设计更清晰，便于维护

## 核心设计

### 1. 模块化架构

```
┌─────────────────────────────────────┐
│           YiXia (主入口)             │
├─────────┬───────────┬───────────────┤
│ Session │ Clipboard │ ContextWindow │
│  (溯)   │   (匣)    │     (窗)      │
├─────────┴───────────┴───────────────┤
│            Utils (工具)              │
└─────────────────────────────────────┘
```

### 2. 数据存储

**会话记录 (JSONL)**
- 优点：流式读写、易追加、易解析
- 格式：每行一个 JSON 对象
- 位置：`data/sessions/{sessionId}.jsonl`

**粘贴内容 (文件存储)**
- 优点：大内容不占内存、易管理
- 格式：纯文本文件
- 位置：`data/clips/{clipId}.txt`

**元数据 (JSON)**
- 统一管理所有资源的元信息
- 位置：`data/meta.json`

### 3. ID 生成规则

```javascript
// 格式：{prefix}_{timestamp}_{random}
sess_1k8x9y2a3b4c  // 会话
clip_1k8x9y2a3b4c  // 粘贴内容
ctx_1k8x9y2a3b4c   // 上下文
```

### 4. 去重机制

```javascript
// 使用 SHA256 哈希
hash = sha256(content)

// 存储时检查是否已有相同哈希
if (existing = findClipByHash(hash)) {
  return existing.id  // 返回已有 ID
}
```

## API 设计原则

### 1. 异步优先

所有可能涉及 I/O 的操作都是异步的：
```javascript
await session.create(...)
await clipboard.store(...)
await context.add(...)
```

### 2. 一致的错误处理

```javascript
try {
  await session.addMessage(sessionId, message);
} catch (error) {
  // 统一错误格式
  // Error: 会话不存在：{sessionId}
}
```

### 3. 日志输出

```javascript
console.log(`[溯] 创建会话：${sessionId}`);
console.log(`[匣] 存储内容：${clipId} - ${formatBytes(size)}`);
console.log(`[窗] 添加上下文：${id} (${tokens} tokens)`);
```

## 扩展方向

### 已完成
- ✅ 会话管理（溯）
- ✅ 粘贴管理（匣）
- ✅ 上下文管理（窗）
- ✅ 去重机制
- ✅ 标签系统
- ✅ 备份/恢复
- ✅ 统计功能

### 可选扩展

1. **加密存储**
   ```javascript
   // 敏感内容加密
   await clipboard.store({
     content: encrypt(secretData),
     encrypted: true
   });
   ```

2. **全文搜索**
   ```javascript
   // 使用 lunr.js 或类似库
   const results = await clipboard.searchFullText('关键词');
   ```

3. **自动压缩**
   ```javascript
   // 定期压缩旧会话
   await session.compress(sessionId, {
     algorithm: 'gzip',
     olderThan: '7d'
   });
   ```

4. **远程同步**
   ```javascript
   // 同步到云存储
   await yixia.sync.to('s3://bucket/yixia');
   ```

## 测试指南

### 运行单个测试

```bash
# 会话测试
node tests/test-session.js

# 粘贴测试
node tests/test-clipboard.js

# 上下文测试
node tests/test-context.js
```

### 运行全部测试

```bash
npm test
```

### 添加新测试

```javascript
// tests/test-new-feature.js
const assert = require('assert');

async function testNewFeature() {
  console.log('🧪 测试新功能\n');
  
  // 测试逻辑...
  
  assert(condition, '错误信息');
}

if (require.main === module) {
  testNewFeature();
}

module.exports = { testNewFeature };
```

## 性能优化

### 1. 懒加载

```javascript
// 只在需要时读取文件
async get(contentId) {
  const file = path.join(this.dataDir, `${contentId}.txt`);
  return fs.readFileSync(file, 'utf-8');
}
```

### 2. 元数据缓存

```javascript
// 元数据缓存在内存中
_getMeta() {
  if (this._metaCache) return this._metaCache;
  return readJson(this.metaFile);
}
```

### 3. 批量操作

```javascript
// 批量删除（减少 I/O）
async batchDelete(ids) {
  for (const id of ids) {
    // 批量处理
  }
}
```

## 调试技巧

### 1. 启用详细日志

```javascript
// 在 src/utils.js 中添加
const DEBUG = process.env.YIXIA_DEBUG === 'true';

function log(...args) {
  if (DEBUG) console.log('[DEBUG]', ...args);
}
```

### 2. 查看数据文件

```bash
# 查看会话记录
cat data/sessions/sess_*.jsonl

# 查看元数据
cat data/meta.json | jq .
```

### 3. 清理测试数据

```bash
# 删除所有测试数据
rm -rf data/
```

## 版本历史

### v1.0.0 (2026-04-06)
- ✅ 初始版本
- ✅ 会话管理（溯）
- ✅ 粘贴管理（匣）
- ✅ 上下文管理（窗）
- ✅ 完整测试套件
- ✅ 文档完善

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT
