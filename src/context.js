/**
 * 窗 - 上下文窗口管理（可选功能）
 * 智能上下文选择，优先级排序，窗口大小控制
 */

const { estimateTokens } = require('./utils');

class ContextWindow {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 4000; // 最大 token 数
    this.items = [];
  }

  /**
   * 添加上下文项
   * @param {object} item - 上下文项
   * @param {string} item.type - 类型 (message|file|note|reference)
   * @param {string} item.content - 内容
   * @param {number} item.priority - 优先级 (1-10, 10 最高)
   * @param {string} item.id - 唯一标识
   */
  async add(item) {
    const tokenCount = estimateTokens(item.content);
    
    const contextItem = {
      ...item,
      tokenCount,
      addedAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0
    };

    this.items.push(contextItem);
    
    console.log(`[窗] 添加上下文：${item.id || 'unnamed'} (${tokenCount} tokens, 优先级${item.priority})`);
    
    // 自动优化窗口
    this._optimize();
    
    return contextItem;
  }

  /**
   * 获取优化后的上下文
   * @returns {array} 上下文项数组
   */
  async getContext() {
    this._optimize();
    return this.items.map(item => ({
      type: item.type,
      content: item.content,
      priority: item.priority,
      id: item.id
    }));
  }

  /**
   * 获取当前 token 使用量
   * @returns {number} token 数
   */
  getTokenUsage() {
    return this.items.reduce((sum, item) => sum + item.tokenCount, 0);
  }

  /**
   * 优化窗口（移除低优先级项）
   * @private
   */
  _optimize() {
    let currentUsage = this.getTokenUsage();
    
    if (currentUsage <= this.maxSize) {
      return;
    }

    console.log(`[窗] 优化窗口：${currentUsage} > ${this.maxSize} tokens`);

    // 按优先级和访问时间排序（低优先级 + 久未访问的优先移除）
    this.items.sort((a, b) => {
      // 先按优先级（低优先级在前）
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // 再按访问时间（久未访问的在前）
      return a.accessedAt - b.accessedAt;
    });

    // 移除直到满足窗口大小
    while (currentUsage > this.maxSize && this.items.length > 0) {
      const removed = this.items.shift();
      currentUsage -= removed.tokenCount;
      console.log(`[窗] 移除：${removed.id || 'unnamed'} (${removed.tokenCount} tokens)`);
    }
  }

  /**
   * 更新上下文项
   * @param {string} id - 上下文项 ID
   * @param {object} updates - 更新内容
   */
  async update(id, updates) {
    const item = this.items.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`上下文项不存在：${id}`);
    }

    Object.assign(item, updates);
    
    if (updates.content) {
      item.tokenCount = estimateTokens(updates.content);
    }
    
    item.accessedAt = Date.now();
    item.accessCount++;

    this._optimize();
  }

  /**
   * 删除上下文项
   * @param {string} id - 上下文项 ID
   */
  async remove(id) {
    const index = this.items.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error(`上下文项不存在：${id}`);
    }

    const removed = this.items.splice(index, 1)[0];
    console.log(`[窗] 移除：${id} (${removed.tokenCount} tokens)`);
  }

  /**
   * 清空窗口
   */
  async clear() {
    this.items = [];
    console.log('[窗] 清空窗口');
  }

  /**
   * 获取窗口状态
   * @returns {object} 状态信息
   */
  getStatus() {
    const currentUsage = this.getTokenUsage();
    const items = this.items.map(item => ({
      id: item.id,
      type: item.type,
      priority: item.priority,
      tokenCount: item.tokenCount,
      accessCount: item.accessCount
    }));

    return {
      current: currentUsage,
      max: this.maxSize,
      usage: Math.round((currentUsage / this.maxSize) * 100) + '%',
      itemCount: this.items.length,
      items
    };
  }

  /**
   * 提升优先级
   * @param {string} id - 上下文项 ID
   * @param {number} priority - 新优先级
   */
  async prioritize(id, priority) {
    const item = this.items.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`上下文项不存在：${id}`);
    }

    const oldPriority = item.priority;
    item.priority = priority;
    item.accessedAt = Date.now();

    console.log(`[窗] 优先级：${id} ${oldPriority} → ${priority}`);
  }

  /**
   * 标记为已访问
   * @param {string} id - 上下文项 ID
   */
  async touch(id) {
    const item = this.items.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`上下文项不存在：${id}`);
    }

    item.accessedAt = Date.now();
    item.accessCount++;
  }
}

module.exports = { ContextWindow };
