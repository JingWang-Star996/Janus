/**
 * Orchestra 工作流引擎
 * 专业工作流执行引擎，支持顺序/并行/混合执行模式
 * 
 * @version 1.0.0
 * @author AI 首席架构师
 */

const fs = require('fs');
const path = require('path');

// ==================== 枚举定义 ====================

/**
 * Stage 执行状态
 */
const StageStatus = {
  PENDING: 'pending',      // 等待执行
  RUNNING: 'running',      // 执行中
  COMPLETED: 'completed',  // 已完成
  FAILED: 'failed',        // 执行失败
  SKIPPED: 'skipped'       // 已跳过
};

/**
 * 工作流执行状态
 */
const WorkflowStatus = {
  IDLE: 'idle',            // 未开始
  RUNNING: 'running',      // 执行中
  COMPLETED: 'completed',  // 已完成
  PAUSED: 'paused',        // 已暂停
  FAILED: 'failed',        // 执行失败
  ROLLED_BACK: 'rolled_back' // 已回滚
};

/**
 * 工作流类型
 */
const WorkflowType = {
  SEQUENTIAL: 'sequential',  // 顺序执行
  PARALLEL: 'parallel',      // 并行执行
  HYBRID: 'hybrid'          // 混合执行
};

// ==================== 核心类定义 ====================

/**
 * Stage 类 - 表示工作流中的单个阶段
 */
class Stage {
  constructor(config) {
    this.id = config.id || config.name;
    this.name = config.name;
    this.description = config.description || '';
    this.agent = config.agent;           // 执行的 Agent 标识
    this.timeout = config.timeout || 300000; // 默认 5 分钟超时
    this.retries = config.retries || 0;  // 重试次数
    this.dependencies = config.dependencies || []; // 依赖的 stage IDs
    this.conditions = config.conditions || []; // 执行条件
    
    // 运行时状态
    this.status = StageStatus.PENDING;
    this.startTime = null;
    this.endTime = null;
    this.result = null;
    this.error = null;
    this.retryCount = 0;
    this.logs = [];
  }

  /**
   * 记录日志
   */
  log(message, level = 'info') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message
    });
  }

  /**
   * 检查是否满足执行条件
   */
  checkConditions(context) {
    if (this.conditions.length === 0) return true;
    
    return this.conditions.every(condition => {
      if (condition.type === 'expression') {
        // 支持简单的表达式判断，使用 Function 构造器安全访问 context
        try {
          const fn = new Function('context', `return ${condition.expression};`);
          return fn(context);
        } catch (e) {
          this.log(`条件判断失败：${e.message}`, 'error');
          return false;
        }
      }
      return true;
    });
  }

  /**
   * 检查依赖是否已完成
   */
  checkDependencies(stages) {
    return this.dependencies.every(depId => {
      const depStage = stages.find(s => s.id === depId);
      // 依赖的 stage 完成或跳过都算满足
      return depStage && [StageStatus.COMPLETED, StageStatus.SKIPPED].includes(depStage.status);
    });
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      result: this.result,
      error: this.error,
      retryCount: this.retryCount,
      logs: this.logs
    };
  }
}

/**
 * Workflow 类 - 表示一个完整的工作流
 */
class Workflow {
  constructor(config) {
    this.id = config.id || config.name;
    this.name = config.name;
    this.description = config.description || '';
    this.type = config.type || WorkflowType.SEQUENTIAL;
    this.stages = (config.stages || []).map((s, index) => {
      if (typeof s === 'string') {
        return new Stage({ id: s, name: s, agent: s });
      }
      return new Stage({ ...s, id: s.id || s.name });
    });
    this.dependencies = config.dependencies || {}; // stage 依赖关系
    this.metadata = config.metadata || {};
    
    // 运行时状态
    this.status = WorkflowStatus.IDLE;
    this.startTime = null;
    this.endTime = null;
    this.currentStageIndex = 0;
    this.context = {}; // 执行上下文
    this.errors = [];
  }

  /**
   * 初始化工作流
   */
  initialize(context = {}) {
    this.status = WorkflowStatus.IDLE;
    this.context = { ...context };
    this.startTime = null;
    this.endTime = null;
    this.currentStageIndex = 0;
    this.errors = [];
    
    // 重置所有 stage 状态
    this.stages.forEach(stage => {
      stage.status = StageStatus.PENDING;
      stage.startTime = null;
      stage.endTime = null;
      stage.result = null;
      stage.error = null;
      stage.retryCount = 0;
      stage.logs = [];
    });

    // 应用依赖关系
    Object.entries(this.dependencies).forEach(([stageId, deps]) => {
      const stage = this.stages.find(s => s.id === stageId);
      if (stage) {
        stage.dependencies = Array.isArray(deps) ? deps : [deps];
      }
    });

    this.log('工作流已初始化', 'info');
  }

  /**
   * 记录日志
   */
  log(message, level = 'info') {
    console.log(`[Workflow:${this.name}] ${message}`);
  }

  /**
   * 获取下一个可执行的 stage
   */
  getNextStage() {
    switch (this.type) {
      case WorkflowType.SEQUENTIAL:
        return this.getNextSequentialStage();
      case WorkflowType.PARALLEL:
        return this.getNextParallelStages();
      case WorkflowType.HYBRID:
        return this.getNextHybridStages();
      default:
        return this.getNextSequentialStage();
    }
  }

  /**
   * 顺序模式：获取下一个 stage
   */
  getNextSequentialStage() {
    for (let i = this.currentStageIndex; i < this.stages.length; i++) {
      const stage = this.stages[i];
      if (stage.status === StageStatus.PENDING) {
        if (stage.checkDependencies(this.stages)) {
          this.currentStageIndex = i;
          return [stage];
        }
      }
    }
    return [];
  }

  /**
   * 并行模式：获取所有可并行执行的 stage
   */
  getNextParallelStages() {
    return this.stages.filter(stage => 
      stage.status === StageStatus.PENDING && 
      stage.checkDependencies(this.stages)
    );
  }

  /**
   * 混合模式：根据配置获取可执行的 stage
   */
  getNextHybridStages() {
    // 混合模式支持复杂的依赖图
    return this.stages.filter(stage => 
      stage.status === StageStatus.PENDING && 
      stage.checkDependencies(this.stages) &&
      stage.checkConditions(this.context)
    );
  }

  /**
   * 检查是否所有 stage 都已完成
   */
  isComplete() {
    return this.stages.every(stage => 
      [StageStatus.COMPLETED, StageStatus.SKIPPED].includes(stage.status)
    );
  }

  /**
   * 检查是否有 stage 失败
   */
  hasFailed() {
    return this.stages.some(stage => stage.status === StageStatus.FAILED);
  }

  /**
   * 获取执行进度
   */
  getProgress() {
    const total = this.stages.length;
    const completed = this.stages.filter(s => 
      [StageStatus.COMPLETED, StageStatus.SKIPPED].includes(s.status)
    ).length;
    const failed = this.stages.filter(s => s.status === StageStatus.FAILED).length;
    const running = this.stages.filter(s => s.status === StageStatus.RUNNING).length;

    return {
      total,
      completed,
      failed,
      running,
      pending: total - completed - failed - running,
      percentage: Math.round((completed / total) * 100)
    };
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      progress: this.getProgress(),
      stages: this.stages.map(s => s.toJSON()),
      context: this.context,
      errors: this.errors
    };
  }
}

/**
 * WorkflowEngine 类 - 工作流执行引擎
 */
class WorkflowEngine {
  constructor(config = {}) {
    this.workflows = new Map();
    this.executions = new Map();
    this.config = {
      maxConcurrentExecutions: config.maxConcurrentExecutions || 10,
      defaultTimeout: config.defaultTimeout || 600000, // 10 分钟
      enableLogging: config.enableLogging !== false,
      enableRollback: config.enableRollback !== false,
      workflowsPath: config.workflowsPath || path.join(__dirname, 'workflows')
    };
    
    this.log('Orchestra 工作流引擎已初始化');
  }

  /**
   * 记录日志
   */
  log(message, level = 'info') {
    if (this.config.enableLogging) {
      console.log(`[Orchestra Engine] ${message}`);
    }
  }

  /**
   * 注册工作流定义
   */
  registerWorkflow(workflowConfig) {
    const workflow = new Workflow(workflowConfig);
    this.workflows.set(workflow.id, workflow);
    this.log(`工作流 "${workflow.name}" 已注册`);
    return workflow;
  }

  /**
   * 从文件加载工作流定义
   */
  loadWorkflowsFromDir(dirPath = this.config.workflowsPath) {
    if (!fs.existsSync(dirPath)) {
      this.log(`工作流目录不存在：${dirPath}`, 'warn');
      return;
    }

    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.json')) {
        try {
          const filePath = path.join(dirPath, file);
          const config = file.endsWith('.js') 
            ? require(filePath) 
            : JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          
          if (Array.isArray(config)) {
            config.forEach(wf => this.registerWorkflow(wf));
          } else {
            this.registerWorkflow(config);
          }
          this.log(`已加载工作流文件：${file}`);
        } catch (error) {
          this.log(`加载工作流文件失败 ${file}: ${error.message}`, 'error');
        }
      }
    });
  }

  /**
   * 启动工作流执行
   */
  async execute(workflowId, context = {}, options = {}) {
    const workflowTemplate = this.workflows.get(workflowId);
    if (!workflowTemplate) {
      throw new Error(`工作流 "${workflowId}" 未找到`);
    }

    // 创建工作流实例
    const execution = new Workflow({ ...workflowTemplate });
    execution.initialize(context);
    
    const executionId = `${workflowId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.executions.set(executionId, execution);

    this.log(`开始执行工作流 "${execution.name}" (ID: ${executionId})`);
    execution.status = WorkflowStatus.RUNNING;
    execution.startTime = new Date().toISOString();

    try {
      await this.runExecution(execution, options);
    } catch (error) {
      this.log(`工作流执行失败：${error.message}`, 'error');
      execution.status = WorkflowStatus.FAILED;
      execution.errors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack
      });

      // 自动回滚
      if (this.config.enableRollback && options.autoRollback !== false) {
        await this.rollback(executionId);
      }
    }

    execution.endTime = new Date().toISOString();
    return {
      executionId,
      status: execution.status,
      progress: execution.getProgress(),
      result: execution.toJSON()
    };
  }

  /**
   * 执行工作流
   */
  async runExecution(execution, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const concurrencyLimit = options.concurrencyLimit || 5;

    while (execution.status === WorkflowStatus.RUNNING) {
      // 获取可执行的 stages
      const stagesToExecute = execution.getNextStage();

      if (stagesToExecute.length === 0) {
        if (execution.isComplete()) {
          execution.status = WorkflowStatus.COMPLETED;
          this.log(`工作流 "${execution.name}" 执行完成`);
          break;
        } else if (execution.hasFailed()) {
          execution.status = WorkflowStatus.FAILED;
          this.log(`工作流 "${execution.name}" 执行失败`);
          break;
        }
        // 等待依赖完成
        await this.sleep(100);
        continue;
      }

      // 限制并发数
      const batches = this.chunkArray(stagesToExecute, concurrencyLimit);
      
      for (const batch of batches) {
        const promises = batch.map(stage => this.executeStage(execution, stage, options));
        await Promise.all(promises);
      }
    }
  }

  /**
   * 执行单个 stage
   */
  async executeStage(execution, stage, options = {}) {
    stage.status = StageStatus.RUNNING;
    stage.startTime = new Date().toISOString();
    stage.log(`开始执行 stage: ${stage.name}`);

    try {
      // 检查执行条件
      if (!stage.checkConditions(execution.context)) {
        stage.status = StageStatus.SKIPPED;
        stage.log('不满足执行条件，跳过', 'warn');
        return;
      }

      // 执行 stage（调用 Agent 或执行函数）
      const result = await this.invokeStage(stage, execution.context, options);
      
      stage.status = StageStatus.COMPLETED;
      stage.result = result;
      stage.log(`执行成功`);

    } catch (error) {
      stage.error = error.message;
      stage.log(`执行失败：${error.message}`, 'error');

      // 重试逻辑
      if (stage.retryCount < stage.retries) {
        stage.retryCount++;
        stage.log(`重试 ${stage.retryCount}/${stage.retries}`, 'warn');
        await this.sleep(1000 * stage.retryCount); // 指数退避
        return this.executeStage(execution, stage, options);
      }

      stage.status = StageStatus.FAILED;
      execution.errors.push({
        stageId: stage.id,
        timestamp: new Date().toISOString(),
        message: error.message
      });

      throw error;
    } finally {
      stage.endTime = new Date().toISOString();
    }
  }

  /**
   * 调用 stage 执行（需要接入实际的 Agent 系统）
   */
  async invokeStage(stage, context, options) {
    stage.log(`调用 Agent: ${stage.agent || stage.name}`);
    
    // TODO: 这里需要接入实际的 Agent 调用系统
    // 目前返回模拟结果
    return new Promise((resolve, reject) => {
      const timeout = stage.timeout || this.config.defaultTimeout;
      
      const timer = setTimeout(() => {
        reject(new Error(`Stage "${stage.name}" 执行超时 (${timeout}ms)`));
      }, timeout);

      // 模拟执行
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          stageId: stage.id,
          status: 'success',
          message: `Stage "${stage.name}" 执行完成`,
          timestamp: new Date().toISOString()
        });
      }, Math.random() * 2000 + 500); // 模拟 0.5-2.5 秒的执行时间
    });
  }

  /**
   * 回滚工作流
   */
  async rollback(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`执行记录 "${executionId}" 未找到`);
    }

    this.log(`开始回滚工作流 "${execution.name}"`);

    // 逆序回滚已完成的 stages
    const completedStages = execution.stages
      .filter(s => s.status === StageStatus.COMPLETED)
      .reverse();

    for (const stage of completedStages) {
      try {
        stage.log('执行回滚', 'warn');
        // TODO: 调用 stage 的回滚逻辑
        stage.status = StageStatus.ROLLED_BACK;
      } catch (error) {
        this.log(`回滚 stage "${stage.name}" 失败：${error.message}`, 'error');
      }
    }

    execution.status = WorkflowStatus.ROLLED_BACK;
    this.log(`工作流 "${execution.name}" 回滚完成`);
  }

  /**
   * 获取执行状态
   */
  getExecutionStatus(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return null;
    }
    return execution.toJSON();
  }

  /**
   * 暂停执行
   */
  pauseExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === WorkflowStatus.RUNNING) {
      execution.status = WorkflowStatus.PAUSED;
      this.log(`工作流 "${execution.name}" 已暂停`);
      return true;
    }
    return false;
  }

  /**
   * 恢复执行
   */
  async resumeExecution(executionId, options = {}) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === WorkflowStatus.PAUSED) {
      execution.status = WorkflowStatus.RUNNING;
      this.log(`工作流 "${execution.name}" 已恢复`);
      await this.runExecution(execution, options);
      return true;
    }
    return false;
  }

  /**
   * 终止执行
   */
  terminateExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === WorkflowStatus.RUNNING) {
      execution.status = WorkflowStatus.FAILED;
      execution.endTime = new Date().toISOString();
      this.log(`工作流 "${execution.name}" 已终止`);
      return true;
    }
    return false;
  }

  /**
   * 工具函数：数组分块
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 工具函数：睡眠
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 导出执行历史
   */
  exportExecutionHistory(executionId, outputPath) {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`执行记录 "${executionId}" 未找到`);
    }

    const data = JSON.stringify(execution.toJSON(), null, 2);
    fs.writeFileSync(outputPath, data, 'utf-8');
    this.log(`执行历史已导出到：${outputPath}`);
  }
}

// ==================== 预定义工作流 ====================

const defaultWorkflows = {
  // 编辑部工作流（顺序执行）
  editorial: {
    id: 'editorial',
    name: '编辑部工作流',
    description: '文章创作的标准编辑流程',
    type: WorkflowType.SEQUENTIAL,
    stages: [
      { id: 'editor_in_chief', name: '总编辑', agent: '编辑部 - 总编辑', description: '统筹全局，把控文章调性' },
      { id: 'planning', name: '选题策划', agent: '编辑部 - 选题策划', description: '提炼核心价值点，确定文章角度' },
      { id: 'writer', name: '资深撰稿人', agent: '编辑部 - 资深撰稿人', description: '撰写正文内容' },
      { id: 'tech_review', name: '技术审核', agent: '编辑部 - 技术审核编辑', description: '确保技术细节准确' },
      { id: 'copy_editor', name: '文字编辑', agent: '编辑部 - 文字编辑', description: '打磨语言表达' },
      { id: 'ux_editor', name: 'UX 编辑', agent: '编辑部 - 用户体验编辑', description: '优化阅读体验' },
      { id: 'final_review', name: '终审官', agent: '编辑部 - 终审官', description: '全面质检，发布决策' }
    ]
  },

  // 游戏设计工作流（并行执行）
  gameDesign: {
    id: 'gameDesign',
    name: '游戏设计工作流',
    description: '游戏设计的并行评审流程',
    type: WorkflowType.PARALLEL,
    stages: [
      { id: 'ceo', name: 'CEO', agent: 'CEO', description: '战略层面评审' },
      { id: 'producer', name: '制作人', agent: '制作人', description: '整体设计评审' },
      { id: 'lead_designer', name: '主策划', agent: '主策划', description: '策划方案评审' },
      { id: 'lead_programmer', name: '主程', agent: '主程', description: '技术可行性评审' },
      { id: 'lead_artist', name: '主美', agent: '主美', description: '美术风格评审' }
    ]
  },

  // 美术生产工作流（混合模式）
  artProduction: {
    id: 'artProduction',
    name: '美术生产工作流',
    description: '美术资源生产的混合流程',
    type: WorkflowType.HYBRID,
    stages: [
      { id: 'concept', name: '概念设计', agent: '概念设计师', description: '概念设计阶段' },
      { id: 'original_art', name: '原画', agent: '原画师', description: '原画绘制', dependencies: ['concept'] },
      { id: 'model', name: '模型', agent: '模型师', description: '3D 模型制作', dependencies: ['original_art'] },
      { id: 'effects', name: '特效', agent: '特效师', description: '特效制作', dependencies: ['original_art'] },
      { id: 'review', name: '审核', agent: '美术总监', description: '最终审核', dependencies: ['model', 'effects'] }
    ]
  }
};

// ==================== 导出 ====================

module.exports = {
  // 核心类
  WorkflowEngine,
  Workflow,
  Stage,
  
  // 枚举
  StageStatus,
  WorkflowStatus,
  WorkflowType,
  
  // 预定义工作流
  defaultWorkflows,
  
  // 快捷创建引擎
  createEngine: (config) => {
    const engine = new WorkflowEngine(config);
    // 自动注册预定义工作流
    Object.values(defaultWorkflows).forEach(wf => engine.registerWorkflow(wf));
    return engine;
  }
};

// ==================== CLI 支持 ====================

if (require.main === module) {
  // 命令行测试
  console.log('🎻 Orchestra 工作流引擎 v1.0.0');
  console.log('================================\n');

  const engine = new WorkflowEngine({ enableLogging: true });
  
  // 注册预定义工作流
  Object.values(defaultWorkflows).forEach(wf => engine.registerWorkflow(wf));

  console.log('\n📋 已注册工作流:');
  engine.workflows.forEach((wf, id) => {
    console.log(`  - ${id}: ${wf.name} (${wf.type})`);
  });

  console.log('\n✅ 引擎初始化完成，准备就绪！\n');
}
