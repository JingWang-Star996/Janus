/**
 * 游戏设计工作流 - 并行执行模式
 * 
 * 适用场景：需要多角色同时评审的设计方案、跨部门协作等
 */

module.exports = {
  id: 'gameDesign',
  name: '游戏设计工作流',
  description: '游戏设计的并行评审流程，5 位核心成员同时评审',
  type: 'parallel',
  
  // 阶段定义（并行模式下所有 stage 同时启动）
  stages: [
    {
      id: 'ceo',
      name: 'CEO',
      agent: 'CEO',
      description: '战略层面评审：市场定位、商业价值、资源投入',
      timeout: 600000,  // 10 分钟
      retries: 0,
      conditions: [
        {
          type: 'expression',
          expression: 'context.designType === "major" || context.requiresCEOApproval === true'
        }
      ]
    },
    {
      id: 'producer',
      name: '制作人',
      agent: '制作人',
      description: '整体设计评审：玩法循环、核心体验、开发优先级',
      timeout: 600000,
      retries: 1
    },
    {
      id: 'lead_designer',
      name: '主策划',
      agent: '主策划',
      description: '策划方案评审：数值平衡、系统设计、文档完整性',
      timeout: 600000,
      retries: 1
    },
    {
      id: 'lead_programmer',
      name: '主程',
      agent: '主程',
      description: '技术可行性评审：实现难度、性能影响、技术风险',
      timeout: 600000,
      retries: 1
    },
    {
      id: 'lead_artist',
      name: '主美',
      agent: '主美',
      description: '美术风格评审：视觉风格、资源需求、品质标准',
      timeout: 600000,
      retries: 1
    }
  ],

  // 并行模式通常不需要依赖关系
  dependencies: {},

  // 汇聚条件（所有并行 stage 完成后执行）
  converge: {
    enabled: true,
    action: 'aggregate_feedback',
    minApprovals: 3,  // 至少 3 人同意才能通过
    vetoRoles: ['ceo', 'producer']  // CEO 和制作人有一票否决权
  },

  // 元数据
  metadata: {
    version: '1.0.0',
    author: 'AI 首席架构师',
    createdAt: '2026-04-03',
    tags: ['game-design', 'review', 'parallel'],
    estimatedDuration: '10-15 分钟',
    team: '游戏设计核心组',
    minParticipants: 3,
    maxParticipants: 5
  }
};
