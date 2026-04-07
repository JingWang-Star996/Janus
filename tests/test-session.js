/**
 * 测试：会话管理（溯）
 */

const { Session } = require('../src/session');
const assert = require('assert');

async function testSession() {
  console.log('🧪 测试会话管理（溯）\n');
  
  const session = new Session();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 创建会话
    console.log('测试 1: 创建会话');
    const sessionId = await session.create('测试会话', { tags: ['test'] });
    assert(sessionId.startsWith('sess_'), '会话 ID 格式错误');
    console.log(`  ✅ 通过 - 会话 ID: ${sessionId}\n`);
    passed++;

    // 测试 2: 添加消息
    console.log('测试 2: 添加消息');
    await session.addMessage(sessionId, {
      role: 'user',
      content: '你好'
    });
    await session.addMessage(sessionId, {
      role: 'assistant',
      content: '你好！有什么可以帮助你的？'
    });
    const messages = await session.getMessages(sessionId);
    assert(messages.length === 2, `消息数应为 2，实际${messages.length}`);
    console.log(`  ✅ 通过 - 消息数：${messages.length}\n`);
    passed++;

    // 测试 3: 检索消息
    console.log('测试 3: 检索消息');
    const filtered = await session.search(sessionId, { keyword: '帮助' });
    assert(filtered.length === 1, '检索结果应为 1 条');
    console.log(`  ✅ 通过 - 检索结果：${filtered.length}条\n`);
    passed++;

    // 测试 4: 获取会话列表
    console.log('测试 4: 获取会话列表');
    const list = await session.list();
    assert(list.length >= 1, '会话列表应至少有 1 个会话');
    console.log(`  ✅ 通过 - 会话数：${list.length}\n`);
    passed++;

    // 测试 5: 更新会话
    console.log('测试 5: 更新会话');
    await session.update(sessionId, { title: '更新后的标题' });
    const updated = await session.get(sessionId);
    assert(updated.title === '更新后的标题', '标题更新失败');
    console.log(`  ✅ 通过 - 新标题：${updated.title}\n`);
    passed++;

    // 测试 6: 导出会话
    console.log('测试 6: 导出会话');
    const exported = await session.export(sessionId);
    assert(exported.messages.length === 2, '导出消息数错误');
    assert(exported.title === '更新后的标题', '导出标题错误');
    console.log(`  ✅ 通过 - 导出成功\n`);
    passed++;

    // 测试 7: 删除会话
    console.log('测试 7: 删除会话');
    await session.delete(sessionId);
    const listAfterDelete = await session.list();
    const deleted = listAfterDelete.find(s => s.id === sessionId);
    assert(!deleted, '会话删除失败');
    console.log(`  ✅ 通过 - 删除成功\n`);
    passed++;

  } catch (error) {
    console.log(`  ❌ 失败 - ${error.message}\n`);
    failed++;
  }

  console.log(`\n📊 测试结果：${passed}通过，${failed}失败\n`);
  return { passed, failed };
}

// 运行测试
if (require.main === module) {
  testSession().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testSession };
