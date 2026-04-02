#!/usr/bin/env node

/**
 * 王鲸 AI-个人化创作引擎
 * 
 * 功能：基于王鲸的个人画像创作文案
 * 用法：node creator.js [场景] [主题]
 * 示例：node creator.js 朋友圈 "Dream 系统发布"
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const PROFILE_PATH = path.join(__dirname, '../../agents/王鲸 AI/profile.md');
const EXAMPLES_PATH = path.join(__dirname, './examples/朋友圈示例.md');

/**
 * 读取个人画像
 */
function readProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    console.error('❌ 个人画像文件不存在：', PROFILE_PATH);
    console.error('请先创建 agents/王鲸 AI/profile.md');
    process.exit(1);
  }
  
  const content = fs.readFileSync(PROFILE_PATH, 'utf-8');
  return parseProfile(content);
}

/**
 * 解析画像文件（简化版）
 */
function parseProfile(content) {
  // TODO: 实现完整的 Markdown 解析
  // 目前返回原始内容，供 AI 参考
  return {
    raw: content,
    sections: extractSections(content)
  };
}

/**
 * 提取画像章节
 */
function extractSections(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n');
      }
      currentSection = line.replace('## ', '').trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n');
  }
  
  return sections;
}

/**
 * 读取示例库
 */
function readExamples() {
  if (!fs.existsSync(EXAMPLES_PATH)) {
    return null;
  }
  
  return fs.readFileSync(EXAMPLES_PATH, 'utf-8');
}

/**
 * 生成创作 Prompt
 */
function generatePrompt(scene, topic, conversation) {
  const profile = readProfile();
  const examples = readExamples();
  
  const prompt = `你是【王鲸 AI-个人化创作助手】，基于王鲸的个人画像创作文案。

## 个人画像
${profile.raw}

## 创作示例
${examples || '无'}

## 创作任务
场景：${scene}
主题：${topic}
对话上下文：${conversation || '无'}

## 创作要求
1. 使用王鲸的语言风格（参考画像中的"语言风格"章节）
2. 符合场景策略（参考画像中的"社交场景策略"章节）
3. 体现王鲸的价值观和能力标签
4. 避免禁忌表达
5. 长度适中（${scene === '朋友圈' ? '300-500 字' : '根据场景调整'}）

## 输出格式
1. 文案正文
2. 配图建议（如适用）
3. 评论区自评（如适用）
4. 风格匹配说明（简要说明如何符合画像）

开始创作。`;

  return prompt;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法：node creator.js [场景] [主题]');
    console.log('示例：node creator.js 朋友圈 "Dream 系统发布"');
    console.log('');
    console.log('可用场景：朋友圈、小红书、演讲、私聊');
    process.exit(1);
  }
  
  const [scene, topic] = args;
  const conversation = process.env.CONVERSATION_CONTEXT || '';
  
  console.log('🎨 王鲸 AI-个人化创作引擎');
  console.log('场景:', scene);
  console.log('主题:', topic);
  console.log('');
  
  // 读取画像
  console.log('📖 读取个人画像...');
  const profile = readProfile();
  console.log('✅ 画像加载成功');
  console.log('   章节:', Object.keys(profile.sections).join(', '));
  console.log('');
  
  // 生成 Prompt
  console.log('📝 生成创作 Prompt...');
  const prompt = generatePrompt(scene, topic, conversation);
  console.log('✅ Prompt 生成成功');
  console.log('   长度:', prompt.length, '字符');
  console.log('');
  
  // 输出（供 AI 使用）
  console.log('--- Prompt 开始 ---');
  console.log(prompt);
  console.log('--- Prompt 结束 ---');
  console.log('');
  
  console.log('💡 将此 Prompt 发送给 AI，即可生成符合王鲸风格的文案');
}

// 运行主函数
main();
