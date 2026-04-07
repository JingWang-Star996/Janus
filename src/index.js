/**
 * 忆匣 (YiXia) - 第二记忆系统
 * 
 * 主入口文件
 * 集成：溯（会话）+ 匣（粘贴）+ 窗（上下文）
 */

const { Session } = require('./session');
const { Clipboard } = require('./clipboard');
const { ContextWindow } = require('./context');
const { FileLock, defaultLock } = require('./fileLock');
const { LazyLoader } = require('./lazyLoader');
const { ModelAdapter } = require('./modelAdapter');
const utils = require('./utils');

class YiXia {
  constructor(options = {}) {
    const dataDir = options.dataDir || '../data';
    
    this.session = new Session(`${dataDir}/sessions`);
    this.clipboard = new Clipboard(`${dataDir}/clips`);
    this.context = new ContextWindow(options.context || {});
    this.lazyLoader = new LazyLoader({
      sessionsDir: `${dataDir}/sessions`,
      clipsDir: `${dataDir}/clips`
    });
    this.modelAdapter = new ModelAdapter(options.model || {});
    this.fileLock = defaultLock;
    
    console.log('📦 忆匣已初始化');
    console.log('  溯 - 会话管理就绪');
    console.log('  匣 - 粘贴管理就绪');
    console.log('  窗 - 上下文管理就绪');
    console.log('  🔒 文件锁机制就绪');
    console.log('  ⚡ 懒加载优化就绪');
    console.log('  🤖 模型适配就绪');
  }

  /**
   * 获取系统统计
   */
  async getStats() {
    const sessions = await this.session.list();
    const clipboardStats = await this.clipboard.getStats();
    const contextStatus = this.context.getStatus();
    const lazyLoaderStats = this.lazyLoader.getCacheStats();
    const modelStatus = this.modelAdapter.getStatus();
    const activeLocks = this.fileLock.getActiveLocks();

    return {
      sessions: {
        total: sessions.length,
        list: sessions.map(s => ({
          id: s.id,
          title: s.title,
          messages: s.messageCount,
          updated: new Date(s.updated).toLocaleString('zh-CN')
        }))
      },
      clipboard: clipboardStats,
      context: contextStatus,
      lazyLoader: lazyLoaderStats,
      model: modelStatus,
      locks: {
        active: activeLocks.length,
        list: activeLocks
      }
    };
  }

  /**
   * 快速存储（会话 + 粘贴联动）
   * @param {string} sessionId - 会话 ID
   * @param {object} message - 消息
   * @param {boolean} storeLarge - 是否自动存储大内容
   */
  async quickStore(sessionId, message, storeLarge = true) {
    const THRESHOLD = 500; // 超过 500 字符自动存储到匣子

    // 添加到会话
    await this.session.addMessage(sessionId, {
      role: message.role,
      content: message.content,
      timestamp: Date.now()
    });

    // 如果内容较大，同时存储到匣子
    if (storeLarge && message.content.length > THRESHOLD) {
      const clipId = await this.clipboard.store({
        content: message.content,
        type: 'text',
        title: `${message.role} - ${new Date().toLocaleString('zh-CN')}`
      });

      console.log(`📦 大内容自动存匣：${clipId}`);
      
      // 在会话中记录引用
      await this.session.addMessage(sessionId, {
        role: 'system',
        content: `[匣子引用] ${clipId}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 导出完整备份
   */
  async exportBackup(filePath) {
    const fs = require('fs');
    const sessions = await this.session.list();
    const clips = await this.clipboard.list();

    const backup = {
      version: '1.0',
      exportedAt: Date.now(),
      sessions: [],
      clips: []
    };

    // 导出所有会话
    for (const session of sessions) {
      const sessionData = await this.session.export(session.id);
      backup.sessions.push(sessionData);
    }

    // 导出所有粘贴内容
    for (const clip of clips) {
      const content = await this.clipboard.get(clip.id);
      backup.clips.push({
        ...clip,
        content
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`📦 备份完成：${filePath}`);
    
    return backup;
  }

  /**
   * 从备份导入
   */
  async importBackup(filePath) {
    const fs = require('fs');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`备份文件不存在：${filePath}`);
    }

    const backup = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`📦 开始导入备份...`);
    console.log(`  会话：${backup.sessions?.length || 0}`);
    console.log(`  粘贴：${backup.clips?.length || 0}`);

    // 导入会话
    for (const sessionData of backup.sessions || []) {
      await this.session.import(sessionData);
    }

    // 导入粘贴内容
    for (const clipData of backup.clips || []) {
      await this.clipboard.store({
        content: clipData.content,
        type: clipData.type,
        tags: clipData.tags,
        title: clipData.title
      });
    }

    console.log('📦 导入完成');
  }

  // ==================== 新功能快捷方法 ====================

  /**
   * 懒加载会话消息（最新优先）
   */
  async getLatestMessages(sessionId, limit = 20) {
    return this.session.getLatestMessages(sessionId, limit);
  }

  /**
   * 展开内容中的引用
   */
  async expandReferences(content, lazy = false) {
    return this.clipboard.expandReferences(content, lazy);
  }

  /**
   * 设置当前模型
   */
  setModel(modelName) {
    return this.modelAdapter.setModel(modelName);
  }

  /**
   * 检查上下文限制
   */
  checkContextLimit(messages, estimatedTokens = null) {
    return this.modelAdapter.checkContextLimit(messages, estimatedTokens);
  }

  /**
   * 创建项目（会话隔离）
   */
  async createProject(projectName, options = {}) {
    return this.session.createProject(projectName, options);
  }

  /**
   * 设置当前会话
   */
  setCurrentSession(sessionId) {
    this.session.setCurrentSession(sessionId);
  }

  /**
   * 带锁添加消息（防止并发冲突）
   */
  async addMessageWithLock(sessionId, message) {
    return this.session.addMessageWithLock(sessionId, message);
  }
}

// 导出所有模块
module.exports = {
  YiXia,
  Session,
  Clipboard,
  ContextWindow,
  FileLock,
  defaultLock,
  LazyLoader,
  ModelAdapter,
  utils
};

// CLI 模式
if (require.main === module) {
  console.log('📦 忆匣 (YiXia) - 第二记忆系统');
  console.log('');
  console.log('用法：');
  console.log('  node src/index.js              # 显示帮助');
  console.log('  node src/index.js stats        # 查看统计');
  console.log('  node src/index.js demo         # 运行演示');
  console.log('');
  
  const command = process.argv[2];
  
  if (command === 'stats') {
    const yixia = new YiXia();
    yixia.getStats().then(stats => {
      console.log('\n📊 系统统计:');
      console.log(JSON.stringify(stats, null, 2));
    });
  } else if (command === 'demo') {
    runDemo();
  }
}

/**
 * 演示函数
 */
async function runDemo() {
  console.log('🎬 运行演示...\n');
  
  const yixia = new YiXia();
  
  // 1. 创建会话
  console.log('\n--- 步骤 1: 创建会话 ---');
  const sessionId = await yixia.session.create('演示会话', { tags: ['demo', 'test'] });
  
  // 2. 添加消息
  console.log('\n--- 步骤 2: 添加消息 ---');
  await yixia.session.addMessage(sessionId, {
    role: 'user',
    content: '你好，这是一个测试消息'
  });
  await yixia.session.addMessage(sessionId, {
    role: 'assistant',
    content: '你好！有什么可以帮助你的？'
  });
  
  // 3. 存储大内容到匣子
  console.log('\n--- 步骤 3: 存储大内容 ---');
  const largeContent = '这是一段很长的文本内容...\n'.repeat(50);
  const clipId = await yixia.clipboard.store({
    content: largeContent,
    type: 'text',
    tags: ['重要', '参考'],
    title: '演示内容'
  });
  
  // 4. 添加到上下文窗口
  console.log('\n--- 步骤 4: 管理上下文 ---');
  await yixia.context.add({
    id: 'ctx_1',
    type: 'note',
    content: '这是重要的上下文信息',
    priority: 8
  });
  
  // 5. 查看统计
  console.log('\n--- 步骤 5: 查看统计 ---');
  const stats = await yixia.getStats();
  console.log(`会话数：${stats.sessions.total}`);
  console.log(`粘贴内容：${stats.clipboard.total}`);
  console.log(`上下文使用：${stats.context.usage}`);
  
  console.log('\n✅ 演示完成！\n');
}
