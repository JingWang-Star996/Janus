# OpenClaw 自愈 Skill

## 触发条件

当收到 `healthcheck` systemEvent 时触发。

## 功能

1. 检查 Gateway 健康状态
2. 自动修复常见问题
3. 发送通知给用户

## 检查项

### 1. Gateway 状态检查
```bash
openclaw gateway status
```

### 2. systemd 服务检查
```bash
systemctl --user status openclaw-gateway --no-pager
```

### 3. 进程检查
```bash
pgrep -f "openclaw gateway"
```

### 4. 端口检查
```bash
netstat -tlnp | grep 18789 || ss -tlnp | grep 18789
```

## 自动修复流程

### 级别 1：Gateway 无响应
```bash
openclaw gateway restart
```

### 级别 2：systemd 服务停止
```bash
systemctl --user restart openclaw-gateway
```

### 级别 3：进程丢失
```bash
# 清理僵尸进程
pkill -f "openclaw gateway"
# 重启服务
systemctl --user start openclaw-gateway
```

### 级别 4：完全恢复
```bash
# 停止所有相关进程
pkill -f openclaw
# 清理锁文件
rm -f /tmp/openclaw*.lock
# 冷启动
systemctl --user restart openclaw-gateway
```

## 通知规则

| 情况 | 通知方式 | 内容 |
|------|---------|------|
| 健康 | 不通知 | - |
| 自动修复成功 | 私信 | "✅ Gateway 已自动恢复" |
| 修复失败 | 私信 | "🚨 Gateway 无法自动修复，请手动运行：`openclaw gateway restart`" |
| 连续 3 次失败 | 私信 | "🆘 需要人工介入！" |

## 日志记录

所有检查和修复操作记录到：`~/.openclaw/logs/healthcheck.log`

## 执行脚本

```bash
/home/z3129119/.openclaw/scripts/healthcheck.sh
```
