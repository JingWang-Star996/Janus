/**
 * 懒加载优化 - 历史条目懒解析、粘贴内容懒展开
 * 支持反向读取（最新优先），按需加载
 */

const fs = require('fs');
const path = require('path');

class LazyLoader {
  constructor(options = {}) {
    this.sessionsDir = path.resolve(__dirname, options.sessionsDir || '../data/sessions');
    this.clipsDir = path.resolve(__dirname, options.clipsDir || '../data/clips');
    
    // 懒加载缓存
    this._sessionCache = new Map(); // sessionId -> { file, lineCount, loadedLines }
    this._clipCache = new Map(); // clipId -> content (仅当访问后缓存)
    
    // 配置
    this.config = {
      maxCachedSessions: options.maxCachedSessions || 50,
      maxCachedClips: options.maxCachedClips || 100,
      lazyLoadThreshold: options.lazyLoadThreshold || 1000, // 超过 1000 字符懒加载
      defaultLimit: options.defaultLimit || 50 // 默认加载条数
    };
  }

  /**
   * 懒加载会话消息（反向读取，最新优先）
   * @param {string} sessionId - 会话 ID
   * @param {object} options - 选项
   * @param {number} options.limit - 加载条数
   * @param {number} options.offset - 偏移量（从末尾开始）
   * @returns {Promise<Array>} 消息数组（最新在前）
   */
  async loadSessionMessages(sessionId, options = {}) {
    const { limit = this.config.defaultLimit, offset = 0 } = options;
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.jsonl`);

    if (!fs.existsSync(sessionFile)) {
      throw new Error(`会话不存在：${sessionId}`);
    }

    // 检查缓存
    let cache = this._sessionCache.get(sessionId);
    
    if (!cache) {
      // 初始化缓存（只读取元数据，不加载内容）
      const stats = fs.statSync(sessionFile);
      cache = {
        file: sessionFile,
        lineCount: 0,
        size: stats.size,
        loadedLines: [],
        lastAccessed: Date.now()
      };
      this._sessionCache.set(sessionId, cache);
    }

    cache.lastAccessed = Date.now();

    // 使用流式读取，从文件末尾开始
    const messages = await this._readLinesReverse(sessionFile, limit, offset);
    
    // 更新缓存
    cache.loadedLines = messages;
    this._cleanupCacheIfNeeded();

    return messages;
  }

  /**
   * 反向读取文件行（最新优先）
   * @private
   */
  async _readLinesReverse(filePath, limit, offset) {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      return [];
    }

    // 对于小文件（< 1MB），直接读取全部然后反向
    // 对于大文件，使用流式读取
    if (stats.size < 1024 * 1024) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n')
        .filter(line => line.trim())
        .reverse(); // 反向：最新在前
      
      return lines
        .slice(offset, offset + limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(msg => msg !== null);
    }

    // 大文件使用流式读取
    return new Promise((resolve, reject) => {
      const CHUNK_SIZE = 4096;
      let position = stats.size;
      let buffer = Buffer.alloc(0);
      let allLines = [];

      const readChunk = () => {
        if (position <= 0) {
          if (buffer.length > 0) {
            const text = buffer.toString('utf-8');
            if (text.trim()) {
              allLines.push(text);
            }
          }
          
          const result = allLines
            .slice(offset, offset + limit)
            .map(line => {
              try {
                return JSON.parse(line);
              } catch (e) {
                return null;
              }
            })
            .filter(msg => msg !== null);
          
          resolve(result);
          return;
        }

        const readSize = Math.min(CHUNK_SIZE, position);
        position -= readSize;

        const readStream = fs.createReadStream(filePath, {
          start: position,
          end: position + readSize - 1
        });

        readStream.on('data', chunk => {
          buffer = Buffer.concat([chunk, buffer]);
          const text = buffer.toString('utf-8');
          const lines = text.split('\n');
          
          for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].trim()) {
              allLines.push(lines[i]);
            }
          }
          
          buffer = lines[lines.length - 1] ? Buffer.from(lines[lines.length - 1]) : Buffer.alloc(0);

          if (allLines.length >= limit + offset) {
            const result = allLines
              .slice(offset, offset + limit)
              .map(line => JSON.parse(line))
              .filter(msg => msg !== null);
            resolve(result);
            return;
          }

          readChunk();
        });

        readStream.on('error', reject);
      };

      readChunk();
    });
  }

  /**
   * 解析缓冲区的行为
   * @private
   */
  _parseLines(buffer) {
    const text = buffer.toString('utf-8');
    const lines = text.split('\n');
    
    // 最后一行可能不完整（没有换行符结尾）
    // 但如果最后一行是空字符串，说明以换行符结尾，是完整的
    const lastLine = lines[lines.length - 1];
    const complete = lines.slice(0, -1).filter(line => line.trim());
    
    // 如果最后一行非空，它可能是不完整的，保留到下一次处理
    // 如果最后一行是空字符串，说明文件以换行符结尾，不需要保留
    const incomplete = lastLine ? Buffer.from(lastLine) : Buffer.alloc(0);

    return { complete, incomplete };
  }

  /**
   * 懒加载粘贴内容（仅在访问时展开）
   * @param {string} clipId - 内容 ID
   * @param {boolean} cache - 是否缓存
   * @returns {Promise<string>} 内容
   */
  async loadClipContent(clipId, cache = true) {
    // 检查缓存
    if (cache && this._clipCache.has(clipId)) {
      const cached = this._clipCache.get(clipId);
      cached.lastAccessed = Date.now();
      cached.accessCount++;
      return cached.content;
    }

    const clipFile = path.join(this.clipsDir, `${clipId}.txt`);
    
    if (!fs.existsSync(clipFile)) {
      return null;
    }

    // 懒加载：只在需要时读取文件
    const content = fs.readFileSync(clipFile, 'utf-8');

    if (cache) {
      this._clipCache.set(clipId, {
        content,
        lastAccessed: Date.now(),
        accessCount: 1
      });
      this._cleanupCacheIfNeeded();
    }

    return content;
  }

  /**
   * 获取会话消息的懒加载引用（不实际加载内容）
   * @param {string} sessionId - 会话 ID
   * @returns {Promise<object>} 会话引用信息
   */
  async getSessionRef(sessionId) {
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.jsonl`);

    if (!fs.existsSync(sessionFile)) {
      return null;
    }

    const stats = fs.statSync(sessionFile);
    
    // 快速计算行数（不解析内容）
    const lineCount = await this._countLines(sessionFile);

    return {
      sessionId,
      file: sessionFile,
      size: stats.size,
      lineCount,
      loaded: false, // 标记为未加载
      load: () => this.loadSessionMessages(sessionId) // 懒加载方法
    };
  }

  /**
   * 计算文件行数（快速）
   * @private
   */
  async _countLines(filePath) {
    return new Promise((resolve, reject) => {
      let lineCount = 0;
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', chunk => {
        const matches = chunk.toString().match(/\n/g);
        if (matches) {
          lineCount += matches.length;
        }
      });
      
      stream.on('end', () => resolve(lineCount));
      stream.on('error', reject);
    });
  }

  /**
   * 批量懒加载多个会话的元数据
   * @param {Array<string>} sessionIds - 会话 ID 列表
   * @returns {Promise<Array>} 会话引用列表
   */
  async batchGetSessionRefs(sessionIds) {
    const refs = [];
    
    for (const sessionId of sessionIds) {
      const ref = await this.getSessionRef(sessionId);
      if (ref) {
        refs.push(ref);
      }
    }

    return refs;
  }

  /**
   * 懒加载会话的最新 N 条消息（常用操作）
   * @param {string} sessionId - 会话 ID
   * @param {number} limit - 条数
   * @returns {Promise<Array>} 消息数组（最新在前）
   */
  async getLatestMessages(sessionId, limit = 10) {
    return this.loadSessionMessages(sessionId, { limit, offset: 0 });
  }

  /**
   * 懒加载历史消息（分页）
   * @param {string} sessionId - 会话 ID
   * @param {object} options - 选项
   * @param {number} options.page - 页码（从 0 开始）
   * @param {number} options.pageSize - 每页条数
   * @returns {Promise<object>} { messages, hasMore, total }
   */
  async getHistoryPage(sessionId, options = {}) {
    const { page = 0, pageSize = this.config.defaultLimit } = options;
    const offset = page * pageSize;

    const messages = await this.loadSessionMessages(sessionId, {
      limit: pageSize,
      offset
    });

    // 检查是否还有更多
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.jsonl`);
    const totalLines = await this._countLines(sessionFile);
    const hasMore = offset + messages.length < totalLines;

    return {
      messages,
      hasMore,
      total: totalLines
    };
  }

  /**
   * 清理缓存（LRU 策略）
   * @private
   */
  _cleanupCacheIfNeeded() {
    // 清理会话缓存
    if (this._sessionCache.size > this.config.maxCachedSessions) {
      const sorted = Array.from(this._sessionCache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = sorted.slice(0, sorted.length - this.config.maxCachedSessions);
      for (const [key] of toRemove) {
        this._sessionCache.delete(key);
      }
    }

    // 清理剪贴板缓存
    if (this._clipCache.size > this.config.maxCachedClips) {
      const sorted = Array.from(this._clipCache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = sorted.slice(0, sorted.length - this.config.maxCachedClips);
      for (const [key] of toRemove) {
        this._clipCache.delete(key);
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clearCache() {
    this._sessionCache.clear();
    this._clipCache.clear();
  }

  /**
   * 获取缓存状态
   * @returns {object} 缓存统计
   */
  getCacheStats() {
    return {
      sessions: {
        cached: this._sessionCache.size,
        max: this.config.maxCachedSessions
      },
      clips: {
        cached: this._clipCache.size,
        max: this.config.maxCachedClips
      }
    };
  }
}

module.exports = {
  LazyLoader
};
