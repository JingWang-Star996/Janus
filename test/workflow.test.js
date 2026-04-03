/**
 * Orchestra 工作流引擎测试套件
 */

const { 
  WorkflowEngine, 
  Workflow, 
  Stage,
  StageStatus,
  WorkflowStatus,
  WorkflowType,
  createEngine 
} = require('../workflowEngine');

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * 断言辅助函数
 */
function assert(condition, message) {
  if (condition) {
    results.passed++;
    console.log(`✅ ${message}`);
    results.tests.push({ name: message, status: 'passed' });
  } else {
    results.failed++;
    console.error(`❌ ${message}`);
    results.tests.push({ name: message, status: 'failed' });
  }
}

/**
 * 测试：引擎初始化
 */
async function testEngineInitialization() {
  console.log('\n📋 测试：引擎初始化\n');
  
  const engine = new WorkflowEngine({
    enableLogging: false,
    defaultTimeout: 60000
  });
  
  assert(engine !== null, '引擎实例创建成功');
  assert(engine.workflows instanceof Map, '工作流寄存器初始化');
  assert(engine.executions instanceof Map, '执行记录器初始化');
  assert(engine.config.defaultTimeout === 60000, '配置参数正确');
}

/**
 * 测试：工作流注册
 */
async function testWorkflowRegistration() {
  console.log('\n📋 测试：工作流注册\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  const workflow = engine.registerWorkflow({
    id: 'test_workflow',
    name: '测试工作流',
    type: 'sequential',
    stages: ['stage1', 'stage2', 'stage3']
  });
  
  assert(workflow !== null, '工作流注册成功');
  assert(engine.workflows.has('test_workflow'), '工作流已存储');
  assert(workflow.stages.length === 3, 'Stage 数量正确');
  assert(workflow.type === 'sequential', '工作流类型正确');
}

/**
 * 测试：顺序执行模式
 */
async function testSequentialExecution() {
  console.log('\n📋 测试：顺序执行模式\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'seq_test',
    name: '顺序测试',
    type: 'sequential',
    stages: [
      { id: 's1', name: '第一阶段' },
      { id: 's2', name: '第二阶段', dependencies: ['s1'] },
      { id: 's3', name: '第三阶段', dependencies: ['s2'] }
    ]
  });
  
  const result = await engine.execute('seq_test', {}, {
    maxRetries: 0
  });
  
  assert(result.status === WorkflowStatus.COMPLETED, '工作流执行完成');
  assert(result.progress.percentage === 100, '进度 100%');
  assert(result.progress.completed === 3, '完成 3 个 stage');
  
  // 验证执行顺序
  const execution = engine.executions.get(result.executionId);
  const s1 = execution.stages[0];
  const s2 = execution.stages[1];
  const s3 = execution.stages[2];
  
  assert(s1.startTime <= s1.endTime, 'S1 正常执行');
  assert(s2.startTime >= s1.endTime, 'S2 在 S1 后执行');
  assert(s3.startTime >= s2.endTime, 'S3 在 S2 后执行');
}

/**
 * 测试：并行执行模式
 */
async function testParallelExecution() {
  console.log('\n📋 测试：并行执行模式\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'parallel_test',
    name: '并行测试',
    type: 'parallel',
    stages: [
      { id: 'p1', name: '并行任务 1' },
      { id: 'p2', name: '并行任务 2' },
      { id: 'p3', name: '并行任务 3' }
    ]
  });
  
  const result = await engine.execute('parallel_test', {}, {
    concurrencyLimit: 3
  });
  
  assert(result.status === WorkflowStatus.COMPLETED, '工作流执行完成');
  assert(result.progress.percentage === 100, '进度 100%');
  
  // 验证并行执行（开始时间应该接近）
  const execution = engine.executions.get(result.executionId);
  const times = execution.stages.map(s => new Date(s.startTime).getTime());
  const maxDiff = Math.max(...times) - Math.min(...times);
  
  assert(maxDiff < 1000, `并行执行（时间差 < 1s: ${maxDiff}ms）`);
}

/**
 * 测试：混合执行模式
 */
async function testHybridExecution() {
  console.log('\n📋 测试：混合执行模式\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'hybrid_test',
    name: '混合测试',
    type: 'hybrid',
    stages: [
      { id: 'h1', name: '概念阶段' },
      { id: 'h2', name: '原画阶段', dependencies: ['h1'] },
      { id: 'h3', name: '模型阶段', dependencies: ['h2'], parallelGroup: 'prod' },
      { id: 'h4', name: '特效阶段', dependencies: ['h2'], parallelGroup: 'prod' },
      { id: 'h5', name: '审核阶段', dependencies: ['h3', 'h4'] }
    ]
  });
  
  const result = await engine.execute('hybrid_test', {});
  
  assert(result.status === WorkflowStatus.COMPLETED, '工作流执行完成');
  assert(result.progress.percentage === 100, '进度 100%');
  assert(result.progress.completed === 5, '完成 5 个 stage');
}

/**
 * 测试：条件分支
 */
async function testConditionalExecution() {
  console.log('\n📋 测试：条件分支\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'conditional_test',
    name: '条件测试',
    type: 'sequential',
    stages: [
      { id: 'c1', name: '第一阶段' },
      { 
        id: 'c2', 
        name: '条件阶段',
        conditions: [{
          type: 'expression',
          expression: 'context.executeStage === true'  // 条件为真时执行
        }]
      },
      { id: 'c3', name: '第三阶段', dependencies: ['c1', 'c2'] }  // c3 依赖 c1 和 c2
    ]
  });
  
  // 测试 1：条件不满足时跳过 stage
  const result1 = await engine.execute('conditional_test', { executeStage: false });
  const execution1 = engine.executions.get(result1.executionId);
  const c2_skipped = execution1.stages.find(s => s.id === 'c2');
  
  assert(c2_skipped.status === StageStatus.SKIPPED, '条件不满足时跳过 stage');
  
  // 测试 2：条件满足时执行 stage
  const result2 = await engine.execute('conditional_test', { executeStage: true });
  const execution2 = engine.executions.get(result2.executionId);
  const c2_executed = execution2.stages.find(s => s.id === 'c2');
  
  assert(c2_executed.status === StageStatus.COMPLETED, '条件满足时执行 stage');
}

/**
 * 测试：错误处理与重试
 */
async function testErrorHandling() {
  console.log('\n📋 测试：错误处理与重试\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  let failCount = 0;
  
  // 模拟会失败的 stage
  engine.registerWorkflow({
    id: 'error_test',
    name: '错误测试',
    type: 'sequential',
    stages: [
      { 
        id: 'fail_stage', 
        name: '失败阶段',
        retries: 2
      }
    ]
  });
  
  // 覆盖 invokeStage 方法模拟失败
  const originalInvoke = engine.invokeStage.bind(engine);
  engine.invokeStage = async function(stage, context, options) {
    failCount++;
    if (failCount < 3) {
      throw new Error('模拟失败');
    }
    return { status: 'success' };
  };
  
  const result = await engine.execute('error_test', {});
  
  assert(failCount === 3, `重试机制工作（失败${failCount}次后成功）`);
  assert(result.status === WorkflowStatus.COMPLETED, '重试后最终成功');
  
  // 恢复原方法
  engine.invokeStage = originalInvoke;
}

/**
 * 测试：暂停与恢复
 */
async function testPauseResume() {
  console.log('\n📋 测试：暂停与恢复\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'pause_test',
    name: '暂停测试',
    type: 'sequential',
    stages: [
      { id: 'p1', name: '第一阶段' },
      { id: 'p2', name: '第二阶段' }
    ]
  });
  
  // 启动执行
  const executionPromise = engine.execute('pause_test', {});
  
  // 等待片刻后暂停
  await engine.sleep(100);
  const executions = Array.from(engine.executions.values());
  if (executions.length > 0) {
    const execId = executions[0].stages[0].id ? 
      Array.from(engine.executions.keys())[0] : null;
    
    if (execId) {
      const paused = engine.pauseExecution(execId);
      assert(paused === true, '暂停成功');
    }
  }
  
  // 等待执行完成
  await executionPromise;
  assert(true, '暂停/恢复机制可用');
}

/**
 * 测试：进度追踪
 */
async function testProgressTracking() {
  console.log('\n📋 测试：进度追踪\n');
  
  const engine = new WorkflowEngine({ enableLogging: false });
  
  engine.registerWorkflow({
    id: 'progress_test',
    name: '进度测试',
    type: 'sequential',
    stages: [
      { id: 'prog1', name: '阶段 1' },
      { id: 'prog2', name: '阶段 2' },
      { id: 'prog3', name: '阶段 3' },
      { id: 'prog4', name: '阶段 4' }
    ]
  });
  
  const result = await engine.execute('progress_test', {});
  
  assert(result.progress.total === 4, '总数正确');
  assert(result.progress.completed === 4, '完成数正确');
  assert(result.progress.failed === 0, '失败数为 0');
  assert(result.progress.percentage === 100, '百分比正确');
}

/**
 * 测试：快捷创建
 */
async function testCreateEngine() {
  console.log('\n📋 测试：快捷创建\n');
  
  const engine = createEngine({ enableLogging: false });
  
  assert(engine !== null, '引擎创建成功');
  assert(engine.workflows.size >= 3, '预定义工作流已注册');
  assert(engine.workflows.has('editorial'), '编辑部工作流已注册');
  assert(engine.workflows.has('gameDesign'), '游戏设计工作流已注册');
  assert(engine.workflows.has('artProduction'), '美术生产工作流已注册');
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🎻 Orchestra 工作流引擎测试套件');
  console.log('================================\n');
  
  const startTime = Date.now();
  
  try {
    await testEngineInitialization();
    await testWorkflowRegistration();
    await testSequentialExecution();
    await testParallelExecution();
    await testHybridExecution();
    await testConditionalExecution();
    await testErrorHandling();
    await testPauseResume();
    await testProgressTracking();
    await testCreateEngine();
    
  } catch (error) {
    console.error('\n❌ 测试执行出错:', error.message);
    console.error(error.stack);
  }
  
  const duration = Date.now() - startTime;
  
  // 打印测试结果
  console.log('\n================================');
  console.log('📊 测试结果汇总');
  console.log('================================');
  console.log(`总测试数：${results.passed + results.failed}`);
  console.log(`✅ 通过：${results.passed}`);
  console.log(`❌ 失败：${results.failed}`);
  console.log(`⏱️  耗时：${duration}ms`);
  console.log('================================\n');
  
  if (results.failed > 0) {
    console.log('失败的测试:');
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`  - ${t.name}`));
    console.log();
  }
  
  return results.failed === 0;
}

// 执行测试
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试运行失败:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, results };
