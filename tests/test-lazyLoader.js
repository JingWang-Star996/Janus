/**
 * 测试：懒加载优化
 */

const { LazyLoader } = require('../src/lazyLoader');
const { Session } = require('../src/session');
const assert = require('assert');

async function testLazyLoader() {
  console.log('🧪 测试懒加载优化\n');
  
  const lazyLoader = new LazyLoader();
  const session = new Session();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 创建测试会话
    console.log('测试 1: 创建测试会话');
    const sessionId = await session.create('懒加载测试会话', { tags: ['lazy', 'test'] });
    assert(sessionId.startsWith('sess_'), '会话 ID 格式错误');
    console.log(`  ✅ 通过 - 会话 ID: ${sessionId}\n`);
    passed++;

    // 测试 2: 添加多条消息
    console.log('测试 2: 添加多条消息');
    for (let i = 0; i < 50; i++) {
      await session.addMessage(sessionId, {
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `消息 #${i + 1} - 测试内容`
      });
    }
    const messages = await session.getMessages(sessionId);
    assert(messages.length === 50, `消息数应为 50，实际${messages.length}`);
    console.log(`  ✅ 通过 - 添加了 ${messages.length} 条消息\n`);
    passed++;

    // 测试 3: 懒加载最新消息（反向读取）
    console.log('测试 3: 懒加载最新消息（反向读取）');
    const latestMessages = await lazyLoader.getLatestMessages(sessionId, 10);
    assert(latestMessages.length === 10, `应加载 10 条消息，实际${latestMessages.length}`);
    assert(latestMessages[0].content.includes('消息 #50'), '第一条应是最新消息');
    console.log(`  ✅ 通过 - 加载了 ${latestMessages.length} 条最新消息（最新在前）\n`);
    passed++;

    // 测试 4: 分页获取历史消息
    console.log('测试 4: 分页获取历史消息');
    const page1 = await lazyLoader.getHistoryPage(sessionId, { page: 0, pageSize: 10 });
    const page2 = await lazyLoader.getHistoryPage(sessionId, { page: 1, pageSize: 10 });
    assert(page1.messages.length === 10, '第一页应有 10 条消息');
    assert(page2.messages.length === 10, '第二页应有 10 条消息');
    assert(page1.hasMore === true, '应有更多页');
    console.log(`  ✅ 通过 - 分页加载正确\n`);
    passed++;

    // 测试 5: 获取会话引用（不加载内容）
    console.log('测试 5: 获取会话引用（不加载内容）');
    const sessionRef = await lazyLoader.getSessionRef(sessionId);
    assert(sessionRef !== null, '会话引用不应为空');
    assert(sessionRef.loaded === false, '应标记为未加载');
    assert(typeof sessionRef.load === 'function', '应有 load 方法');
    console.log(`  ✅ 通过 - 会话引用：${sessionRef.lineCount} 条，大小：${sessionRef.size} 字节\n`);
    passed++;

    // 测试 6: 懒加载粘贴内容
    console.log('测试 6: 懒加载粘贴内容');
    const { Clipboard } = require('../src/clipboard');
    const clipboard = new Clipboard();
    const clipId = await clipboard.store({
      content: '这是测试粘贴内容\n'.repeat(100),
      type: 'text',
      title: '懒加载测试'
    });
    const content = await lazyLoader.loadClipContent(clipId);
    assert(content !== null, '内容不应为空');
    assert(content.includes('这是测试粘贴内容'), '内容应正确');
    console.log(`  ✅ 通过 - 懒加载粘贴内容成功\n`);
    passed++;

    // 测试 7: 缓存统计
    console.log('测试 7: 缓存统计');
    const stats = lazyLoader.getCacheStats();
    assert(stats.sessions.cached >= 0, '会话缓存统计应正常');
    assert(stats.clips.cached >= 0, '剪贴板缓存统计应正常');
    console.log(`  ✅ 通过 - 缓存统计：${JSON.stringify(stats)}\n`);
    passed++;

    // 测试 8: 批量获取会话引用
    console.log('测试 8: 批量获取会话引用');
    const sessionId2 = await session.create('懒加载测试会话 2', { tags: ['lazy', 'test'] });
    for (let i = 0; i < 10; i++) {
      await session.addMessage(sessionId2, {
        role: 'user',
        content: `会话 2 消息 #${i + 1}`
      });
    }
    const refs = await lazyLoader.batchGetSessionRefs([sessionId, sessionId2]);
    assert(refs.length === 2, '应返回 2 个会话引用');
    console.log(`  ✅ 通过 - 批量获取 ${refs.length} 个会话引用\n`);
    passed++;

    // 测试 9: 清空缓存
    console.log('测试 9: 清空缓存');
    lazyLoader.clearCache();
    const statsAfterClear = lazyLoader.getCacheStats();
    assert(statsAfterClear.sessions.cached === 0, '会话缓存应清空');
    assert(statsAfterClear.clips.cached === 0, '剪贴板缓存应清空');
    console.log(`  ✅ 通过 - 缓存已清空\n`);
    passed++;

    // 清理测试数据
    await session.delete(sessionId);
    await session.delete(sessionId2);

  } catch (error) {
    console.log(`  ❌ 失败 - ${error.message}\n`);
    failed++;
  }

  console.log(`\n📊 测试结果：${passed}通过，${failed}失败\n`);
  return { passed, failed };
}

// 运行测试
if (require.main === module) {
  testLazyLoader().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testLazyLoader };
