# 文档双备份管理 Skill

**创建时间**：2026-04-01  
**来源**：Claude Code 分析项目重大失误教训  
**优先级**：最高

---

## 🎯 适用场景

当需要创建或更新飞书文档时，必须同时保存本地备份。

**触发条件**：
- 调用 `feishu_create_doc` 创建飞书文档
- 调用 `feishu_update_doc` 更新飞书文档
- 任何云端文档操作

---

## 📋 工作流程

### 标准流程

```python
# 1. 创建/更新飞书文档
feishu_create_doc(title, content)  # 或 feishu_update_doc

# 2. 立即保存本地（强制步骤）
local_path = f"/home/z3129119/.openclaw/workspace/{project}/docs/{title}.md"
write(local_path, content)

# 3. 验证本地文件存在（强制验证）
assert file_exists(local_path), "本地保存失败！"

# 4. 记录日志
log(f"✅ 文档已双备份：")
log(f"   飞书：{feishu_url}")
log(f"   本地：{local_path}")
```

---

## ✅ 检查清单

每次文档操作后必须确认：

- [ ] **飞书文档已创建/更新**
  - 获取文档 URL
  - 确认操作成功

- [ ] **本地文件已保存**
  - 路径：`/home/z3129119/.openclaw/workspace/{project}/docs/`
  - 文件名：`{文档标题}.md`

- [ ] **本地文件内容完整**
  - 文件大小 > 0
  - 内容包含关键部分（标题、正文、收尾）

- [ ] **本地 + 云端 内容一致**
  - 字数基本相同
  - 关键内容一致

---

## 🚨 禁止行为

### 绝对禁止
- ❌ 只保存云端不保存本地
- ❌ 认为"云端安全"就省略本地备份
- ❌ 批量操作时忽略本地保存
- ❌ 没有验证机制就认为完成

### 常见错误
- ❌ "稍后再保存本地" → 最后忘记
- ❌ "这个文档不重要" → 全部文档都要备份
- ❌ "本地目录不存在" → 先创建目录
- ❌ "文件名有问题" → 清理特殊字符

---

## 📁 本地路径规范

### 项目结构
```
/home/z3129119/.openclaw/workspace/
├── {project-name}/
│   ├── README.md              # 项目说明
│   └── docs/                  # 文档目录
│       ├── 文档 1.md
│       ├── 文档 2.md
│       └── ...
```

### 文件名规范
- 使用中文或英文
- 特殊字符替换为 `-` 或 `_`
- 示例：
  - `Buddy 系统深度分析.md`
  - `Coordinator 多 Agent 系统.md`
  - `最终报告_v2.0.md`

---

## 🔧 自动化脚本（推荐）

### Python 示例
```python
import os
from pathlib import Path

def save_document_with_backup(title, content, project):
    """保存文档到飞书 + 本地"""
    
    # 1. 保存飞书
    feishu_url = feishu_create_doc(title, content)
    
    # 2. 准备本地路径
    docs_dir = Path(f"/home/z3129119/.openclaw/workspace/{project}/docs")
    docs_dir.mkdir(parents=True, exist_ok=True)
    
    # 清理文件名
    safe_title = "".join(c for c in title if c.isalnum() or c in " -_").strip()
    local_path = docs_dir / f"{safe_title}.md"
    
    # 3. 保存本地
    local_path.write_text(content, encoding='utf-8')
    
    # 4. 验证
    assert local_path.exists(), f"本地保存失败：{local_path}"
    assert local_path.stat().st_size > 0, "本地文件为空"
    
    # 5. 记录日志
    print(f"✅ 文档已双备份：")
    print(f"   飞书：{feishu_url}")
    print(f"   本地：{local_path}")
    
    return feishu_url, local_path
```

---

## 📝 日志格式

### 成功日志
```
✅ 文档已双备份：
   飞书：https://www.feishu.cn/docx/xxx
   本地：/home/z3129119/.openclaw/workspace/claude-code-analysis/docs/Buddy 系统.md
   大小：9,478 字节
```

### 失败日志
```
❌ 本地保存失败！
   飞书：https://www.feishu.cn/docx/xxx
   本地路径：/home/z3129119/.openclaw/workspace/xxx/docs/xxx.md
   错误：目录不存在 / 权限不足 / 磁盘满
```

---

## 🎯 核心原则

### 1. 承诺必须兑现
- 说了"本地一份云端一份"就必须执行
- 不能因为"麻烦"就省略
- 不能因为"云端安全"就侥幸

### 2. 简单任务更需要纪律
- 保存本地文件是"简单"任务
- 但正是简单任务最容易被忽略
- 需要建立强制性流程

### 3. 验证机制必不可少
- 每次操作后必须自我验证
- "我保存本地了吗？"
- "本地文件存在吗？"
- "内容完整吗？"

### 4. 批量操作需要自动化
- 多份文档处理时容易出错
- 应该编写脚本自动保存本地
- 或者至少建立一个检查步骤

---

## 📊 失误案例（2026-04-01）

### 事件
- **项目**：Claude Code 源码分析
- **文档数**：17 份
- **承诺**：本地一份 + 云端一份
- **实际**：只有云端（飞书），本地空白

### 原因
1. 工作流程缺陷 - 没有强制本地保存步骤
2. 注意力分散 - 专注于格式修复，忽略了本地备份
3. 没有检查机制 - 没有自我验证
4. 过度依赖飞书 - 认为"云端安全"

### 教训
- ✅ 必须建立强制性工作流程
- ✅ 每次操作后必须验证
- ✅ 批量操作需要自动化脚本
- ✅ 不能有任何侥幸心理

---

**维护人**：王鲸 AI 分析团队  
**最后更新**：2026-04-01  
**版本**：v1.0  
**状态**：✅ 强制执行
