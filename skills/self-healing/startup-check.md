# 启动时检查 Gateway 健康状态

## 触发条件
每次 AI 会话启动时执行一次。

## 检查内容
```bash
if [ -f /tmp/openclaw-healthcheck-alert.txt ]; then
    # 有未处理的警告
    cat /tmp/openclaw-healthcheck-alert.txt
    # 显示给用户后删除
    rm /tmp/openclaw-healthcheck-alert.txt
fi
```

## 通知规则
| 情况 | 通知方式 |
|------|---------|
| 健康 | 不通知 |
| 修复成功 | 不通知（静默） |
| 修复失败 | 会话启动时通知一次 |

## 目的
- 避免频繁打扰用户
- 只在真正需要人工介入时通知
- 正常运行时零感知
