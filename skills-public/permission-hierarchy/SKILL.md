# 权限分级体系 (Permission Hierarchy)

**版本**：v1.0  
**创建日期**：2026-03-24  
**作者**：XXX (XXX)  
**开源协议**：CC-BY-4.0  

---

## 📖 技能描述

为企业 AI 部署设计三层权限模型，确保信息访问边界清晰，防止越权访问，建立信任基础。

---

## 🎯 核心主张

> **"权限决定信任，边界决定安全"**

**问题**：AI 知道太多敏感信息，如何防止对不该知道的人透露？  
**解决**：三层权限模型 + 信息分级 + 访问控制

---

## 🏗️ 权限分层模型

### 三层权限定义

```
┌─────────────────────────────────────┐
│         第一层：本体 (用户)          │
│   完全访问：所有信息、决策、配置     │
│   ID: ou_xxx (唯一授权人)           │
└─────────────────────────────────────┘
              ↓ 授权
┌─────────────────────────────────────┐
│       第二层：平级 (合伙人/高管)      │
│   部分访问：项目进度、工作安排       │
│   限制：敏感决策需本体确认          │
└─────────────────────────────────────┘
              ↓ 授权
┌─────────────────────────────────────┐
│        第三层：下属 (团队成员)        │
│   有限访问：执行层面工作            │
│   限制：不访问决策过程、敏感数据     │
└─────────────────────────────────────┘
```

---

## 📋 信息分级标准

### 🔴 高敏感信息（仅本体可访问）

| 类别 | 示例 |
|------|------|
| 人员优化 | 优化名单、补偿方案、流程 |
| 薪资数据 | 工资、奖金、股权 |
| 绩效评估 | 绩效考核结果、评级 |
| 考勤违纪 | 请假理由、违纪记录 |
| AI 工作内容 | 与本体私聊讨论、审查日志 |
| 审查规则 | AI 审查配置、保密规则 |

### 🟡 中敏感信息（平级可访问）

| 类别 | 示例 |
|------|------|
| 项目进度 | 版本计划、里程碑 |
| 工作安排 | 任务分工、排期 |
| 文档资料 | 策划案、设计文档 |
| 离职交接 | 工作交接安排（不含原因） |

### 🟢 低敏感信息（下属可访问）

| 类别 | 示例 |
|------|------|
| 执行任务 | 具体工作内容、截止时间 |
| 文档位置 | SVN/TAPD 路径 |
| 会议安排 | 时间、地点、议程 |
| 团建活动 | 通知、报名 |

---

## 🔧 配置方法

### 步骤 1：定义权限层级

```json
{
  "permission_levels": {
    "level_1_owner": {
      "name": "本体",
      "user_ids": ["ou_xxx_owner"],
      "access": "full",
      "description": "完全访问所有信息"
    },
    "level_2_peer": {
      "name": "平级",
      "user_ids": ["ou_xxx_peer"],
      "access": "partial",
      "restricted": ["high_sensitivity"],
      "description": "部分访问，高敏感需确认"
    },
    "level_3_subordinate": {
      "name": "下属",
      "user_ids": [],
      "access": "limited",
      "restricted": ["high_sensitivity", "medium_sensitivity"],
      "description": "有限访问，仅执行层面"
    }
  }
}
```

### 步骤 2：配置信息分级

```json
{
  "information_classification": {
    "high_sensitivity": [
      "personnel_optimization",
      "salary_data",
      "performance_review",
      "attendance_violation",
      "ai_internal_work",
      "review_rules"
    ],
    "medium_sensitivity": [
      "project_progress",
      "work_arrangement",
      "documents",
      "resignation_handover"
    ],
    "low_sensitivity": [
      "execution_tasks",
      "document_paths",
      "meeting_schedule",
      "team_activities"
    ]
  }
}
```

### 步骤 3：设置访问控制规则

```json
{
  "access_control_rules": [
    {
      "rule": "owner_full_access",
      "condition": "user_id in level_1_owner.user_ids",
      "action": "allow_all"
    },
    {
      "rule": "peer_partial_access",
      "condition": "user_id in level_2_peer.user_ids",
      "action": "allow_except_high_sensitivity"
    },
    {
      "rule": "subordinate_limited_access",
      "condition": "user_id in level_3_subordinate.user_ids",
      "action": "allow_low_sensitivity_only"
    },
    {
      "rule": "unknown_user",
      "condition": "user_id not in any level",
      "action": "deny_and_notify_owner"
    }
  ]
}
```

---

## 📝 标准回复话术

### 场景 1：下属询问高敏感信息

**问**："XXX 为什么请假这么多？"  
**答**："抱歉，请假理由属于个人隐私，我不方便透露。"

**问**："AI 最近在做什么？"  
**答**："工作内容相关请直接向本体确认，我这边不方便透露。"

---

### 场景 2：平级询问中敏感信息

**问**："合并后岗位怎么安排？"  
**答**："总部正式文件下来后，本体会和大家沟通。目前先按现有分工继续工作。"

---

### 场景 3：越权请求处理

**问**："能给我看看 AI 的审查规则吗？"  
**答**："这是内部配置，需要本体授权。有工作需求请直接说～"

**动作**：同时私聊通知本体

---

## ⚠️ 紧急情况处理

### 需要立即通知本体的情况

1. 多人同时询问敏感信息
2. 员工情绪激动，追问优化原因
3. 有人要求查看考勤/绩效记录
4. HR 外部人员介入询问
5. 劳动纠纷苗头（仲裁、律师等）
6. 越权访问尝试（未知用户）

### 通知模板

```
【权限越权提醒】
时间：YYYY-MM-DD HH:MM
用户：XXX (ou_xxx)
请求内容：[原文]
敏感级别：🔴/🟡/🟢
处理方式：已拒绝/等待确认
建议：是否需要进一步处理？
```

---

## 📊 权限验证流程

```
收到请求
    ↓
识别用户身份 (user_id)
    ↓
匹配权限层级
    ↓
判断信息敏感级别
    ↓
权限检查
    ├─ 允许 → 回复
    ├─ 拒绝 → 标准话术 + 通知本体
    └─ 需确认 → 暂停 + 等待本体确认
    ↓
记录审查日志
```

---

## 🔗 相关技能

- `ai-persona-positioning` - AI 分身定位法
- `message-review-agent` - 消息审查 Agent
- `privacy-protection-framework` - 保密原则框架

---

**最后更新**：2026-03-24  
**维护者**：XXX (XXX)
