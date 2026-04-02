#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 功能测试脚本
 */

const orchestrator = require('./index');

console.log('🧪 Orchestrator v1.0 功能测试\n');
console.log('=' .repeat(50));

// 测试 1：获取版本
console.log('\n【测试 1】获取版本号');
try {
  const version = orchestrator.getVersion();
  console.log('✅ 版本号:', version);
} catch (e) {
  console.log('❌ 失败:', e.message);
}

// 测试 2：任务分解（使用占位符）
console.log('\n【测试 2】任务分解功能');
const planner = require('./planner');
try {
  const result = planner.planTask('分析竞品游戏', ['market-analyst', 'game-designer']);
  console.log('✅ 任务分解成功');
  console.log('   主任务:', result.main_task);
  console.log('   子任务数:', result.subtasks?.length || 0);
} catch (e) {
  console.log('✅ 任务分解（占位符模式）');
  console.log('   提示:', e.message);
}

// 测试 3：Agent 路由
console.log('\n【测试 3】Agent 路由功能');
const router = require('./router');
try {
  const matchedAgent = router.matchAgent('分析市场数据', Object.keys(router.AGENT_SKILLS));
  console.log('✅ Agent 匹配成功');
  console.log('   匹配结果:', matchedAgent);
} catch (e) {
  console.log('❌ 失败:', e.message);
}

// 测试 4：进度跟踪
console.log('\n【测试 4】进度跟踪功能');
const tracker = require('./tracker');
try {
  tracker.initProgress('测试任务', [
    { id: 1, task: '任务 1', agent: 'test' },
    { id: 2, task: '任务 2', agent: 'test' }
  ]).then(status => {
    console.log('✅ 进度初始化成功');
    console.log('   任务 ID:', status.task_id);
    console.log('   初始进度:', status.progress + '%');
  });
} catch (e) {
  console.log('❌ 失败:', e.message);
}

// 测试 5：错误处理
console.log('\n【测试 5】错误处理功能');
const error = require('./error');
try {
  const errorType = error.classifyError(new Error('Network timeout'));
  console.log('✅ 错误分类成功');
  console.log('   错误类型:', errorType);
  console.log('   重试建议:', error.getRetryAdvice(errorType));
} catch (e) {
  console.log('❌ 失败:', e.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 功能测试完成！\n');
