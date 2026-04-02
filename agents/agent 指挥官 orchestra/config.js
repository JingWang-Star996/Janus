#!/usr/bin/env node

/**
 * Agent 指挥官 Orchestra - 配置管理
 * 
 * 管理所有 27 个 AI 岗位的配置和路由规则
 */

// 所有 AI 岗位定义（约 56 人）
var AI_AGENTS = [
  // 管理层（2 人）
  { id: 'ceo', name: 'AI CEO', role: '管理层', skills: ['战略决策', '商业敏感度', '资源整合'] },
  { id: 'producer', name: 'AI 制作人', role: '管理层', skills: ['产品定义', '玩法判断', '项目管理'] },
  
  // 策划岗（8 人）
  { id: 'lead-designer', name: 'AI 主策划', role: '策划岗', skills: ['系统架构', '文档规范', '跨系统整合'] },
  { id: 'numerical', name: 'AI 数值策划', role: '策划岗', skills: ['数值建模', '平衡性设计', '付费设计'] },
  { id: 'system', name: 'AI 系统策划', role: '策划岗', skills: ['需求分析', '系统设计', '文档撰写'] },
  { id: 'level', name: 'AI 关卡策划', role: '策划岗', skills: ['关卡设计', '节奏控制', '数据驱动'] },
  { id: 'narrative', name: 'AI 剧情策划', role: '策划岗', skills: ['世界观构建', '剧情设计', '角色塑造'] },
  { id: 'combat', name: 'AI 战斗策划', role: '策划岗', skills: ['战斗系统设计', '技能设计', '打击感调优'] },
  { id: 'economy', name: 'AI 经济策划', role: '策划岗', skills: ['经济系统建模', '产出消耗平衡', '通胀控制'] },
  { id: 'event', name: 'AI 活动策划', role: '策划岗', skills: ['活动设计', '玩家激励', '数据分析'] },
  
  // 美术岗（3 人）
  { id: 'art-lead', name: 'AI 主美', role: '美术岗', skills: ['风格定义', '概念设计', '团队管理'] },
  { id: 'art-director', name: 'AI 美术总监', role: '美术岗', skills: ['视觉风格', 'AI 美术工具', '美术规范'] },
  { id: 'character-artist', name: 'AI 角色原画师', role: '美术岗', skills: ['角色设计', '人体结构', '服装设计'] },
  
  // 程序岗（4 人）
  { id: 'tech-lead', name: 'AI 主程', role: '程序岗', skills: ['架构设计', '技术选型', '性能优化'] },
  { id: 'client', name: 'AI 客户端程序员', role: '程序岗', skills: ['Unity/UE 开发', '功能实现', 'Bug 修复'] },
  { id: 'server', name: 'AI 服务器程序员', role: '程序岗', skills: ['服务器逻辑', '数据库设计', '安全防护'] },
  { id: 'ai-architect', name: 'AI AI 技术总监', role: '程序岗', skills: ['AI 架构', 'NPC 智能', 'LLM 应用'] },
  
  // 运营岗（10 人）
  { id: 'data-analyst', name: 'AI 数据分析师', role: '运营岗', skills: ['核心指标', '玩家行为', 'A/B 测试'] },
  { id: 'product', name: 'AI 产品经理', role: '运营岗', skills: ['需求管理', '版本规划', '跨部门协调'] },
  { id: 'ux', name: 'AI UX 设计师', role: '运营岗', skills: ['交互设计', '用户研究', '原型设计'] },
  { id: 'community', name: 'AI 社区经理', role: '运营岗', skills: ['玩家沟通', '社区运营', '反馈收集'] },
  { id: 'marketing', name: 'AI 市场营销经理', role: '运营岗', skills: ['用户获取', '品牌营销', 'ASO'] },
  { id: 'qa', name: 'AI QA 主管', role: '运营岗', skills: ['测试计划', 'Bug 管理', '自动化测试'] },
  { id: 'monetization', name: 'AI 变现设计师', role: '运营岗', skills: ['付费系统设计', '经济模型', '付费平衡'] },
  { id: 'ops-director', name: 'AI 运营总监', role: '运营岗', skills: ['运营策略', '数据分析', '用户运营'] },
  { id: 'user-ops', name: 'AI 用户运营', role: '运营岗', skills: ['用户分层', '新手引导', '留存优化'] },
  { id: 'biz-ops', name: 'AI 商业化运营', role: '运营岗', skills: ['付费设计', '定价策略', 'A/B 测试'] },
  
  // AI 编辑部（7 人）
  { id: 'editor-chief', name: '编辑部 - 总编辑', role: '编辑部', skills: ['统筹全局', '把控文章调性', '质量标准'] },
  { id: 'editor-planner', name: '编辑部 - 选题策划', role: '编辑部', skills: ['信息提炼', '角度设计', '结构设计'] },
  { id: 'editor-writer', name: '编辑部 - 资深撰稿人', role: '编辑部', skills: ['叙事能力', '技术表达', '结构设计'] },
  { id: 'editor-tech', name: '编辑部 - 技术审核编辑', role: '编辑部', skills: ['技术验证', '逻辑审查', '内容补充'] },
  { id: 'editor-copy', name: '编辑部 - 文字编辑', role: '编辑部', skills: ['句式优化', '用词精准化', '节奏优化'] },
  { id: 'editor-ux', name: '编辑部 - 用户体验编辑', role: '编辑部', skills: ['信息层次设计', '视觉呈现优化', '互动设计'] },
  { id: 'editor-final', name: '编辑部 - 终审官', role: '编辑部', skills: ['全面质检', '品牌调性把控', '发布决策'] },
  
  // OpenClaw 分析团队（15 人）
  { id: 'oc-ceo', name: 'AI CEO', role: 'OpenClaw', skills: ['战略决策', '项目统筹', '资源协调'] },
  { id: 'oc-cto', name: 'AI CTO', role: 'OpenClaw', skills: ['技术架构把控', '技术决策', '代码审查'] },
  { id: 'oc-architect', name: 'AI 首席架构师', role: 'OpenClaw', skills: ['整体架构分析', '模块划分', '依赖关系'] },
  { id: 'oc-backend', name: 'AI 后端架构师', role: 'OpenClaw', skills: ['核心引擎分析', '会话管理', '工具系统'] },
  { id: 'oc-frontend', name: 'AI 前端架构师', role: 'OpenClaw', skills: ['Web 界面分析', '浏览器集成', 'Canvas 系统'] },
  { id: 'oc-system', name: 'AI 系统架构师', role: 'OpenClaw', skills: ['系统集成分析', '部署架构', '配置系统'] },
  { id: 'oc-ai-engine', name: 'AI AI 引擎专家', role: 'OpenClaw', skills: ['模型路由', 'Prompt 工程', '推理优化'] },
  { id: 'oc-toolchain', name: 'AI 工具链专家', role: 'OpenClaw', skills: ['工具系统', '函数调用', '安全策略'] },
  { id: 'oc-runtime', name: 'AI 运行时专家', role: 'OpenClaw', skills: ['会话管理', '状态机', '内存管理'] },
  { id: 'oc-plugin', name: 'AI 插件架构师', role: 'OpenClaw', skills: ['插件系统', 'Skill 机制', '扩展点'] },
  { id: 'oc-integration', name: 'AI 集成专家', role: 'OpenClaw', skills: ['第三方服务集成', '飞书/微信/Discord'] },
  { id: 'oc-api', name: 'AI API 专家', role: 'OpenClaw', skills: ['API 设计', '协议分析', '兼容性'] },
  { id: 'oc-tech-writer', name: 'AI 技术写作主管', role: 'OpenClaw', skills: ['文档体系设计', '内容审核', '风格统一'] },
  { id: 'oc-doc-engineer', name: 'AI 文档工程师', role: 'OpenClaw', skills: ['文档编写', '示例代码', 'API 文档'] },
  { id: 'oc-knowledge', name: 'AI 知识管理师', role: 'OpenClaw', skills: ['知识库建设', '索引系统', '检索优化'] },
  
  // 独立 Agent（6 人）
  { id: 'profile', name: '王鲸 AI-个人画像 Agent', role: '独立', skills: ['持续学习用户特质', '创作文案', '风格审查'] },
  { id: 'audit', name: 'AI 内审部', role: '独立', skills: ['商业隐私审查', '脱敏指导'] },
  { id: 'message-review', name: 'AI 消息审查 Agent', role: '独立', skills: ['消息敏感性审查', '保密检查'] },
  { id: 'copy-optimizer', name: 'AI 文案优化专家', role: '独立', skills: ['文案优化', '风格调整'] },
  { id: 'editorial', name: 'AI 编辑部', role: '独立', skills: ['社交媒体文案创作'] },
  { id: 'game-producer', name: '游戏制作人王鲸 Agent', role: '独立', skills: ['游戏设计咨询', '项目管理指导'] },
  { id: 'web-generator', name: '网页生成器', role: '独立', skills: ['将内容转换为精美 HTML 网页'] }
];

// 任务类型到 Agent 的路由规则
var ROUTING_RULES = {
  // 管理层任务
  '战略': ['ceo'],
  '商业': ['ceo', 'producer'],
  '产品': ['producer', 'product'],
  '项目': ['producer', 'product'],
  
  // 策划岗任务
  '系统': ['lead-designer', 'system'],
  '数值': ['numerical'],
  '关卡': ['level'],
  '剧情': ['narrative'],
  '战斗': ['combat', 'tech-lead'],
  '经济': ['economy', 'numerical'],
  '活动': ['event'],
  '需求': ['lead-designer', 'system', 'product'],
  
  // 美术岗任务
  '美术': ['art-lead', 'art-director'],
  '视觉': ['art-director'],
  '角色': ['character-artist', 'art-lead'],
  '风格': ['art-director', 'art-lead'],
  
  // 程序岗任务
  '代码': ['tech-lead', 'client'],
  '架构': ['tech-lead', 'ai-architect'],
  '技术': ['tech-lead'],
  '客户端': ['client'],
  '服务器': ['server'],
  'AI': ['ai-architect'],
  '性能': ['tech-lead', 'client', 'server'],
  'Bug': ['tech-lead', 'client', 'qa'],
  
  // 运营岗任务
  '数据': ['data-analyst'],
  '用户': ['user-ops', 'ux'],
  '社区': ['community'],
  '市场': ['marketing'],
  '测试': ['qa'],
  '付费': ['monetization', 'biz-ops'],
  '运营': ['ops-director', 'user-ops'],
  'UX': ['ux'],
  '交互': ['ux']
};

// 工作流程定义
var WORKFLOWS = {
  '游戏设计': {
    phases: ['research', 'synthesis', 'implementation', 'verification'],
    agents: ['producer', 'lead-designer', 'numerical', 'system', 'art-director', 'tech-lead', 'client', 'qa']
  },
  '系统设计': {
    phases: ['research', 'synthesis', 'implementation'],
    agents: ['lead-designer', 'system', 'tech-lead']
  },
  '数值设计': {
    phases: ['research', 'synthesis', 'implementation', 'verification'],
    agents: ['numerical', 'economy', 'data-analyst']
  },
  '代码 Review': {
    phases: ['research', 'synthesis'],
    agents: ['tech-lead', 'qa']
  },
  '美术设计': {
    phases: ['research', 'synthesis', 'implementation'],
    agents: ['art-director', 'character-artist']
  }
};

module.exports = {
  AI_AGENTS: AI_AGENTS,
  ROUTING_RULES: ROUTING_RULES,
  WORKFLOWS: WORKFLOWS,
  
  /**
   * 根据关键词路由到 Agent
   */
  routeByKeywords: function(keywords) {
    var matchedAgents = [];
    
    for (var keyword in ROUTING_RULES) {
      if (keywords.indexOf(keyword) !== -1) {
        matchedAgents = matchedAgents.concat(ROUTING_RULES[keyword]);
      }
    }
    
    // 去重
    return matchedAgents.filter(function(agent, index) {
      return matchedAgents.indexOf(agent) === index;
    });
  },
  
  /**
   * 获取工作流
   */
  getWorkflow: function(workflowName) {
    return WORKFLOWS[workflowName] || null;
  },
  
  /**
   * 获取 Agent 信息
   */
  getAgent: function(agentId) {
    for (var i = 0; i < AI_AGENTS.length; i++) {
      if (AI_AGENTS[i].id === agentId) {
        return AI_AGENTS[i];
      }
    }
    return null;
  },
  
  /**
   * 获取所有 Agent
   */
  getAllAgents: function() {
    return AI_AGENTS;
  },
  
  /**
   * 按角色筛选 Agent
   */
  getAgentsByRole: function(role) {
    return AI_AGENTS.filter(function(agent) {
      return agent.role === role;
    });
  }
};
