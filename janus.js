/**
 * Janus (Janus) - OpenClaw 第二记忆系统
 * 
 * Slogan: "记忆太多？装匣子！"
 * 灰色幽默："别人忘，你不忘，因为有匣子"
 * 
 * 三大核心功能：
 * - 溯 (Su): 会话历史记录管理
 * - 匣 (Xia): 粘贴内容管理
 * - 窗 (Chuang): 上下文窗口管理
 * 
 * @version 1.0.0
 * @author AI 主程
 */

const path = require('path');

// 导入三个核心模块
const su = require('./modules/su');      // 溯 - 会话历史
const xia = require('./modules/xia');    // 匣 - 粘贴管理
const chuang = require('./modules/chuang'); // 窗 - 上下文窗口

/**
 * Janus统一入口
 * 提供高层 API，整合三个模块的功能
 */
class Janus {
  constructor(options = {}) {
    this.options = {
      historyPath: options.historyPath || su.DEFAULT_HISTORY_PATH,
      pastesDir: options.pastesDir || xia.DEFAULT_PASTES_DIR,
      windowConfig: options.windowConfig || {}
    };
    
    // 合并默认窗口配置
    this.windowConfig = {
      ...chuang.DEFAULT_CONFIG,
      ...this.options.windowConfig
    };
  }
  
  // ==================== 溯 (Su) - 会话历史 ====================
  
  /**
   * 追加会话记录
   */
  record(options) {
    const { sessionId, role, content, timestamp = Date.now(), metadata = {} } = options;
    return su.append({ sessionId, role, content, timestamp, metadata }, this.options.historyPath);
  }
  
  /**
   * 批量追加记录
   */
  batchRecord(records) {
    return su.batchAppend(records, this.options.historyPath);
  }
  
  /**
   * 获取会话历史
   */
  async getSession(sessionId) {
    return su.getBySessionId(sessionId, this.options.historyPath);
  }
  
  /**
   * 搜索会话
   */
  async search(keyword, sessionId = null, limit = 100) {
    return su.search(keyword, this.options.historyPath, { sessionId, limit });
  }
  
  /**
   * 按时间范围查询
   */
  async getByTimeRange(startTime, endTime) {
    return su.getByTimeRange(startTime, endTime, this.options.historyPath);
  }
  
  /**
   * 删除会话
   */
  async deleteSession(sessionId) {
    return su.deleteSession(sessionId, this.options.historyPath);
  }
  
  /**
   * 清空所有历史
   */
  async clearHistory() {
    return su.clear(this.options.historyPath);
  }
  
  /**
   * 获取统计信息
   */
  async getHistoryStats() {
    return su.getStats(this.options.historyPath);
  }
  
  /**
   * 导出会话
   */
  async exportSession(sessionId, outputPath, format = 'jsonl') {
    return su.exportSession(sessionId, outputPath, format, this.options.historyPath);
  }
  
  /**
   * 列出所有会话
   */
  async listSessions() {
    return su.listSessions(this.options.historyPath);
  }
  
  // ==================== 匣 (Xia) - 粘贴管理 ====================
  
  /**
   * 存储内容（自动选择内联或外部）
   */
  store(content) {
    return xia.store(content, this.options.pastesDir);
  }
  
  /**
   * 获取内容
   */
  retrieve(ref) {
    return xia.retrieve(ref, this.options.pastesDir);
  }
  
  /**
   * 批量存储
   */
  batchStore(contents) {
    return xia.batchStore(contents, this.options.pastesDir);
  }
  
  /**
   * 批量获取
   */
  batchRetrieve(refs) {
    return xia.batchRetrieve(refs, this.options.pastesDir);
  }
  
  /**
   * 检查内容是否存在
   */
  contentExists(hash) {
    return xia.exists(hash, this.options.pastesDir);
  }
  
  /**
   * 删除内容
   */
  deleteContent(hash) {
    return xia.deleteByHash(hash, this.options.pastesDir);
  }
  
  /**
   * 获取存储统计
   */
  getPastesStats() {
    return xia.getStats(this.options.pastesDir);
  }
  
  /**
   * 清理未使用的内容
   */
  cleanupPastes(usedHashes) {
    return xia.cleanup(usedHashes, this.options.pastesDir);
  }
  
  /**
   * 转换为传输格式
   */
  toTransport(content) {
    return xia.toTransportFormat(content, this.options.pastesDir);
  }
  
  /**
   * 从传输格式恢复
   */
  fromTransport(obj) {
    return xia.fromTransportFormat(obj, this.options.pastesDir);
  }
  
  // ==================== 窗 (Chuang) - 上下文窗口 ====================
  
  /**
   * 截断消息列表
   */
  truncateMessages(messages, config = {}) {
    const cfg = { ...this.windowConfig, ...config };
    return chuang.truncateMessages(messages, cfg);
  }
  
  /**
   * 智能压缩上下文
   */
  compressContext(messages, config = {}) {
    const cfg = { ...this.windowConfig, ...config };
    return chuang.smartCompress(messages, cfg);
  }
  
  /**
   * 滑动窗口
   */
  slidingWindow(messages, windowSize, options = {}) {
    return chuang.slidingWindow(messages, windowSize, options);
  }
  
  /**
   * 标记消息优先级
   */
  markPriority(message, priority) {
    return chuang.markPriority(message, priority);
  }
  
  /**
   * 获取 token 使用统计
   */
  getTokenUsage(messages) {
    return chuang.getTokenUsage(messages);
  }
  
  /**
   * 检查是否超限
   */
  checkLimit(messages, config = {}) {
    const cfg = { ...this.windowConfig, ...config };
    return chuang.checkLimit(messages, cfg);
  }
  
  /**
   * 更新窗口配置
   */
  updateWindowConfig(newConfig) {
    this.windowConfig = { ...this.windowConfig, ...newConfig };
    return chuang.updateConfig(newConfig);
  }
  
  /**
   * 获取当前配置
   */
  getConfig() {
    return {
      historyPath: this.options.historyPath,
      pastesDir: this.options.pastesDir,
      window: this.windowConfig
    };
  }
  
  // ==================== 高层 API - 组合功能 ====================
  
  /**
   * 完整记录一次对话（自动处理存储和窗口）
   */
  async recordConversation(sessionId, messages) {
    // 1. 存储大内容到匣子
    const processedMessages = messages.map(msg => {
      const ref = this.store(msg.content);
      return {
        ...msg,
        sessionId,
        contentRef: ref,
        // 小内容保留原文，大内容用 hash
        content: ref.type === 'inline' ? msg.content : `[hash:${ref.hash}]`
      };
    });
    
    // 2. 记录到历史
    this.batchRecord(processedMessages);
    
    // 3. 返回处理后的消息（适合上下文窗口）
    const compressed = this.compressContext(processedMessages);
    
    return {
      recorded: processedMessages.length,
      compressed: compressed.compressed,
      messages: compressed.messages,
      summary: compressed.summary
    };
  }
  
  /**
   * 恢复会话（从历史 + 匣子）
   */
  async restoreSession(sessionId) {
    const records = await this.getSession(sessionId);
    
    // 恢复被 hash 引用的内容
    const restored = records.map(record => {
      if (record.contentRef) {
        const content = this.retrieve(record.contentRef);
        if (content) {
          return { ...record, content: content };
        }
      }
      return record;
    });
    
    return restored;
  }
  
  /**
   * 获取系统状态
   */
  async getStatus() {
    const historyStats = await this.getHistoryStats();
    const pastesStats = this.getPastesStats();
    
    return {
      version: '1.0.0',
      history: {
        path: this.options.historyPath,
        records: historyStats.totalRecords,
        sessions: historyStats.sessionCount,
        sizeBytes: historyStats.sizeBytes
      },
      pastes: {
        dir: this.options.pastesDir,
        files: pastesStats.fileCount,
        sizeBytes: pastesStats.totalSizeBytes
      },
      window: this.windowConfig
    };
  }
}

// 导出模块和类
module.exports = {
  // 主类
  Janus,
  
  // 直接导出模块（供高级用户直接使用）
  su,      // 溯
  xia,     // 匣
  chuang,  // 窗
  
  // 便捷创建
  create(options) {
    return new Janus(options);
  }
};

// 默认导出
module.exports.default = Janus;
