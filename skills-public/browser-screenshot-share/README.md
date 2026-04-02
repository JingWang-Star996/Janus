# 浏览器截图技能

浏览器截图并分享到飞书云空间。

## 快速开始

1. 打开网页：`browser(action=open, url="xxx")`
2. 截取屏幕：`browser(action=screenshot, ...)`
3. 上传飞书：`feishu_drive_file(action=upload, ...)`
4. 发送链接给用户

## 使用场景

- 登录二维码展示
- 网页内容分享
- 验证码展示
- 页面状态展示

## 核心流程

```
浏览器截图 → 飞书云空间 → 发送链接
```

## 许可证

CC-BY-4.0
