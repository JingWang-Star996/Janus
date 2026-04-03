/**
 * 编辑部工作流 - 顺序执行模式
 * 
 * 适用场景：文章创作、内容审核、编辑出版等需要严格顺序的流程
 */

module.exports = {
  id: 'editorial',
  name: '编辑部工作流',
  description: '文章创作的标准编辑流程，7 人专业编辑部协作',
  type: 'sequential',
  
  // 阶段定义
  stages: [
    {
      id: 'editor_in_chief',
      name: '总编辑',
      agent: '编辑部 - 总编辑',
      description: '统筹全局，把控文章调性和质量标准',
      timeout: 300000,  // 5 分钟
      retries: 1
    },
    {
      id: 'planning',
      name: '选题策划',
      agent: '编辑部 - 选题策划',
      description: '从素材中提炼核心价值点，确定文章角度',
      timeout: 300000,
      retries: 1,
      dependencies: ['editor_in_chief']
    },
    {
      id: 'writer',
      name: '资深撰稿人',
      agent: '编辑部 - 资深撰稿人',
      description: '将素材转化为有深度、有温度的正文内容',
      timeout: 600000,  // 10 分钟
      retries: 2,
      dependencies: ['planning']
    },
    {
      id: 'tech_review',
      name: '技术审核',
      agent: '编辑部 - 技术审核编辑',
      description: '确保技术细节准确、逻辑严密',
      timeout: 300000,
      retries: 1,
      dependencies: ['writer'],
      conditions: [
        {
          type: 'expression',
          expression: 'context.hasTechnicalContent === true'
        }
      ]
    },
    {
      id: 'copy_editor',
      name: '文字编辑',
      agent: '编辑部 - 文字编辑',
      description: '打磨语言表达，提升文字质量',
      timeout: 300000,
      retries: 1,
      dependencies: ['writer']
    },
    {
      id: 'ux_editor',
      name: 'UX 编辑',
      agent: '编辑部 - 用户体验编辑',
      description: '从读者角度审视文章，优化阅读体验',
      timeout: 300000,
      retries: 1,
      dependencies: ['copy_editor']
    },
    {
      id: 'final_review',
      name: '终审官',
      agent: '编辑部 - 终审官',
      description: '全面质检，确保文章达到出版标准',
      timeout: 300000,
      retries: 0,
      dependencies: ['ux_editor', 'tech_review']
    }
  ],

  // 依赖关系（也可在 stage 中定义）
  dependencies: {
    'planning': ['editor_in_chief'],
    'writer': ['planning'],
    'tech_review': ['writer'],
    'copy_editor': ['writer'],
    'ux_editor': ['copy_editor'],
    'final_review': ['ux_editor', 'tech_review']
  },

  // 元数据
  metadata: {
    version: '1.0.0',
    author: 'AI 首席架构师',
    createdAt: '2026-04-03',
    tags: ['editorial', 'content', 'sequential'],
    estimatedDuration: '30-60 分钟',
    team: '编辑部'
  }
};
