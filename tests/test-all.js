/**
 * 忆匣 - 完整测试套件
 */

const { testSession } = require('./test-session');
const { testClipboard } = require('./test-clipboard');
const { testContext } = require('./test-context');
const { testFileLock } = require('./test-fileLock');
const { testLazyLoader } = require('./test-lazyLoader');
const { testClipboardReferences } = require('./test-clipboard-references');
const { testSessionIsolation } = require('./test-session-isolation');
const { testModelAdapter } = require('./test-modelAdapter');

async function runAllTests() {
  console.log('🧪 忆匣 (YiXia) - 完整测试套件\n');
  console.log('='.repeat(60) + '\n');
  
  const results = {
    session: await testSession(),
    clipboard: await testClipboard(),
    context: await testContext(),
    fileLock: await testFileLock(),
    lazyLoader: await testLazyLoader(),
    clipboardRefs: await testClipboardReferences(),
    sessionIsolation: await testSessionIsolation(),
    modelAdapter: await testModelAdapter()
  };

  console.log('='.repeat(60));
  console.log('\n📊 总测试结果:\n');
  
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  
  console.log('  核心模块:');
  console.log(`    会话管理（溯）: ${results.session.passed}通过，${results.session.failed}失败`);
  console.log(`    粘贴管理（匣）: ${results.clipboard.passed}通过，${results.clipboard.failed}失败`);
  console.log(`    上下文管理（窗）: ${results.context.passed}通过，${results.context.failed}失败`);
  console.log('');
  console.log('  新增功能:');
  console.log(`    文件锁机制：${results.fileLock.passed}通过，${results.fileLock.failed}失败`);
  console.log(`    懒加载优化：${results.lazyLoader.passed}通过，${results.lazyLoader.failed}失败`);
  console.log(`    粘贴引用展开：${results.clipboardRefs.passed}通过，${results.clipboardRefs.failed}失败`);
  console.log(`    会话隔离增强：${results.sessionIsolation.passed}通过，${results.sessionIsolation.failed}失败`);
  console.log(`    模型适配：${results.modelAdapter.passed}通过，${results.modelAdapter.failed}失败`);
  console.log('─'.repeat(60));
  console.log(`  总计：${totalPassed}通过，${totalFailed}失败`);
  
  if (totalFailed === 0) {
    console.log('\n✅ 所有测试通过！\n');
  } else {
    console.log('\n❌ 有测试失败，请检查错误信息\n');
  }
  
  return { totalPassed, totalFailed };
}

// 运行所有测试
if (require.main === module) {
  runAllTests().then(result => {
    process.exit(result.totalFailed > 0 ? 1 : 0);
  });
}

module.exports = { runAllTests };
