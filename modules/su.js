/**
 * 溯 (Su) - 会话历史记录管理
 * 
 * 功能：
 * - JSONL 格式存储会话历史
 * - 追加/批量追加记录
 * - 按会话 ID 检索
 * - 时间范围过滤
 * - 关键词搜索
 * - 删除会话/清空
 * - 统计信息
 * - 导出会话
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 默认存储路径
const DEFAULT_HISTORY_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'history.jsonl');

/**
 * 确保存储目录存在
 */
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 追加单条历史记录
 * @param {Object} record - 记录对象 { sessionId, timestamp, role, content, metadata? }
 * @param {string} filePath - 存储路径
 * @returns {boolean} 是否成功
 */
function append(record, filePath = DEFAULT_HISTORY_PATH) {
  try {
    ensureDir(filePath);
    const line = JSON.stringify(record) + '\n';
    fs.appendFileSync(filePath, line, 'utf8');
    return true;
  } catch (error) {
    console.error('[溯] 追加记录失败:', error.message);
    return false;
  }
}

/**
 * 批量追加历史记录
 * @param {Array<Object>} records - 记录数组
 * @param {string} filePath - 存储路径
 * @returns {number} 成功追加的数量
 */
function batchAppend(records, filePath = DEFAULT_HISTORY_PATH) {
  let success = 0;
  try {
    ensureDir(filePath);
    const lines = records.map(r => JSON.stringify(r) + '\n').join('');
    fs.appendFileSync(filePath, lines, 'utf8');
    success = records.length;
  } catch (error) {
    console.error('[溯] 批量追加失败:', error.message);
  }
  return success;
}

/**
 * 按会话 ID 检索记录
 * @param {string} sessionId - 会话 ID
 * @param {string} filePath - 存储路径
 * @returns {Promise<Array<Object>>} 记录数组
 */
async function getBySessionId(sessionId, filePath = DEFAULT_HISTORY_PATH) {
  const records = [];
  if (!fs.existsSync(filePath)) return records;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record.sessionId === sessionId) {
        records.push(record);
      }
    } catch (e) {
      // 跳过无效行
    }
  }

  return records;
}

/**
 * 按时间范围过滤记录
 * @param {number} startTime - 开始时间戳 (ms)
 * @param {number} endTime - 结束时间戳 (ms)
 * @param {string} filePath - 存储路径
 * @returns {Promise<Array<Object>>} 记录数组
 */
async function getByTimeRange(startTime, endTime, filePath = DEFAULT_HISTORY_PATH) {
  const records = [];
  if (!fs.existsSync(filePath)) return records;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record.timestamp >= startTime && record.timestamp <= endTime) {
        records.push(record);
      }
    } catch (e) {
      // 跳过无效行
    }
  }

  return records;
}

/**
 * 关键词搜索
 * @param {string} keyword - 搜索关键词
 * @param {string} filePath - 存储路径
 * @param {Object} options - 选项 { sessionId?, limit? }
 * @returns {Promise<Array<Object>>} 匹配的记录数组
 */
async function search(keyword, filePath = DEFAULT_HISTORY_PATH, options = {}) {
  const results = [];
  if (!fs.existsSync(filePath)) return results;

  const { sessionId = null, limit = 100 } = options;
  const regex = new RegExp(keyword, 'gi');
  let count = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (count >= limit) break;
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (sessionId && record.sessionId !== sessionId) continue;
      
      const content = record.content || '';
      if (regex.test(content)) {
        results.push(record);
        count++;
      }
    } catch (e) {
      // 跳过无效行
    }
  }

  return results;
}

/**
 * 删除指定会话的所有记录
 * @param {string} sessionId - 会话 ID
 * @param {string} filePath - 存储路径
 * @returns {Promise<number>} 删除的记录数
 */
async function deleteSession(sessionId, filePath = DEFAULT_HISTORY_PATH) {
  if (!fs.existsSync(filePath)) return 0;

  const retained = [];
  let deleted = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record.sessionId === sessionId) {
        deleted++;
      } else {
        retained.push(line);
      }
    } catch (e) {
      retained.push(line); // 保留无效行
    }
  }

  // 重写文件
  fs.writeFileSync(filePath, retained.join('\n') + (retained.length ? '\n' : ''), 'utf8');
  return deleted;
}

/**
 * 清空所有历史记录
 * @param {string} filePath - 存储路径
 * @returns {Promise<number>} 清空的记录数
 */
async function clear(filePath = DEFAULT_HISTORY_PATH) {
  if (!fs.existsSync(filePath)) return 0;

  let count = 0;
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) count++;
  }

  fs.writeFileSync(filePath, '', 'utf8');
  return count;
}

/**
 * 获取统计信息
 * @param {string} filePath - 存储路径
 * @returns {Promise<Object>} 统计信息 { totalRecords, sessions, dateRange, sizeBytes }
 */
async function getStats(filePath = DEFAULT_HISTORY_PATH) {
  const stats = {
    totalRecords: 0,
    sessions: new Set(),
    minTimestamp: Infinity,
    maxTimestamp: 0,
    sizeBytes: 0
  };

  if (!fs.existsSync(filePath)) {
    stats.minTimestamp = null;
    stats.maxTimestamp = null;
    return stats;
  }

  stats.sizeBytes = fs.statSync(filePath).size;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      stats.totalRecords++;
      if (record.sessionId) stats.sessions.add(record.sessionId);
      if (record.timestamp) {
        stats.minTimestamp = Math.min(stats.minTimestamp, record.timestamp);
        stats.maxTimestamp = Math.max(stats.maxTimestamp, record.timestamp);
      }
    } catch (e) {
      // 跳过无效行
    }
  }

  return {
    totalRecords: stats.totalRecords,
    sessionCount: stats.sessions.size,
    dateRange: {
      start: stats.minTimestamp === Infinity ? null : stats.minTimestamp,
      end: stats.maxTimestamp === 0 ? null : stats.maxTimestamp
    },
    sizeBytes: stats.sizeBytes
  };
}

/**
 * 导出会话到文件
 * @param {string} sessionId - 会话 ID
 * @param {string} outputPath - 输出路径
 * @param {string} format - 导出格式 'jsonl' | 'json' | 'txt'
 * @param {string} filePath - 源文件路径
 * @returns {Promise<boolean>} 是否成功
 */
async function exportSession(sessionId, outputPath, format = 'jsonl', filePath = DEFAULT_HISTORY_PATH) {
  const records = await getBySessionId(sessionId, filePath);
  if (!records.length) return false;

  try {
    ensureDir(outputPath);
    let content;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(records, null, 2);
        break;
      case 'txt':
        content = records.map(r => `[${new Date(r.timestamp).toISOString()}] ${r.role}: ${r.content}`).join('\n');
        break;
      case 'jsonl':
      default:
        content = records.map(r => JSON.stringify(r)).join('\n');
    }

    fs.writeFileSync(outputPath, content + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error('[溯] 导出失败:', error.message);
    return false;
  }
}

/**
 * 获取所有会话 ID 列表
 * @param {string} filePath - 存储路径
 * @returns {Promise<Array<string>>} 会话 ID 数组
 */
async function listSessions(filePath = DEFAULT_HISTORY_PATH) {
  const sessions = new Set();
  if (!fs.existsSync(filePath)) return [];

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record.sessionId) sessions.add(record.sessionId);
    } catch (e) {
      // 跳过无效行
    }
  }

  return Array.from(sessions);
}

module.exports = {
  append,
  batchAppend,
  getBySessionId,
  getByTimeRange,
  search,
  deleteSession,
  clear,
  getStats,
  exportSession,
  listSessions,
  DEFAULT_HISTORY_PATH
};
