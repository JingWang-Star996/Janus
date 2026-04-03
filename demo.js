/**
 * Orchestra 工作流引擎 - 快速演示
 */

const { createEngine, WorkflowType, StageStatus } = require('./workflowEngine');

async function demo() {
  console.log('🎻 Orchestra 工作流引擎 - 功能演示\n');
  console.log('=' .repeat(50));
  
  // 创建引擎
  const engine = createEngine({ enableLogging: false });
  
  console.log('\n✅ 引擎已创建');
  console.log(`📋 已注册工作流：${engine.workflows.size} 个`);
  
  // 列出所有工作流
  console.log('\n📝 工作流列表:');
  engine.workflows.forEach((wf, id) => {
    console.log(`   - ${id}: ${wf.name} (${wf.type})`);
  });
  
  // 演示：获取工作流详情
  const editorial = engine.workflows.get('editorial');
  console.log('\n📄 编辑部工作流详情:');
  console.log(`   阶段数：${editorial.stages.length}`);
  console.log(`   类型：${editorial.type}`);
  console.log(`   阶段列表:`);
  editorial.stages.forEach((stage, i) => {
    console.log(`     ${i + 1}. ${stage.name} (${stage.agent})`);
  });
  
  // 演示：创建工作流实例
  console.log('\n🔄 创建工作流实例...');
  editorial.initialize({
    title: 'AI 助手开发指南',
    hasTechnicalContent: true
  });
  
  console.log(`   状态：${editorial.status}`);
  console.log(`   上下文：${JSON.stringify(editorial.context)}`);
  
  // 演示：进度追踪
  const progress = editorial.getProgress();
  console.log('\n📊 初始进度:');
  console.log(`   总计：${progress.total}`);
  console.log(`   完成：${progress.completed}`);
  console.log(`   百分比：${progress.percentage}%`);
  
  // 演示：模拟执行一个 stage
  console.log('\n▶️  模拟执行第一阶段...');
  const firstStage = editorial.stages[0];
  firstStage.status = StageStatus.RUNNING;
  firstStage.startTime = new Date().toISOString();
  console.log(`   ${firstStage.name}: ${firstStage.status}`);
  
  // 模拟完成
  setTimeout(() => {
    firstStage.status = StageStatus.COMPLETED;
    firstStage.endTime = new Date().toISOString();
    firstStage.result = { success: true };
    console.log(`   ${firstStage.name}: ${firstStage.status} ✅`);
    
    const newProgress = editorial.getProgress();
    console.log(`\n📊 当前进度：${newProgress.percentage}% (${newProgress.completed}/${newProgress.total})`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 演示完成！引擎功能正常。\n');
  }, 500);
}

// 运行演示
demo().catch(console.error);
