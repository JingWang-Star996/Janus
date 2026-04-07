/**
 * 窗 (Chuang) - 上下文窗口管理
 * 
 * 功能：
 * - 控制上下文窗口大小
 * - 自动截断超长内容
 * - 优先级管理（重要内容保留）
 * - 可配置窗口大小
 */

// 默认配置
const DEFAULT_CONFIG = {
  maxTokens: 8000,      // 最大 token 数（估算）
  maxMessages: 50,      // 最大消息数
  reserveImportant: true, // 保留重要内容
  tokenEstimateRatio: 4  // 字符到 token 的估算比例（中文字符）
};

/**
 * 估算文本的 token 数量
 * @param {string} text - 文本
 * @param {number} ratio - 字符到 token 的比例
 * @returns {number} 估算的 token 数
 */
function estimateTokens(text, ratio = DEFAULT_CONFIG.tokenEstimateRatio) {
  if (!text) return 0;
  return Math.ceil(text.length / ratio);
}

/**
 * 截断文本到指定 token 数
 * @param {string} text - 原始文本
 * @param {number} maxTokens - 最大 token 数
 * @param {Object} options - 选项 { keepStart?, keepEnd?, ellipsis? }
 * @returns {Object} 截断结果 { text, truncated, originalLength, newLength }
 */
function truncateText(text, maxTokens, options = {}) {
  const {
    keepStart = true,
    keepEnd = true,
    ellipsis = '...[内容已截断]...'
  } = options;
  
  const estimatedTokens = estimateTokens(text);
  
  if (estimatedTokens <= maxTokens) {
    return {
      text: text,
      truncated: false,
      originalLength: text.length,
      newLength: text.length,
      tokensSaved: 0
    };
  }
  
  // 需要截断
  const targetLength = Math.floor(text.length * (maxTokens / estimatedTokens));
  const ellipsisLength = ellipsis.length;
  
  let result;
  if (keepStart && keepEnd) {
    // 保留开头和结尾
    const halfLength = Math.floor((targetLength - ellipsisLength) / 2);
    result = text.slice(0, halfLength) + ellipsis + text.slice(-halfLength);
  } else if (keepStart) {
    // 只保留开头
    result = text.slice(0, targetLength) + ellipsis;
  } else if (keepEnd) {
    // 只保留结尾
    result = ellipsis + text.slice(-targetLength);
  } else {
    // 只保留中间
    const startIdx = Math.floor((text.length - targetLength) / 2);
    result = ellipsis + text.slice(startIdx, startIdx + targetLength) + ellipsis;
  }
  
  return {
    text: result,
    truncated: true,
    originalLength: text.length,
    newLength: result.length,
    tokensSaved: estimatedTokens - estimateTokens(result)
  };
}

/**
 * 截断消息列表以适应窗口
 * @param {Array<Object>} messages - 消息数组 [{ role, content, priority?, timestamp? }]
 * @param {Object} config - 配置 { maxTokens?, maxMessages?, reserveImportant? }
 * @returns {Object} 截断结果 { messages, truncated, removedCount, tokensUsed }
 */
function truncateMessages(messages, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const result = {
    messages: [],
    truncated: false,
    removedCount: 0,
    tokensUsed: 0
  };
  
  if (!messages || messages.length === 0) return result;
  
  // 按优先级和时间的排序
  const sorted = [...messages].sort((a, b) => {
    // 重要消息优先
    if (cfg.reserveImportant) {
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
    }
    // 同优先级按时间排序（新的在后）
    return (a.timestamp || 0) - (b.timestamp || 0);
  });
  
  // 首先限制消息数量
  let candidates = sorted;
  if (candidates.length > cfg.maxMessages) {
    // 保留重要的，删除不重要的
    const important = candidates.filter(m => m.priority && m.priority > 0);
    const normal = candidates.filter(m => !m.priority || m.priority === 0);
    
    // 计算需要删除多少普通消息
    const toRemove = candidates.length - cfg.maxMessages;
    if (toRemove > 0 && normal.length > 0) {
      // 从普通消息中删除最旧的
      normal.splice(0, Math.min(toRemove, normal.length));
      result.removedCount = toRemove;
      result.truncated = true;
    }
    
    candidates = [...important, ...normal];
  }
  
  // 然后限制 token 数量
  let totalTokens = 0;
  const finalMessages = [];
  
  // 重要消息无条件保留
  const importantMessages = candidates.filter(m => m.priority && m.priority > 0);
  const normalMessages = candidates.filter(m => !m.priority || m.priority === 0);
  
  // 计算重要消息的 token
  for (const msg of importantMessages) {
    const tokens = estimateTokens(msg.content);
    totalTokens += tokens;
    finalMessages.push(msg);
  }
  
  // 普通消息按时间顺序添加，直到达到限制
  for (const msg of normalMessages) {
    const tokens = estimateTokens(msg.content);
    if (totalTokens + tokens > cfg.maxTokens) {
      // 尝试截断这条消息
      const remainingTokens = cfg.maxTokens - totalTokens;
      if (remainingTokens > 100) { // 至少保留 100 tokens
        const truncated = truncateText(msg.content, remainingTokens);
        finalMessages.push({
          ...msg,
          content: truncated.text,
          truncated: true
        });
        totalTokens += estimateTokens(truncated.text);
      }
      result.truncated = true;
      break;
    }
    totalTokens += tokens;
    finalMessages.push(msg);
  }
  
  result.messages = finalMessages;
  result.tokensUsed = totalTokens;
  
  return result;
}

/**
 * 为消息添加优先级标记
 * @param {Object} message - 消息对象
 * @param {number} priority - 优先级 (0=普通，1=重要，2=关键)
 * @returns {Object} 带优先级的消息
 */
function markPriority(message, priority = 1) {
  return {
    ...message,
    priority: priority
  };
}

/**
 * 计算当前上下文的 token 使用情况
 * @param {Array<Object>} messages - 消息数组
 * @returns {Object} 使用统计 { totalTokens, totalChars, messageCount, avgTokensPerMessage }
 */
function getTokenUsage(messages) {
  let totalTokens = 0;
  let totalChars = 0;
  
  for (const msg of messages) {
    const chars = msg.content ? msg.content.length : 0;
    totalChars += chars;
    totalTokens += estimateTokens(msg.content);
  }
  
  return {
    totalTokens: totalTokens,
    totalChars: totalChars,
    messageCount: messages.length,
    avgTokensPerMessage: messages.length > 0 ? Math.round(totalTokens / messages.length) : 0
  };
}

/**
 * 智能压缩上下文（保留关键信息）
 * @param {Array<Object>} messages - 消息数组
 * @param {Object} config - 配置
 * @returns {Object} 压缩结果 { messages, summary?, compressed: boolean }
 */
function smartCompress(messages, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const usage = getTokenUsage(messages);
  
  // 如果未超限，直接返回
  if (usage.totalTokens <= cfg.maxTokens && messages.length <= cfg.maxMessages) {
    return {
      messages: messages,
      compressed: false
    };
  }
  
  // 需要压缩
  const result = truncateMessages(messages, cfg);
  
  // 生成压缩摘要（可选）
  let summary = null;
  if (result.removedCount > 0) {
    summary = `[已压缩：移除 ${result.removedCount} 条消息，当前 ${result.messages.length} 条，使用 ${result.tokensUsed}/${cfg.maxTokens} tokens]`;
  }
  
  return {
    messages: result.messages,
    summary: summary,
    compressed: true,
    stats: {
      before: usage,
      after: getTokenUsage(result.messages)
    }
  };
}

/**
 * 创建滑动窗口（只保留最近 N 条消息）
 * @param {Array<Object>} messages - 消息数组
 * @param {number} windowSize - 窗口大小
 * @param {Object} options - 选项 { keepImportant? }
 * @returns {Array<Object>} 窗口内的消息
 */
function slidingWindow(messages, windowSize, options = {}) {
  const { keepImportant = true } = options;
  
  if (!keepImportant) {
    return messages.slice(-windowSize);
  }
  
  // 保留重要消息 + 最近的普通消息
  const important = messages.filter(m => m.priority && m.priority > 0);
  const normal = messages.filter(m => !m.priority || m.priority === 0);
  
  // 计算需要保留多少普通消息
  const normalCount = Math.max(0, windowSize - important.length);
  const recentNormal = normal.slice(-normalCount);
  
  // 合并（重要消息在前，普通消息按时间顺序）
  return [...important, ...recentNormal];
}

/**
 * 获取配置信息
 * @returns {Object} 当前配置
 */
function getConfig() {
  return { ...DEFAULT_CONFIG };
}

/**
 * 更新配置
 * @param {Object} newConfig - 新配置
 * @returns {Object} 更新后的配置
 */
function updateConfig(newConfig) {
  Object.assign(DEFAULT_CONFIG, newConfig);
  return { ...DEFAULT_CONFIG };
}

/**
 * 检查是否超出窗口限制
 * @param {Array<Object>} messages - 消息数组
 * @param {Object} config - 配置
 * @returns {Object} 检查结果 { exceeds, tokensOver, messagesOver, suggestions }
 */
function checkLimit(messages, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const usage = getTokenUsage(messages);
  
  const tokensOver = Math.max(0, usage.totalTokens - cfg.maxTokens);
  const messagesOver = Math.max(0, messages.length - cfg.maxMessages);
  const exceeds = tokensOver > 0 || messagesOver > 0;
  
  const suggestions = [];
  if (tokensOver > 0) {
    suggestions.push(`Token 超出 ${tokensOver}，建议：截断长消息或减少消息数量`);
  }
  if (messagesOver > 0) {
    suggestions.push(`消息数超出 ${messagesOver}，建议：使用滑动窗口或删除旧消息`);
  }
  if (exceeds && cfg.reserveImportant) {
    suggestions.push('重要消息已保护，压缩将优先处理普通消息');
  }
  
  return {
    exceeds: exceeds,
    tokensOver: tokensOver,
    messagesOver: messagesOver,
    currentUsage: usage,
    limits: {
      maxTokens: cfg.maxTokens,
      maxMessages: cfg.maxMessages
    },
    suggestions: suggestions
  };
}

module.exports = {
  truncateText,
  truncateMessages,
  markPriority,
  getTokenUsage,
  smartCompress,
  slidingWindow,
  getConfig,
  updateConfig,
  checkLimit,
  estimateTokens,
  DEFAULT_CONFIG
};
