/**
 * 匣 - 粘贴内容管理
 * 大内容外部存储，自动去重，支持标签分类
 */

const fs = require('fs');
const path = require('path');
const { generateId, hashContent, readJson, writeJson, formatBytes, estimateTokens } = require('./utils');
const { LazyLoader } = require('./lazyLoader');

class Clipboard {
  constructor(dataDir = '../data/clips') {
    this.dataDir = path.resolve(__dirname, dataDir);
    this.metaFile = path.resolve(__dirname, '../data/meta.json');
    this.sessionsDir = path.resolve(__dirname, '../data/sessions');
    this._ensureDataDir();
    
    // 懒加载器
    this.lazyLoader = new LazyLoader({
      sessionsDir: '../data/sessions',
      clipsDir: dataDir
    });
    
    // 引用计数器（用于展开）
    this._referenceCounter = new Map();
  }

  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _getMeta() {
    return readJson(this.metaFile) || { sessions: [], clips: [], context: [] };
  }

  _saveMeta(meta) {
    writeJson(this.metaFile, meta);
  }

  /**
   * 存储内容
   * @param {object} options - 存储选项
   * @param {string} options.content - 内容
   * @param {string} options.type - 类型 (text|code|image|file)
   * @param {array} options.tags - 标签
   * @param {string} options.title - 标题
   * @returns {string} 内容 ID
   */
  async store(options) {
    const { content, type = 'text', tags = [], title = '' } = options;
    
    if (!content) {
      throw new Error('内容不能为空');
    }

    // 计算哈希（用于去重）
    const hash = hashContent(content);
    const contentId = generateId('clip');
    const contentFile = path.join(this.dataDir, `${contentId}.txt`);

    // 存储内容到文件
    fs.writeFileSync(contentFile, content, 'utf-8');

    // 创建元数据
    const clipMeta = {
      id: contentId,
      title: title || content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      type,
      size: Buffer.byteLength(content, 'utf-8'),
      hash,
      tags,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0
    };

    // 更新元数据
    const meta = this._getMeta();
    meta.clips.push(clipMeta);
    this._saveMeta(meta);

    console.log(`[匣] 存储内容：${contentId} - ${formatBytes(clipMeta.size)}`);
    return contentId;
  }

  /**
   * 获取内容
   * @param {string} contentId - 内容 ID
   * @returns {string|null} 内容
   */
  async get(contentId) {
    const contentFile = path.join(this.dataDir, `${contentId}.txt`);
    
    if (!fs.existsSync(contentFile)) {
      return null;
    }

    const content = fs.readFileSync(contentFile, 'utf-8');

    // 更新访问记录
    const meta = this._getMeta();
    const clip = meta.clips.find(c => c.id === contentId);
    if (clip) {
      clip.accessed = Date.now();
      clip.accessCount++;
    }
    this._saveMeta(meta);

    return content;
  }

  /**
   * 检索内容
   * @param {object} filters - 过滤条件
   * @returns {array} 匹配的元数据
   */
  async search(filters = {}) {
    const meta = this._getMeta();
    
    return meta.clips.filter(clip => {
      if (filters.tag && !clip.tags.includes(filters.tag)) {
        return false;
      }
      if (filters.type && clip.type !== filters.type) {
        return false;
      }
      if (filters.keyword) {
        const content = fs.readFileSync(
          path.join(this.dataDir, `${clip.id}.txt`),
          'utf-8'
        );
        if (!content.includes(filters.keyword)) {
          return false;
        }
      }
      if (filters.startTime && clip.created < filters.startTime) {
        return false;
      }
      if (filters.endTime && clip.created > filters.endTime) {
        return false;
      }
      return true;
    });
  }

  /**
   * 获取内容列表
   * @returns {array} 内容元数据数组
   */
  async list() {
    const meta = this._getMeta();
    return meta.clips.sort((a, b) => b.accessed - a.accessed);
  }

  /**
   * 获取内容详情
   * @param {string} contentId - 内容 ID
   * @returns {object|null} 内容元数据
   */
  async getMeta(contentId) {
    const meta = this._getMeta();
    return meta.clips.find(c => c.id === contentId) || null;
  }

  /**
   * 更新标签
   * @param {string} contentId - 内容 ID
   * @param {array} tags - 新标签
   */
  async updateTags(contentId, tags) {
    const meta = this._getMeta();
    const clip = meta.clips.find(c => c.id === contentId);
    
    if (!clip) {
      throw new Error(`内容不存在：${contentId}`);
    }

    clip.tags = tags;
    this._saveMeta(meta);
  }

  /**
   * 删除内容
   * @param {string} contentId - 内容 ID
   */
  async delete(contentId) {
    const contentFile = path.join(this.dataDir, `${contentId}.txt`);
    
    if (fs.existsSync(contentFile)) {
      fs.unlinkSync(contentFile);
    }

    const meta = this._getMeta();
    meta.clips = meta.clips.filter(c => c.id !== contentId);
    this._saveMeta(meta);

    console.log(`[匣] 删除内容：${contentId}`);
  }

  /**
   * 检查内容是否已存在（通过哈希）
   * @param {string} content - 内容
   * @returns {string|null} 已存在的内容 ID，不存在返回 null
   */
  async checkDuplicate(content) {
    const hash = hashContent(content);
    const meta = this._getMeta();
    const existing = meta.clips.find(c => c.hash === hash);
    return existing ? existing.id : null;
  }

  /**
   * 智能存储（自动去重）
   * @param {object} options - 存储选项
   * @returns {object} {id, isDuplicate}
   */
  async smartStore(options) {
    const { content } = options;
    
    const existingId = await this.checkDuplicate(content);
    
    if (existingId) {
      console.log(`[匣] 发现重复内容，使用已有 ID: ${existingId}`);
      return { id: existingId, isDuplicate: true };
    }

    const newId = await this.store(options);
    return { id: newId, isDuplicate: false };
  }

  /**
   * 获取统计信息
   * @returns {object} 统计数据
   */
  async getStats() {
    const meta = this._getMeta();
    const clips = meta.clips;

    const totalSize = clips.reduce((sum, c) => {
      try {
        const file = path.join(this.dataDir, `${c.id}.txt`);
        if (fs.existsSync(file)) {
          return sum + fs.statSync(file).size;
        }
      } catch (e) {}
      return sum;
    }, 0);

    const byType = {};
    clips.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
    });

    return {
      total: clips.length,
      totalSize: formatBytes(totalSize),
      totalTokens: estimateTokens(clips.reduce((sum, c) => {
        try {
          const file = path.join(this.dataDir, `${c.id}.txt`);
          if (fs.existsSync(file)) {
            return sum + fs.readFileSync(file, 'utf-8');
          }
        } catch (e) {}
        return sum;
      }, '')),
      byType,
      oldest: clips.length ? new Date(Math.min(...clips.map(c => c.created))) : null,
      newest: clips.length ? new Date(Math.max(...clips.map(c => c.created))) : null
    };
  }

  /**
   * 清理未使用的内容
   * @param {number} daysOld - 多少天未访问
   */
  async cleanup(daysOld = 30) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const meta = this._getMeta();
    
    const toDelete = meta.clips.filter(c => c.accessed < cutoff);
    
    for (const clip of toDelete) {
      await this.delete(clip.id);
    }

    console.log(`[匣] 清理了 ${toDelete.length} 个未使用的内容`);
    return toDelete.length;
  }

  /**
   * 存储内容并返回引用格式
   * @param {object} options - 存储选项
   * @returns {object} { id, reference, type }
   */
  async storeWithReference(options) {
    const clipId = await this.store(options);
    const meta = await this.getMeta(clipId);
    
    // 生成引用格式
    const reference = this._generateReference(clipId, meta);
    
    // 记录引用计数
    this._referenceCounter.set(clipId, (this._referenceCounter.get(clipId) || 0) + 1);
    
    return {
      id: clipId,
      reference,
      type: 'clipboard'
    };
  }

  /**
   * 生成引用格式
   * @private
   */
  _generateReference(clipId, meta) {
    const refNum = this._referenceCounter.get(clipId) || 1;
    
    if (meta.type === 'image') {
      return `[Image #${refNum}]`;
    } else if (meta.type === 'code') {
      return `[Code #${refNum}]`;
    } else {
      return `[Pasted text #${refNum}]`;
    }
  }

  /**
   * 展开内容中的引用
   * @param {string} content - 包含引用的内容
   * @param {boolean} lazy - 是否懒加载（只返回引用信息）
   * @returns {Promise<string>} 展开后的内容
   */
  async expandReferences(content, lazy = false) {
    if (!content) return content;
    
    let expanded = content;
    
    // 匹配引用格式：[Pasted text #N], [Image #N], [Code #N]
    const referencePattern = /\[(Pasted text|Image|Code) #(\d+)\]/g;
    const matches = [...content.matchAll(referencePattern)];
    
    // 反向替换（从后往前，避免索引偏移）
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const fullMatch = match[0];
      const type = match[1];
      const refNum = parseInt(match[2], 10);
      
      // 查找对应的 clipId
      const clipId = this._findClipByReference(type, refNum);
      
      if (clipId) {
        if (lazy) {
          // 懒加载模式：只返回引用信息
          const meta = await this.getMeta(clipId);
          const preview = meta.title || `[${type} #${refNum}]`;
          expanded = expanded.replace(
            fullMatch,
            `--- ${preview} (${clipId}) ---\n`
          );
        } else {
          // 完全展开
          const clipContent = await this.lazyLoader.loadClipContent(clipId);
          if (clipContent) {
            expanded = expanded.replace(
              fullMatch,
              `\n--- ${type} #${refNum} 开始 ---\n${clipContent}\n--- ${type} #${refNum} 结束 ---\n`
            );
          }
        }
      }
    }
    
    return expanded;
  }

  /**
   * 根据引用信息查找 clipId
   * @private
   */
  _findClipByReference(type, refNum) {
    const meta = this._getMeta();
    const targetType = type === 'Pasted text' ? 'text' : type.toLowerCase();
    
    // 按创建时间排序
    const sortedClips = meta.clips
      .filter(c => c.type === targetType)
      .sort((a, b) => a.created - b.created);
    
    if (refNum <= sortedClips.length) {
      return sortedClips[refNum - 1].id;
    }
    
    return null;
  }

  /**
   * 批量展开多个引用
   * @param {Array<string>} contents - 内容数组
   * @param {boolean} lazy - 是否懒加载
   * @returns {Promise<Array<string>>} 展开后的内容数组
   */
  async batchExpandReferences(contents, lazy = false) {
    const results = [];
    for (const content of contents) {
      results.push(await this.expandReferences(content, lazy));
    }
    return results;
  }

  /**
   * 压缩内容中的大段文本为引用
   * @param {string} content - 原始内容
   * @param {number} threshold - 阈值（字符数）
   * @returns {Promise<object>} { compressed, references }
   */
  async compressToReferences(content, threshold = 1024) {
    const references = [];
    let compressed = content;
    
    // 策略 1：按段落分割
    let segments = content.split(/\n\n+/);
    
    // 如果没有段落分割，尝试按行分割
    if (segments.length <= 1) {
      segments = content.split(/\n/);
    }
    
    for (const segment of segments) {
      if (segment.length > threshold) {
        const { id, reference } = await this.storeWithReference({
          content: segment,
          type: 'text',
          title: segment.substring(0, 50) + '...'
        });
        
        references.push({ id, original: segment, reference });
        // 使用全局替换，避免多次替换同一内容
        compressed = compressed.split(segment).join(reference);
      }
    }
    
    // 如果还是没有引用，但内容很长，强制压缩
    if (references.length === 0 && content.length > threshold * 2) {
      const midPoint = Math.floor(content.length / 2);
      const part1 = content.substring(0, midPoint);
      const part2 = content.substring(midPoint);
      
      const { id: id1, reference: ref1 } = await this.storeWithReference({
        content: part1,
        type: 'text',
        title: '内容前半部分...'
      });
      const { id: id2, reference: ref2 } = await this.storeWithReference({
        content: part2,
        type: 'text',
        title: '内容后半部分...'
      });
      
      references.push({ id: id1, original: part1, reference: ref1 });
      references.push({ id: id2, original: part2, reference: ref2 });
      compressed = ref1 + '\n\n' + ref2;
    }
    
    return { compressed, references };
  }

  /**
   * 获取引用计数
   * @param {string} clipId - 内容 ID
   * @returns {number} 引用次数
   */
  getReferenceCount(clipId) {
    return this._referenceCounter.get(clipId) || 0;
  }

  /**
   * 重置引用计数器
   */
  resetReferenceCounter() {
    this._referenceCounter.clear();
  }
}

module.exports = { Clipboard };
