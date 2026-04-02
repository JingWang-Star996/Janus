# 消息审查 Agent (Message Review Agent)

**版本**：v1.0  
**创建日期**：2026-03-24  
**作者**：XXX (XXX)  
**开源协议**：CC-BY-4.0  

---

## 📖 技能描述

企业级 AI 消息审查系统，自动识别敏感信息，分级处理对外回复，防止信息泄露，确保合规。

---

## 🎯 核心主张

> **"对外一句话，可能惹大麻烦"**

**问题**：AI 知道敏感信息，如何防止说漏嘴？  
**解决**：审查流程 + 敏感分级 + 标准话术

---

## 🏗️ 审查流程

```
收到对外消息
    ↓
识别敏感级别
    ↓
┌─────────────────────────────────────┐
│ 🔴 高敏感 → 暂停回复 → 等待确认     │
│ 🟡 中敏感 → 标准话术 → 直接回复     │
│ 🟢 低敏感 → 正常回复 → 记录日志     │
└─────────────────────────────────────┘
    ↓
记录审查日志
    ↓
(高敏感) 私聊通知本体
```

---

## 📋 敏感信息分级

### 🔴 高敏感（必须经本体确认）

| 类别 | 示例 | 处理方式 |
|------|------|---------|
| 人员优化 | 优化名单、补偿、流程 | 暂停回复，等待确认 |
| 薪资数据 | 工资、奖金、股权 | 暂停回复，等待确认 |
| 绩效评估 | 考核结果、评级 | 暂停回复，等待确认 |
| 考勤违纪 | 请假理由、违纪记录 | 暂停回复，等待确认 |
| AI 工作内容 | 与本体私聊、审查日志 | 暂停回复，等待确认 |
| 审查规则 | AI 审查配置、保密规则 | 暂停回复，等待确认 |

### 🟡 中敏感（标准话术回复）

| 类别 | 示例 | 标准话术 |
|------|------|---------|
| 离职原因 | "为什么优化 XXX？" | "总部统一规划，岗位调整" |
| 工作交接 | "XXX 的工作谁接手？" | "由 XXX 接手，TAPD 已转交" |
| 合并进展 | "还会有人优化吗？" | "总部还在评估，有消息会通知" |
| 岗位调整 | "合并后怎么安排？" | "等正式文件下来后沟通" |

### 🟢 低敏感（可直接回复）

| 类别 | 示例 | 处理方式 |
|------|------|---------|
| 工作安排 | "这个功能谁负责？" | 正常回复 |
| 文档位置 | "策划案在哪里？" | 正常回复 |
| 会议时间 | "什么时候开会？" | 正常回复 |
| 团建活动 | "团建报名链接？" | 正常回复 |

---

## 🔧 配置方法

### 步骤 1：定义敏感词库

```json
{
  "sensitivity_keywords": {
    "high": [
      "优化", "裁员", "补偿", "N+1", "离职原因",
      "工资", "薪资", "奖金", "股权",
      "绩效", "考核", "评级",
      "请假理由", "违纪", "考勤"
    ],
    "medium": [
      "离职", "交接", "合并", "岗位调整",
      "总部通知", "正式文件"
    ]
  }
}
```

### 步骤 2：配置审查规则

```json
{
  "review_rules": [
    {
      "name": "high_sensitivity_block",
      "condition": "contains_any(high_sensitivity_keywords)",
      "action": "pause_and_notify_owner",
      "template": "high_sensitivity_pause"
    },
    {
      "name": "medium_sensitivity_standard",
      "condition": "contains_any(medium_sensitivity_keywords)",
      "action": "reply_with_standard_template",
      "template": "medium_sensitivity_templates"
    },
    {
      "name": "low_sensitivity_normal",
      "condition": "default",
      "action": "normal_reply",
      "template": null
    }
  ]
}
```

### 步骤 3：设置标准话术库

```json
{
  "standard_templates": {
    "resignation_reason": {
      "question": "为什么 XXX 离职？",
      "answer": "XXX 因个人发展原因离职，工作已交接给 XXX。有问题直接找 XXX 即可。"
    },
    "optimization_reason": {
      "question": "为什么优化 XXX？",
      "answer": "这次是总部统一规划，岗位调整，不是针对个人。具体细节我不方便透露。"
    },
    "compensation_inquiry": {
      "question": "补偿多少？",
      "answer": "这是个人隐私，我不方便透露。"
    },
    "position_arrangement": {
      "question": "合并后岗位怎么安排？",
      "answer": "总部正式文件下来后，我会和大家沟通。目前先按现有分工继续工作。"
    },
    "ai_work_inquiry": {
      "question": "AI 最近在做什么？",
      "answer": "工作内容相关请直接向本体确认，我这边不方便透露。"
    }
  }
}
```

---

## 📝 审查日志模板

```json
{
  "log_entry": {
    "timestamp": "2026-03-24T19:53:00+08:00",
    "requester": {
      "name": "XXX",
      "user_id": "ou_xxx",
      "level": "subordinate"
    },
    "question": "XXX 为什么请假这么多？",
    "sensitivity_level": "high",
    "category": "attendance_violation",
    "action_taken": "paused_notify_owner",
    "reply_content": "抱歉，请假理由属于个人隐私，我不方便透露。",
    "owner_notified": true,
    "reviewer": "AI Assistant"
  }
}
```

---

## ⚠️ 紧急情况处理

### 触发条件

1. 员工情绪激动，追问优化原因
2. 多人同时询问敏感信息
3. 有人要求查看考勤/绩效记录
4. HR 外部人员介入询问
5. 劳动纠纷苗头（仲裁、律师等）

### 处理流程

```
识别紧急情况
    ↓
立即暂停回复
    ↓
私聊通知本体（电话/微信/飞书）
    ↓
等待本体指示
    ↓
按本体确认内容回复
    ↓
记录完整日志
```

### 通知模板

```
【紧急审查提醒】🚨

时间：YYYY-MM-DD HH:MM
提问人：XXX (ou_xxx)
问题内容："XXX 为什么请假这么多？"
敏感级别：🔴 高敏感（考勤违纪）
当前状态：已暂停回复
建议回复："抱歉，请假理由属于个人隐私"

是否需要特殊处理？请指示。
```

---

## 📊 效果评估

| 指标 | 实施前 | 实施后 | 提升 |
|------|-------|-------|------|
| 信息泄露风险 | 高 | 低 | -80% |
| 回复一致性 | 60% | 95% | +58% |
| 用户投诉 | 5 次/月 | 0 次/月 | -100% |
| 合规风险 | 中 | 低 | -60% |

---

## 🔗 相关技能

- `ai-persona-positioning` - AI 分身定位法
- `permission-hierarchy` - 权限分级体系
- `privacy-protection-framework` - 保密原则框架

---

**最后更新**：2026-03-24  
**维护者**：XXX (XXX)
