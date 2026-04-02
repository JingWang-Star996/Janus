# Orchestra vs Claude Code Coordinator 对比分析

**分析时间**：2026-04-03 00:21  
**分析人**：AI 软件公司（15 人团队）  
**源码参考**：`claude-code/coordinator/coordinatorMode.ts`

---

## 📊 系统概览对比

| 维度 | Claude Code Coordinator | Orchestra 100% |
|------|------------------------|---------------|
| **架构模式** | Coordinator + Worker | Gateway + Agent/Team |
| **执行模式** | 异步并行 | 同步/异步混合 |
| **核心流程** | 4 阶段（Research/Synthesis/Implementation/Verification） | 多工作流（编辑部 7 阶段/游戏设计 24 岗位/OpenClaw 15 人） |
| **知识共享** | Scratchpad（跨 Worker） | 上下文传递（待实现） |
| **任务通知** | XML 格式 `<task-notification>` | 待实现 |
| **Worker 管理** | Create/Continue/Stop | 延迟加载/工作流引擎 |

---

## 🏗️ 架构对比

### Claude Code Coordinator

```
coordinatorMode.ts
  ↓
AgentTool (Worker 创建)
SendMessageTool (Worker 继续)
TaskStopTool (Worker 停止)
TeamCreateTool (团队管理)
```

### Orchestra 100%

```
orchestra/
├── gateway.js          # 统一入口（类似 Coordinator）
├── planner.js          # 任务分解器
├── router.js           # Agent 路由器
├── tracker.js          # 进度跟踪器
├── aggregator.js       # 结果汇总器
├── error.js            # 错误处理
└── index.js            # 导出
```

---

## 🎯 核心角色对比

### Coordinator vs Gateway

| 功能 | Claude Code Coordinator | Orchestra Gateway | 状态 |
|------|----------------------|-------------------|------|
| 用户交互 | 直接与用户沟通 | ✅ 统一入口 | ✅ |
| Worker 创建 | AGENT_TOOL_NAME | ✅ 团队识别 | ✅ |
| Worker 继续 | SEND_MESSAGE_TOOL_NAME | ❌ 待实现 | ❌ |
| Worker 停止 | TASK_STOP_TOOL_NAME | ❌ 待实现 | ❌ |
| 简单问题直接回答 | ✅ 是 | ❌ 待实现 | ❌ |

### Worker vs Agent

| 功能 | Claude Code Worker | Orchestra Agent | 状态 |
|------|------------------|----------------|------|
| 异步并行执行 | ✅ 是 | ❌ 同步顺序 | ❌ |
| 任务通知 | ✅ XML 格式 | ❌ 待实现 | ❌ |
| 工具权限 | 简单/完整模式 | ❌ 待实现 | ❌ |
| 上下文隔离 | ✅ 是 | ✅ 是 | ✅ |

---

## 🔄 工作流对比

### Claude Code 四阶段

1. **Research（研究）** - Workers 并行调查代码库
2. **Synthesis（综合）** - Coordinator 阅读发现、制定规范
3. **Implementation（实现）** - Workers 根据规范修改
4. **Verification（验证）** - Workers 测试修改

### Orchestra 工作流

| 工作流 | 阶段数 | 执行模式 | 状态 |
|-------|-------|---------|------|
| 编辑部 | 7 阶段 | 顺序执行 | ✅ 完成 |
| 游戏设计 | 24 岗位 | 并行执行 | ❌ 待实现 |
| OpenClaw 分析 | 15 人 | 顺序 + 并行 | ✅ 完成 |

---

## 📡 任务通知系统对比

### Claude Code（XML 格式）

```xml
<task-notification>
  <task-id>{agentId}</task-id>
  <status>completed|failed|killed</status>
  <summary>{human-readable status summary}</summary>
  <result>{agent's final text response}</result>
  <usage>
    <total_tokens>N</total_tokens>
    <tool_uses>N</tool_uses>
    <duration_ms>N</duration_ms>
  </usage>
</task-notification>
```

### Orchestra

**状态**：❌ 待实现

**建议实现**：
```javascript
{
  type: 'task-notification',
  taskId: 'agent-x7q',
  status: 'completed|failed|killed',
  summary: '任务完成摘要',
  result: 'Agent 最终响应',
  usage: {
    totalTokens: N,
    toolUses: N,
    durationMs: N
  }
}
```

---

## 🎯 Worker/Agent 管理对比

### Claude Code 三种操作

| 操作 | API | 用途 |
|------|-----|------|
| 创建 | AGENT_TOOL_NAME | 创建新 Worker |
| 继续 | SEND_MESSAGE_TOOL_NAME | 继续现有 Worker |
| 停止 | TASK_STOP_TOOL_NAME | 停止 Worker |

### Orchestra

| 操作 | 状态 | 说明 |
|------|------|------|
| 团队识别 | ✅ 完成 | 根据触发词识别团队 |
| 延迟加载 | ✅ 完成 | 避免初始化错误 |
| 工作流引擎 | ✅ 完成 | 编辑部/OpenClaw |
| Continue vs. Spawn | ❌ 待实现 | 智能决策机制 |
| Worker 停止 | ❌ 待实现 | 停止错误方向 |

---

## 🧠 Continue vs. Spawn 决策矩阵

### Claude Code 决策原则

| 情况 | 机制 | 原因 |
|------|------|------|
| 研究探索了 exactly 需要编辑的文件 | **Continue** | Worker 已有文件上下文 + 清晰计划 |
| 研究广泛但实现狭窄 | **Spawn fresh** | 避免探索噪音，专注上下文 |
| 纠正失败或扩展近期工作 | **Continue** | Worker 有错误上下文 |
| 验证另一个 Worker 的代码 | **Spawn fresh** | 验证者应该用新鲜眼光 |
| 第一次尝试用了错误方法 | **Spawn fresh** | 错误方法上下文污染重试 |
| 完全不相关的任务 | **Spawn fresh** | 无有用上下文可复用 |

**核心原则**：
> "Think about how much of the worker's context overlaps with the next task. High overlap → continue. Low overlap → spawn fresh."

### Orchestra

**状态**：❌ 待实现

**建议实现位置**：`orchestrator/router.js`

---

## 🚀 并行执行对比

### Claude Code 并发策略

| 任务类型 | 策略 |
|---------|------|
| **只读任务**（研究） | 自由并行 |
| **写密集任务**（实现） | 每文件集一次一个 |
| **验证** | 可在不同文件区域与实现并行 |

**核心原则**：
> "Parallelism is your superpower. Workers are async. Launch independent workers concurrently whenever possible."

### Orchestra

| 工作流 | 执行模式 | 状态 |
|-------|---------|------|
| 编辑部 7 阶段 | 顺序执行 | ✅ 完成 |
| 游戏设计 24 岗位 | 并行执行 | ❌ 待实现 |
| OpenClaw 分析 15 人 | 顺序 + 并行 | ✅ 部分完成 |

---

## 🔧 工具系统对比

### Claude Code Coordinator 专属工具

| 工具 | 用途 | Orchestra 状态 |
|------|------|---------------|
| AGENT_TOOL_NAME | 创建 Worker | ❌ 待实现 |
| SEND_MESSAGE_TOOL_NAME | 继续现有 Worker | ❌ 待实现 |
| TASK_STOP_TOOL_NAME | 停止 Worker | ❌ 待实现 |
| subscribe_pr_activity | 订阅 GitHub PR 事件 | ❌ 不相关 |
| unsubscribe_pr_activity | 取消订阅 | ❌ 不相关 |

### Orchestra 工具系统

| 工具 | 状态 | 说明 |
|------|------|------|
| 团队识别 | ✅ 完成 | router.js |
| 延迟加载 | ✅ 完成 | getTeamAgents() |
| 工作流引擎 | ✅ 完成 | editorial/codeAnalysis |
| 任务通知 | ❌ 待实现 | 需实现 XML/JSON 格式 |
| Worker 管理 | ❌ 待实现 | Create/Continue/Stop |

---

## 📝 Scratchpad 系统对比

### Claude Code

- **功能**：跨 Worker 知识共享、持久化存储、无权限提示
- **启用条件**：`checkStatsigFeatureGate_CACHED_MAY_BE_STALE('tengu_scratch')`

### Orchestra

**状态**：❌ 待实现

**建议实现**：
- 使用 `memory/` 目录作为共享知识存储
- 每个任务创建独立的 Scratchpad 文件
- Worker 之间通过 Scratchpad 传递上下文

---

## 💡 设计亮点借鉴

### 1. 并行优先

**Claude Code**：
> "Parallelism is your superpower. Workers are async."

**Orchestra 现状**：编辑部 7 阶段是顺序执行

**建议改进**：
- 实现异步执行引擎
- 游戏设计 24 岗位实现并行执行
- 支持"扇出"（fan out）模式

---

### 2. 上下文管理

**Claude Code**：Continue vs. Spawn 智能决策

**Orchestra 现状**：❌ 待实现

**建议实现**：
```javascript
// router.js
function decideContinueOrSpawn(task, workerContext) {
  const overlap = calculateContextOverlap(task, workerContext);
  return overlap > 0.7 ? 'continue' : 'spawn';
}
```

---

### 3. 任务隔离

**Claude Code**：Worker 看不到 Coordinator 对话

**Orchestra 现状**：✅ 已实现（每个 Agent 独立提示词）

---

### 4. 灵活恢复

**Claude Code**：继续 Worker 利用上下文、停止错误方向

**Orchestra 现状**：❌ 待实现

**建议实现**：
- 添加 `continueAgent(agentId, message)` 方法
- 添加 `stopAgent(agentId)` 方法

---

### 5. 验证独立

**Claude Code**：验证者用新鲜眼光，不依赖实现者假设

**Orchestra 现状**：❌ 待实现

**建议实现**：
- 验证任务使用 `spawn fresh` 模式
- 不传递实现者的上下文

---

## 📋 差距总结

### ✅ 已完成（Orchestra 100%）

| 功能 | 文件 | 状态 |
|------|------|------|
| Gateway 统一入口 | gateway.js | ✅ |
| Orchestrator Agent | agents/Orchestrator/agent.md | ✅ |
| Router 团队识别 | router.js | ✅ |
| Router 延迟加载 | router.js | ✅ |
| 编辑部 7 人工作流 | gateway.js | ✅ |
| OpenClaw 分析 15 人工作流 | gateway.js | ✅ |
| README.100.md | README.100.md | ✅ |

### ❌ 待实现（vs Claude Code）

| 功能 | 优先级 | 预计工作量 |
|------|-------|-----------|
| 异步并行执行 | 🔴 高 | 2 天 |
| 任务通知系统（XML/JSON） | 🔴 高 | 1 天 |
| Continue vs. Spawn 决策 | 🔴 高 | 1 天 |
| Worker 管理（Create/Continue/Stop） | 🔴 高 | 2 天 |
| Scratchpad 知识共享 | 🟡 中 | 2 天 |
| 游戏设计 24 人并行工作流 | 🟡 中 | 2 天 |
| Agent 间通信机制 | 🟡 中 | 2 天 |
| 性能优化 | 🟢 低 | 3 天 |
| 单元测试 | 🟢 低 | 3 天 |

---

## 🎯 下一步建议

### Phase 1（核心功能）- 1 周

1. **异步并行执行引擎** - 支持多个 Agent 同时运行
2. **任务通知系统** - 实现 XML/JSON 格式通知
3. **Worker 管理 API** - Create/Continue/Stop

### Phase 2（智能决策）- 1 周

1. **Continue vs. Spawn 决策矩阵** - 上下文重叠计算
2. **Scratchpad 知识共享** - 跨 Agent 上下文传递
3. **游戏设计 24 人并行工作流** - 实现并行执行

### Phase 3（优化完善）- 1 周

1. **性能优化** - 并发管理、资源控制
2. **单元测试** - 覆盖核心功能
3. **文档完善** - API 参考、最佳实践

---

## 📊 完成度评估

| 维度 | Claude Code | Orchestra 100% | 完成度 |
|------|-----------|---------------|--------|
| 核心架构 | 100% | 80% | 🟡 |
| 并行执行 | 100% | 30% | 🔴 |
| Worker 管理 | 100% | 40% | 🔴 |
| 任务通知 | 100% | 0% | 🔴 |
| 知识共享 | 100% | 20% | 🔴 |
| 工作流引擎 | 80% | 70% | 🟡 |
| 文档体系 | 80% | 80% | 🟢 |

**总体完成度**：约 **60%**

**差距**：主要是**异步并行**、**任务通知**、**Worker 管理**三大核心功能

---

**分析版本**：v1.0  
**创建时间**：2026-04-03 00:21  
**状态**：✅ 对比分析完成
