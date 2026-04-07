/**
 * 测试：会话隔离增强
 */

const { Session } = require('../src/session');
const assert = require('assert');

async function testSessionIsolation() {
  console.log('🧪 测试会话隔离增强\n');
  
  const session = new Session();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 创建项目
    console.log('测试 1: 创建项目');
    const projectId = await session.createProject('测试项目 A', { description: '用于测试' });
    assert(projectId.startsWith('proj_'), '项目 ID 格式错误');
    console.log(`  ✅ 通过 - 项目 ID: ${projectId}\n`);
    passed++;

    // 测试 2: 创建会话
    console.log('测试 2: 创建会话');
    const sessionId1 = await session.create('项目 A - 会话 1', { tags: ['project-a'] });
    const sessionId2 = await session.create('项目 A - 会话 2', { tags: ['project-a'] });
    const sessionId3 = await session.create('其他会话', { tags: ['other'] });
    assert(sessionId1 && sessionId2 && sessionId3, '会话创建应成功');
    console.log(`  ✅ 通过 - 创建了 3 个会话\n`);
    passed++;

    // 测试 3: 关联会话到项目
    console.log('测试 3: 关联会话到项目');
    await session.linkSessionToProject(projectId, sessionId1);
    await session.linkSessionToProject(projectId, sessionId2);
    console.log(`  ✅ 通过 - 会话关联到项目\n`);
    passed++;

    // 测试 4: 获取项目会话
    console.log('测试 4: 获取项目会话');
    const projectSessions = await session.getProjectSessions(projectId);
    assert(projectSessions.length === 2, `项目应有 2 个会话，实际${projectSessions.length}`);
    console.log(`  ✅ 通过 - 项目会话数：${projectSessions.length}\n`);
    passed++;

    // 测试 5: 设置当前会话
    console.log('测试 5: 设置当前会话');
    session.setCurrentSession(sessionId1);
    const currentId = session.getCurrentSessionId();
    assert(currentId === sessionId1, '当前会话 ID 应正确');
    console.log(`  ✅ 通过 - 当前会话：${currentId}\n`);
    passed++;

    // 测试 6: 获取当前会话消息
    console.log('测试 6: 获取当前会话消息');
    await session.addMessage(sessionId1, { role: 'user', content: '消息 1' });
    await session.addMessage(sessionId1, { role: 'assistant', content: '回复 1' });
    const currentMessages = await session.getCurrentMessages({ limit: 10 });
    assert(currentMessages.length === 2, '当前会话应有 2 条消息');
    console.log(`  ✅ 通过 - 当前会话消息数：${currentMessages.length}\n`);
    passed++;

    // 测试 7: 懒加载最新消息
    console.log('测试 7: 懒加载最新消息（反向读取）');
    for (let i = 0; i < 30; i++) {
      await session.addMessage(sessionId1, {
        role: 'user',
        content: `消息 #${i + 1}`
      });
    }
    const latest = await session.getLatestMessages(sessionId1, 10);
    assert(latest.length === 10, '应加载 10 条最新消息');
    assert(latest[0].content.includes('消息 #30'), '第一条应是最新消息');
    console.log(`  ✅ 通过 - 懒加载最新消息（最新在前）\n`);
    passed++;

    // 测试 8: 分页获取历史
    console.log('测试 8: 分页获取历史消息');
    const page1 = await session.getHistoryPage(sessionId1, { page: 0, pageSize: 10 });
    const page2 = await session.getHistoryPage(sessionId1, { page: 1, pageSize: 10 });
    assert(page1.messages.length === 10, '第一页应有 10 条');
    assert(page2.messages.length === 10, '第二页应有 10 条');
    assert(page1.hasMore === true, '应有更多页');
    console.log(`  ✅ 通过 - 分页加载正确\n`);
    passed++;

    // 测试 9: 带锁添加消息
    console.log('测试 9: 带锁添加消息（防止并发）');
    await session.addMessageWithLock(sessionId2, {
      role: 'user',
      content: '带锁消息'
    });
    const messages2 = await session.getMessages(sessionId2);
    assert(messages2.length === 1, '会话 2 应有 1 条消息');
    console.log(`  ✅ 通过 - 带锁添加消息成功\n`);
    passed++;

    // 测试 10: 批量获取会话引用
    console.log('测试 10: 批量获取会话引用');
    const refs = await session.batchGetSessionRefs([sessionId1, sessionId2, sessionId3]);
    assert(refs.length === 3, '应返回 3 个会话引用');
    console.log(`  ✅ 通过 - 批量获取 ${refs.length} 个会话引用\n`);
    passed++;

    // 测试 11: 获取项目列表
    console.log('测试 11: 获取项目列表');
    const projects = await session.listProjects();
    assert(projects.length >= 1, '应至少有 1 个项目');
    console.log(`  ✅ 通过 - 项目数：${projects.length}\n`);
    passed++;

    // 测试 12: 删除项目
    console.log('测试 12: 删除项目');
    const projectId2 = await session.createProject('临时项目', {});
    await session.deleteProject(projectId2);
    const projectsAfterDelete = await session.listProjects();
    const deleted = projectsAfterDelete.find(p => p.id === projectId2);
    assert(!deleted, '项目应已删除');
    console.log(`  ✅ 通过 - 删除项目成功\n`);
    passed++;

    // 清理测试数据
    await session.delete(sessionId1);
    await session.delete(sessionId2);
    await session.delete(sessionId3);
    await session.deleteProject(projectId);

  } catch (error) {
    console.log(`  ❌ 失败 - ${error.message}\n`);
    failed++;
  }

  console.log(`\n📊 测试结果：${passed}通过，${failed}失败\n`);
  return { passed, failed };
}

// 运行测试
if (require.main === module) {
  testSessionIsolation().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testSessionIsolation };
