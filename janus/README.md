# Janus (杰纳斯) - Second Memory System

> **Slogan**: "Two Faces, One Memory"
>
> **Named After**: Janus, the Roman god of beginnings and transitions - one face looks to the past (session history), the other to the future (context management)

**🌍 Languages**: [English](README.md) | [中文](README.zh.md)

Janus is a complete second memory system for OpenClaw, inspired by Claude Code's session management + paste management + context management, unified into one system.

---

## 📦 Core Features

### 1️⃣ Su (溯) - Session History

JSONL format storage for session history with full CRUD operations.

**Features**:
- ✅ Append/batch append records
- ✅ Retrieve by session ID
- ✅ Time range filtering
- ✅ Keyword search
- ✅ Delete session/clear all
- ✅ Statistics
- ✅ Export sessions (JSONL/JSON/TXT)

**Storage**: `~/.openclaw/history.jsonl`

### 2️⃣ Xia (匣) - Paste Content Management

Smart storage strategy: inline for small content, external for large content, with content reuse.

**Features**:
- ✅ Inline storage (<1024 chars)
- ✅ External storage (`~/.openclaw/pastes/`)
- ✅ Hash reference (MD5)
- ✅ Content reuse (same content stored once)
- ✅ Reduce token consumption
- ✅ Batch store/retrieve
- ✅ Cleanup unused content

**Storage Strategy**:
```
Content < 1024 chars → Inline storage
Content >= 1024 chars → External storage (MD5 hash naming)
```

### 3️⃣ Chuang (窗) - Context Window Management

Intelligently control context window size, auto-truncate oversized content, protect important information.

**Features**:
- ✅ Control context window size
- ✅ Auto-truncate oversized content
- ✅ Priority management (keep important content)
- ✅ Configurable window size
- ✅ Token usage statistics
- ✅ Sliding window
- ✅ Smart compression

**Default Config**:
```javascript
{
  maxTokens: 8000,      // Max tokens
  maxMessages: 50,      // Max messages
  reserveImportant: true, // Keep important content
  tokenEstimateRatio: 4  // Char to token ratio
}
```

---

## 🚀 Quick Start

### Installation

Janus is a pure JavaScript module, no installation needed:

```bash
cd ~/.openclaw/workspace/janus
```

### Basic Usage

```javascript
const { Janus } = require('./janus.js');

// Create instance
const janus = new Janus({
  historyPath: '~/.openclaw/history.jsonl',
  pastesDir: '~/.openclaw/pastes/',
  windowConfig: {
    maxTokens: 8000,
    maxMessages: 50
  }
});

// 1. Record conversation
janus.record({
  sessionId: 'session-001',
  role: 'user',
  content: 'Hello, Janus!'
});

// 2. Store content (auto select inline or external)
const ref = janus.store('This is some content');
console.log(ref); // { type: 'inline' | 'hash', value: '...', hash: '...' }

// 3. Get session history
const history = await janus.getSession('session-001');

// 4. Compress context
const compressed = janus.compressContext(messages);

// 5. Get system status
const status = await janus.getStatus();
```

---

## 💻 CLI Tools

Janus provides complete command-line tools.

### Usage

```bash
node janus-cli.js <command> [options]
```

### Commands

#### record - Append Record

```bash
# Append record
node janus-cli.js record --session abc123 --role user --content "Hello"

# Read from file
node janus-cli.js record --session abc123 --role user --file ./message.txt
```

#### search - Search History

```bash
# Search keyword
node janus-cli.js search --keyword "design"

# Limit to session
node janus-cli.js search --keyword "design" --session abc123 --limit 50
```

#### session - Session Management

```bash
# List all sessions
node janus-cli.js session list

# Get session details
node janus-cli.js session get abc123

# Delete session
node janus-cli.js session delete abc123

# Clear all history
node janus-cli.js session clear
```

#### paste - Paste Content Management

```bash
# Store content
node janus-cli.js paste store "This is content"

# Get content
node janus-cli.js paste get <hash>

# Storage statistics
node janus-cli.js paste stats

# Cleanup unused
node janus-cli.js paste cleanup
```

#### window - Window Management

```bash
# Check config
node janus-cli.js window check

# Update config
node janus-cli.js window set maxTokens 10000

# Test truncation
node janus-cli.js window test
```

#### stats - System Statistics

```bash
node janus-cli.js stats
```

#### export - Export Session

```bash
# Export as JSONL
node janus-cli.js export --session abc123 --output ./backup.jsonl

# Export as JSON
node janus-cli.js export --session abc123 --output ./backup.json --format json

# Export as text
node janus-cli.js export --session abc123 --output ./backup.txt --format txt
```

#### help - Show Help

```bash
node janus-cli.js help
```

---

## 🧪 Testing

Run automated tests:

```bash
node test.js
```

Test coverage:
- ✅ Su module (8 tests)
- ✅ Xia module (9 tests)
- ✅ Chuang module (10 tests)
- ✅ High-level API (3 tests)

---

## 📁 Project Structure

```
janus/
├── janus.js              # Main entry, unified API
├── janus-cli.js          # CLI tool
├── test.js               # Test script
├── README.md             # Documentation (English)
├── README.zh.md          # Documentation (Chinese)
└── modules/
    ├── su.js             # Su - Session history
    ├── xia.js            # Xia - Paste content
    └── chuang.js         # Chuang - Context window
```

---

## 🔧 API Reference

### Janus Class

#### Constructor

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

#### Su Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `record` | `{sessionId, role, content, timestamp?, metadata?}` | `boolean` | Append record |
| `batchRecord` | `records: Array` | `number` | Batch append |
| `getSession` | `sessionId: string` | `Promise<Array>` | Get session |
| `search` | `keyword, sessionId?, limit?` | `Promise<Array>` | Search |
| `getByTimeRange` | `startTime, endTime` | `Promise<Array>` | Time range query |
| `deleteSession` | `sessionId` | `Promise<number>` | Delete session |
| `clearHistory` | - | `Promise<number>` | Clear history |
| `getHistoryStats` | - | `Promise<Object>` | Statistics |
| `exportSession` | `sessionId, outputPath, format` | `Promise<boolean>` | Export |
| `listSessions` | - | `Promise<Array>` | List sessions |

#### Xia Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `store` | `content: string` | `Object` | Store content |
| `retrieve` | `ref: Object` | `string|null` | Retrieve content |
| `batchStore` | `contents: Array` | `Array` | Batch store |
| `batchRetrieve` | `refs: Array` | `Array` | Batch retrieve |
| `contentExists` | `hash: string` | `boolean` | Check exists |
| `deleteContent` | `hash: string` | `boolean` | Delete content |
| `getPastesStats` | - | `Object` | Storage stats |
| `cleanupPastes` | `usedHashes: Array` | `Object` | Cleanup |
| `toTransport` | `content: string` | `Object` | Transport format |
| `fromTransport` | `obj: Object` | `string|null` | Restore content |

#### Chuang Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `truncateMessages` | `messages, config` | `Object` | Truncate messages |
| `compressContext` | `messages, config` | `Object` | Smart compress |
| `slidingWindow` | `messages, windowSize, options` | `Array` | Sliding window |
| `markPriority` | `message, priority` | `Object` | Mark priority |
| `getTokenUsage` | `messages` | `Object` | Token stats |
| `checkLimit` | `messages, config` | `Object` | Limit check |
| `updateWindowConfig` | `newConfig` | `Object` | Update config |
| `getConfig` | - | `Object` | Get config |

#### High-Level API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `recordConversation` | `sessionId, messages` | `Promise<Object>` | Full record |
| `restoreSession` | `sessionId` | `Promise<Array>` | Restore session |
| `getStatus` | - | `Promise<Object>` | System status |

---

## 📝 Data Formats

### History Record Format (JSONL)

```jsonl
{"sessionId":"abc123","role":"user","content":"Hello","timestamp":1712400000000}
{"sessionId":"abc123","role":"assistant","content":"Hello! How can I help?","timestamp":1712400001000}
```

### Content Reference Format

```javascript
// Inline reference (small content)
{
  type: 'inline',
  value: 'Original content',
  hash: 'md5...',
  length: 100
}

// Hash reference (large content)
{
  type: 'hash',
  value: 'md5...',
  hash: 'md5...',
  length: 5000,
  reused: false
}
```

### Message Format

```javascript
{
  role: 'user' | 'assistant' | 'system',
  content: string,
  timestamp?: number,
  priority?: number,  // 0=normal, 1=important, 2=critical
  metadata?: Object
}
```

---

## 🎯 Use Cases

### Case 1: OpenClaw Session Management

```javascript
// Auto-record every conversation
const janus = new Janus();

async function handleUserMessage(sessionId, content) {
  // Record user message
  janus.record({ sessionId, role: 'user', content });
  
  // Generate reply
  const reply = await generateReply(content);
  
  // Record reply
  janus.record({ sessionId, role: 'assistant', content: reply });
  
  return reply;
}
```

### Case 2: Large Content Optimization

```javascript
// Auto-store large content externally
const longCode = `...very long code...`;
const ref = janus.store(longCode);

// Only pass hash in context
const contextMessage = {
  role: 'user',
  content: ref.type === 'inline' ? longCode : `[code:${ref.hash}]`
};
```

### Case 3: Context Window Control

```javascript
// Check window before conversation
const check = janus.checkLimit(currentMessages);
if (check.exceeds) {
  console.log('Need compression:', check.suggestions);
  const compressed = janus.compressContext(currentMessages);
  currentMessages = compressed.messages;
}
```

---

## 🔐 Security & Privacy

- All data stored locally (`~/.openclaw/`)
- No content uploaded externally
- Support content deletion and cleanup
- Hash reference avoids duplicate storage

---

## 📊 Performance Optimization

1. **JSONL Streaming Read** - Don't load large files at once
2. **Content Reuse** - Same content stored once
3. **Smart Truncation** - Keep important content first
4. **Batch Operations** - Reduce IO calls

---

## 🌟 Recommended: Install with Dream & Lao

For a complete memory experience, install Janus with Dream and Lao:

### 🌙 Dream - Long-term Memory Integration

Dream automatically integrates short-term memories into long-term memory:
- Daily memory consolidation at 5 AM
- Smart analysis and rule-based pruning
- Automatic backup before changes
- 50% memory optimization

**Install**: `~/.openclaw/workspace/skills/dream-system/`

### 🪝 Lao (捞) - Memory Retrieval System

Lao provides semantic search across all memory sources:
- Search MEMORY.md + memory/*.md
- Session transcript search
- Score-based relevance ranking
- Context-aware retrieval

**Install**: `~/.openclaw/workspace/skills/lao-retrieval/`

### 🎯 Complete Memory Stack

```
┌─────────────────────────────────────┐
│          Janus (Session)            │
│     Short-term conversation history │
├─────────────────────────────────────┤
│          Dream (Long-term)          │
│   Curated memories & insights       │
├─────────────────────────────────────┤
│           Lao (Retrieval)           │
│   Semantic search across all        │
└─────────────────────────────────────┘
```

**Together they provide**:
- ✅ Complete conversation history (Janus)
- ✅ Curated long-term memory (Dream)
- ✅ Fast semantic search (Lao)
- ✅ 70% token reduction
- ✅ Automatic memory management

---

## 🤝 Contributing

Janus is a built-in system for OpenClaw. Issues and improvements are welcome.

---

**Janus v1.0.0**  
*Too many memories? Put them in a box!*

**GitHub**: https://github.com/JingWang-Star996/Janus
