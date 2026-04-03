/**
 * Orchestra Scratchpad 基础使用示例
 */

import { createScratchpad, Scratchpad } from '../src/index';

async function basicUsage() {
  // 创建 Scratchpad 实例
  const scratchpad = await createScratchpad(
    './data/scratchpad.json',
    'worker-1'
  );

  try {
    // ==================== 基础写入 ====================
    
    // 写入简单值
    await scratchpad.write('counter', 0);
    
    // 写入对象
    await scratchpad.write('user', {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
    });
    
    // 写入数组
    await scratchpad.write('tags', ['typescript', 'orchestra', 'scratchpad']);
    
    // 带选项写入
    await scratchpad.write('session-token', 'abc123', {
      ttl: 3600000,  // 1 小时后过期
      tags: ['auth', 'session'],
      metadata: { userId: 1 },
    });

    // ==================== 基础读取 ====================
    
    // 读取完整条目
    const counterEntry = await scratchpad.read('counter');
    console.log('Counter entry:', counterEntry);
    
    // 便捷获取值
    const counter = await scratchpad.get<number>('counter', 0);
    console.log('Counter value:', counter);
    
    // 获取对象
    const user = await scratchpad.get<any>('user');
    console.log('User:', user);
    
    // 检查键是否存在
    const hasUser = await scratchpad.has('user');
    console.log('Has user:', hasUser);

    // ==================== 更新数据 ====================
    
    // 更新计数器
    await scratchpad.write('counter', counter + 1);
    
    // 更新用户信息
    const updatedUser = { ...user, name: 'Alice Smith' };
    await scratchpad.write('user', updatedUser);

    // ==================== 列表操作 ====================
    
    // 列出所有条目
    const allEntries = await scratchpad.list();
    console.log('All entries:', allEntries.length);
    
    // 按模式列出
    const authEntries = await scratchpad.list({
      pattern: 'session-*',
    });
    console.log('Session entries:', authEntries.length);
    
    // 按标签列出
    const taggedEntries = await scratchpad.list({
      tags: ['auth'],
    });
    console.log('Auth tagged entries:', taggedEntries.length);
    
    // 分页列出
    const paginated = await scratchpad.list({
      limit: 10,
      offset: 0,
    });
    console.log('First 10 entries:', paginated.length);

    // ==================== 删除操作 ====================
    
    // 删除单个键
    const deleted = await scratchpad.delete('counter');
    console.log('Deleted counter:', deleted);
    
    // 按模式清除
    const clearedCount = await scratchpad.clear({
      pattern: 'session-*',
    });
    console.log('Cleared entries:', clearedCount);
    
    // 清除所有
    const allCleared = await scratchpad.clear();
    console.log('All cleared:', allCleared);

  } finally {
    // 清理资源
    await scratchpad.destroy();
  }
}

// 运行示例
basicUsage().catch(console.error);
