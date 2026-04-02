#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 多 Agent 编排系统
 * 
 * 统一入口：协调所有模块，提供简洁的 API
 */

const planner = require('./planner');
const router = require('./router');
const tracker = require('./tracker');
const aggregator = require('./aggregator');
const error = require('./error');

/**
 * Orchestrator 配置
 */
const ORCHESTRATOR_CONFIG = {
  version: '1.0.0',
  maxConcurrent: 4,
  timeout: 300000 // 5 分钟
};

/**
 * 主函数：执行编排任务
 */
async function run(task, options = {}) {
  console.log('[Orchestrator] 🚀 开始执行编排任务...');
  console.log('[Orchestrator] 任务:', task);
  
  const {
    agents = Object.keys(router.AGENT_SKILLS),
    model = 'qwen3.5-plus'
  } = options;
  
  try {
    // Step 1: 分解任务
    console.log('[Orchestrator] Step 1: 分解任务');
    const decomposition = await planner.planTask(task, agents);
    
    if (decomposition.error) {
      throw new Error('任务分解失败：' + decomposition.error);
    }
    
    console.log('[Orchestrator] 分解为', decomposition.subtasks.length, '个子任务');
    
    // Step 2: 初始化进度跟踪
    console.log('[Orchestrator] Step 2: 初始化进度跟踪');
    const status = await tracker.initProgress(decomposition.main_task, decomposition.subtasks);
    const taskId = status.task_id;  // 保存任务 ID
    
    // Step 3: 执行所有子任务
    console.log('[Orchestrator] Step 3: 执行子任务');
    const results = await executeAllSubtasks(decomposition.subtasks, agents);
    
    // Step 4: 更新进度
    console.log('[Orchestrator] Step 4: 更新进度');
    for (const result of results) {
      const status = result.success ? tracker.TaskStatus.COMPLETED : tracker.TaskStatus.FAILED;
      await tracker.updateSubtaskStatus(
        taskId,  // 使用保存的任务 ID
        result.subtask.id,
        status,
        result.output
      );
    }
    
    // Step 5: 汇总结果
    console.log('[Orchestrator] Step 5: 汇总结果');
    const finalResult = await aggregator.aggregateResults(
      decomposition.task_id,
      decomposition.subtasks.map((s, i) => ({
        ...s,
        status: results[i].success ? 'completed' : 'failed',
        output: results[i].output,
        error: results[i].error
      }))
    );
    
    console.log('[Orchestrator] ✅ 任务完成！');
    console.log('[Orchestrator] 成功率:', Math.round((finalResult.completed / finalResult.total) * 100) + '%');
    console.log('[Orchestrator] 报告路径:', finalResult.output_path);
    
    return finalResult;
    
  } catch (e) {
    console.error('[Orchestrator] ❌ 任务失败:', e.message);
    throw e;
  }
}

/**
 * 执行所有子任务
 */
async function executeAllSubtasks(subtasks, agents) {
  const results = [];
  
  for (const subtask of subtasks) {
    console.log('[Orchestrator] 执行子任务', subtask.id, '/', subtasks.length);
    
    // 使用带重试的执行
    const result = await error.executeWithRetry(
      async () => {
        return await router.routeSubtask(subtask, agents);
      },
      'orch-task',
      subtask.id
    );
    
    results.push({
      subtask: subtask,
      success: result.success,
      output: result.result?.output,
      error: result.error
    });
  }
  
  return results;
}

/**
 * 获取任务进度
 */
async function getStatus(taskId) {
  return await tracker.getProgress(taskId);
}

/**
 * 获取 Orchestrator 版本
 */
function getVersion() {
  return ORCHESTRATOR_CONFIG.version;
}

// 导出
module.exports = {
  run,
  getStatus,
  getVersion,
  ORCHESTRATOR_CONFIG
};

// 如果直接执行，运行示例
if (require.main === module) {
  // 示例用法
  console.log('Orchestrator v1.0 - 多 Agent 编排系统');
  console.log('');
  console.log('用法:');
  console.log('  const orchestrator = require("./orchestrator");');
  console.log('  const result = await orchestrator.run("你的任务", { agents: [...] });');
  console.log('');
  console.log('API:');
  console.log('  run(task, options) - 执行编排任务');
  console.log('  getStatus(taskId) - 获取任务进度');
  console.log('  getVersion() - 获取版本号');
}
