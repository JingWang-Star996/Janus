/**
 * 匣 (Xia) - 粘贴内容管理
 * 
 * 功能：
 * - 小内容内联（<1024 字符）
 * - 大内容外部存储（~/.openclaw/pastes/）
 * - Hash 引用（md5）
 * - 支持内容复用
 * - 减少 Token 消耗
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置
const INLINE_THRESHOLD = 1024; // 内联阈值（字符）
const DEFAULT_PASTES_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'pastes');

/**
 * 计算内容的 MD5 hash
 * @param {string} content - 内容
 * @returns {string} MD5 hash
 */
function md5(content) {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/**
 * 确保存储目录存在
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 存储内容（自动选择内联或外部存储）
 * @param {string} content - 要存储的内容
 * @param {string} pastesDir - 存储目录
 * @returns {Object} 引用对象 { type: 'inline' | 'hash', value: string }
 */
function store(content, pastesDir = DEFAULT_PASTES_DIR) {
  const hash = md5(content);
  
  if (content.length < INLINE_THRESHOLD) {
    // 小内容直接内联
    return {
      type: 'inline',
      value: content,
      hash: hash,
      length: content.length
    };
  } else {
    // 大内容外部存储
    ensureDir(pastesDir);
    const filePath = path.join(pastesDir, hash);
    
    // 检查是否已存在（内容复用）
    if (fs.existsSync(filePath)) {
      return {
        type: 'hash',
        value: hash,
        hash: hash,
        length: content.length,
        reused: true
      };
    }
    
    // 新内容，写入文件
    fs.writeFileSync(filePath, content, 'utf8');
    return {
      type: 'hash',
      value: hash,
      hash: hash,
      length: content.length,
      reused: false
    };
  }
}

/**
 * 根据引用获取内容
 * @param {Object} ref - 引用对象 { type, value }
 * @param {string} pastesDir - 存储目录
 * @returns {string|null} 内容，失败返回 null
 */
function retrieve(ref, pastesDir = DEFAULT_PASTES_DIR) {
  if (!ref || !ref.type || !ref.value) return null;
  
  if (ref.type === 'inline') {
    return ref.value;
  } else if (ref.type === 'hash') {
    const filePath = path.join(pastesDir, ref.value);
    if (!fs.existsSync(filePath)) {
      console.error('[匣] 内容不存在:', ref.value);
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  }
  
  return null;
}

/**
 * 批量存储内容
 * @param {Array<string>} contents - 内容数组
 * @param {string} pastesDir - 存储目录
 * @returns {Array<Object>} 引用数组
 */
function batchStore(contents, pastesDir = DEFAULT_PASTES_DIR) {
  return contents.map(content => store(content, pastesDir));
}

/**
 * 批量获取内容
 * @param {Array<Object>} refs - 引用数组
 * @param {string} pastesDir - 存储目录
 * @returns {Array<string|null>} 内容数组
 */
function batchRetrieve(refs, pastesDir = DEFAULT_PASTES_DIR) {
  return refs.map(ref => retrieve(ref, pastesDir));
}

/**
 * 删除指定 hash 的内容
 * @param {string} hash - MD5 hash
 * @param {string} pastesDir - 存储目录
 * @returns {boolean} 是否成功删除
 */
function deleteByHash(hash, pastesDir = DEFAULT_PASTES_DIR) {
  const filePath = path.join(pastesDir, hash);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * 检查内容是否存在（通过 hash）
 * @param {string} hash - MD5 hash
 * @param {string} pastesDir - 存储目录
 * @returns {boolean} 是否存在
 */
function exists(hash, pastesDir = DEFAULT_PASTES_DIR) {
  const filePath = path.join(pastesDir, hash);
  return fs.existsSync(filePath);
}

/**
 * 获取存储统计信息
 * @param {string} pastesDir - 存储目录
 * @returns {Object} 统计信息 { fileCount, totalSizeBytes, hashes: [] }
 */
function getStats(pastesDir = DEFAULT_PASTES_DIR) {
  const stats = {
    fileCount: 0,
    totalSizeBytes: 0,
    hashes: []
  };
  
  if (!fs.existsSync(pastesDir)) return stats;
  
  const files = fs.readdirSync(pastesDir);
  for (const file of files) {
    const filePath = path.join(pastesDir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        stats.fileCount++;
        stats.totalSizeBytes += stat.size;
        stats.hashes.push(file);
      }
    } catch (e) {
      // 跳过无法访问的文件
    }
  }
  
  return stats;
}

/**
 * 清理未使用的粘贴内容
 * @param {Array<string>} usedHashes - 正在使用的 hash 列表
 * @param {string} pastesDir - 存储目录
 * @returns {Object} 清理结果 { deleted: number, freedBytes: number }
 */
function cleanup(usedHashes, pastesDir = DEFAULT_PASTES_DIR) {
  const result = { deleted: 0, freedBytes: 0 };
  
  if (!fs.existsSync(pastesDir)) return result;
  
  const usedSet = new Set(usedHashes);
  const files = fs.readdirSync(pastesDir);
  
  for (const file of files) {
    if (!usedSet.has(file)) {
      const filePath = path.join(pastesDir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          fs.unlinkSync(filePath);
          result.deleted++;
          result.freedBytes += stat.size;
        }
      } catch (e) {
        // 跳过无法删除的文件
      }
    }
  }
  
  return result;
}

/**
 * 将内容转换为适合传输的格式（大内容用 hash 引用）
 * @param {string} content - 原始内容
 * @param {string} pastesDir - 存储目录
 * @returns {Object} 可传输对象 { content?, hash?, length }
 */
function toTransportFormat(content, pastesDir = DEFAULT_PASTES_DIR) {
  const hash = md5(content);
  
  if (content.length < INLINE_THRESHOLD) {
    return {
      content: content,
      length: content.length
    };
  } else {
    // 存储并返回 hash 引用
    store(content, pastesDir);
    return {
      hash: hash,
      length: content.length
    };
  }
}

/**
 * 从传输格式恢复内容
 * @param {Object} obj - 传输对象 { content?, hash?, length }
 * @param {string} pastesDir - 存储目录
 * @returns {string|null} 恢复的内容
 */
function fromTransportFormat(obj, pastesDir = DEFAULT_PASTES_DIR) {
  if (!obj) return null;
  
  if (obj.content !== undefined) {
    return obj.content;
  } else if (obj.hash) {
    return retrieve({ type: 'hash', value: obj.hash }, pastesDir);
  }
  
  return null;
}

/**
 * 获取内容大小（不实际读取内容）
 * @param {Object} ref - 引用对象
 * @param {string} pastesDir - 存储目录
 * @returns {number} 内容长度
 */
function getLength(ref, pastesDir = DEFAULT_PASTES_DIR) {
  if (!ref) return 0;
  
  if (ref.length !== undefined) {
    return ref.length;
  }
  
  if (ref.type === 'inline') {
    return ref.value ? ref.value.length : 0;
  } else if (ref.type === 'hash') {
    const filePath = path.join(pastesDir, ref.value);
    if (fs.existsSync(filePath)) {
      return fs.statSync(filePath).size;
    }
  }
  
  return 0;
}

module.exports = {
  store,
  retrieve,
  batchStore,
  batchRetrieve,
  deleteByHash,
  exists,
  getStats,
  cleanup,
  toTransportFormat,
  fromTransportFormat,
  getLength,
  md5,
  INLINE_THRESHOLD,
  DEFAULT_PASTES_DIR
};
