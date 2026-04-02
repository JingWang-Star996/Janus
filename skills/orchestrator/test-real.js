#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 真实环境测试脚本
 * 
 * 测试任务：分析竞品游戏《XX传奇》，输出完整报告
 */

console.log('🧪 Orchestrator v1.0 真实环境测试\n');
console.log('=' .repeat(60));

// 测试任务配置
const TEST_CONFIG = {
  mainTask: '分析竞品游戏《XX传奇》，输出完整报告',
  agents: [
    'market-analyst',    // 市场分析
    'game-designer',     // 游戏设计
    'data-analyst',      // 数据分析
    'report-writer'      // 报告撰写
  ],
  expectedSubtasks: 4    // 期望分解为 4 个子任务
};

console.log('\n【测试任务】');
console.log('主任务:', TEST_CONFIG.mainTask);
console.log('可用 Agent:', TEST_CONFIG.agents.join(', '));
console.log('期望子任务数:', TEST_CONFIG.expectedSubtasks);

console.log('\n' + '='.repeat(60));
console.log('📋 测试步骤\n');

// 步骤 1：任务分解
console.log('步骤 1: 任务分解');
console.log('  - 调用 AI 将主任务分解为子任务');
console.log('  - 期望输出：4 个子任务（市场分析、玩法分析、付费分析、报告汇总）');
console.log('  - 验证点：子任务数量、Agent 匹配合理性\n');

// 步骤 2：Agent 路由
console.log('步骤 2: Agent 路由');
console.log('  - 为每个子任务分配合适的 Agent');
console.log('  - 期望输出：market-analyst→市场分析，game-designer→玩法分析...');
console.log('  - 验证点：Agent 与任务匹配度\n');

// 步骤 3：并发执行
console.log('步骤 3: 并发执行');
console.log('  - 创建 4 个子代理会话并行执行');
console.log('  - 期望输出：4 个会话同时运行');
console.log('  - 验证点：会话创建成功、状态跟踪正常\n');

// 步骤 4：进度跟踪
console.log('步骤 4: 进度跟踪');
console.log('  - 实时更新每个子任务状态');
console.log('  - 期望输出：pending→running→completed');
console.log('  - 验证点：status.json 实时更新、进度百分比准确\n');

// 步骤 5：结果汇总
console.log('步骤 5: 结果汇总');
console.log('  - 收集所有子任务结果');
console.log('  - 期望输出：完整的竞品分析报告（Markdown 格式）');
console.log('  - 验证点：报告格式正确、内容完整\n');

console.log('='.repeat(60));
console.log('\n✅ 预期结果：\n');
console.log('1. 任务分解为 4 个合理的子任务');
console.log('2. 每个子任务分配了正确的 Agent');
console.log('3. 所有子任务成功完成');
console.log('4. 生成了完整的竞品分析报告');
console.log('5. 报告保存到：orchestrator/outputs/[任务 ID]-report.md\n');

console.log('🚀 准备开始测试...\n');

// 实际执行（需要 OpenClaw 工具注入）
async function runTest() {
  try {
    const orchestrator = require('./index');
    
    console.log('[执行] 调用 orchestrator.run()...\n');
    
    const result = await orchestrator.run(TEST_CONFIG.mainTask, {
      agents: TEST_CONFIG.agents
    });
    
    console.log('\n✅ 测试完成！\n');
    console.log('任务 ID:', result.task_id);
    console.log('成功率:', Math.round((result.completed / result.total) * 100) + '%');
    console.log('报告路径:', result.output_path);
    console.log('\n查看报告：cat', result.output_path, '\n');
    
  } catch (e) {
    console.error('\n❌ 测试失败:', e.message, '\n');
    console.error('堆栈:', e.stack, '\n');
  }
}

// 如果是命令行执行
if (require.main === module) {
  runTest();
}

// 导出供外部调用
module.exports = { runTest, TEST_CONFIG };
