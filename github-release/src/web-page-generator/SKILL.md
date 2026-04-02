---
name: web-page-generator
description: 将内容转换为适合移动端分享的精美 HTML 网页。使用场景：当用户说"做成一个网页发给我"、"生成分享页面"、"输出 HTML"、"做成可截图的页面"时触发。自动创建带翻页功能、美观排版的移动端页面，适合截图分享到社交平台。
---

# Web Page Generator - 网页生成器

**核心功能**：将对话内容、建议、指南等转换为适合移动端分享的精美 HTML 网页。

---

## 触发条件

当用户表达以下意图时触发：

- "做成一个网页发给我"
- "生成分享页面"
- "输出 HTML"
- "做成可截图的页面"
- "我要发朋友圈/小红书"
- "弄个好看的格式"
- "分页展示"

---

## 输出规范

### 页面设计要求

1. **移动端优先**
   - 宽度：375px（iPhone 标准）
   - 高度：667px 每页（适合截图）
   - 字体：支持中文（PingFang SC, Microsoft YaHei, Noto Sans SC）

2. **翻页功能**
   - 每页一个完整主题
   - 底部导航按钮（← →）
   - 分页指示器（圆点）
   - 支持触摸滑动切换

3. **视觉设计**
   - 渐变背景（紫色系 #667eea → #764ba2）
   - 卡片式布局
   - 统一的配色方案
   - 表情符号增强可读性

4. **分享优化**
   - 每页底部水印/品牌标识
   - 页码显示（第 X 页 / 共 Y 页）
   - 引用金句突出显示
   - 数据指标用代码框展示

---

## 页面结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[页面标题]</title>
    <style>
        /* 移动端样式 */
        /* 渐变背景 */
        /* 卡片布局 */
        /* 翻页动画 */
    </style>
</head>
<body>
    <!-- 封面页 -->
    <div class="page cover-page">...</div>
    
    <!-- 内容页 -->
    <div class="page content-page">...</div>
    
    <!-- 导航 -->
    <div class="pagination">...</div>
    <div class="nav-buttons">...</div>
    
    <script>
        // 翻页逻辑
        // 触摸滑动
        // 键盘导航
    </script>
</body>
</html>
```

---

## 内容组织原则

### 封面页
- 大标题 + 副标题
- 主题表情符号
- 金句/引言
- 视觉焦点

### 内容页（每页一个主题）
- 页码 + 标题
- 核心内容（分点/表格/数据框）
- 金句引用（突出显示）
- 底部水印

### 结尾页
- 行动号召
- 总结要点
- 联系方式/品牌信息

---

## 样式组件库

### 数据框
```css
.data-box {
    background: #1a1a2e;
    color: #eee;
    padding: 20px;
    border-radius: 12px;
    font-family: monospace;
}
```

### 引用框
```css
.quote-box {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
}
```

### 高亮框
```css
.highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
}
```

### 表格
```css
table {
    width: 100%;
    border-collapse: collapse;
    th { background: gradient; color: white; }
    td { border-bottom: 1px solid #eee; }
}
```

---

## 使用示例

### 示例 1：游戏建议

**用户**：把做游戏的建议做成一个网页发给我

**输出**：
- 封面页：游戏制作人王鲸
- 第 2 页：核心原则
- 第 3 页：数据指标
- 第 4 页：独立游戏路线
- 第 5 页：商业化小游戏
- 第 6 页：学习路线
- 第 7 页：风险提示
- 第 8 页：下一步行动

### 示例 2：技术文档

**用户**：把这个技术文档生成分享页面

**输出**：
- 封面页：文档标题 + 版本
- 内容页：按章节分页
- 代码页：代码高亮展示
- 结尾页：参考链接

---

## 文件保存规范

1. **文件名**：`[主题]-[日期].html`
   - 例：`wangjing-game-advice-20260311.html`

2. **保存位置**：`/home/z3129119/.openclaw/workspace/`

3. **同时生成**：
   - HTML 文件
   - 简短说明（如何打开/分享）

---

## 最佳实践

### ✅ 推荐做法

1. **控制每页内容量**
   - 每页 200-400 字
   - 避免文字过密
   - 留白适当

2. **视觉层次清晰**
   - 标题 > 正文 > 注释
   - 重要内容高亮
   - 使用表情符号分隔

3. **考虑截图场景**
   - 每页完整信息
   - 避免跨页内容
   - 底部加水印

### ❌ 避免做法

1. 文字过多，一屏放不下
2. 字体太小，看不清
3. 颜色过多，视觉混乱
4. 没有页码，无法定位

---

## 响应式适配

虽然主要面向移动端，但也要保证桌面浏览器打开时：
- 居中显示（max-width: 375px）
- 背景填充全屏
- 功能正常（翻页、导航）

---

## 扩展功能（可选）

1. **导出 PDF**：添加打印样式
2. **二维码**：页面底部添加分享二维码
3. **社交分享按钮**：微信、微博、小红书
4. **主题切换**：提供多套配色方案

---

## 相关文件

- **模板文件**：`assets/mobile-page-template.html`
- **样式库**：`assets/styles.css`
- **示例**：`assets/examples/`

---

## 快速开始

当用户请求生成网页时：

1. **分析内容**：确定主题、要点、页数
2. **选择模板**：根据内容类型选择合适模板
3. **生成 HTML**：套用模板，填充内容
4. **保存文件**：按规范命名保存
5. **告知用户**：文件位置、如何打开

---

> "好的内容值得好的展示方式。" —— Web Page Generator
