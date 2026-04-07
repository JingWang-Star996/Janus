/**
 * 溯 - 会话历史记录管理
 * JSONL 格式存储，支持检索和导出
 */

const fs = require('fs');
const path = require('path');
const { generateId, readJson, writeJson, readJsonl, appendJsonl } = require('./utils');
const { FileLock, defaultLock } = require('./fileLock');
const { LazyLoader } = require('./lazyLoader');

class Session {
  constructor(dataDir = '../data/sessions') {
    this.dataDir = path.resolve(__dirname, dataDir);
    this.metaFile = path.resolve(__dirname, '../data/meta.json');
    this.projectsDir = path.resolve(__dirname, '../data/projects');
    this._ensureDataDir();
    
    // 文件锁
    this.lock = new FileLock();
    
    // 懒加载器
    this.lazyLoader = new LazyLoader({
      sessionsDir: dataDir
    });
    
    // 当前会话（会话隔离）
    this._currentSessionId = null;
    
    // 项目隔离映射
    this._projectSessions = new Map(); // projectId -> Set<sessionId>
  }

  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.projectsDir)) {
      fs.mkdirSync(this.projectsDir, { recursive: true });
    }
    if (!fs.existsSync(this.metaFile)) {
      writeJson(this.metaFile, { sessions: [], clips: [], context: [], projects: [] });
    }
  }

  _getMeta() {
    return readJson(this.metaFile) || { sessions: [], clips: [], context: [] };
  }

  _saveMeta(meta) {
    writeJson(this.metaFile, meta);
  }

  /**
   * 创建新会话
   * @param {string} title - 会话标题
   * @param {object} options - 选项
   * @returns {string} 会话 ID
   */
  async create(title, options = {}) {
    const sessionId = generateId('sess');
    const sessionFile = path.join(this.dataDir, `${sessionId}.jsonl`);
    
    const sessionMeta = {
      id: sessionId,
      title,
      file: `${sessionId}.jsonl`,
      created: Date.now(),
      updated: Date.now(),
      messageCount: 0,
      tags: options.tags || [],
      ...options
    };

    // 创建空文件
    fs.writeFileSync(sessionFile, '', 'utf-8');

    // 更新元数据
    const meta = this._getMeta();
    meta.sessions.push(sessionMeta);
    this._saveMeta(meta);

    console.log(`[溯] 创建会话：${sessionId} - ${title}`);
    return sessionId;
  }

  /**
   * 添加消息到会话
   * @param {string} sessionId - 会话 ID
   * @param {object} message - 消息对象 {role, content, timestamp?}
   */
  async addMessage(sessionId, message) {
    const sessionFile = path.join(this.dataDir, `${sessionId}.jsonl`);
    
    if (!fs.existsSync(sessionFile)) {
      throw new Error(`会话不存在：${sessionId}`);
    }

    const messageWithTime = {
      ...message,
      timestamp: message.timestamp || Date.now()
    };

    appendJsonl(sessionFile, messageWithTime);

    // 更新元数据
    const meta = this._getMeta();
    const session = meta.sessions.find(s => s.id === sessionId);
    if (session) {
      session.messageCount++;
      session.updated = Date.now();
    }
    this._saveMeta(meta);
  }

  /**
   * 获取会话所有消息
   * @param {string} sessionId - 会话 ID
   * @returns {array} 消息数组
   */
  async getMessages(sessionId) {
    const sessionFile = path.join(this.dataDir, `${sessionId}.jsonl`);
    return readJsonl(sessionFile);
  }

  /**
   * 检索会话消息
   * @param {string} sessionId - 会话 ID
   * @param {object} filters - 过滤条件 {keyword, role, startTime, endTime}
   * @returns {array} 匹配的消息
   */
  async search(sessionId, filters = {}) {
    const messages = await this.getMessages(sessionId);
    
    return messages.filter(msg => {
      if (filters.keyword && !msg.content?.includes(filters.keyword)) {
        return false;
      }
      if (filters.role && msg.role !== filters.role) {
        return false;
      }
      if (filters.startTime && msg.timestamp < filters.startTime) {
        return false;
      }
      if (filters.endTime && msg.timestamp > filters.endTime) {
        return false;
      }
      return true;
    });
  }

  /**
   * 获取会话列表
   * @returns {array} 会话元数据数组
   */
  async list() {
    const meta = this._getMeta();
    return meta.sessions.sort((a, b) => b.updated - a.updated);
  }

  /**
   * 获取会话详情
   * @param {string} sessionId - 会话 ID
   * @returns {object|null} 会话元数据
   */
  async get(sessionId) {
    const meta = this._getMeta();
    return meta.sessions.find(s => s.id === sessionId) || null;
  }

  /**
   * 更新会话元数据
   * @param {string} sessionId - 会话 ID
   * @param {object} updates - 更新内容
   */
  async update(sessionId, updates) {
    const meta = this._getMeta();
    const session = meta.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error(`会话不存在：${sessionId}`);
    }

    Object.assign(session, updates, { updated: Date.now() });
    this._saveMeta(meta);
  }

  /**
   * 删除会话
   * @param {string} sessionId - 会话 ID
   */
  async delete(sessionId) {
    const sessionFile = path.join(this.dataDir, `${sessionId}.jsonl`);
    
    if (fs.existsSync(sessionFile)) {
      fs.unlinkSync(sessionFile);
    }

    const meta = this._getMeta();
    meta.sessions = meta.sessions.filter(s => s.id !== sessionId);
    this._saveMeta(meta);

    console.log(`[溯] 删除会话：${sessionId}`);
  }

  /**
   * 导出会话
   * @param {string} sessionId - 会话 ID
   * @returns {object} 导出的会话数据
   */
  async export(sessionId) {
    const session = await this.get(sessionId);
    if (!session) {
      throw new Error(`会话不存在：${sessionId}`);
    }

    const messages = await this.getMessages(sessionId);

    return {
      ...session,
      messages,
      exportedAt: Date.now()
    };
  }

  /**
   * 导入会话
   * @param {object} data - 导出的会话数据
   * @returns {string} 新会话 ID
   */
  async import(data) {
    const sessionId = await this.create(data.title || '导入的会话', {
      tags: data.tags,
      importedFrom: data.id
    });

    const sessionFile = path.join(this.dataDir, `${sessionId}.jsonl`);
    
    for (const msg of data.messages || []) {
      appendJsonl(sessionFile, msg);
    }

    // 更新消息计数
    const meta = this._getMeta();
    const session = meta.sessions.find(s => s.id === sessionId);
    if (session) {
      session.messageCount = data.messages?.length || 0;
    }
    this._saveMeta(meta);

    return sessionId;
  }

  /**
   * 清理过期会话（可选）
   * @param {number} daysOld - 多少天前的会话
   */
  async cleanup(daysOld = 30) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const meta = this._getMeta();
    
    const toDelete = meta.sessions.filter(s => s.updated < cutoff);
    
    for (const session of toDelete) {
      await this.delete(session.id);
    }

    console.log(`[溯] 清理了 ${toDelete.length} 个过期会话`);
    return toDelete.length;
  }

  // ==================== 会话隔离增强功能 ====================

  /**
   * 创建项目（项目级隔离）
   * @param {string} projectName - 项目名称
   * @param {object} options - 选项
   * @returns {string} 项目 ID
   */
  async createProject(projectName, options = {}) {
    const projectId = generateId('proj');
    const projectFile = path.join(this.projectsDir, `${projectId}.json`);
    
    const projectMeta = {
      id: projectId,
      name: projectName,
      created: Date.now(),
      updated: Date.now(),
      sessionIds: [],
      ...options
    };
    
    writeJson(projectFile, projectMeta);
    
    // 更新元数据
    const meta = this._getMeta();
    if (!meta.projects) meta.projects = [];
    meta.projects.push({
      id: projectId,
      name: projectName,
      created: projectMeta.created
    });
    this._saveMeta(meta);
    
    console.log(`[溯] 创建项目：${projectId} - ${projectName}`);
    return projectId;
  }

  /**
   * 获取项目信息
   * @param {string} projectId - 项目 ID
   * @returns {object|null} 项目信息
   */
  async getProject(projectId) {
    const projectFile = path.join(this.projectsDir, `${projectId}.json`);
    
    if (!fs.existsSync(projectFile)) {
      return null;
    }
    
    return readJson(projectFile);
  }

  /**
   * 将Session 关联到项目
   * @param {string} projectId - 项目 ID
   * @param {string} sessionId - 会话 ID
   */
  async linkSessionToProject(projectId, sessionId) {
    const projectFile = path.join(this.projectsDir, `${projectId}.json`);
    
    if (!fs.existsSync(projectFile)) {
      throw new Error(`项目不存在：${projectId}`);
    }
    
    const project = readJson(projectFile);
    
    if (!project.sessionIds.includes(sessionId)) {
      project.sessionIds.push(sessionId);
      project.updated = Date.now();
      writeJson(projectFile, project);
    }
    
    // 更新内存映射
    if (!this._projectSessions.has(projectId)) {
      this._projectSessions.set(projectId, new Set());
    }
    this._projectSessions.get(projectId).add(sessionId);
    
    console.log(`[溯] 关联会话到项目：${sessionId} → ${projectId}`);
  }

  /**
   * 获取项目下的所有会话
   * @param {string} projectId - 项目 ID
   * @returns {Promise<Array>} 会话列表
   */
  async getProjectSessions(projectId) {
    const project = await this.getProject(projectId);
    
    if (!project) {
      return [];
    }
    
    const sessions = [];
    for (const sessionId of project.sessionIds) {
      const session = await this.get(sessionId);
      if (session) {
        sessions.push(session);
      }
    }
    
    return sessions.sort((a, b) => b.updated - a.updated);
  }

  /**
   * 设置当前会话（会话隔离）
   * @param {string} sessionId - 会话 ID
   */
  setCurrentSession(sessionId) {
    this._currentSessionId = sessionId;
    console.log(`[溯] 当前会话：${sessionId}`);
  }

  /**
   * 获取当前会话 ID
   * @returns {string|null} 当前会话 ID
   */
  getCurrentSessionId() {
    return this._currentSessionId;
  }

  /**
   * 获取当前会话（优先返回当前会话）
   * @param {object} options - 选项，支持 limit 等参数
   * @returns {Promise<Array>} 当前会话消息
   */
  async getCurrentMessages(options = {}) {
    if (!this._currentSessionId) {
      throw new Error('未设置当前会话');
    }
    
    const limit = options.limit || 20;
    return this.getLatestMessages(this._currentSessionId, limit);
  }

  /**
   * 懒加载获取最新消息（反向读取优化）
   * @param {string} sessionId - 会话 ID
   * @param {number} limit - 条数
   * @returns {Promise<Array>} 消息数组（最新在前）
   */
  async getLatestMessages(sessionId, limit = 20) {
    return this.lazyLoader.getLatestMessages(sessionId, limit);
  }

  /**
   * 分页获取历史消息（懒加载）
   * @param {string} sessionId - 会话 ID
   * @param {object} options - 选项
   * @returns {Promise<object>} { messages, hasMore, total }
   */
  async getHistoryPage(sessionId, options = {}) {
    return this.lazyLoader.getHistoryPage(sessionId, options);
  }

  /**
   * 带锁添加消息（防止并发冲突）
   * @param {string} sessionId - 会话 ID
   * @param {object} message - 消息对象
   */
  async addMessageWithLock(sessionId, message) {
    return defaultLock.withLock(`session:${sessionId}`, async () => {
      return await this.addMessage(sessionId, message);
    });
  }

  /**
   * 批量获取多个会话的引用（懒加载）
   * @param {Array<string>} sessionIds - 会话 ID 列表
   * @returns {Promise<Array>} 会话引用列表
   */
  async batchGetSessionRefs(sessionIds) {
    return this.lazyLoader.batchGetSessionRefs(sessionIds);
  }

  /**
   * 获取项目列表
   * @returns {Array} 项目列表
   */
  async listProjects() {
    const meta = this._getMeta();
    return meta.projects || [];
  }

  /**
   * 删除项目
   * @param {string} projectId - 项目 ID
   */
  async deleteProject(projectId) {
    const projectFile = path.join(this.projectsDir, `${projectId}.json`);
    
    if (fs.existsSync(projectFile)) {
      fs.unlinkSync(projectFile);
    }
    
    const meta = this._getMeta();
    meta.projects = (meta.projects || []).filter(p => p.id !== projectId);
    this._saveMeta(meta);
    
    this._projectSessions.delete(projectId);
    
    console.log(`[溯] 删除项目：${projectId}`);
  }
}

module.exports = { Session };
