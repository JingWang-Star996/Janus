# Orchestra 工作流引擎使用指南

> 🎻 专业工作流引擎，支持顺序/并行/混合执行模式

**版本**: 1.0.0  
**作者**: AI 首席架构师  
**创建日期**: 2026-04-03

---

## 📖 目录

1. [快速开始](#快速开始)
2. [核心概念](#核心概念)
3. [工作流类型](#工作流类型)
4. [API 参考](#api 参考)
5. [高级功能](#高级功能)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)

---

## 🚀 快速开始

### 1. 安装与初始化

```javascript
const { createEngine, WorkflowType } = require('./workflowEngine');

// 创建引擎实例（自动注册预定义工作流）
const engine = createEngine({
  enableLogging: true,
  enableRollback: true,
  defaultTimeout: 600000  // 10 分钟
});
```

### 2. 执行工作流

```javascript
// 执行编辑部工作流（顺序模式）
const result = await engine.execute('editorial', {
  title: 'AI 助手开发指南',
 素材：'...',
  hasTechnicalContent: true
});

console.log(`执行状态：${result.status}`);
console.log(`进度：${result.progress.percentage}%`);
```

### 3. 监控进度

```javascript
// 获取执行状态
const status = engine.getExecutionStatus(result.executionId);
console.log(JSON.stringify(status, null, 2));
```

---

## 💡 核心概念

### Stage（阶段）

工作流的基本执行单元，代表一个独立的 task。

```javascript
{
  id: 'unique_stage_id',
  name: '阶段名称',
  agent: '执行的 Agent 标识',
  description: '阶段描述',
  timeout: 300000,      // 超时时间（毫秒）
  retries: 2,           // 重试次数
  dependencies: ['stage_a'],  // 依赖的其他 stage
  conditions: [...]     // 执行条件
}
```

### Workflow（工作流）

由多个 Stage 组成的完整流程。

```javascript
{
  id: 'workflow_id',
  name: '工作流名称',
  type: 'sequential',   // sequential | parallel | hybrid
  stages: [...],        // Stage 数组
  dependencies: {...},  // 依赖关系
  metadata: {...}       // 元数据
}
```

### Execution（执行实例）

工作流的一次具体执行，包含运行时状态。

```javascript
{
  executionId: 'unique_id',
  status: 'running',    // idle | running | completed | failed | paused
  progress: {
    total: 7,
    completed: 3,
    percentage: 42
  },
  stages: [...]         // 各 stage 的状态
}
```

---

## 📊 工作流类型

### 1. 顺序执行 (Sequential)

Stage 按定义顺序依次执行，前一个完成后才能执行下一个。

**适用场景**：
- 编辑审核流程
- 审批链
- 生产线

**示例**：
```javascript
{
  type: 'sequential',
  stages: ['stage1', 'stage2', 'stage3']
  // 执行顺序：stage1 → stage2 → stage3
}
```

### 2. 并行执行 (Parallel)

所有 Stage 同时启动，独立执行。

**适用场景**：
- 多角色评审
- 跨部门协作
- 独立任务分发

**示例**：
```javascript
{
  type: 'parallel',
  stages: ['ceo_review', 'tech_review', 'design_review']
  // 同时执行所有 stage
}
```

### 3. 混合执行 (Hybrid)

结合顺序和并行，支持复杂依赖关系。

**适用场景**：
- 美术生产管线
- 软件发布流程
- 多阶段项目

**示例**：
```javascript
{
  type: 'hybrid',
  stages: [
    { id: 'concept', dependencies: [] },
    { id: 'original', dependencies: ['concept'] },
    { id: 'model', dependencies: ['original'], parallelGroup: 'prod' },
    { id: 'effects', dependencies: ['original'], parallelGroup: 'prod' },
    { id: 'review', dependencies: ['model', 'effects'] }
  ]
  // 执行流程：concept → original → (model + effects 并行) → review
}
```

---

## 🔧 API 参考

### WorkflowEngine

#### 构造函数

```javascript
new WorkflowEngine(config?: {
  maxConcurrentExecutions?: number,  // 最大并发执行数
  defaultTimeout?: number,           // 默认超时（毫秒）
  enableLogging?: boolean,           // 是否启用日志
  enableRollback?: boolean,          // 是否启用回滚
  workflowsPath?: string             // 工作流定义文件目录
})
```

#### 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `registerWorkflow(config)` | `WorkflowConfig` | `Workflow` | 注册工作流定义 |
| `loadWorkflowsFromDir(path)` | `string` | `void` | 从目录加载工作流 |
| `execute(id, context, options)` | `string, object, object` | `Promise<ExecutionResult>` | 执行工作流 |
| `getExecutionStatus(id)` | `string` | `ExecutionStatus` | 获取执行状态 |
| `pauseExecution(id)` | `string` | `boolean` | 暂停执行 |
| `resumeExecution(id, options)` | `string, object` | `Promise<boolean>` | 恢复执行 |
| `terminateExecution(id)` | `string` | `boolean` | 终止执行 |
| `rollback(id)` | `string` | `Promise<void>` | 回滚执行 |
| `exportExecutionHistory(id, path)` | `string, string` | `void` | 导出执行历史 |

### Stage

#### 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `id` | string | - | 唯一标识 |
| `name` | string | - | 显示名称 |
| `status` | StageStatus | PENDING | 执行状态 |
| `dependencies` | string[] | [] | 依赖的 stage IDs |
| `conditions` | Condition[] | [] | 执行条件 |
| `timeout` | number | 300000 | 超时时间 |
| `retries` | number | 0 | 重试次数 |
| `result` | any | null | 执行结果 |
| `error` | string | null | 错误信息 |
| `logs` | LogEntry[] | [] | 执行日志 |

---

## 🎯 高级功能

### 1. 依赖管理

Stage 可以定义对其他 Stage 的依赖：

```javascript
{
  id: 'stage_b',
  dependencies: ['stage_a', 'stage_c']
  // 只有当 stage_a 和 stage_c 都完成后才会执行
}
```

### 2. 条件分支

根据上下文条件决定是否执行：

```javascript
{
  id: 'tech_review',
  conditions: [
    {
      type: 'expression',
      expression: 'context.hasTechnicalContent === true'
    }
  ]
  // 只有当 context.hasTechnicalContent 为 true 时才执行
}
```

### 3. 错误处理与重试

```javascript
{
  id: 'critical_stage',
  retries: 3,  // 失败后重试 3 次
  timeout: 600000
}
```

### 4. 暂停与恢复

```javascript
// 暂停
engine.pauseExecution(executionId);

// ... 做一些其他事情 ...

// 恢复
await engine.resumeExecution(executionId);
```

### 5. 回滚

```javascript
// 执行失败时自动回滚
await engine.execute('workflow', context, {
  autoRollback: true
});

// 或手动回滚
await engine.rollback(executionId);
```

### 6. 并行组

混合模式下可以定义并行组：

```javascript
{
  stages: [
    { id: 'model', parallelGroup: 'production' },
    { id: 'effects', parallelGroup: 'production' }
  ],
  parallelGroups: {
    'production': {
      stages: ['model', 'effects'],
      syncPoint: 'review',
      timeout: 2400000
    }
  }
}
```

---

## 📚 最佳实践

### 1. 工作流设计

✅ **推荐**：
- 保持 Stage 职责单一
- 明确定义依赖关系
- 设置合理的超时时间
- 为关键 Stage 配置重试

❌ **避免**：
- 循环依赖
- 过长的 Stage 链（>10 个）
- 无超时限制
- 忽略错误处理

### 2. 性能优化

```javascript
// 批量执行时限制并发数
await engine.execute('workflow', context, {
  concurrencyLimit: 5,  // 最多 5 个 stage 并行
  maxRetries: 2
});
```

### 3. 监控与日志

```javascript
// 启用详细日志
const engine = new WorkflowEngine({
  enableLogging: true
});

// 定期查询进度
const status = engine.getExecutionStatus(executionId);
console.log(`进度：${status.progress.percentage}%`);
```

### 4. 错误处理

```javascript
try {
  const result = await engine.execute('workflow', context);
  
  if (result.status === 'failed') {
    console.error('执行失败:', result.result.errors);
    
    // 分析失败原因
    const failedStages = result.result.stages.filter(
      s => s.status === 'failed'
    );
    console.log('失败的 Stage:', failedStages.map(s => s.name));
  }
} catch (error) {
  console.error('引擎错误:', error.message);
}
```

---

## 🔍 故障排除

### 常见问题

#### 1. Stage 不执行

**可能原因**：
- 依赖的 Stage 未完成
- 条件不满足
- 工作流已暂停

**解决方案**：
```javascript
const status = engine.getExecutionStatus(executionId);
status.stages.forEach(stage => {
  console.log(`${stage.name}: ${stage.status}`);
  if (stage.dependencies.length > 0) {
    console.log('  依赖:', stage.dependencies);
  }
});
```

#### 2. 执行超时

**可能原因**：
- Stage 执行时间过长
- 死锁（循环依赖）
- Agent 无响应

**解决方案**：
```javascript
// 增加超时时间
{
  id: 'slow_stage',
  timeout: 1200000  // 20 分钟
}

// 或终止执行
engine.terminateExecution(executionId);
```

#### 3. 回滚失败

**可能原因**：
- Stage 未实现回滚逻辑
- 资源已释放

**解决方案**：
- 确保关键 Stage 实现回滚方法
- 使用事务性操作
- 记录回滚日志

---

## 📋 预定义工作流

引擎内置了 3 个工作流模板：

| ID | 名称 | 类型 | 描述 |
|----|------|------|------|
| `editorial` | 编辑部工作流 | sequential | 7 人编辑部协作流程 |
| `gameDesign` | 游戏设计工作流 | parallel | 5 人并行评审流程 |
| `artProduction` | 美术生产工作流 | hybrid | 美术资源生产管线 |

### 使用示例

```javascript
const engine = createEngine();

// 编辑部工作流
await engine.execute('editorial', {
  title: '文章标题',
  素材：'原始素材',
  hasTechnicalContent: true
});

// 游戏设计工作流
await engine.execute('gameDesign', {
  designDoc: '设计方案',
  designType: 'major',
  requiresCEOApproval: true
});

// 美术生产工作流
await engine.execute('artProduction', {
  assetType: 'character',
  qualityStandard: 'high',
  isFinalBuild: true
});
```

---

## 🎓 进阶示例

### 自定义工作流

```javascript
const customWorkflow = {
  id: 'custom_review',
  name: '自定义评审流程',
  type: 'hybrid',
  stages: [
    {
      id: 'initial',
      name: '初审',
      agent: 'reviewer_1',
      timeout: 300000
    },
    {
      id: 'expert_review',
      name: '专家评审',
      agent: 'expert',
      dependencies: ['initial'],
      conditions: [{
        type: 'expression',
        expression: 'context.complexity > 5'
      }]
    },
    {
      id: 'final_approval',
      name: '最终批准',
      agent: 'manager',
      dependencies: ['initial', 'expert_review']
    }
  ]
};

engine.registerWorkflow(customWorkflow);
```

### 监听执行事件

```javascript
// 扩展引擎添加事件监听
class MonitoredEngine extends WorkflowEngine {
  async executeStage(execution, stage, options) {
    this.emit('stage:start', { execution, stage });
    
    try {
      const result = await super.executeStage(execution, stage, options);
      this.emit('stage:complete', { execution, stage, result });
      return result;
    } catch (error) {
      this.emit('stage:fail', { execution, stage, error });
      throw error;
    }
  }
}
```

---

## 📞 支持

如有问题或建议，请联系：

- **作者**: AI 首席架构师
- **版本**: 1.0.0
- **许可证**: MIT

---

*最后更新：2026-04-03*
