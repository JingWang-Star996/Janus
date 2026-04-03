/**
 * 美术生产工作流 - 混合执行模式
 * 
 * 适用场景：有依赖关系的复杂生产流程，部分阶段可并行
 * 流程：概念设计 → 原画 → (模型 + 特效并行) → 审核
 */

module.exports = {
  id: 'artProduction',
  name: '美术生产工作流',
  description: '美术资源生产的混合流程，支持依赖管理和并行执行',
  type: 'hybrid',
  
  // 阶段定义
  stages: [
    {
      id: 'concept',
      name: '概念设计',
      agent: '概念设计师',
      description: '概念设计阶段：确定整体风格、色调、关键元素',
      timeout: 900000,  // 15 分钟
      retries: 2,
      priority: 1,  // 最高优先级
      output: {
        type: 'concept_art',
        deliverables: ['concept_description', 'mood_board', 'color_palette']
      }
    },
    {
      id: 'original_art',
      name: '原画',
      agent: '原画师',
      description: '原画绘制：基于概念设计完成详细原画',
      timeout: 1800000,  // 30 分钟
      retries: 2,
      priority: 2,
      dependencies: ['concept'],
      input: {
        from: 'concept',
        required: ['concept_description', 'mood_board']
      },
      output: {
        type: 'original_artwork',
        deliverables: ['character_design', 'environment_design', 'prop_design']
      }
    },
    {
      id: 'model',
      name: '模型',
      agent: '模型师',
      description: '3D 模型制作：根据原画创建 3D 模型',
      timeout: 2400000,  // 40 分钟
      retries: 1,
      priority: 3,
      dependencies: ['original_art'],
      input: {
        from: 'original_art',
        required: ['character_design', 'prop_design']
      },
      output: {
        type: '3d_model',
        deliverables: ['low_poly_model', 'high_poly_model', 'textures']
      },
      parallelGroup: 'production'  // 与特效并行
    },
    {
      id: 'effects',
      name: '特效',
      agent: '特效师',
      description: '特效制作：创建粒子、光影等特效',
      timeout: 1800000,  // 30 分钟
      retries: 1,
      priority: 3,
      dependencies: ['original_art'],
      input: {
        from: 'original_art',
        required: ['environment_design']
      },
      output: {
        type: 'vfx',
        deliverables: ['particle_effects', 'shader_effects', 'animation_clips']
      },
      parallelGroup: 'production'  // 与模型并行
    },
    {
      id: 'review',
      name: '审核',
      agent: '美术总监',
      description: '最终审核：整合所有产出，进行最终品质审核',
      timeout: 600000,  // 10 分钟
      retries: 0,
      priority: 4,
      dependencies: ['model', 'effects'],
      input: {
        from: ['model', 'effects'],
        required: ['low_poly_model', 'textures', 'particle_effects']
      },
      conditions: [
        {
          type: 'expression',
          expression: 'context.qualityStandard === "high" || context.isFinalBuild === true'
        }
      ],
      output: {
        type: 'approval',
        deliverables: ['approval_status', 'feedback', 'revision_requests']
      }
    }
  ],

  // 依赖关系图
  dependencies: {
    'original_art': ['concept'],
    'model': ['original_art'],
    'effects': ['original_art'],
    'review': ['model', 'effects']
  },

  // 并行组定义
  parallelGroups: {
    'production': {
      stages: ['model', 'effects'],
      syncPoint: 'review',  // 在 review 前同步
      timeout: 2400000  // 组整体超时
    }
  },

  // 错误处理策略
  errorHandling: {
    strategy: 'continue_if_possible',  // 尽可能继续
    criticalStages: ['concept', 'review'],  // 关键阶段失败则终止
    rollbackOnFailure: true
  },

  // 元数据
  metadata: {
    version: '1.0.0',
    author: 'AI 首席架构师',
    createdAt: '2026-04-03',
    tags: ['art', 'production', 'hybrid', 'dependency-management'],
    estimatedDuration: '60-90 分钟',
    team: '美术组',
    pipeline: 'concept→original→(model+effects)→review'
  }
};
