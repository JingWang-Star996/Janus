# 群聊规则配置指南

**版本**：1.0.0  
**最后更新**：2026-03-20

---

## 一、飞书插件配置

### 配置文件位置

```
~/.openclaw/openclaw.json
```

### 配置示例

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxx",
      "appSecret": "xxx",
      "domain": "feishu",
      "connectionMode": "websocket",
      "requireMention": true,
      "dmPolicy": "allowlist",
      "groupPolicy": "open",
      "allowFrom": [
        "ou_3833a36af6b901cab181b69ce8b762d1",
        "ou_7e31a302531d68cf0ce249417e4a1d0c"
      ],
      "groupAllowFrom": []
    }
  }
}
```

---

## 二、关键配置项说明

### requireMention

**作用**：控制群聊中是否需要@机器人才响应

**推荐值**：`true`

**说明**：
- `true`：只响应@消息，避免刷屏
- `false`：响应所有消息，可能干扰群聊

**配置后效果**：
```
群消息：今天天气不错
AI: （不响应）

群消息：@AI 这个 BUG 怎么解决？
AI: 收到，分析一下...
```

### dmPolicy

**作用**：控制私聊策略

**可选值**：
- `pairing`：需要配对授权
- `allowlist`：白名单模式
- `open`：开放模式
- `disabled`：禁用私聊

**推荐值**：`allowlist`

### allowFrom

**作用**：私聊白名单（open_id 列表）

**示例**：
```json
"allowFrom": [
  "ou_3833a36af6b901cab181b69ce8b762d1",
  "ou_7e31a302531d68cf0ce249417e4a1d0c"
]
```

**获取 open_id 方法**：
1. 飞书管理后台 → 用户管理
2. 或调用飞书 API 查询

### groupPolicy

**作用**：群聊访问策略

**可选值**：
- `open`：所有群可访问
- `allowlist`：白名单群
- `disabled`：禁用群聊

**推荐值**：`open`

---

## 三、配置步骤

### 步骤 1：获取必要信息

```
1. 飞书应用 App ID
2. 飞书应用 App Secret
3. 团队成员 open_id
4. 工作群 chat_id（可选）
```

### 步骤 2：修改配置文件

```bash
# 编辑配置文件
vim ~/.openclaw/openclaw.json

# 或
code ~/.openclaw/openclaw.json
```

### 步骤 3：重启网关

```bash
openclaw gateway restart
```

### 步骤 4：验证配置

```bash
# 查看状态
openclaw status

# 或在群里测试
@AI 测试
```

---

## 四、常见问题

### Q1: 配置后不生效？

**A**: 需要重启网关：
```bash
openclaw gateway restart
```

### Q2: 如何获取 open_id？

**A**: 方法 1：飞书管理后台查看  
方法 2：调用 API 查询  
方法 3：群里@AI，查看日志

### Q3: 配置错了怎么恢复？

**A**: 
```bash
# 恢复备份
cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json

# 重启网关
openclaw gateway restart
```

### Q4: 多个群怎么配置？

**A**: 使用 `groups` 配置：
```json
{
  "groups": {
    "oc_xxx1": {
      "enabled": true,
      "requireMention": true
    },
    "oc_xxx2": {
      "enabled": true,
      "requireMention": false
    }
  }
}
```

---

## 五、最佳实践

### 1. 最小权限原则

```json
{
  "requireMention": true,  // 只响应@
  "dmPolicy": "allowlist", // 私聊白名单
  "allowFrom": ["ou_xxx"]  // 仅关键人员
}
```

### 2. 分群配置

```json
{
  "groups": {
    "工作群": {
      "enabled": true,
      "requireMention": true
    },
    "闲聊群": {
      "enabled": false  // 不参与闲聊
    }
  }
}
```

### 3. 定期审查

每月审查一次配置：
- 白名单是否过期
- 群聊是否需要调整
- 权限是否合适

---

**维护者**：ai-onboarding-flow 团队  
**最后更新**：2026-03-20
