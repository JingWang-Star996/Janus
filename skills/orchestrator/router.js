#!/usr/bin/env node

/**
 * Orchestrator v1.0 - Agent 路由器
 * 
 * 功能：根据任务类型分配合适的 Agent，创建子代理会话
 * 
 * 注意：sessions_spawn, sessions_send 由 OpenClaw 工具提供
 */

// 由 OpenClaw 工具提供（运行时注入）
const sessions_spawn = global.sessions_spawn || require('./sessions_stub').sessions_spawn;
const sessions_send = global.sessions_send || require('./sessions_stub').sessions_send;

/**
 * Agent 路由器配置
 */
const ROUTER_CONFIG = {
  timeout: 300000, // 5 分钟
  maxConcurrent: 4 // 最大并发数
};

/**
 * Agent 技能映射表
 */
const AGENT_SKILLS = {
  'market-analyst': ['市场分析', '竞品分析', '数据收集', '用户调研'],
  'game-designer': ['游戏设计', '玩法分析', '系统设计', '数值平衡'],
  'data-analyst': ['数据分析', '付费分析', '留存分析', 'A/B 测试'],
  'report-writer': ['报告撰写', '文档整理', '内容汇总', '文案写作'],
  'programmer': ['编程', '代码实现', 'Bug 修复', '性能优化'],
  'artist': ['美术设计', 'UI 设计', '原画', '概念设计'],
  'producer': ['项目管理', '需求分析', '版本规划', '资源协调']
};

/**
 * 根据任务类型匹配 Agent
 */
function matchAgent(task, availableAgents) {
  console.log('[Orchestrator.Router] 匹配 Agent...');
  console.log('[Orchestrator.Router] 任务:', task);
  
  // 简单的关键词匹配
  const taskKeywords = extractKeywords(task);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const agent of availableAgents) {
    const skills = AGENT_SKILLS[agent] || [];
    const score = calculateMatchScore(taskKeywords, skills);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = agent;
    }
  }
  
  // 如果没有匹配，返回第一个可用的
  if (!bestMatch && availableAgents.length > 0) {
    bestMatch = availableAgents[0];
  }
  
  console.log('[Orchestrator.Router] 匹配结果:', bestMatch, '(分数:', bestScore, ')');
  
  return bestMatch;
}

/**
 * 提取任务关键词
 */
function extractKeywords(task) {
  // 简单的中文分词（实际应该用更好的分词库）
  const keywords = [];
  
  // 常见关键词
  const commonKeywords = [
    '分析', '设计', '实现', '优化', '测试',
    '市场', '竞品', '用户', '数据',
    '游戏', '玩法', '系统', '数值',
    '付费', '留存', '转化', '收入',
    '报告', '文档', '汇总', '整理'
  ];
  
  for (const keyword of commonKeywords) {
    if (task.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  return keywords;
}

/**
 * 计算匹配分数
 */
function calculateMatchScore(taskKeywords, agentSkills) {
  let score = 0;
  
  for (const taskKeyword of taskKeywords) {
    for (const skill of agentSkills) {
      if (skill.includes(taskKeyword) || taskKeyword.includes(skill)) {
        score += 1;
      }
    }
  }
  
  return score;
}

/**
 * 创建子代理会话并执行任务
 */
async function executeSubtask(subtask, agentId) {
  console.log('[Orchestrator.Router] 执行子任务...');
  console.log('[Orchestrator.Router] Agent:', agentId);
  console.log('[Orchestrator.Router] 任务:', subtask.task);
  
  try {
    // 创建子代理会话
    const session = await sessions_spawn({
      task: subtask.task,
      agentId: agentId,
      mode: 'run',
      timeoutSeconds: ROUTER_CONFIG.timeout / 1000
    });
    
    console.log('[Orchestrator.Router] 会话创建成功:', session.sessionKey);
    
    // 等待任务完成
    const result = await waitForCompletion(session);
    
    console.log('[Orchestrator.Router] 子任务完成');
    
    return {
      success: true,
      sessionKey: session.sessionKey,
      output: result,
      agent: agentId
    };
    
  } catch (e) {
    console.error('[Orchestrator.Router] 子任务执行失败:', e.message);
    
    return {
      success: false,
      error: e.message,
      agent: agentId
    };
  }
}

/**
 * 等待任务完成
 */
async function waitForCompletion(session) {
  // TODO: 实现等待逻辑
  // 这里简化处理，实际应该轮询会话状态
  
  return session.result || '任务完成';
}

/**
 * 主函数：路由子任务
 */
async function routeSubtask(subtask, availableAgents) {
  try {
    // 如果子任务已经指定了 Agent
    if (subtask.agent) {
      return await executeSubtask(subtask, subtask.agent);
    }
    
    // 否则自动匹配
    const matchedAgent = matchAgent(subtask.task, availableAgents);
    
    if (!matchedAgent) {
      throw new Error('没有可用的 Agent');
    }
    
    return await executeSubtask(subtask, matchedAgent);
    
  } catch (e) {
    console.error('[Orchestrator.Router] 路由失败:', e.message);
    throw e;
  }
}

// 导出
module.exports = {
  routeSubtask,
  executeSubtask,
  matchAgent,
  AGENT_SKILLS,
  ROUTER_CONFIG
};
