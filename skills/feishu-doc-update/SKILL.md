# 飞书文档编辑规范

**优先级**: ⭐⭐⭐⭐⭐ (最高)  
**来源**: 用户王鲸明确要求 + 实际失误教训

---

## ❌ 禁止行为

### 默认禁止使用 overwrite 模式

**事件**：
- 使用 `overwrite` 模式迁移 6 万字文档
- 错误地认为"正文内容保持不变"
- 只提供简化版内容，导致原文档正文被覆盖删除
- 文档中留下"（正文内容保持不变...）"占位文字

**王鲸明确要求**：
> overwrite 出了很多问题 默认不要使用 overwrite 模式编辑飞书文档

---

## ✅ 正确做法

### 模式选择指南

| 需求 | 正确模式 | 示例 |
|------|---------|------|
| **添加章节** | `append` | 在文档末尾追加新内容 |
| **修改段落** | `replace_range` + `selection_by_title` | 精确定位替换 |
| **插入内容** | `insert_before` / `insert_after` | 在某章节前/后插入 |
| **小修改** | `replace_range` + `selection_with_ellipsis` | 开头...结尾定位 |
| **默认** | **`append`** | **最安全的选择** |

---

## 🚫 禁止行为清单

- ❌ overwrite 模式（除非用户明确要求）
- ❌ 为了省 token 提供简化版内容
- ❌ 自作聪明假设 API 行为
- ❌ 占位文字出现在最终文档中（如"正文内容保持不变..."）
- ❌ 批量操作时忽略备份

---

## ✅ 正确操作示例

### 1. 添加章节（推荐）

```javascript
feishu_update_doc({
  doc_id: 'xxx',
  mode: 'append',  // ✅ 默认安全选择
  markdown: '## 新章节\n\n内容...'
})
```

### 2. 精确修改段落

```javascript
feishu_update_doc({
  doc_id: 'xxx',
  mode: 'replace_range',
  selection_by_title: '## 第二章',  // 通过标题定位
  markdown: '## 第二章\n\n更新后的内容...'
})
```

### 3. 使用省略号定位

```javascript
feishu_update_doc({
  doc_id: 'xxx',
  mode: 'replace_range',
  selection_with_ellipsis: '开头内容...结尾内容',
  markdown: '替换后的完整内容'
})
```

### 4. 在某章节前插入

```javascript
feishu_update_doc({
  doc_id: 'xxx',
  mode: 'insert_before',
  selection_by_title: '## 第三章',
  markdown: '## 新章节\n\n内容...'
})
```

---

## 🛡️ 数据安全原则

### 核心原则

1. **数据安全 > Token 优化**
   - 不要为了省 token 使用简化版内容
   - 完整内容 > 占位文字

2. **追加 > 覆盖**
   - 默认使用 `append`
   - 只在明确需要替换时使用 `replace_range`

3. **精确定位 > 全文替换**
   - 使用 `selection_by_title` 或 `selection_with_ellipsis`
   - 避免影响其他内容

4. **备份意识**
   - 大修改前先读取原文档
   - 必要时保存本地备份

---

## 📋 检查清单

执行文档更新前自检：

- [ ] 我使用的是 `append` 或 `replace_range` 吗？
- [ ] 我避免了 `overwrite` 模式吗？
- [ ] 我提供了完整内容而不是简化版吗？
- [ ] 我使用了精确定位（标题/省略号）吗？
- [ ] 我确认不会影响其他内容吗？

---

## 🎯 执行流程

```
接收任务
    ↓
判断更新类型
    ↓
📝 添加内容 → append 模式
📝 修改段落 → replace_range + 定位
📝 插入内容 → insert_before/after
    ↓
执行更新
    ↓
验证结果（读取确认）
```

---

## ⚠️ 紧急处理

如果不小心使用了 overwrite：

1. **立即停止**后续操作
2. **读取文档**确认损失范围
3. **尝试恢复**（如果有本地备份）
4. **向用户报告**并道歉
5. **创建 Skill**记录教训

---

## 📚 相关文档

- 飞书文档 API 文档：https://open.feishu.cn/document/ukTMukTMukTM/uEjNwUjL2YDM14SM2ATN
- 本地文档：`docs/飞书文档编辑规范.md`

---

**维护者**: AI 助理  
**最后更新**: 2026-04-03  
**优先级**: 最高（用户明确要求）
