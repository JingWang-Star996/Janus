/**
 * 测试：粘贴管理（匣）
 */

const { Clipboard } = require('../src/clipboard');
const assert = require('assert');

async function testClipboard() {
  console.log('🧪 测试粘贴管理（匣）\n');
  
  const clipboard = new Clipboard();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 存储内容
    console.log('测试 1: 存储内容');
    const clipId = await clipboard.store({
      content: '测试内容',
      type: 'text',
      tags: ['test'],
      title: '测试标题'
    });
    assert(clipId.startsWith('clip_'), '内容 ID 格式错误');
    console.log(`  ✅ 通过 - 内容 ID: ${clipId}\n`);
    passed++;

    // 测试 2: 获取内容
    console.log('测试 2: 获取内容');
    const content = await clipboard.get(clipId);
    assert(content === '测试内容', '内容不匹配');
    console.log(`  ✅ 通过 - 内容正确\n`);
    passed++;

    // 测试 3: 检索内容
    console.log('测试 3: 检索内容');
    const results = await clipboard.search({ tag: 'test' });
    assert(results.length >= 1, '检索结果应为至少 1 个');
    console.log(`  ✅ 通过 - 检索结果：${results.length}个\n`);
    passed++;

    // 测试 4: 更新标签
    console.log('测试 4: 更新标签');
    await clipboard.updateTags(clipId, ['updated', 'important']);
    const meta = await clipboard.getMeta(clipId);
    assert(meta.tags.includes('important'), '标签更新失败');
    console.log(`  ✅ 通过 - 新标签：${meta.tags.join(', ')}\n`);
    passed++;

    // 测试 5: 去重检测
    console.log('测试 5: 去重检测');
    const duplicateId = await clipboard.checkDuplicate('测试内容');
    assert(duplicateId === clipId, '去重检测失败');
    console.log(`  ✅ 通过 - 检测到重复：${duplicateId}\n`);
    passed++;

    // 测试 6: 智能存储
    console.log('测试 6: 智能存储（去重）');
    const smartResult = await clipboard.smartStore({
      content: '测试内容',
      type: 'text'
    });
    assert(smartResult.isDuplicate === true, '应检测到重复');
    assert(smartResult.id === clipId, '应返回已有 ID');
    console.log(`  ✅ 通过 - 智能去重成功\n`);
    passed++;

    // 测试 7: 统计信息
    console.log('测试 7: 统计信息');
    const stats = await clipboard.getStats();
    assert(stats.total >= 1, '统计总数应至少为 1');
    console.log(`  ✅ 通过 - 总数：${stats.total}, 大小：${stats.totalSize}\n`);
    passed++;

    // 测试 8: 删除内容
    console.log('测试 8: 删除内容');
    await clipboard.delete(clipId);
    const contentAfterDelete = await clipboard.get(clipId);
    assert(contentAfterDelete === null, '删除失败');
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
  testClipboard().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testClipboard };
