#!/usr/bin/env node

/**
 * 忆匣 (YiXia) CLI 工具
 * 
 * 命令行接口，用于管理第二记忆系统
 * 
 * 用法:
 *   node yixia-cli.js <command> [options]
 * 
 * 命令:
 *   record     - 追加记录
 *   search     - 搜索历史
 *   session    - 管理会话
 *   paste      - 管理粘贴内容
 *   window     - 窗口管理
 *   stats      - 统计信息
 *   export     - 导出会话
 *   cleanup    - 清理未使用内容
 */

const path = require('path');
const fs = require('fs');
const { YiXia } = require('./yixia.js');

// 创建默认实例
const yixia = new YiXia();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}错误：${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════╗
║          忆匣 (YiXia) - 第二记忆系统 CLI              ║
║                                                      ║
║   Slogan: "记忆太多？装匣子！"                        ║
╚══════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}用法:${colors.reset}
  node yixia-cli.js <command> [options]

${colors.yellow}命令:${colors.reset}
  ${colors.green}record${colors.reset}     追加记录到历史
    --session <id>    会话 ID (必填)
    --role <role>     角色 (user/assistant/system)
    --content <text>  内容
    --file <path>     从文件读取内容

  ${colors.green}search${colors.reset}     搜索历史记录
    --keyword <text>  搜索关键词 (必填)
    --session <id>    限定会话
    --limit <num>     结果数量 (默认 100)

  ${colors.green}session${colors.reset}    会话管理
    list              列出所有会话
    get <id>          获取会话详情
    delete <id>       删除会话
    clear             清空所有历史

  ${colors.green}paste${colors.reset}      粘贴内容管理
    store <text>      存储内容
    get <hash>        获取内容
    stats             存储统计
    cleanup           清理未使用

  ${colors.green}window${colors.reset}     窗口管理
    check             检查当前配置
    set <key> <val>   更新配置
    test              测试截断功能

  ${colors.green}stats${colors.reset}      系统统计信息

  ${colors.green}export${colors.reset}     导出会话
    --session <id>    会话 ID (必填)
    --output <path>   输出路径
    --format <fmt>    格式 (jsonl/json/txt)

  ${colors.green}help${colors.reset}       显示帮助

${colors.yellow}示例:${colors.reset}
  # 追加记录
  node yixia-cli.js record --session abc123 --role user --content "你好"
  
  # 搜索历史
  node yixia-cli.js search --keyword "设计"
  
  # 列出会话
  node yixia-cli.js session list
  
  # 存储大内容
  node yixia-cli.js paste store "这是一段很长的内容..."
  
  # 查看统计
  node yixia-cli.js stats
  
  # 导出会话
  node yixia-cli.js export --session abc123 --output ./backup.json --format json
`);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const result = { command: null, options: {}, positional: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result.options[key] = value;
        i++;
      } else {
        result.options[key] = true;
      }
    } else if (!result.command) {
      result.command = arg;
    } else {
      result.positional.push(arg);
    }
  }
  
  return result;
}

/**
 * 处理 record 命令
 */
async function cmdRecord(options) {
  const { session, role, content, file } = options;
  
  if (!session) {
    error('缺少参数：--session <id>');
    return;
  }
  
  let text = content;
  if (file) {
    if (!fs.existsSync(file)) {
      error(`文件不存在：${file}`);
      return;
    }
    text = fs.readFileSync(file, 'utf8');
  }
  
  if (!text) {
    error('缺少内容：--content <text> 或 --file <path>');
    return;
  }
  
  const result = yixia.record({
    sessionId: session,
    role: role || 'user',
    content: text
  });
  
  if (result) {
    success(`记录已追加到会话：${session}`);
  } else {
    error('记录失败');
  }
}

/**
 * 处理 search 命令
 */
async function cmdSearch(options) {
  const { keyword, session, limit } = options;
  
  if (!keyword) {
    error('缺少参数：--keyword <text>');
    return;
  }
  
  const results = await yixia.search(keyword, session || null, parseInt(limit) || 100);
  
  if (results.length === 0) {
    log('未找到匹配结果', 'yellow');
    return;
  }
  
  log(`找到 ${results.length} 条匹配记录:\n`, 'cyan');
  
  for (const r of results) {
    const date = new Date(r.timestamp).toLocaleString('zh-CN');
    console.log(`[${date}] ${r.role}:`);
    console.log(`  ${r.content.slice(0, 200)}${r.content.length > 200 ? '...' : ''}`);
    console.log(`  会话：${r.sessionId}\n`);
  }
}

/**
 * 处理 session 命令
 */
async function cmdSession(command, options) {
  switch (command) {
    case 'list': {
      const sessions = await yixia.listSessions();
      if (sessions.length === 0) {
        log('暂无会话记录', 'yellow');
      } else {
        log(`共 ${sessions.length} 个会话:`, 'cyan');
        sessions.forEach(s => console.log(`  - ${s}`));
      }
      break;
    }
    
    case 'get': {
      const sessionId = options.positional?.[0];
      if (!sessionId) {
        error('缺少会话 ID');
        return;
      }
      
      const records = await yixia.getSession(sessionId);
      if (records.length === 0) {
        log('会话为空或不存在', 'yellow');
      } else {
        log(`会话 ${sessionId} 共 ${records.length} 条记录:`, 'cyan');
        for (const r of records) {
          const date = new Date(r.timestamp).toLocaleString('zh-CN');
          console.log(`[${date}] ${r.role}: ${r.content.slice(0, 100)}...`);
        }
      }
      break;
    }
    
    case 'delete': {
      const sessionId = options.positional?.[0];
      if (!sessionId) {
        error('缺少会话 ID');
        return;
      }
      
      const count = await yixia.deleteSession(sessionId);
      success(`已删除 ${count} 条记录`);
      break;
    }
    
    case 'clear': {
      const count = await yixia.clearHistory();
      success(`已清空 ${count} 条记录`);
      break;
    }
    
    default:
      error(`未知命令：session ${command}`);
  }
}

/**
 * 处理 paste 命令
 */
async function cmdPaste(command, options) {
  switch (command) {
    case 'store': {
      const content = options.positional?.[0];
      if (!content) {
        error('缺少内容');
        return;
      }
      
      const ref = yixia.store(content);
      log(`存储成功:`, 'cyan');
      log(`  类型：${ref.type}`);
      log(`  Hash: ${ref.hash}`);
      log(`  长度：${ref.length} 字符`);
      if (ref.reused) {
        log(`  状态：复用已有内容`, 'yellow');
      }
      break;
    }
    
    case 'get': {
      const hash = options.positional?.[0];
      if (!hash) {
        error('缺少 hash');
        return;
      }
      
      const content = yixia.retrieve({ type: 'hash', value: hash });
      if (content === null) {
        error('内容不存在');
      } else {
        log(`内容 (${content.length} 字符):`, 'cyan');
        console.log(content);
      }
      break;
    }
    
    case 'stats': {
      const stats = yixia.getPastesStats();
      log('粘贴存储统计:', 'cyan');
      log(`  文件数：${stats.fileCount}`);
      log(`  总大小：${(stats.totalSizeBytes / 1024).toFixed(2)} KB`);
      break;
    }
    
    case 'cleanup': {
      // 获取所有历史中的 hash
      const allSessions = await yixia.listSessions();
      const usedHashes = new Set();
      
      for (const sessionId of allSessions) {
        const records = await yixia.getSession(sessionId);
        for (const r of records) {
          if (r.contentRef && r.contentRef.hash) {
            usedHashes.add(r.contentRef.hash);
          }
        }
      }
      
      const result = yixia.cleanupPastes(Array.from(usedHashes));
      log('清理完成:', 'cyan');
      log(`  删除文件：${result.deleted}`);
      log(`  释放空间：${(result.freedBytes / 1024).toFixed(2)} KB`);
      break;
    }
    
    default:
      error(`未知命令：paste ${command}`);
  }
}

/**
 * 处理 window 命令
 */
async function cmdWindow(command, options) {
  switch (command) {
    case 'check': {
      const config = yixia.getConfig();
      log('窗口配置:', 'cyan');
      log(`  最大 Token: ${config.window.maxTokens}`);
      log(`  最大消息数：${config.window.maxMessages}`);
      log(`  保留重要：${config.window.reserveImportant}`);
      log(`  Token 估算比例：${config.window.tokenEstimateRatio}`);
      break;
    }
    
    case 'set': {
      const key = options.positional?.[0];
      const value = options.positional?.[1];
      
      if (!key || value === undefined) {
        error('用法：window set <key> <value>');
        return;
      }
      
      const newConfig = {};
      newConfig[key] = isNaN(value) ? value : Number(value);
      yixia.updateWindowConfig(newConfig);
      success(`配置已更新：${key} = ${value}`);
      break;
    }
    
    case 'test': {
      // 测试截断功能
      const testMessages = [
        { role: 'user', content: '短消息', timestamp: 1 },
        { role: 'assistant', content: '这是一条比较长的消息，用于测试截断功能。'.repeat(50), timestamp: 2 },
        { role: 'user', content: '重要消息', priority: 2, timestamp: 3 }
      ];
      
      const result = yixia.truncateMessages(testMessages, { maxTokens: 500 });
      log('截断测试结果:', 'cyan');
      log(`  原始消息：${testMessages.length} 条`);
      log(`  截断后：${result.messages.length} 条`);
      log(`  已截断：${result.truncated}`);
      log(`  使用 Token: ${result.tokensUsed}`);
      break;
    }
    
    default:
      error(`未知命令：window ${command}`);
  }
}

/**
 * 处理 stats 命令
 */
async function cmdStats() {
  const status = await yixia.getStatus();
  
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║              忆匣 (YiXia) 系统状态                       ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');
  
  log('📦 历史记录', 'yellow');
  log(`   路径：${status.history.path}`);
  log(`   记录数：${status.history.records}`);
  log(`   会话数：${status.history.sessions}`);
  log(`   大小：${(status.history.sizeBytes / 1024).toFixed(2)} KB`);
  
  log('\n📋 粘贴存储', 'yellow');
  log(`   路径：${status.pastes.dir}`);
  log(`   文件数：${status.pastes.files}`);
  log(`   大小：${(status.pastes.sizeBytes / 1024).toFixed(2)} KB`);
  
  log('\n🪟 窗口配置', 'yellow');
  log(`   最大 Token: ${status.window.maxTokens}`);
  log(`   最大消息数：${status.window.maxMessages}`);
  log(`   保留重要：${status.window.reserveImportant}`);
  
  console.log('');
}

/**
 * 处理 export 命令
 */
async function cmdExport(options) {
  const { session, output, format } = options;
  
  if (!session) {
    error('缺少参数：--session <id>');
    return;
  }
  
  if (!output) {
    error('缺少参数：--output <path>');
    return;
  }
  
  const fmt = format || 'jsonl';
  const success = await yixia.exportSession(session, output, fmt);
  
  if (success) {
    success(`会话已导出：${output} (格式：${fmt})`);
  } else {
    error('导出失败，会话可能不存在');
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const parsed = parseArgs(args);
  const { command, options } = parsed;
  
  try {
    switch (command) {
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
        
      case 'record':
        await cmdRecord(options);
        break;
        
      case 'search':
        await cmdSearch(options);
        break;
        
      case 'session':
        await cmdSession(options.positional?.[0] || 'list', options);
        break;
        
      case 'paste':
        await cmdPaste(options.positional?.[0] || 'stats', options);
        break;
        
      case 'window':
        await cmdWindow(options.positional?.[0] || 'check', options);
        break;
        
      case 'stats':
        await cmdStats();
        break;
        
      case 'export':
        await cmdExport(options);
        break;
        
      default:
        error(`未知命令：${command}`);
        console.log('使用 "node yixia-cli.js help" 查看帮助');
    }
  } catch (err) {
    error(err.message);
    process.exit(1);
  }
}

// 执行
main();
