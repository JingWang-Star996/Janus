/**
 * 测试：模型适配
 */

const { ModelAdapter } = require('../src/modelAdapter');
const assert = require('assert');

async function testModelAdapter() {
  console.log('🧪 测试模型适配\n');
  
  const modelAdapter = new ModelAdapter();
  let passed = 0;
  let failed = 0;

  try {
    // 测试 1: 获取模型配置
    console.log('测试 1: 获取模型配置');
    const config = modelAdapter.getModelConfig('qwen3.5-plus');
    assert(config !== null, '模型配置不应为空');
    assert(config.contextWindow === 32768, '上下文窗口应为 32K');
    assert(config.maxOutputTokens === 8192, '最大输出应为 8K');
    console.log(`  ✅ 通过 - qwen3.5-plus: ${config.contextWindow} tokens\n`);
    passed++;

    // 测试 2: 切换模型
    console.log('测试 2: 切换模型');
    modelAdapter.setModel('claude-3-5-sonnet');
    const claudeConfig = modelAdapter.getModelConfig();
    assert(claudeConfig.contextWindow === 200000, 'Claude 应有 200K 上下文');
    console.log(`  ✅ 通过 - 切换到 claude-3-5-sonnet: ${claudeConfig.contextWindow} tokens\n`);
    passed++;

    // 测试 3: 获取上下文窗口
    console.log('测试 3: 获取上下文窗口');
    const contextWindow = modelAdapter.getContextWindow();
    assert(contextWindow === 200000, '上下文窗口应正确');
    console.log(`  ✅ 通过 - 上下文窗口：${contextWindow}\n`);
    passed++;

    // 测试 4: 获取最大输出 Token
    console.log('测试 4: 获取最大输出 Token');
    const maxOutput = modelAdapter.getMaxOutputTokens();
    assert(maxOutput === 8192, '最大输出 Token 应正确');
    console.log(`  ✅ 通过 - 最大输出：${maxOutput}\n`);
    passed++;

    // 测试 5: 可用上下文窗口（含安全余量）
    console.log('测试 5: 可用上下文窗口');
    const available = modelAdapter.getAvailableContextWindow();
    assert(available < contextWindow, '可用窗口应小于总窗口（有安全余量）');
    console.log(`  ✅ 通过 - 可用窗口：${available} (${Math.round(available/contextWindow*100)}%)\n`);
    passed++;

    // 测试 6: 检查上下文限制
    console.log('测试 6: 检查上下文限制');
    const messages = [
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好！有什么帮助？' }
    ];
    const check = modelAdapter.checkContextLimit(messages);
    assert(check.exceeds === false, '不应超出限制');
    assert(check.current > 0, '当前 token 数应大于 0');
    console.log(`  ✅ 通过 - 上下文使用：${check.usage}\n`);
    passed++;

    // 测试 7: 估算 Token 数
    console.log('测试 7: 估算 Token 数');
    const chineseText = '你好，这是一个测试';
    const englishText = 'Hello, this is a test';
    const chineseTokens = modelAdapter.estimateTokens(chineseText);
    const englishTokens = modelAdapter.estimateTokens(englishText);
    assert(chineseTokens > 0, '中文 token 估算应正确');
    assert(englishTokens > 0, '英文 token 估算应正确');
    console.log(`  ✅ 通过 - 中文：${chineseTokens} tokens, 英文：${englishTokens} tokens\n`);
    passed++;

    // 测试 8: 截断消息
    console.log('测试 8: 截断消息以适应上下文');
    const longMessages = [];
    for (let i = 0; i < 100; i++) {
      longMessages.push({
        role: 'user',
        content: `消息 #${i} - `.repeat(100)
      });
    }
    const truncated = modelAdapter.truncateToContext(longMessages, {
      reserveSystem: true,
      reserveLast: 5
    });
    assert(truncated.messages.length < longMessages.length, '应截断部分消息');
    assert(truncated.removed > 0, '应有移除的消息');
    console.log(`  ✅ 通过 - 截断：${longMessages.length} → ${truncated.messages.length}，移除 ${truncated.removed} 条\n`);
    passed++;

    // 测试 9: 获取模型信息
    console.log('测试 9: 获取模型信息');
    const modelInfo = modelAdapter.getModelInfo();
    assert(modelInfo.name === 'claude-3-5-sonnet', '模型名称应正确');
    assert(modelInfo.contextWindow > 0, '上下文窗口应正确');
    console.log(`  ✅ 通过 - 模型信息：${JSON.stringify(modelInfo, null, 2)}\n`);
    passed++;

    // 测试 10: 列出所有模型
    console.log('测试 10: 列出所有支持的模型');
    const allModels = modelAdapter.listModels();
    assert(allModels.length > 10, '应支持多个模型');
    console.log(`  ✅ 通过 - 支持 ${allModels.length} 个模型\n`);
    passed++;

    // 测试 11: 按 provider 筛选
    console.log('测试 11: 按 provider 筛选模型');
    const bailianModels = modelAdapter.getModelsByProvider('bailian');
    const openaiModels = modelAdapter.getModelsByProvider('openai');
    assert(bailianModels.length > 0, '应有通义千问模型');
    assert(openaiModels.length > 0, '应有 GPT 模型');
    console.log(`  ✅ 通过 - 通义千问：${bailianModels.length}个，OpenAI: ${openaiModels.length}个\n`);
    passed++;

    // 测试 12: 推荐模型
    console.log('测试 12: 根据需求推荐模型');
    const recommended = modelAdapter.recommendModel({
      minContext: 100000,
      maxOutput: 4096
    });
    assert(recommended !== null, '应推荐模型');
    const recConfig = modelAdapter.getModelConfig(recommended);
    assert(recConfig.contextWindow >= 100000, '推荐模型应满足上下文要求');
    console.log(`  ✅ 通过 - 推荐模型：${recommended} (${recConfig.contextWindow} tokens)\n`);
    passed++;

    // 测试 13: 注册自定义模型
    console.log('测试 13: 注册自定义模型');
    modelAdapter.registerModel('custom-model', {
      name: 'Custom Model',
      contextWindow: 50000,
      maxOutputTokens: 4096,
      provider: 'custom'
    });
    const customConfig = modelAdapter.getModelConfig('custom-model');
    assert(customConfig !== null, '自定义模型应注册成功');
    assert(customConfig.contextWindow === 50000, '自定义配置应正确');
    console.log(`  ✅ 通过 - 自定义模型注册成功\n`);
    passed++;

    // 测试 14: 设置安全余量
    console.log('测试 14: 设置安全余量');
    modelAdapter.setSafetyMargin(0.2);
    const available20 = modelAdapter.getAvailableContextWindow();
    assert(available20 < available, '安全余量增大后可用窗口应减小');
    console.log(`  ✅ 通过 - 安全余量 20% 后可用窗口：${available20}\n`);
    passed++;

    // 测试 15: 获取状态
    console.log('测试 15: 获取模型适配器状态');
    const status = modelAdapter.getStatus();
    assert(status.currentModel === 'claude-3-5-sonnet', '当前模型应正确');
    assert(status.customModelsCount >= 1, '自定义模型数应正确');
    console.log(`  ✅ 通过 - 状态：${JSON.stringify(status, null, 2)}\n`);
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
  testModelAdapter().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

module.exports = { testModelAdapter };
