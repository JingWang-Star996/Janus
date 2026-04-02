#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 错误处理
 * 
 * 功能：捕获子任务失败，自动重试，记录错误日志
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 错误处理配置
 */
const ERROR_CONFIG = {
  maxRetries: 3,              // 最大重试次数
  retryDelay: 5000,           // 重试延迟（毫秒）
  logFilePath: path.join(process.cwd(), 'skills/orchestrator/error.log')
};

/**
 * 错误类型枚举
 */
const ErrorType = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  AGENT_ERROR: 'agent_error',
  TASK_ERROR: 'task_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * 执行任务（带重试）
 */
async function executeWithRetry(taskFn, taskId, subtaskId) {
  console.log('[Orchestrator.Error] 执行任务（带重试）...');
  console.log('[Orchestrator.Error] 任务 ID:', taskId);
  console.log('[Orchestrator.Error] 子任务 ID:', subtaskId);
  
  let lastError = null;
  
  for (let attempt = 1; attempt <= ERROR_CONFIG.maxRetries; attempt++) {
    console.log('[Orchestrator.Error] 尝试', attempt, '/', ERROR_CONFIG.maxRetries);
    
    try {
      // 执行任务
      const result = await taskFn();
      
      console.log('[Orchestrator.Error] 任务成功');
      
      return {
        success: true,
        result: result,
        attempt: attempt
      };
      
    } catch (e) {
      lastError = e;
      
      console.error('[Orchestrator.Error] 尝试失败:', e.message);
      
      // 记录错误
      await logError(taskId, subtaskId, e, attempt);
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < ERROR_CONFIG.maxRetries) {
        console.log('[Orchestrator.Error] 等待', ERROR_CONFIG.retryDelay / 1000, '秒后重试...');
        await sleep(ERROR_CONFIG.retryDelay);
      }
    }
  }
  
  // 所有重试都失败
  console.error('[Orchestrator.Error] 所有重试失败');
  
  return {
    success: false,
    error: lastError.message,
    errorType: classifyError(lastError),
    attempt: ERROR_CONFIG.maxRetries
  };
}

/**
 * 分类错误类型
 */
function classifyError(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('connection')) {
    return ErrorType.NETWORK_ERROR;
  }
  
  if (message.includes('timeout') || message.includes('time out')) {
    return ErrorType.TIMEOUT_ERROR;
  }
  
  if (message.includes('agent') || message.includes('session')) {
    return ErrorType.AGENT_ERROR;
  }
  
  if (message.includes('task') || message.includes('invalid')) {
    return ErrorType.TASK_ERROR;
  }
  
  return ErrorType.UNKNOWN_ERROR;
}

/**
 * 记录错误日志
 */
async function logError(taskId, subtaskId, error, attempt) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: task=${taskId}, subtask=${subtaskId}, attempt=${attempt}, type=${classifyError(error)}, message=${error.message}\n`;
    
    // 追加到日志文件
    await fs.appendFile(ERROR_CONFIG.logFilePath, logEntry, 'utf8');
    
    console.log('[Orchestrator.Error] 错误已记录:', ERROR_CONFIG.logFilePath);
    
  } catch (e) {
    console.error('[Orchestrator.Error] 记录日志失败:', e.message);
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 判断是否可重试
 */
function isRetryable(error) {
  const errorType = classifyError(error);
  
  // 网络错误和超时错误通常可以重试
  return errorType === ErrorType.NETWORK_ERROR || 
         errorType === ErrorType.TIMEOUT_ERROR;
}

/**
 * 获取重试建议
 */
function getRetryAdvice(errorType) {
  const advices = {
    [ErrorType.NETWORK_ERROR]: '检查网络连接，确认 API 服务可用',
    [ErrorType.TIMEOUT_ERROR]: '增加超时时间，或检查任务是否过于复杂',
    [ErrorType.AGENT_ERROR]: '检查 Agent 配置，确认 Agent 可用',
    [ErrorType.TASK_ERROR]: '检查任务定义，确认格式正确',
    [ErrorType.UNKNOWN_ERROR]: '查看错误日志，联系技术支持'
  };
  
  return advices[errorType] || advices[ErrorType.UNKNOWN_ERROR];
}

/**
 * 辅助函数：睡眠
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 导出
module.exports = {
  executeWithRetry,
  classifyError,
  logError,
  isRetryable,
  getRetryAdvice,
  ErrorType,
  ERROR_CONFIG
};
