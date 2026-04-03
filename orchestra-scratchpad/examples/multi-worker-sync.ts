/**
 * Orchestra Scratchpad 多 Worker 同步示例
 * 
 * 演示多个 Worker 之间如何共享和同步数据
 */

import { createWorkerBridge, WorkerBridge } from '../src/index';

async function simulateWorker(
  workerId: string,
  delay: number,
  operations: Array<{ key: string; value: any }>
) {
  console.log(`[${workerId}] Starting...`);
  
  const bridge = await createWorkerBridge({
    storagePath: './data/scratchpad.json',
    workerId,
    enableSync: true,
    syncIntervalMs: 2000, // 2 秒同步一次
    broadcastChanges: true,
  });

  try {
    // 等待其他 Worker 启动
    await new Promise(resolve => setTimeout(resolve, delay));

    // 执行写入操作
    for (const op of operations) {
      console.log(`[${workerId}] Writing ${op.key} = ${JSON.stringify(op.value)}`);
      await bridge.write(op.key, op.value, {
        workerId,
        tags: ['multi-worker'],
      });
      
      // 模拟工作间隔
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 强制同步
    console.log(`[${workerId}] Forcing sync...`);
    await bridge.sync();

    // 读取所有数据
    const allEntries = await bridge.list();
    console.log(
      `[${workerId}] Total entries after sync: ${allEntries.length}`
    );

    // 监听来自其他 Worker 的广播
    bridge.on('broadcast', (message) => {
      console.log(
        `[${workerId}] Received broadcast:`,
        message.type,
        message.key
      );
    });

    // 监听同步事件
    bridge.on('sync', (result) => {
      console.log(
        `[${workerId}] Sync completed:`,
        `${result.merged} merged, ${result.conflicts} conflicts`
      );
    });

    // 保持运行一段时间
    await new Promise(resolve => setTimeout(resolve, 5000));

    return allEntries.length;
  } finally {
    await bridge.destroy();
    console.log(`[${workerId}] Stopped`);
  }
}

async function multiWorkerExample() {
  console.log('=== Multi-Worker Sync Example ===\n');

  // 模拟 3 个 Worker 同时工作
  const workers = [
    simulateWorker('worker-1', 0, [
      { key: 'task-1', value: { status: 'processing', progress: 0 } },
      { key: 'task-2', value: { status: 'pending', progress: 0 } },
      { key: 'shared-counter', value: 1 },
    ]),
    simulateWorker('worker-2', 500, [
      { key: 'task-3', value: { status: 'processing', progress: 0 } },
      { key: 'task-4', value: { status: 'pending', progress: 0 } },
      { key: 'shared-counter', value: 2 },
    ]),
    simulateWorker('worker-3', 1000, [
      { key: 'task-5', value: { status: 'processing', progress: 0 } },
      { key: 'task-6', value: { status: 'pending', progress: 0 } },
      { key: 'shared-counter', value: 3 },
    ]),
  ];

  // 等待所有 Worker 完成
  const results = await Promise.all(workers);
  
  console.log('\n=== Results ===');
  console.log('All workers completed');
  console.log('Final entry counts:', results);
}

// 运行示例
multiWorkerExample().catch(console.error);
