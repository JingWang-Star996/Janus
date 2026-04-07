/**
 * 忆匣工具函数
 * 提供通用的辅助功能
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 生成唯一 ID
 * @param {string} prefix - ID 前缀
 * @returns {string} 唯一 ID
 */
function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * 计算内容哈希（用于去重）
 * @param {string} content - 内容
 * @returns {string} SHA256 哈希
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 读取 JSON 文件
 * @param {string} filePath - 文件路径
 * @returns {object|null} JSON 对象
 */
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`读取 JSON 失败：${filePath}`, e);
    return null;
  }
}

/**
 * 写入 JSON 文件
 * @param {string} filePath - 文件路径
 * @param {object} data - JSON 数据
 */
function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 追加到 JSONL 文件
 * @param {string} filePath - 文件路径
 * @param {object} line - JSON 对象
 */
function appendJsonl(filePath, line) {
  ensureDir(path.dirname(filePath));
  const lineStr = JSON.stringify(line) + '\n';
  fs.appendFileSync(filePath, lineStr, 'utf-8');
}

/**
 * 从 JSONL 文件读取所有行
 * @param {string} filePath - 文件路径
 * @returns {array} JSON 对象数组
 */
function readJsonl(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (e) {
    console.error(`读取 JSONL 失败：${filePath}`, e);
    return [];
  }
}

/**
 * 格式化字节数
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 估算文本的 token 数（粗略）
 * @param {string} text - 文本内容
 * @returns {number} 估算的 token 数
 */
function estimateTokens(text) {
  if (!text) return 0;
  // 中文：约 1.5 字符/token，英文：约 4 字符/token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

module.exports = {
  generateId,
  hashContent,
  ensureDir,
  readJson,
  writeJson,
  appendJsonl,
  readJsonl,
  formatBytes,
  estimateTokens
};
