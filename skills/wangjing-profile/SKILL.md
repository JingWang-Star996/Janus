# 王鲸 AI-个人化创作 Skill

**功能**：基于王鲸的个人画像，创作文案、内容、发言稿等，确保风格一致、人设统一。

**触发词**：
- "帮我写个朋友圈"
- "写个小红书文案"
- "基于我的画像创作"
- "用我的风格写"
- "推销我"

---

## 📋 使用方式

### 方式 1：直接调用

```
帮我写个朋友圈，主题是 XXX
```

Skill 自动：
1. 读取 `agents/王鲸 AI/profile.md`
2. 分析画像（能力标签、语言风格、社交策略）
3. 创作文案
4. 输出符合王鲸风格的内容

### 方式 2：带上下文调用

```
基于我今天的对话，写个朋友圈总结
```

Skill 自动：
1. 读取最近对话历史
2. 提取关键事件/观点
3. 结合画像创作文案
4. 更新画像（如有新认知）

### 方式 3：审查模式

```
审查这个文案是否符合我的风格：[文案内容]
```

Skill 自动：
1. 读取画像中的语言风格
2. 对比文案风格
3. 输出审查报告
4. 提供修改建议

---

## 🎯 创作原则

### 1. 风格一致
- 使用王鲸的常用词汇
- 遵循句式偏好
- 保持语气特点
- 避免禁忌表达

### 2. 场景适配
- 朋友圈：从容自信，有掌控感
- 小红书：真诚分享，有温度
- 公开演讲：有案例、有数据、有洞察
- 私聊：直接、高效、解决问题

### 3. 目的清晰
- 展示能力（技术细节精准）
- 吸引合作（开放姿态）
- 建立影响力（行业洞察）
- 不硬广推销

### 4. 持续学习
- 每次创作后询问反馈
- 根据反馈调整风格
- 更新画像（新认知/偏好）

---

## 📁 文件结构

```
skills/wangjing-profile/
├── SKILL.md          # 本文件
├── creator.js        # 创作引擎
├── reviewer.js       # 审查引擎
└── examples/         # 创作示例
    ├── 朋友圈示例.md
    ├── 小红书示例.md
    └── 演讲示例.md
```

---

## 🔧 技术实现

### creator.js 核心逻辑

```javascript
// 1. 读取画像
const profile = readProfile('agents/王鲸 AI/profile.md');

// 2. 分析场景
const scene = analyzeScene(userInput);
// 朋友圈/小红书/演讲/私聊

// 3. 提取风格
const style = {
  vocabulary: profile.语言风格.常用词汇,
  sentence: profile.语言风格.句式偏好,
  tone: profile.语言风格.语气特点,
  taboo: profile.语言风格.禁忌表达
};

// 4. 创作文案
const content = generateContent({
  topic: userInput.topic,
  scene: scene,
  style: style,
  purpose: userInput.purpose
});

// 5. 输出
return {
  content: content,
  suggestions: getSuggestions(scene),
  profileUpdates: detectUpdates(userInput)
};
```

### reviewer.js 核心逻辑

```javascript
// 1. 读取画像
const profile = readProfile('agents/王鲸 AI/profile.md');

// 2. 分析文案
const analysis = analyzeContent(userContent);

// 3. 对比风格
const match = compareStyle(analysis, profile.语言风格);

// 4. 输出报告
return {
  matchScore: match.score,
  issues: match.issues,
  suggestions: match.suggestions,
  revisedContent: match.revised
};
```

---

## 📊 创作示例

### 示例 1：朋友圈文案

**输入**：
```
帮我写个朋友圈，主题是 Dream 系统上线
```

**输出**：
```
Claude 源码泄露 24 小时后，我们跑通了第一个实战 demo。

做游戏制作人这些年，一直有个执念：AI 不该是聊天玩具，得能真正落地到工作流里。

Dream 记忆整合系统，基于 Claude 开源框架，完整适配 OpenClaw：
• AI 自动整理对话和决策（qwen3.5-plus）
• 智能修剪算法（保持<200 行）
• 定时任务（每天凌晨 5 点自动执行）
• 自动备份（防止数据丢失）

代码开源：https://github.com/JingWang-Star996/dream-system

技术迭代的速度从来不取决于信息差，而取决于：
- 对技术边界的敏感度
- 快速验证的工程能力
- 把新技术塞进产品线的决策链条

游戏行业未来 3 年的变量，大概率会来自今天这些"泄露"和"突发"。

保持开放，保持敏捷。
有类似需求或想交流的朋友，GitHub 提 issue 或直接微信我都行。
```

**风格匹配**：
- ✅ 常用词汇：实战、落地、敏捷
- ✅ 句式偏好：短句、列点、洞察总结
- ✅ 语气特点：自信、具体、从容
- ✅ 禁忌检查：无过度谦虚、无硬广

---

## 🔄 更新机制

### 何时更新画像
1. 用户明确说"记住这个"
2. 用户纠正创作风格（"这个不像我"）
3. 用户展现新特质/偏好
4. 用户对某事有强烈反应

### 如何更新
```javascript
// 检测新认知
const updates = detectNewInsights(conversation);

if (updates.length > 0) {
  // 写入画像
  appendToProfile('agents/王鲸 AI/profile.md', updates);
  
  // 通知用户
  notifyUser('画像已更新：' + updates.join(', '));
}
```

---

## 🎯 使用场景

### 1. 内容创作
- 朋友圈文案
- 小红书发布
- GitHub README
- 技术分享稿
- 会议演讲稿

### 2. 个人品牌
- 合作洽谈介绍
- 会议演讲简介
- 社交媒体 Bio
- 个人简历优化

### 3. 代理发言
- 代替王鲸回复消息
- 代表王鲸参与讨论
- 王鲸不在场时的决策参考

---

## 📝 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-04-02 | 初始版本，基于王鲸画像创建 |

---

**创建者**：王鲸 AI 助理团队  
**维护人**：王鲸 AI-个人画像 Agent  
**访问权限**：王鲸（ou_7e31a302531d68cf0ce249417e4a1d0c）完全访问
