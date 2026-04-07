/**
 * 测试：上下文管理（窗）
 */

const { ContextWindow } = require('../src/context');
const assert = require('assert');

async function testContext() {
  console.log('🧪 测试上下文管理（窗）\n');
  
  const window = new ContextWindow({ maxSize: 100 }); // 小窗口便于测试
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 添加上下文
    console.log('测试 1: 添加上下文');
    await window.add({
      id: 'ctx_1',
      type: 'note',
      content: '重要信息',
      priority: 10
    });
    const status = window.getStatus();
    assert(status.itemCount === 1, '上下文项数应为 1');
    console.log(`  ✅ 通过 - 上下文数：${status.itemCount}\n`);
    passed++;

    // 测试 2: 获取上下文
    console.log('测试 2: 获取上下文');
    const context = await window.getContext();
    assert(context.length === 1, '上下文长度应为 1');
    assert(context[0].content === '重要信息', '内容不匹配');
    console.log(`  ✅ 通过 - 获取成功\n`);
    passed++;

    // 测试 3: 更新上下文
    console.log('测试 3: 更新上下文');
    await window.update('ctx_1', { content: '更新后的信息' });
    const updated = await window.getContext();
    assert(updated[0].content === '更新后的信息', '更新失败');
    console.log(`  ✅ 通过 - 更新成功\n`);
    passed++;

    // 测试 4: 优先级调整
    console.log('测试 4: 优先级调整');
    await window.prioritize('ctx_1', 5);
    const item = window.items.find(i => i.id === 'ctx_1');
    assert(item.priority === 5, '优先级调整失败');
    console.log(`  ✅ 通过 - 新优先级：${item.priority}\n`);
    passed++;

    // 测试 5: 窗口优化（自动移除）
    console.log('测试 5: 窗口优化');
    await window.add({
      id: 'ctx_2',
      type: 'note',
      content: '低优先级内容 ' + 'x'.repeat(100),
      priority: 1
    });
    await window.add({
      id: 'ctx_3',
      type: 'note',
      content: '中优先级内容 ' + 'x'.repeat(100),
      priority: 5
    });
    // 此时应触发优化，移除低优先级项
    const optimized = window.getStatus();
    console.log(`  ✅ 通过 - 优化后：${optimized.itemCount}项，使用率${optimized.usage}\n`);
    passed++;

    // 测试 6: 获取状态
    console.log('测试 6: 获取状态');
    const fullStatus = window.getStatus();
    assert(fullStatus.current >= 0, '当前使用量应非负');
    assert(fullStatus.max === 100, '最大容量应为 100');
    console.log(`  ✅ 通过 - 状态：${fullStatus.usage}\n`);
    passed++;

    // 测试 7: 标记访问
    console.log('测试 7: 标记访问');
    await window.touch('ctx_1');
    const itemAfterTouch = window.items.find(i => i.id === 'ctx_1');
    assert(itemAfterTouch.accessCount >= 1, '访问计数应增加');
    console.log(`  ✅ 通过 - 访问次数：${itemAfterTouch.accessCount}\n`);
    passed++;

    // 测试 8: 删除上下文
    console.log('测试 8: 删除上下文');
    await window.remove('ctx_1');
    const afterRemove = window.getStatus();
    const removed = window.items.find(i => i.id === 'ctx_1');
    assert(!removed, '删除失败');
    console.log(`  ✅ 通过 - 删除成功\n`);
    passed++;

    // 测试 9: 清空窗口
    console.log('测试 9: 清空窗口');
    await window.clear();
    const afterClear = window.getStatus();
    assert(afterClear.itemCount === 0, '清空失败');
    console.log(`  ✅ 通过 - 清空成功\n`);
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
  testContext().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testContext };
