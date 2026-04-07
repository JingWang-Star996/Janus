# 忆匣 (YiXia) 项目结构

```
yixia/                          # 忆匣项目根目录
│
├── src/                        # 源代码目录
│   ├── index.js               # 主入口文件（YiXia 类）
│   ├── session.js             # 会话管理模块（溯）
│   ├── clipboard.js           # 粘贴管理模块（匣）
│   ├── context.js             # 上下文管理模块（窗）
│   └── utils.js               # 通用工具函数
│
├── tests/                      # 测试文件目录
│   ├── test-all.js            # 测试套件入口（运行全部测试）
│   ├── test-session.js        # 会话管理测试
│   ├── test-clipboard.js      # 粘贴管理测试
│   └── test-context.js        # 上下文管理测试
│
├── data/                       # 数据存储目录（运行时生成）
│   ├── sessions/              # 会话记录（JSONL 文件）
│   ├── clips/                 # 粘贴内容（文本文件）
│   └── meta.json              # 元数据索引
│
├── README.md                   # 项目说明文档
├── USAGE.md                    # 详细使用文档
├── DEV.md                      # 开发文档（架构设计）
├── PROJECT-SUMMARY.md          # 项目总结
├── STRUCTURE.md                # 项目结构（本文件）
└── package.json                # NPM 项目配置
```

## 文件说明

### 源代码 (src/)

| 文件 | 大小 | 行数 | 说明 |
|------|------|------|------|
| index.js | 5.5KB | ~180 | YiXia 主类，集成三大模块 |
| session.js | 6.0KB | ~200 | 会话管理（溯）- JSONL 存储 |
| clipboard.js | 6.8KB | ~230 | 粘贴管理（匣）- 外部存储 + 去重 |
| context.js | 4.2KB | ~150 | 上下文管理（窗）- 智能优化 |
| utils.js | 2.9KB | ~100 | 工具函数（ID 生成、哈希、JSON 等） |

### 测试文件 (tests/)

| 文件 | 大小 | 行数 | 说明 |
|------|------|------|------|
| test-all.js | 1.3KB | ~45 | 测试套件入口，汇总所有测试 |
| test-session.js | 2.5KB | ~80 | 7 个会话管理测试用例 |
| test-clipboard.js | 2.6KB | ~85 | 8 个粘贴管理测试用例 |
| test-context.js | 3.2KB | ~100 | 9 个上下文管理测试用例 |

### 文档

| 文件 | 大小 | 说明 |
|------|------|------|
| README.md | 2.4KB | 项目说明、快速开始、API 示例 |
| USAGE.md | 4.8KB | 详细使用文档、最佳实践 |
| DEV.md | 4.6KB | 开发文档、架构设计、扩展方向 |
| PROJECT-SUMMARY.md | 5.0KB | 项目总结、交付清单、测试结果 |
| STRUCTURE.md | 本文件 | 项目结构说明 |

### 配置

| 文件 | 大小 | 说明 |
|------|------|------|
| package.json | 0.5KB | NPM 项目配置、脚本定义 |

## 模块依赖关系

```
┌─────────────────────────────────────────┐
│           index.js (YiXia)              │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Session  │  │Clipboard │  │Context│ │
│  │  (溯)    │  │  (匣)    │  │ (窗)  │ │
│  └────┬─────┘  └────┬─────┘  └───┬───┘ │
│       │             │             │     │
│       └─────────────┴─────────────┘     │
│                     │                    │
│              ┌──────▼──────┐            │
│              │  utils.js   │            │
│              │  (工具)     │            │
│              └─────────────┘            │
└─────────────────────────────────────────┘
```

## 数据流向

### 会话管理（溯）

```
用户消息
   │
   ▼
Session.addMessage()
   │
   ▼
appendJsonl() ──→ data/sessions/{sessionId}.jsonl
   │
   ▼
更新 meta.json 中的会话元数据
```

### 粘贴管理（匣）

```
大段内容
   │
   ▼
Clipboard.store()
   │
   ├─→ 计算 SHA256 哈希（去重检测）
   │
   ├─→ 写入 data/clips/{clipId}.txt
   │
   └─→ 更新 meta.json 中的剪贴元数据
```

### 上下文管理（窗）

```
添加上下文
   │
   ▼
ContextWindow.add()
   │
   ├─→ 估算 token 数
   │
   ├─→ 添加到内存数组
   │
   └─→ 触发优化（如超限）
         │
         ▼
       移除低优先级项
```

## 运行流程

### 测试流程

```bash
npm test
   │
   ▼
node tests/test-all.js
   │
   ├─→ test-session.js (7 个测试)
   │
   ├─→ test-clipboard.js (8 个测试)
   │
   └─→ test-context.js (9 个测试)
   │
   ▼
汇总结果：24 个测试用例
```

### 演示流程

```bash
node src/index.js demo
   │
   ▼
1. 创建会话
2. 添加消息
3. 存储大内容
4. 管理上下文
5. 查看统计
```

## 命令快速参考

```bash
# 运行测试
npm test

# 运行演示
npm run demo

# 查看统计
npm run stats

# 单独测试
node tests/test-session.js
node tests/test-clipboard.js
node tests/test-context.js
```

## 扩展指南

### 添加新功能模块

1. 在 `src/` 下创建新模块文件
2. 在 `index.js` 中导入并集成
3. 在 `tests/` 下创建对应测试
4. 更新文档

### 添加新字段类型

1. 修改对应模块的 store/create 方法
2. 更新 meta.json 结构
3. 添加迁移逻辑（如需要）
4. 更新测试用例

### 添加新存储后端

1. 实现统一的存储接口
2. 修改 utils.js 中的读写函数
3. 添加配置选项
4. 更新测试

---

**项目结构版本**: v1.0.0  
**最后更新**: 2026-04-06
