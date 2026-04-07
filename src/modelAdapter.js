/**
 * 模型适配 - 支持多种 LLM 模型配置
 * 自动适配上下文窗口和最大输出 Token 限制
 */

class ModelAdapter {
  constructor(options = {}) {
    // 预定义模型配置
    this.modelConfigs = {
      // 通义千问系列
      'qwen3.5-plus': {
        name: 'Qwen 3.5 Plus',
        contextWindow: 32768, // 32K tokens
        maxOutputTokens: 8192,
        provider: 'bailian'
      },
      'qwen-max': {
        name: 'Qwen Max',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        provider: 'bailian'
      },
      'qwen-plus': {
        name: 'Qwen Plus',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        provider: 'bailian'
      },
      'qwen-turbo': {
        name: 'Qwen Turbo',
        contextWindow: 8192,
        maxOutputTokens: 2048,
        provider: 'bailian'
      },
      
      // Claude 系列
      'claude-3-5-sonnet': {
        name: 'Claude 3.5 Sonnet',
        contextWindow: 200000, // 200K tokens
        maxOutputTokens: 8192,
        provider: 'anthropic'
      },
      'claude-3-opus': {
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        provider: 'anthropic'
      },
      'claude-3-sonnet': {
        name: 'Claude 3 Sonnet',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        provider: 'anthropic'
      },
      'claude-3-haiku': {
        name: 'Claude 3 Haiku',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        provider: 'anthropic'
      },
      
      // GPT 系列
      'gpt-4o': {
        name: 'GPT-4o',
        contextWindow: 128000, // 128K tokens
        maxOutputTokens: 4096,
        provider: 'openai'
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        provider: 'openai'
      },
      'gpt-4': {
        name: 'GPT-4',
        contextWindow: 8192,
        maxOutputTokens: 4096,
        provider: 'openai'
      },
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        contextWindow: 16385,
        maxOutputTokens: 4096,
        provider: 'openai'
      },
      
      // Gemini 系列
      'gemini-1.5-pro': {
        name: 'Gemini 1.5 Pro',
        contextWindow: 1048576, // 1M tokens
        maxOutputTokens: 8192,
        provider: 'google'
      },
      'gemini-1.5-flash': {
        name: 'Gemini 1.5 Flash',
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        provider: 'google'
      },
      'gemini-pro': {
        name: 'Gemini Pro',
        contextWindow: 32768,
        maxOutputTokens: 8192,
        provider: 'google'
      }
    };
    
    // 当前模型
    this.currentModel = options.defaultModel || 'qwen3.5-plus';
    
    // 安全余量（保留一部分 token 用于系统提示等）
    this.safetyMargin = options.safetyMargin || 0.1; // 10%
    
    // 自定义模型配置
    this.customConfigs = options.customConfigs || {};
    
    console.log(`[模型] 适配器已初始化，默认模型：${this.currentModel}`);
  }

  /**
   * 设置当前模型
   * @param {string} modelName - 模型名称
   */
  setModel(modelName) {
    if (!this.getModelConfig(modelName)) {
      console.warn(`[模型] 未知模型：${modelName}，使用默认模型`);
      modelName = this.currentModel;
    }
    
    this.currentModel = modelName;
    console.log(`[模型] 切换到：${modelName}`);
    
    return this;
  }

  /**
   * 获取模型配置
   * @param {string} modelName - 模型名称
   * @returns {object|null} 模型配置
   */
  getModelConfig(modelName = null) {
    const name = modelName || this.currentModel;
    return this.customConfigs[name] || this.modelConfigs[name] || null;
  }

  /**
   * 注册自定义模型配置
   * @param {string} modelName - 模型名称
   * @param {object} config - 配置
   */
  registerModel(modelName, config) {
    this.customConfigs[modelName] = {
      name: config.name || modelName,
      contextWindow: config.contextWindow || 8192,
      maxOutputTokens: config.maxOutputTokens || 2048,
      provider: config.provider || 'unknown'
    };
    
    console.log(`[模型] 注册自定义模型：${modelName}`);
  }

  /**
   * 获取当前模型的上下文窗口
   * @returns {number} 上下文窗口大小
   */
  getContextWindow() {
    const config = this.getModelConfig();
    if (!config) {
      return 8192; // 默认值
    }
    return config.contextWindow;
  }

  /**
   * 获取当前模型的最大输出 Token 数
   * @returns {number} 最大输出 Token 数
   */
  getMaxOutputTokens() {
    const config = this.getModelConfig();
    if (!config) {
      return 2048; // 默认值
    }
    return config.maxOutputTokens;
  }

  /**
   * 获取可用上下文窗口（减去安全余量）
   * @returns {number} 可用上下文窗口
   */
  getAvailableContextWindow() {
    const total = this.getContextWindow();
    return Math.floor(total * (1 - this.safetyMargin));
  }

  /**
   * 检查消息是否超出上下文窗口
   * @param {Array} messages - 消息数组
   * @param {number} estimatedTokens - 估算的 token 数
   * @returns {object} { exceeds, current, available, suggestions }
   */
  checkContextLimit(messages, estimatedTokens = null) {
    const available = this.getAvailableContextWindow();
    const current = estimatedTokens || this.estimateMessagesTokens(messages);
    const exceeds = current > available;
    
    const suggestions = [];
    if (exceeds) {
      const needToRemove = current - available;
      suggestions.push(`需要移除约 ${needToRemove} tokens`);
      suggestions.push('建议：移除低优先级消息、压缩历史对话、使用摘要');
    }
    
    return {
      exceeds,
      current,
      available,
      usage: Math.round((current / available) * 100) + '%',
      suggestions
    };
  }

  /**
   * 估算消息的 token 数
   * @param {Array} messages - 消息数组
   * @returns {number} 估算的 token 数
   */
  estimateMessagesTokens(messages) {
    if (!messages || !Array.isArray(messages)) {
      return 0;
    }
    
    let totalTokens = 0;
    
    for (const msg of messages) {
      const content = typeof msg === 'string' ? msg : (msg.content || '');
      totalTokens += this.estimateTokens(content);
      
      // 每条消息额外消耗（角色标记等）
      totalTokens += 4;
    }
    
    return totalTokens;
  }

  /**
   * 估算文本的 token 数
   * @param {string} text - 文本内容
   * @returns {number} 估算的 token 数
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // 中文：约 1.5 字符/token，英文：约 4 字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }

  /**
   * 截断消息以适应上下文窗口
   * @param {Array} messages - 消息数组
   * @param {object} options - 选项
   * @returns {object} { messages, removed, summary }
   */
  truncateToContext(messages, options = {}) {
    const {
      reserveSystem = true, // 保留系统消息
      reserveLast = 5, // 至少保留最后 N 条
      useSummary = false, // 使用摘要替代
      maxMessages = 50 // 最大消息数（额外保护）
    } = options;
    
    const available = this.getAvailableContextWindow();
    let currentTokens = this.estimateMessagesTokens(messages);
    
    // 如果没有超出上下文，但消息数太多，也进行截断
    const shouldTruncate = currentTokens > available || messages.length > maxMessages;
    
    if (!shouldTruncate) {
      return {
        messages,
        removed: 0,
        summary: null
      };
    }
    
    let result = [...messages];
    let removed = 0;
    
    // 分离系统消息
    let systemMessages = [];
    if (reserveSystem) {
      systemMessages = result.filter(msg => msg.role === 'system');
      result = result.filter(msg => msg.role !== 'system');
    }
    
    // 保留最后 N 条
    const toKeep = result.slice(-reserveLast);
    const toProcess = result.slice(0, -reserveLast);
    
    // 从前往后移除（保留最近的对话）
    while ((currentTokens > available || toProcess.length + toKeep.length > maxMessages) && toProcess.length > 0) {
      const removedMsg = toProcess.shift();
      currentTokens -= this.estimateTokens(removedMsg.content || '');
      removed++;
    }
    
    // 如果还是超出，考虑使用摘要
    if (currentTokens > available && useSummary) {
      // TODO: 实现摘要功能
      console.warn('[模型] 需要摘要功能，但尚未实现');
    }
    
    return {
      messages: [...systemMessages, ...toProcess, ...toKeep],
      removed,
      summary: null
    };
  }

  /**
   * 获取模型信息
   * @returns {object} 模型信息
   */
  getModelInfo() {
    const config = this.getModelConfig();
    
    return {
      name: this.currentModel,
      displayName: config?.name || this.currentModel,
      contextWindow: config?.contextWindow || 8192,
      maxOutputTokens: config?.maxOutputTokens || 2048,
      provider: config?.provider || 'unknown',
      availableContext: this.getAvailableContextWindow(),
      safetyMargin: this.safetyMargin
    };
  }

  /**
   * 列出所有支持的模型
   * @returns {Array} 模型列表
   */
  listModels() {
    const allModels = {
      ...this.modelConfigs,
      ...this.customConfigs
    };
    
    return Object.entries(allModels).map(([key, config]) => ({
      id: key,
      name: config.name,
      contextWindow: config.contextWindow,
      maxOutputTokens: config.maxOutputTokens,
      provider: config.provider
    }));
  }

  /**
   * 按 provider 筛选模型
   * @param {string} provider - 提供商名称
   * @returns {Array} 模型列表
   */
  getModelsByProvider(provider) {
    return this.listModels().filter(m => m.provider === provider);
  }

  /**
   * 推荐模型（根据需求）
   * @param {object} requirements - 需求
   * @returns {string|null} 推荐的模型名称
   */
  recommendModel(requirements = {}) {
    const {
      minContext = 0,
      maxOutput = 0,
      provider = null
    } = requirements;
    
    const candidates = this.listModels().filter(m => {
      if (m.contextWindow < minContext) return false;
      if (m.maxOutputTokens < maxOutput) return false;
      if (provider && m.provider !== provider) return false;
      return true;
    });
    
    if (candidates.length === 0) {
      return null;
    }
    
    // 返回上下文窗口最小的符合条件的模型（节省成本）
    return candidates.sort((a, b) => a.contextWindow - b.contextWindow)[0].id;
  }

  /**
   * 设置安全余量
   * @param {number} margin - 安全余量比例（0-1）
   */
  setSafetyMargin(margin) {
    if (margin < 0 || margin > 1) {
      throw new Error('安全余量必须在 0-1 之间');
    }
    this.safetyMargin = margin;
  }

  /**
   * 获取当前状态
   * @returns {object} 状态信息
   */
  getStatus() {
    return {
      currentModel: this.currentModel,
      ...this.getModelInfo(),
      customModelsCount: Object.keys(this.customConfigs).length
    };
  }
}

module.exports = {
  ModelAdapter
};
