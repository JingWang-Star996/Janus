#!/usr/bin/env node

/**
 * 美术部门 Agent 配置 - 37 个专家级 Agent
 * 
 * 覆盖 2000 人规模游戏公司美术部门全岗位
 */

var ART_AGENTS = [
  // 一、场景美术部门（5 个）
  { id: 'art-scene-concept', name: '王鲸 AI-场景原画师', role: '场景美术', skills: ['场景概念设计', '色彩理论', '透视与构图'] },
  { id: 'art-scene-model', name: '王鲸 AI-场景模型师', role: '场景美术', skills: ['硬表面建模', '有机体建模', '拓扑优化'] },
  { id: 'art-scene-level', name: '王鲸 AI-场景地编师', role: '场景美术', skills: ['地形编辑', '植被系统', '空间规划'] },
  { id: 'art-scene-light', name: '王鲸 AI-场景灯光师', role: '场景美术', skills: ['全局光照', '实时光照', '大气效果'] },
  { id: 'art-scene-ta', name: '王鲸 AI-场景 TA', role: '场景美术', skills: ['Shader 开发', '渲染管线', '性能优化'] },
  
  // 二、角色美术部门（5 个）
  { id: 'art-char-concept', name: '王鲸 AI-角色原画师', role: '角色美术', skills: ['角色造型设计', '人体结构', '服装设计'] },
  { id: 'art-char-model', name: '王鲸 AI-角色模型师', role: '角色美术', skills: ['高模雕刻', '低模制作', '拓扑规范'] },
  { id: 'art-char-rig', name: '王鲸 AI-角色绑定师', role: '角色美术', skills: ['骨骼系统', '蒙皮权重', '面部绑定'] },
  { id: 'art-char-anim', name: '王鲸 AI-角色动画师', role: '角色美术', skills: ['角色动画', '动画原则', '动作捕捉'] },
  { id: 'art-char-ta', name: '王鲸 AI-角色 TA', role: '角色美术', skills: ['皮肤渲染', '布料渲染', '毛发渲染'] },
  
  // 三、特效美术部门（3 个）
  { id: 'art-vfx-concept', name: '王鲸 AI-特效原画师', role: '特效美术', skills: ['技能特效', '环境特效', '特效分镜'] },
  { id: 'art-vfx-artist', name: '王鲸 AI-特效制作师', role: '特效美术', skills: ['粒子系统', 'Shader 特效', '序列帧'] },
  { id: 'art-vfx-ta', name: '王鲸 AI-特效 TA', role: '特效美术', skills: ['特效管线', 'Shader 开发', '性能优化'] },
  
  // 四、UI 美术部门（3 个）
  { id: 'art-ui-concept', name: '王鲸 AI-UI 原画师', role: 'UI 美术', skills: ['UI 风格设计', '图标设计', '框架设计'] },
  { id: 'art-ui-artist', name: '王鲸 AI-UI 制作师', role: 'UI 美术', skills: ['界面制作', '图标制作', '动效制作'] },
  { id: 'art-ui-ux', name: '王鲸 AI-UI/UX 设计师', role: 'UI 美术', skills: ['信息架构', '交互设计', '用户研究'] },
  
  // 五、原画概念设计部门（3 个）
  { id: 'art-world-concept', name: '王鲸 AI-世界观设定师', role: '概念设计', skills: ['世界观构建', '文化设计', '视觉符号系统'] },
  { id: 'art-creature-concept', name: '王鲸 AI-怪物原画师', role: '概念设计', skills: ['怪物造型', '生物设计', '恐惧设计'] },
  { id: 'art-vehicle-concept', name: '王鲸 AI-载具原画师', role: '概念设计', skills: ['地面载具', '空中载具', '机械设计'] },
  
  // 六、材质贴图部门（1 个）
  { id: 'art-texture', name: '王鲸 AI-材质贴图师', role: '材质美术', skills: ['PBR 材质', '手绘材质', '程序化材质'] },
  
  // 七、渲染与技术美术部门（2 个）
  { id: 'art-chief-ta', name: '王鲸 AI-首席技术美术', role: '技术美术', skills: ['渲染管线', '全局技术规范', '技术选型'] },
  { id: 'art-render-prog', name: '王鲸 AI-渲染程序', role: '技术美术', skills: ['渲染管线', '光照技术', 'GPU 性能分析'] },
  
  // 八、2D 美术支持部门（2 个）
  { id: 'art-illustration', name: '王鲸 AI-插画师', role: '2D 美术', skills: ['宣传 CG', '卡牌插画', '剧情插画'] },
  { id: 'art-2d-anim', name: '王鲸 AI-2D 动画师', role: '2D 美术', skills: ['Live2D', '骨骼动画', '帧动画'] },
  
  // 九、宣传与品牌美术部门（2 个）
  { id: 'art-marketing', name: '王鲸 AI-宣传美术师', role: '宣传美术', skills: ['宣传海报', '社交媒体', '品牌设计'] },
  { id: 'art-motion', name: '王鲸 AI-视频剪辑/动态设计师', role: '宣传美术', skills: ['视频剪辑', '动态图形', '字幕设计'] },
  
  // 十、美术管理部门（3 个）
  { id: 'art-director', name: '王鲸 AI-美术总监', role: '美术管理', skills: ['视觉方向', '质量把控', '团队管理'] },
  { id: 'art-lead', name: '王鲸 AI-主美', role: '美术管理', skills: ['方向传达', '技术指导', '质量审核'] },
  { id: 'art-producer', name: '王鲸 AI-美术制作人', role: '美术管理', skills: ['计划管理', '资源管理', '风险管理'] },
  
  // 十一、专项技术部门（3 个）
  { id: 'art-pcg', name: '王鲸 AI-程序化美术师', role: '专项技术', skills: ['Houdini 程序化', 'UE5 PCG', '地形系统'] },
  { id: 'art-photogrammetry', name: '王鲸 AI-扫描重建师', role: '专项技术', skills: ['拍摄规范', '数据重建', '模型清理'] },
  { id: 'art-ai-specialist', name: '王鲸 AI-AI 美术工具师', role: '专项技术', skills: ['AI 概念生成', '提示词工程', '工作流集成'] },
  
  // 十二、外包管理部门（1 个）
  { id: 'art-outsource', name: '王鲸 AI-外包管理师', role: '外包管理', skills: ['供应商管理', '需求文档', '质量管控'] }
];

// 导出
module.exports = {
  ART_AGENTS: ART_AGENTS,
  
  // 获取美术部门 Agent 总数
  getTotalCount: function() {
    return ART_AGENTS.length;
  },
  
  // 按部门获取 Agent
  getAgentsByDepartment: function(department) {
    return ART_AGENTS.filter(function(agent) {
      return agent.role.includes(department);
    });
  },
  
  // 获取所有部门列表
  getDepartments: function() {
    var departments = {};
    for (var i = 0; i < ART_AGENTS.length; i++) {
      var role = ART_AGENTS[i].role;
      if (!departments[role]) {
        departments[role] = 0;
      }
      departments[role]++;
    }
    return departments;
  }
};
