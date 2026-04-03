/**
 * 快速验证：条件分支功能
 */
const { createEngine, StageStatus } = require('./workflowEngine');

async function test() {
  console.log('🔍 验证条件分支修复\n');
  
  const engine = createEngine({ enableLogging: false });
  
  // 创建工作流
  engine.registerWorkflow({
    id: 'cond_test',
    name: '条件测试',
    type: 'sequential',
    stages: [
      { id: 'c1', name: '第一阶段' },
      { 
        id: 'c2', 
        name: '条件阶段',
        conditions: [{
          type: 'expression',
          expression: 'context.executeStage === true'
        }]
      },
      { id: 'c3', name: '第三阶段', dependencies: ['c1', 'c2'] }
    ]
  });
  
  console.log('测试 1: executeStage=false (c2 应该被跳过)');
  const result1 = await engine.execute('cond_test', { executeStage: false });
  const exec1 = engine.executions.get(result1.executionId);
  const c2_1 = exec1.stages.find(s => s.id === 'c2');
  const c3_1 = exec1.stages.find(s => s.id === 'c3');
  
  console.log(`  c2 状态：${c2_1.status} ${c2_1.status === StageStatus.SKIPPED ? '✅' : '❌'}`);
  console.log(`  c3 状态：${c3_1.status} ${c3_1.status === StageStatus.COMPLETED ? '✅' : '❌'}`);
  console.log(`  工作流：${result1.status} ${result1.status === 'completed' ? '✅' : '❌'}`);
  
  console.log('\n测试 2: executeStage=true (c2 应该执行)');
  const result2 = await engine.execute('cond_test', { executeStage: true });
  const exec2 = engine.executions.get(result2.executionId);
  const c2_2 = exec2.stages.find(s => s.id === 'c2');
  const c3_2 = exec2.stages.find(s => s.id === 'c3');
  
  console.log(`  c2 状态：${c2_2.status} ${c2_2.status === StageStatus.COMPLETED ? '✅' : '❌'}`);
  console.log(`  c3 状态：${c3_2.status} ${c3_2.status === StageStatus.COMPLETED ? '✅' : '❌'}`);
  console.log(`  工作流：${result2.status} ${result2.status === 'completed' ? '✅' : '❌'}`);
  
  console.log('\n✅ 条件分支功能验证完成！');
}

test().catch(console.error);
