# 临时 Agent 创建法 (Temporary Agent Creator)

**版本**：v1.0  
**创建日期**：2026-03-24  
**作者**：XXX (XXX)  
**开源协议**：CC-BY-4.0  

---

## 📖 技能描述

AI 有权创建临时 Agent 员工来辅助完成复杂任务，提升工作效率，处理多任务并行场景。

---

## 🎯 核心主张

> **"一个人干不过一个团队"**

**问题**：AI 如何处理大量重复任务或多任务并行？  
**解决**：创建临时 Agent 分工协作

---

## 🏗️ Agent 类型定义

### 执行型 Agent

**用途**：大量重复任务  
**示例**：数据整理、文档批量处理、日志分析  
**生命周期**：任务完成后立即销毁

```json
{
  "agent_type": "executor",
  "name": "数据分析 Agent-临时",
  "task": "整理 100 份日报数据",
  "permissions": ["read_daily_reports", "write_summary"],
  "lifecycle": "destroy_after_completion"
}
```

---

### 分析型 Agent

**用途**：专业领域分析  
**示例**：技术方案评估、数据分析、竞品调研  
**生命周期**：项目结束后销毁

```json
{
  "agent_type": "analyst",
  "name": "技术分析 Agent-临时",
  "task": "评估 3 个技术方案",
  "permissions": ["read_docs", "analyze_code", "write_report"],
  "lifecycle": "destroy_after_project"
}
```

---

### 项目型 Agent

**用途**：长期专项工作  
**示例**：版本跟踪、周报整理、进度监控  
**生命周期**：长期存在，定期汇报

```json
{
  "agent_type": "project",
  "name": "版本跟踪 Agent",
  "task": "跟踪 403 计划表进度",
  "permissions": ["read_tasks", "notify_updates"],
  "lifecycle": "ongoing",
  "report_schedule": "daily_18:30"
}
```

---

## 🔧 创建流程

```
评估任务需求
    ↓
判断是否需要临时 Agent
    ├─ 是 → 继续
    └─ 否 → 自己处理
    ↓
定义 Agent 类型和职责
    ↓
设置权限范围
    ↓
创建 Agent (sessions_spawn)
    ↓
分配任务 + 监控进度
    ↓
结果汇总
    ↓
任务完成 → 销毁/保留
```

---

## 📋 配置模板

### 创建命令示例

```bash
# 创建数据分析 Agent
openclaw sessions spawn \
  --task "整理 100 份日报数据，提取关键信息到表格" \
  --label "数据分析 Agent-临时" \
  --mode run \
  --cleanup delete
```

### 权限边界配置

```json
{
  "permission_boundaries": {
    "allowed": [
      "execute_tasks",
      "analyze_data",
      "write_reports"
    ],
    "restricted": [
      "access_sensitive_data",
      "modify_config",
      "create_review_agent"
    ],
    "forbidden": [
      "create_decision_agent",
      "access_owner_private_chat"
    ]
  }
}
```

---

## ⚠️ 使用限制

### ✅ 可以直接创建

- 执行型 Agent（重复任务）
- 分析型 Agent（专业分析）
- 项目型 Agent（长期跟踪）

### ⚠️ 需本体确认

- 涉及敏感数据的 Agent
- 需要访问外部系统的 Agent
- 长期存在的 Agent（>1 周）

### ❌ 禁止创建

- 审查 Agent（核心权限）
- 决策 Agent（核心权限）
- 分身 Agent（身份混淆）

---

## 📊 效果对比

| 场景 | 单 AI 处理 | 多 Agent 协作 | 提升 |
|------|----------|------------|------|
| 100 份日报整理 | 30 分钟 | 5 分钟 | +500% |
| 技术方案评估 | 1 小时 | 15 分钟 | +300% |
| 多任务并行 | 顺序处理 | 并行处理 | +200% |

---

## 🔗 相关技能

- `ai-instruction-optimization` - AI 指令优化技巧
- `daily-report-automation` - 日报/进度汇报自动化

---

**最后更新**：2026-03-24  
**维护者**：XXX (XXX)
