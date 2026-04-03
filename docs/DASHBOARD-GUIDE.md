# 🎻 Orchestra Dashboard 使用指南

## 📋 目录

- [功能概述](#功能概述)
- [快速开始](#快速开始)
- [图表说明](#图表说明)
- [自定义配置](#自定义配置)
- [移动端适配](#移动端适配)
- [截图分享](#截图分享)
- [常见问题](#常见问题)

---

## 功能概述

Orchestra Dashboard 是 AI 编辑部协作系统的实时监控面板，提供以下核心功能：

### ✨ 主要特性

- **实时监控**：每 5 秒自动刷新数据
- **多维度可视化**：4 种图表类型全面展示系统状态
- **响应式设计**：完美适配桌面端和移动端
- **深色主题**：护眼配色，适合长时间监控
- **动画效果**：流畅的过渡动画和交互反馈

### 📊 图表类型

| 图表 | 用途 | 更新频率 |
|------|------|----------|
| Token 消耗折线图 | 实时显示 Token 消耗趋势 | 5 秒 |
| Agent 状态饼图 | 运行中/已完成/失败 比例 | 5 秒 |
| 成本对比柱状图 | 各 Agent 成本对比 | 5 秒 |
| 任务时间线甘特图 | 各 Agent 执行时间线 | 5 秒 |
| 任务成功率 | 成功/失败任务分布 | 5 秒 |

---

## 快速开始

### 1. 打开 Dashboard

直接在浏览器中打开 `dashboard/visual-dashboard.html` 文件：

```bash
# macOS
open dashboard/visual-dashboard.html

# Windows
start dashboard/visual-dashboard.html

# Linux
xdg-open dashboard/visual-dashboard.html
```

### 2. 查看实时数据

- 页面加载后自动初始化所有图表
- 右上角绿色圆点表示正在实时监控
- 底部显示最后更新时间

### 3. 刷新数据

- **自动刷新**：每 5 秒自动更新
- **手动刷新**：按 F5 或 Ctrl+R 刷新页面

---

## 图表说明

### 1. Token 消耗折线图

**位置**：左上角

**功能**：
- 显示最近 30 个时间点的 Token 消耗趋势
- 渐变色线条（青色→绿色）
- 面积图效果，直观展示消耗量

**数据解读**：
- 上升趋势：Token 消耗增加
- 下降趋势：Token 消耗减少
- 平稳：消耗稳定

### 2. Agent 状态饼图

**位置**：右上角

**功能**：
- 显示当前 Agent 状态分布
- 三种状态：运行中（青色）、已完成（绿色）、失败（红色）
- 点击图例可隐藏/显示对应状态

**数据解读**：
- 青色区域：正在运行的 Agent 数量
- 绿色区域：已完成任务的 Agent 数量
- 红色区域：执行失败的 Agent 数量

### 3. 成本对比柱状图

**位置**：左中

**功能**：
- 对比 7 个编辑岗位的成本
- 渐变色柱状图（绿色→青色）
- 支持 X 轴标签旋转，避免重叠

**岗位列表**：
1. 总编辑
2. 选题策划
3. 资深撰稿人
4. 技术审核
5. 文字编辑
6. 用户体验
7. 终审官

### 4. 任务成功率

**位置**：右中

**功能**：
- 显示任务成功/失败比例
- 绿色：成功任务
- 红色：失败任务

### 5. Agent 执行时间线（甘特图）

**位置**：底部（全宽）

**功能**：
- 展示各 Agent 的执行时间线
- 横轴：时间（分钟）
- 纵轴：Agent 岗位
- 渐变色条形图表示执行时长

**数据解读**：
- 条形长度：执行时长
- 条形位置：开始时间
- 颜色：统一渐变（青色→绿色）

---

## 自定义配置

### 修改刷新频率

编辑 `charts.js` 文件，找到以下代码：

```javascript
// 每 5 秒自动刷新
setInterval(updateCharts, 5000);
```

修改 `5000` 为所需的毫秒数（例如 `10000` 表示 10 秒）。

### 修改图表颜色

在 `charts.js` 中找到对应的图表配置，修改颜色值：

```javascript
// 示例：修改 Token 消耗图颜色
itemStyle: {
    color: '#你的颜色代码'
}
```

### 连接真实数据源

当前使用模拟数据生成器。要连接真实 API，修改 `DataGenerator` 对象：

```javascript
const DataGenerator = {
    async generateTokenData() {
        // 替换为真实 API 调用
        const response = await fetch('/api/token-stats');
        const data = await response.json();
        return data;
    },
    
    // 其他方法类似修改...
};
```

### 添加新图表

1. 在 `visual-dashboard.html` 中添加新的图表卡片：

```html
<div class="chart-card">
    <h2>新图表标题</h2>
    <div id="new-chart" class="chart-container"></div>
</div>
```

2. 在 `charts.js` 中添加配置：

```javascript
const ChartConfigs = {
    // ... 现有配置
    
    newChart: {
        // 新图表配置
    }
};
```

3. 初始化和更新图表：

```javascript
// 初始化
charts.new = echarts.init(document.getElementById('new-chart'));
charts.new.setOption(ChartConfigs.newChart);

// 更新
charts.new.setOption({ /* 新数据 */ });
```

---

## 移动端适配

### 响应式断点

| 设备 | 屏幕宽度 | 布局 |
|------|----------|------|
| 桌面端 | > 768px | 2 列网格 |
| 平板 | 376px - 768px | 1 列网格 |
| 手机 | ≤ 375px | 单列 + 简化统计栏 |

### 移动端优化

- **图表高度**：自动调整为 250px
- **字体大小**：自适应缩小
- **统计栏**：2 列或 1 列布局
- **触摸友好**：图表支持触摸交互

### 测试方法

在浏览器开发者工具中切换设备模式：

1. 按 F12 打开开发者工具
2. 点击设备切换按钮（或按 Ctrl+Shift+M）
3. 选择不同设备预览效果

---

## 截图分享

### 最佳截图方式

1. **启用截图模式**（可选）：
   在浏览器控制台执行：
   ```javascript
   document.body.classList.add('screenshot-mode');
   ```

2. **等待数据稳定**：
   观察图表数据不再大幅波动

3. **全屏截图**：
   - Windows: `Win + Shift + S`
   - macOS: `Cmd + Shift + 3`（全屏）或 `Cmd + Shift + 4`（选区）
   - 浏览器扩展：GoFullPage、Fireshot 等

4. **滚动截图**（如需完整页面）：
   使用浏览器扩展或开发者工具的滚动截图功能

### 截图优化技巧

- **隐藏刷新指示器**：截图模式自动隐藏
- **选择数据丰富时刻**：等待所有图表都有数据
- **避免动画中截图**：等待动画完成
- **使用深色模式**：系统深色模式效果更佳

---

## 常见问题

### Q1: 图表不显示怎么办？

**检查项**：
1. 确认已联网（需要加载 ECharts CDN）
2. 检查浏览器控制台是否有错误
3. 确认 `charts.js` 文件路径正确

**解决方案**：
```html
<!-- 确认 CDN 链接可访问 -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
```

### Q2: 数据不更新？

**检查项**：
1. 查看右上角刷新指示器是否闪烁
2. 检查浏览器控制台是否有 JavaScript 错误
3. 确认 `setInterval` 未被清除

**手动刷新**：
```javascript
// 在控制台执行
updateCharts();
```

### Q3: 移动端显示异常？

**解决方案**：
1. 清除浏览器缓存
2. 检查 viewport meta 标签
3. 使用 Chrome 开发者工具调试

### Q4: 如何导出图表图片？

**方法 1**：使用 ECharts 内置方法
```javascript
// 在控制台执行
const imgUrl = charts.token.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#1a1a2e'
});
// imgUrl 即为图片的 DataURL
```

**方法 2**：截图工具
使用系统或浏览器扩展截图

### Q5: 性能优化建议

**针对大量数据**：
1. 降低刷新频率（如改为 10 秒）
2. 减少数据点数量（如从 30 个改为 15 个）
3. 禁用不必要的动画效果

---

## 技术栈

- **图表库**：[ECharts 5.4.3](https://echarts.apache.org/)
- **CSS**：CSS Grid + Flexbox + 动画
- **JavaScript**：原生 ES6+
- **CDN**：jsDelivr

## 浏览器兼容性

| 浏览器 | 版本要求 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| 移动端浏览器 | 最新 2 个版本 |

---

## 更新日志

### v1.0 (2026-04-03)
- ✨ 初始版本发布
- 📊 5 种图表类型
- 📱 响应式设计
- 🎨 深色主题
- ⚡ 5 秒自动刷新

---

## 技术支持

如有问题或建议，请联系开发团队。

**最后更新**：2026-04-03  
**版本**：v1.0
