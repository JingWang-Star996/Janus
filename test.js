#!/usr/bin/env node

/**
 * 忆匣 (YiXia) 测试脚本
 * 
 * 测试三大核心功能：
 * - 溯 (Su): 会话历史管理
 * - 匣 (Xia): 粘贴内容管理
 * - 窗 (Chuang): 上下文窗口管理
 */

const path = require('path');
const fs = require('fs');
const YiXia = require('./yixia.js');

// 测试配置（使用临时路径）
const TEST_DIR = path.join(__dirname, '.test');
const TEST_HISTORY_PATH = path.join(TEST_DIR, 'history.jsonl');
const TEST_PASTES_DIR = path.join(TEST_DIR, 'pastes');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;

function log(message, color = 'white') {
  console.log(`${colors.cyan}[测试]${colors.reset} ${message}`);
}

function pass(name) {
  console.log(`${colors.green}✓ 通过${colors.reset} ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`${colors.red}✗ 失败${colors.reset} ${name}`);
  if (reason) console.log(`  原因：${reason}`);
  failed++;
}

/**
 * 清理测试环境
 */
function cleanup() {
  if (fs.existsSync(TEST_HISTORY_PATH)) {
    fs.unlinkSync(TEST_HISTORY_PATH);
  }
  if (fs.existsSync(TEST_PASTES_DIR)) {
    fs.rmSync(TEST_PASTES_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(TEST_DIR)) {
    fs.rmdirSync(TEST_DIR);
  }
}

/**
 * 准备测试环境
 */
function setup() {
  // 先清理（确保干净环境）
  cleanup();
  // 创建目录
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * 测试"溯"模块 - 会话历史管理
 */
async function testSu() {
  log('=== 测试"溯"模块 - 会话历史管理 ===\n');
  
  const yixia = require('./yixia.js');
  const su = yixia.su;
  
  // 测试 1: 追加单条记录
  try {
    const result = su.append({
      sessionId: 'test-001',
      role: 'user',
      content: '你好，测试消息',
      timestamp: Date.now()
    }, TEST_HISTORY_PATH);
    
    if (result) pass('追加单条记录');
    else fail('追加单条记录', '返回 false');
  } catch (e) {
    fail('追加单条记录', e.message);
  }
  
  // 测试 2: 批量追加记录
  try {
    const records = [
      { sessionId: 'test-001', role: 'assistant', content: '你好！有什么可以帮你？', timestamp: Date.now() },
      { sessionId: 'test-001', role: 'user', content: '我想了解一下忆匣系统', timestamp: Date.now() },
      { sessionId: 'test-002', role: 'user', content: '另一个会话的消息', timestamp: Date.now() }
    ];
    
    const count = su.batchAppend(records, TEST_HISTORY_PATH);
    if (count === 3) pass('批量追加记录');
    else fail('批量追加记录', `期望 3 条，实际 ${count} 条`);
  } catch (e) {
    fail('批量追加记录', e.message);
  }
  
  // 测试 3: 按会话 ID 检索
  try {
    const records = await su.getBySessionId('test-001', TEST_HISTORY_PATH);
    if (records.length === 3) pass('按会话 ID 检索');
    else fail('按会话 ID 检索', `期望 3 条，实际 ${records.length} 条`);
  } catch (e) {
    fail('按会话 ID 检索', e.message);
  }
  
  // 测试 4: 关键词搜索
  try {
    const results = await su.search('忆匣', TEST_HISTORY_PATH);
    if (results.length >= 1) pass('关键词搜索');
    else fail('关键词搜索', '未找到匹配结果');
  } catch (e) {
    fail('关键词搜索', e.message);
  }
  
  // 测试 5: 获取统计信息
  try {
    const stats = await su.getStats(TEST_HISTORY_PATH);
    if (stats.totalRecords >= 4 && stats.sessionCount >= 2) {
      pass('获取统计信息');
    } else {
      fail('获取统计信息', `记录数：${stats.totalRecords}, 会话数：${stats.sessionCount}`);
    }
  } catch (e) {
    fail('获取统计信息', e.message);
  }
  
  // 测试 6: 列出所有会话
  try {
    const sessions = await su.listSessions(TEST_HISTORY_PATH);
    if (sessions.length >= 2) pass('列出所有会话');
    else fail('列出所有会话', `期望>=2 个，实际 ${sessions.length} 个`);
  } catch (e) {
    fail('列出所有会话', e.message);
  }
  
  // 测试 7: 删除会话
  try {
    const deleted = await su.deleteSession('test-002', TEST_HISTORY_PATH);
    if (deleted >= 1) pass('删除会话');
    else fail('删除会话', '未删除任何记录');
  } catch (e) {
    fail('删除会话', e.message);
  }
  
  // 测试 8: 导出会话
  try {
    const exportPath = path.join(TEST_DIR, 'export.json');
    const success = await su.exportSession('test-001', exportPath, 'json', TEST_HISTORY_PATH);
    if (success && fs.existsSync(exportPath)) {
      pass('导出会话');
      fs.unlinkSync(exportPath);
    } else {
      fail('导出会话', '导出失败');
    }
  } catch (e) {
    fail('导出会话', e.message);
  }
  
  console.log('');
}

/**
 * 测试"匣"模块 - 粘贴内容管理
 */
async function testXia() {
  log('=== 测试"匣"模块 - 粘贴内容管理 ===\n');
  
  const yixiaModule = require('./yixia.js');
  const xia = yixiaModule.xia;
  const YiXia = yixiaModule.YiXia;
  const yixia = new YiXia({ pastesDir: TEST_PASTES_DIR });
  
  // 测试 1: 小内容内联存储
  try {
    const shortContent = '这是一段短内容';
    const ref = yixia.store(shortContent);
    if (ref.type === 'inline' && ref.value === shortContent) {
      pass('小内容内联存储');
    } else {
      fail('小内容内联存储', `类型：${ref.type}`);
    }
  } catch (e) {
    fail('小内容内联存储', e.message);
  }
  
  // 测试 2: 大内容外部存储
  try {
    const longContent = 'x'.repeat(1100); // 确保超过 1024 字符
    const ref = yixia.store(longContent);
    if (ref.type === 'hash' && ref.hash) {
      pass('大内容外部存储');
    } else {
      fail('大内容外部存储', `类型：${ref.type}, 长度：${longContent.length}`);
    }
  } catch (e) {
    fail('大内容外部存储', e.message);
  }
  
  // 测试 3: 内容检索
  try {
    const content = '测试检索内容';
    const ref = yixia.store(content);
    const retrieved = yixia.retrieve(ref);
    if (retrieved === content) {
      pass('内容检索');
    } else {
      fail('内容检索', '检索内容不匹配');
    }
  } catch (e) {
    fail('内容检索', e.message);
  }
  
  // 测试 4: 内容复用（相同 hash）
  try {
    const content = '重复内容测试';
    const ref1 = yixia.store(content);
    const ref2 = yixia.store(content);
    if (ref1.hash === ref2.hash && ref2.reused !== false) {
      pass('内容复用');
    } else {
      fail('内容复用', 'hash 不一致或未复用');
    }
  } catch (e) {
    fail('内容复用', e.message);
  }
  
  // 测试 5: MD5 hash 计算
  try {
    const { md5 } = xia;
    const hash1 = md5('test');
    const hash2 = md5('test');
    const hash3 = md5('different');
    if (hash1 === hash2 && hash1 !== hash3) {
      pass('MD5 hash 计算');
    } else {
      fail('MD5 hash 计算', 'hash 不一致');
    }
  } catch (e) {
    fail('MD5 hash 计算', e.message);
  }
  
  // 测试 6: 批量存储
  try {
    const contents = ['内容 1', '内容 2', '内容 3'];
    const refs = yixia.batchStore(contents);
    if (refs.length === 3) {
      pass('批量存储');
    } else {
      fail('批量存储', `期望 3 个，实际 ${refs.length} 个`);
    }
  } catch (e) {
    fail('批量存储', e.message);
  }
  
  // 测试 7: 批量检索
  try {
    const contents = ['检索 1', '检索 2'];
    const refs = yixia.batchStore(contents);
    const retrieved = yixia.batchRetrieve(refs);
    if (retrieved[0] === contents[0] && retrieved[1] === contents[1]) {
      pass('批量检索');
    } else {
      fail('批量检索', '检索内容不匹配');
    }
  } catch (e) {
    fail('批量检索', e.message);
  }
  
  // 测试 8: 获取存储统计
  try {
    const stats = yixia.getPastesStats();
    if (stats.fileCount >= 0 && stats.totalSizeBytes >= 0) {
      pass('获取存储统计');
    } else {
      fail('获取存储统计', '统计信息异常');
    }
  } catch (e) {
    fail('获取存储统计', e.message);
  }
  
  // 测试 9: 传输格式转换
  try {
    const shortContent = '短内容';
    const longContent = '长内容'.repeat(200);
    
    const shortRef = yixia.toTransport(shortContent);
    const longRef = yixia.toTransport(longContent);
    
    const shortBack = yixia.fromTransport(shortRef);
    const longBack = yixia.fromTransport(longRef);
    
    if (shortBack === shortContent && longBack === longContent) {
      pass('传输格式转换');
    } else {
      fail('传输格式转换', '内容恢复失败');
    }
  } catch (e) {
    fail('传输格式转换', e.message);
  }
  
  console.log('');
}

/**
 * 测试"窗"模块 - 上下文窗口管理
 */
async function testChuang() {
  log('=== 测试"窗"模块 - 上下文窗口管理 ===\n');
  
  const yixiaModule = require('./yixia.js');
  const chuang = yixiaModule.chuang;
  const YiXia = yixiaModule.YiXia;
  const yixia = new YiXia();
  
  // 测试 1: Token 估算
  try {
    const text = '这是一段测试文本，共 20 个字符左右';
    const tokens = chuang.estimateTokens(text);
    if (tokens > 0) {
      pass('Token 估算');
    } else {
      fail('Token 估算', '估算结果为 0');
    }
  } catch (e) {
    fail('Token 估算', e.message);
  }
  
  // 测试 2: 文本截断
  try {
    const longText = '这是一条很长的消息。'.repeat(100);
    const result = chuang.truncateText(longText, 50);
    if (result.truncated && result.text.length < longText.length) {
      pass('文本截断');
    } else {
      fail('文本截断', '截断失败');
    }
  } catch (e) {
    fail('文本截断', e.message);
  }
  
  // 测试 3: 消息列表截断
  try {
    const messages = Array(100).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `消息 ${i}`,
      timestamp: i
    }));
    
    const result = yixia.truncateMessages(messages, { maxMessages: 50 });
    if (result.messages.length <= 50) {
      pass('消息列表截断');
    } else {
      fail('消息列表截断', `期望<=50 条，实际 ${result.messages.length} 条`);
    }
  } catch (e) {
    fail('消息列表截断', e.message);
  }
  
  // 测试 4: 优先级标记
  try {
    const msg = { role: 'user', content: '重要消息' };
    const marked = chuang.markPriority(msg, 2);
    if (marked.priority === 2 && marked.content === msg.content) {
      pass('优先级标记');
    } else {
      fail('优先级标记', '标记失败');
    }
  } catch (e) {
    fail('优先级标记', e.message);
  }
  
  // 测试 5: 重要消息保护
  try {
    const messages = [
      { role: 'user', content: '普通消息 1', timestamp: 1 },
      { role: 'user', content: '重要消息', priority: 2, timestamp: 2 },
      { role: 'user', content: '普通消息 2', timestamp: 3 }
    ];
    
    const result = yixia.truncateMessages(messages, { maxMessages: 2 });
    const hasImportant = result.messages.some(m => m.priority === 2);
    if (hasImportant) {
      pass('重要消息保护');
    } else {
      fail('重要消息保护', '重要消息被删除');
    }
  } catch (e) {
    fail('重要消息保护', e.message);
  }
  
  // 测试 6: Token 使用统计
  try {
    const messages = [
      { role: 'user', content: '消息 1' },
      { role: 'assistant', content: '消息 2' }
    ];
    const usage = chuang.getTokenUsage(messages);
    if (usage.totalTokens > 0 && usage.messageCount === 2) {
      pass('Token 使用统计');
    } else {
      fail('Token 使用统计', '统计信息异常');
    }
  } catch (e) {
    fail('Token 使用统计', e.message);
  }
  
  // 测试 7: 智能压缩
  try {
    const messages = Array(60).fill(null).map((_, i) => ({
      role: 'user',
      content: `消息 ${i}`,
      timestamp: i
    }));
    
    const result = yixia.compressContext(messages, { maxMessages: 50 });
    if (result.compressed && result.messages.length <= 50) {
      pass('智能压缩');
    } else {
      fail('智能压缩', '压缩失败');
    }
  } catch (e) {
    fail('智能压缩', e.message);
  }
  
  // 测试 8: 滑动窗口
  try {
    const messages = Array(100).fill(null).map((_, i) => ({
      role: 'user',
      content: `消息 ${i}`,
      timestamp: i
    }));
    
    const windowed = chuang.slidingWindow(messages, 20);
    if (windowed.length === 20) {
      pass('滑动窗口');
    } else {
      fail('滑动窗口', `期望 20 条，实际 ${windowed.length} 条`);
    }
  } catch (e) {
    fail('滑动窗口', e.message);
  }
  
  // 测试 9: 限制检查
  try {
    const messages = Array(10).fill(null).map((_, i) => ({
      role: 'user',
      content: '长消息'.repeat(100),
      timestamp: i
    }));
    
    const check = yixia.checkLimit(messages, { maxTokens: 500, maxMessages: 5 });
    if (check.exceeds && check.suggestions.length > 0) {
      pass('限制检查');
    } else {
      fail('限制检查', '检查结果异常');
    }
  } catch (e) {
    fail('限制检查', e.message);
  }
  
  // 测试 10: 配置更新
  try {
    const oldConfig = chuang.getConfig();
    const newConfig = chuang.updateConfig({ maxTokens: 10000 });
    if (newConfig.maxTokens === 10000) {
      pass('配置更新');
      chuang.updateConfig(oldConfig); // 恢复默认
    } else {
      fail('配置更新', '配置未更新');
    }
  } catch (e) {
    fail('配置更新', e.message);
  }
  
  console.log('');
}

/**
 * 测试高层 API - 组合功能
 */
async function testHighLevelAPI() {
  log('=== 测试高层 API - 组合功能 ===\n');
  
  const { YiXia } = require('./yixia.js');
  const yixia = new YiXia({
    historyPath: TEST_HISTORY_PATH,
    pastesDir: TEST_PASTES_DIR
  });
  
  // 测试 1: 完整记录对话
  try {
    const messages = [
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好！有什么可以帮你？' },
      { role: 'user', content: '长内容'.repeat(200) }
    ];
    
    const result = await yixia.recordConversation('test-high-level', messages);
    if (result.recorded === 3) {
      pass('完整记录对话');
    } else {
      fail('完整记录对话', `期望 3 条，实际 ${result.recorded} 条`);
    }
  } catch (e) {
    fail('完整记录对话', e.message);
  }
  
  // 测试 2: 恢复会话
  try {
    const restored = await yixia.restoreSession('test-high-level');
    if (restored.length >= 1) {
      pass('恢复会话');
    } else {
      fail('恢复会话', '恢复失败');
    }
  } catch (e) {
    fail('恢复会话', e.message);
  }
  
  // 测试 3: 获取系统状态
  try {
    const status = await yixia.getStatus();
    if (status.version && status.history && status.pastes && status.window) {
      pass('获取系统状态');
    } else {
      fail('获取系统状态', '状态信息不完整');
    }
  } catch (e) {
    fail('获取系统状态', e.message);
  }
  
  console.log('');
}

/**
 * 主测试流程
 */
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           忆匣 (YiXia) 自动化测试                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  setup();
  
  try {
    await testSu();
    await testXia();
    await testChuang();
    await testHighLevelAPI();
    
    // 总结
    const total = passed + failed;
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`测试结果：${passed}/${total} 通过`);
    
    if (failed > 0) {
      console.log(`${colors.red}失败：${failed}${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}全部通过！${colors.reset}`);
    }
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } finally {
    cleanup();
  }
}

// 执行测试
main();
