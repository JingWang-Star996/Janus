# 浏览器截图技能 (Browser Screenshot & Share)

**版本**：v1.0  
**创建日期**：2026-03-24  
**作者**：王鲸 (研发三部孵化二组)  
**开源协议**：CC-BY-4.0  

---

## 📖 技能描述

当用户需要查看浏览器中的网页内容（如登录二维码、页面截图等）时，通过浏览器工具截图并上传到飞书云空间，然后发送文件链接给用户。

**核心流程**：浏览器截图 → 飞书云空间上传 → 发送文件链接

---

## 🎯 使用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| 登录二维码 | 网页需要扫码登录 | 金山文档、飞书开放平台 |
| 页面内容展示 | 用户需要查看网页内容 | 配置页面、错误信息 |
| 验证码 | 网页需要输入验证码 | 两步验证、安全验证 |
| 页面状态 | 展示网页当前状态 | 加载进度、操作结果 |

---

## 🔧 操作流程

### 步骤 1：打开网页

```bash
# 使用浏览器工具打开目标网页
browser(action=open, url="https://example.com")
```

### 步骤 2：截取屏幕

```bash
# 截取完整页面或指定区域
browser(action=screenshot, targetId="页面 ID", fullPage=true, type="jpg")
```

**参数说明**：
- `targetId`：浏览器页面 ID（从 open 操作返回）
- `fullPage`：是否截取完整页面（true/false）
- `type`：图片格式（jpg/png）

### 步骤 3：上传到飞书云空间

```bash
# 上传截图文件到飞书云空间
feishu_drive_file(action=upload, file_path="截图文件路径")
```

**返回结果**：
- `file_name`：文件名
- `url`：文件访问链接
- `token`：文件 token

### 步骤 4：发送链接给用户

```
✅ 截图已上传！

文件链接：https://xxx.feishu.cn/file/xxx

请用手机扫码登录/查看页面内容。
```

---

## 📋 完整示例

### 示例 1：金山文档登录二维码

**用户需求**："帮我打开金山文档，我要扫码登录"

**操作流程**：
```
1. browser(action=open, url="https://www.kdocs.cn/l/xxx")
2. browser(action=screenshot, targetId="C19E412C...", fullPage=true, type="jpg")
3. feishu_drive_file(action=upload, file_path="/home/xxx/media/browser/xxx.jpg")
4. 回复用户："二维码已上传，链接：https://xxx.feishu.cn/file/xxx"
```

**用户操作**：
1. 在飞书里打开文件链接
2. 微信扫码登录
3. 登录成功后告知 AI

---

### 示例 2：飞书开放平台配置页面

**用户需求**："帮我看看飞书开放平台的权限配置页面"

**操作流程**：
```
1. browser(action=open, url="https://open.feishu.cn/")
2. browser(action=screenshot, targetId="xxx", fullPage=true, type="png")
3. feishu_drive_file(action=upload, file_path="/home/xxx/media/browser/xxx.png")
4. 回复用户："截图已上传，链接：https://xxx.feishu.cn/file/xxx"
```

---

## ⚠️ 注意事项

### 1. 文件路径
- 浏览器截图默认保存在：`/home/xxx/.openclaw/media/browser/`
- 文件格式：jpg/png
- 文件大小：通常 50KB-500KB

### 2. 飞书云空间限制
- 单文件大小限制：100MB
- 文件保留时间：永久
- 访问权限：仅上传者和管理员可访问

### 3. 安全考虑
- ✅ 截图内容可能包含敏感信息（如二维码）
- ✅ 文件链接仅发送给当前用户
- ✅ 不要将截图链接分享给第三方
- ✅ 使用后及时清理敏感截图

### 4. 浏览器限制
- 无法自动点击/登录（需要用户手动操作）
- 无法执行 JavaScript（部分页面可能显示异常）
- 无法访问需要登录的页面（除非用户先登录）

---

## 🚀 优化建议

### 方案 1：自动命名文件

```bash
# 使用时间戳 + 页面标题命名文件
file_name="screenshot_$(date +%Y%m%d_%H%M%S)_${page_title}.jpg"
```

### 方案 2：压缩图片

```bash
# 如果截图文件过大，可以压缩后再上传
convert input.jpg -quality 80% output.jpg
```

### 方案 3：直接发送图片

```bash
# 如果飞书支持，直接发送图片消息
feishu_im_bot_image(message_id="xxx", file_key="xxx", type="image")
```

---

## 📊 效果对比

| 方式 | 耗时 | 安全性 | 用户体验 |
|------|------|--------|---------|
| 截图 + 云空间 | 10 秒 | ✅ 高 | ✅ 好 |
| 复制文字描述 | 30 秒 | ✅ 高 | ⚠️ 一般 |
| 让用户自己打开 | 0 秒 | ✅ 高 | ❌ 差 |

---

## 🔗 相关技能

- `feishu-drive-ops` - 飞书云空间操作
- `browser-automation` - 浏览器自动化
- `image-processing` - 图片处理

---

## 📝 更新日志

### v1.0 (2026-03-24)
- ✅ 首发版本
- ✅ 完整操作流程
- ✅ 实战案例
- ✅ 安全注意事项

---

**最后更新**：2026-03-24  
**维护者**：王鲸 (研发三部孵化二组)
