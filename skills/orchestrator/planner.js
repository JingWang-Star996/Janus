#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 任务分解器
 * 
 * 功能：将复杂任务分解为多个子任务，分配给专门的 Agent 执行
 * 
 * 注意：sessions_spawn 等函数由 OpenClaw 工具提供，不是 Node.js 模块
 */

// sessions_spawn 由 OpenClaw 工具提供（运行时注入）
const sessions_spawn = global.sessions_spawn || require('./sessions_stub').sessions_spawn;

/**
 * 任务分解器配置
 */
const PLANNER_CONFIG = {
  model: process.env.ORCHESTRATOR_MODEL || 'qwen3.5-plus',
  maxTokens: 4096,
  timeout: 300000 // 5 分钟
};

/**
 * 任务分解 Prompt 模板
 */
const DECOMPOSE_PROMPT = `你是一个专业的任务规划专家。你的任务是将复杂任务分解为多个可执行的子任务。

## 输入任务
{task}

## 可用 Agent 列表
{agents}

## 分解要求

1. **子任务数量**：3-5 个（不要太多，也不要太少）
2. **每个子任务必须**：
   - 有明确的目标
   - 可以独立执行
   - 有明确的输出
3. **分配合适的 Agent**：根据子任务类型选择最匹配的 Agent

## 输出格式

**必须严格遵循以下 JSON 格式**：

{
  "main_task": "原始任务描述",
  "subtasks": [
    {
      "id": 1,
      "agent": "agent-id",
      "task": "子任务描述",
      "expected_output": "期望的输出"
    }
  ]
}

## 示例

**输入**：
任务："分析竞品游戏，输出报告"
Agent 列表：["market-analyst", "game-designer", "data-analyst", "report-writer"]

**输出**：
{
  "main_task": "分析竞品游戏，输出报告",
  "subtasks": [
    {
      "id": 1,
      "agent": "market-analyst",
      "task": "收集竞品游戏的基本信息（下载量、收入、用户评价等）",
      "expected_output": "竞品数据汇总表"
    },
    {
      "id": 2,
      "agent": "game-designer",
      "task": "分析竞品游戏的核心玩法、系统设计、数值平衡",
      "expected_output": "玩法分析报告"
    },
    {
      "id": 3,
      "agent": "data-analyst",
      "task": "分析竞品游戏的付费设计、广告变现、留存数据",
      "expected_output": "付费设计分析报告"
    },
    {
      "id": 4,
      "agent": "report-writer",
      "task": "汇总以上分析，输出完整的竞品分析报告",
      "expected_output": "完整的竞品分析报告（Markdown 格式）"
    }
  ]
}

---

**请分解以下任务**：
任务：{task}
Agent 列表：{agents}
`;

/**
 * 调用 AI 进行任务分解
 */
async function decomposeTask(task, agents) {
  console.log('[Orchestrator.Planner] 开始任务分解...');
  console.log('[Orchestrator.Planner] 任务:', task);
  console.log('[Orchestrator.Planner] Agent 列表:', agents);
  
  // 构建 Prompt
  const prompt = DECOMPOSE_PROMPT
    .replace('{task}', task)
    .replace('{agents}', agents.join(', '));
  
  // 调用 AI
  const aiResponse = await callAI(prompt);
  
  // 解析 AI 响应
  const decomposition = parseAIResponse(aiResponse);
  
  console.log('[Orchestrator.Planner] 分解完成');
  console.log('[Orchestrator.Planner] 子任务数量:', decomposition.subtasks.length);
  
  return decomposition;
}

/**
 * 调用 AI API
 */
async function callAI(prompt) {
  // TODO: 实现 AI 调用
  // 使用 OpenClaw 的 sessions_spawn 创建临时会话
  
  const session = await sessions_spawn({
    task: prompt,
    model: PLANNER_CONFIG.model,
    mode: 'run'
  });
  
  return session.result;
}

/**
 * 解析 AI 响应
 */
function parseAIResponse(aiResponse) {
  try {
    // 尝试从响应中提取 JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch && jsonMatch[0]) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 验证格式
      if (!parsed.main_task || !parsed.subtasks) {
        throw new Error('AI 响应格式错误：缺少 main_task 或 subtasks');
      }
      
      // 为每个子任务添加默认状态
      parsed.subtasks = parsed.subtasks.map(subtask => ({
        ...subtask,
        status: 'pending',
        retry_count: 0
      }));
      
      return parsed;
    }
    
    // 如果没有 JSON 块，尝试直接解析
    const parsed = JSON.parse(aiResponse);
    return parsed;
    
  } catch (e) {
    console.error('[Orchestrator.Planner] 解析 AI 响应失败:', e.message);
    console.log('[Orchestrator.Planner] 原始响应:', aiResponse.substring(0, 500));
    
    // 返回错误格式
    return {
      main_task: '任务分解失败',
      subtasks: [],
      error: e.message
    };
  }
}

/**
 * 主函数：分解任务
 */
async function planTask(task, agents) {
  try {
    const decomposition = await decomposeTask(task, agents);
    return decomposition;
  } catch (e) {
    console.error('[Orchestrator.Planner] 任务分解失败:', e.message);
    throw e;
  }
}

// 导出
module.exports = {
  planTask,
  decomposeTask,
  PLANNER_CONFIG
};
