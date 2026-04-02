#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 结果汇总器
 * 
 * 功能：收集所有子任务结果，合并为最终输出
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 结果汇总器配置
 */
const AGGREGATOR_CONFIG = {
  outputDir: path.join(process.cwd(), 'skills/orchestrator/outputs'),
  format: 'markdown' // 支持 'markdown', 'json', 'text'
};

/**
 * 汇总所有子任务结果
 */
async function aggregateResults(taskId, subtasks) {
  console.log('[Orchestrator.Aggregator] 开始汇总结果...');
  console.log('[Orchestrator.Aggregator] 子任务数量:', subtasks.length);
  
  // 收集所有成功的结果
  const successfulResults = subtasks
    .filter(s => s.status === 'completed' && s.output)
    .map(s => ({
      id: s.id,
      task: s.task,
      agent: s.agent,
      output: s.output
    }));
  
  // 收集失败的结果
  const failedResults = subtasks
    .filter(s => s.status === 'failed')
    .map(s => ({
      id: s.id,
      task: s.task,
      agent: s.agent,
      error: s.error
    }));
  
  console.log('[Orchestrator.Aggregator] 成功:', successfulResults.length);
  console.log('[Orchestrator.Aggregator] 失败:', failedResults.length);
  
  // 生成汇总报告
  const report = generateReport(taskId, successfulResults, failedResults);
  
  // 保存报告
  const outputPath = await saveReport(report, taskId);
  
  console.log('[Orchestrator.Aggregator] 汇总完成，报告路径:', outputPath);
  
  return {
    success: true,
    task_id: taskId,
    report: report,
    output_path: outputPath,
    total: subtasks.length,
    completed: successfulResults.length,
    failed: failedResults.length
  };
}

/**
 * 生成汇总报告
 */
function generateReport(taskId, successfulResults, failedResults) {
  let report = '';
  
  // Markdown 格式
  report += `# 📊 Orchestrator 任务汇总报告\n\n`;
  report += `**任务 ID**: ${taskId}\n`;
  report += `**生成时间**: ${new Date().toISOString()}\n\n`;
  
  // 执行摘要
  report += `## 📋 执行摘要\n\n`;
  report += `- **总任务数**: ${successfulResults.length + failedResults.length}\n`;
  report += `- **成功**: ${successfulResults.length}\n`;
  report += `- **失败**: ${failedResults.length}\n`;
  report += `- **成功率**: ${Math.round((successfulResults.length / (successfulResults.length + failedResults.length)) * 100)}%\n\n`;
  
  // 成功的结果
  if (successfulResults.length > 0) {
    report += `## ✅ 成功的任务\n\n`;
    
    for (const result of successfulResults) {
      report += `### 任务 ${result.id}: ${result.task}\n\n`;
      report += `**Agent**: ${result.agent}\n\n`;
      report += `**输出**:\n`;
      report += `${result.output}\n\n`;
      report += `---\n\n`;
    }
  }
  
  // 失败的结果
  if (failedResults.length > 0) {
    report += `## ❌ 失败的任务\n\n`;
    
    for (const result of failedResults) {
      report += `### 任务 ${result.id}: ${result.task}\n\n`;
      report += `**Agent**: ${result.agent}\n\n`;
      report += `**错误**: ${result.error}\n\n`;
      report += `---\n\n`;
    }
  }
  
  // 最终结论
  report += `## 📝 最终结论\n\n`;
  
  if (failedResults.length === 0) {
    report += `✅ 所有任务执行成功！\n\n`;
    report += `所有子任务均已完成，结果已汇总如上。\n`;
  } else if (successfulResults.length > failedResults.length) {
    report += `⚠️ 部分任务成功，部分任务失败。\n\n`;
    report += `建议检查失败任务的错误信息，必要时重新执行。\n`;
  } else {
    report += `❌ 大部分任务失败。\n\n`;
    report += `建议检查系统配置和 Agent 状态，重新执行任务。\n`;
  }
  
  report += `\n---\n\n`;
  report += `**Made with ❤️ by 王鲸 AI Agent 公司**\n`;
  
  return report;
}

/**
 * 保存报告到文件
 */
async function saveReport(report, taskId) {
  try {
    // 确保目录存在
    await fs.mkdir(AGGREGATOR_CONFIG.outputDir, { recursive: true });
    
    // 生成文件名
    const filename = `${taskId}-report.md`;
    const outputPath = path.join(AGGREGATOR_CONFIG.outputDir, filename);
    
    // 写入文件
    await fs.writeFile(outputPath, report, 'utf8');
    
    console.log('[Orchestrator.Aggregator] 报告已保存:', outputPath);
    
    return outputPath;
    
  } catch (e) {
    console.error('[Orchestrator.Aggregator] 保存报告失败:', e.message);
    throw e;
  }
}

/**
 * 简单合并结果（用于快速返回）
 */
function mergeResults(subtasks) {
  const outputs = subtasks
    .filter(s => s.output)
    .map(s => s.output);
  
  return outputs.join('\n\n---\n\n');
}

// 导出
module.exports = {
  aggregateResults,
  generateReport,
  saveReport,
  mergeResults,
  AGGREGATOR_CONFIG
};
