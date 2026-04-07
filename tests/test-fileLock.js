/**
 * 测试：文件锁机制
 */

const { FileLock } = require('../src/fileLock');
const assert = require('assert');

async function testFileLock() {
  console.log('🧪 测试文件锁机制\n');
  
  const lock = new FileLock();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 获取锁
    console.log('测试 1: 获取锁');
    const resourceId = 'test-resource-' + Date.now();
    const acquired = await lock.tryAcquire(resourceId);
    assert(acquired === true, '获取锁应成功');
    console.log(`  ✅ 通过 - 成功获取锁：${resourceId}\n`);
    passed++;

    // 测试 2: 检查锁状态
    console.log('测试 2: 检查锁状态');
    const isLocked = lock.isLocked(resourceId);
    assert(isLocked === true, '资源应被锁定');
    console.log(`  ✅ 通过 - 锁状态正确\n`);
    passed++;

    // 测试 3: 释放锁
    console.log('测试 3: 释放锁');
    const released = await lock.release(resourceId);
    assert(released === true, '释放锁应成功');
    console.log(`  ✅ 通过 - 成功释放锁\n`);
    passed++;

    // 测试 4: 锁已释放
    console.log('测试 4: 验证锁已释放');
    const isLockedAfter = lock.isLocked(resourceId);
    assert(isLockedAfter === false, '资源应未锁定');
    console.log(`  ✅ 通过 - 锁已正确释放\n`);
    passed++;

    // 测试 5: withLock 自动管理
    console.log('测试 5: withLock 自动管理锁');
    const result = await lock.withLock('test-auto-lock', async () => {
      return '操作成功';
    });
    assert(result === '操作成功', '操作应返回正确结果');
    assert(lock.isLocked('test-auto-lock') === false, '操作后锁应自动释放');
    console.log(`  ✅ 通过 - withLock 自动管理锁\n`);
    passed++;

    // 测试 6: 并发锁测试
    console.log('测试 6: 并发锁测试');
    const concurrentResourceId = 'test-concurrent-' + Date.now();
    const results = await Promise.all([
      lock.tryAcquire(concurrentResourceId),
      lock.tryAcquire(concurrentResourceId),
      lock.tryAcquire(concurrentResourceId)
    ]);
    const successCount = results.filter(r => r).length;
    assert(successCount === 1, '只有一个应成功获取锁');
    await lock.release(concurrentResourceId);
    console.log(`  ✅ 通过 - 并发锁正确工作\n`);
    passed++;

    // 测试 7: 获取活跃锁列表
    console.log('测试 7: 获取活跃锁列表');
    await lock.acquire('test-active-1');
    await lock.acquire('test-active-2');
    const activeLocks = lock.getActiveLocks();
    assert(activeLocks.length >= 2, '应至少有 2 个活跃锁');
    await lock.release('test-active-1');
    await lock.release('test-active-2');
    console.log(`  ✅ 通过 - 活跃锁列表：${activeLocks.length}个\n`);
    passed++;

    // 测试 8: 清理过期锁
    console.log('测试 8: 清理过期锁');
    const cleaned = lock.cleanup();
    console.log(`  ✅ 通过 - 清理了 ${cleaned} 个过期锁\n`);
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
  testFileLock().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testFileLock };
