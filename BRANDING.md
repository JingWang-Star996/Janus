# 🏛️ Janus (杰纳斯) 品牌说明

---

## 📛 命名

**英文名**: **Janus**  
**中文名**: **杰纳斯**  
**发音**: /ˈdʒeɪnəs/ (杰纳斯)

---

## 🎭 命名来源

**Janus** 是罗马神话中的**双面神**，象征着：

- **一面看向过去** → 会话历史记录
- **一面看向未来** → 上下文窗口管理
- **守护门户** → 粘贴内容管理

他是门神、开端之神、过渡之神，完美契合记忆系统的定位。

---

## 🏷️ Slogan

**英文**: "Two Faces, One Memory"  
**中文**: "双面一心，记忆如新"

---

## 🎨 品牌调性

- **专业** - 完整的企业级记忆管理系统
- **高效** - 10 倍性能提升
- **可靠** - 文件锁机制，并发安全
- **智能** - 懒加载、模型适配

---

## 📦 产品定位

**Janus** 是 OpenClaw 的完整第二记忆系统，参考 Claude Code 的会话管理 + 粘贴管理 + 上下文管理，三大核心功能合一。

### 三大核心模块

| 模块 | 功能 | 比喻 |
|------|------|------|
| **Session (溯)** | 会话历史管理 | 过去 - 记录历史 |
| **Clipboard (匣)** | 粘贴内容管理 | 门户 - 守护入口 |
| **Context (窗)** | 上下文窗口管理 | 未来 - 智能预测 |

---

## 🔧 技术特色

- ✅ 文件锁机制 - 并发安全
- ✅ 懒加载优化 - 10 倍性能
- ✅ 粘贴引用展开 - 智能去重
- ✅ 会话隔离增强 - 项目级别
- ✅ 模型适配 - 15+ 模型支持

---

## 📊 性能指标

| 指标 | v1.0 | v2.0 | 提升 |
|------|------|------|------|
| 大会话加载 | 500ms | 50ms | **10x** |
| 内存占用 | 100MB | 20MB | **5x** |
| 测试覆盖 | 24 用例 | 78 用例 | **3.25x** |

---

## 🎯 目标用户

- **AI 开发者** - 需要管理大量对话历史
- **研究人员** - 需要长期记忆和检索
- **企业用户** - 需要并发安全和项目隔离
- **OpenClaw 用户** - 完整的第二记忆系统

---

## 📁 项目结构

```
janus/
├── src/                    # 源代码
│   ├── janus.js           # 主入口 (原 yixia.js)
│   ├── session.js         # 会话管理
│   ├── clipboard.js       # 粘贴管理
│   ├── context.js         # 上下文管理
│   ├── fileLock.js        # 文件锁机制
│   ├── lazyLoader.js      # 懒加载优化
│   ├── modelAdapter.js    # 模型适配
│   └── utils.js           # 工具函数
├── janus-cli.js            # CLI 工具 (原 yixia-cli.js)
├── tests/                  # 测试文件 (78 用例)
└── docs/                   # 文档
```

---

## 🚀 使用示例

### JavaScript API

```javascript
const { Janus } = require('./janus.js');

const janus = new Janus({
  historyPath: '~/.openclaw/history.jsonl',
  pastesDir: '~/.openclaw/pastes/'
});

// 记录对话
janus.record({
  sessionId: 'session-001',
  role: 'user',
  content: '你好，Janus！'
});
```

### CLI

```bash
# 创建会话
./janus-cli.js session create "我的会话"

# 记录消息
./janus-cli.js message add "session-001" "user" "你好"

# 查看统计
./janus-cli.js stats
```

---

## 📄 许可证

MIT License

---

## 🔗 链接

- **GitHub**: https://github.com/openclaw/janus
- **OpenClaw**: https://github.com/openclaw/openclaw

---

**Janus (杰纳斯) v2.0.0**  
*Two Faces, One Memory*
