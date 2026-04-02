---
name: feishu-sheet-formula
description: 飞书电子表格公式编写指南。包含跨表引用、VLOOKUP类型匹配、组合字段处理等常见问题的解决方案。

**当以下情况时使用此 Skill**：
(1) 需要在飞书表格中编写复杂公式
(2) 需要跨表格引用数据（IMPORTRANGE）
(3) VLOOKUP查找失败（类型不匹配）
(4) 处理组合字段（用分隔符连接的多值字段）
(5) 用户说"公式不对"、"查找不到"等公式相关问题
---

# 飞书电子表格公式技巧

## 一、跨表格引用

### 1.1 IMPORTRANGE 基础语法

```
=IMPORTRANGE("表格URL", "工作表名!范围")
```

**示例**：
```
=IMPORTRANGE("https://my.feishu.cn/sheets/XXX", "'Sheet2'!A:D")
```

**注意事项**：
1. 首次使用需要授权，点击提示授权即可
2. 工作表名包含空格时需要用单引号：`'Sheet Name'`
3. 授权后才能返回数据

### 1.2 测试跨表引用是否正常

先测试简单引用：
```
=IMPORTRANGE("https://my.feishu.cn/sheets/XXX", "'Sheet2'!A1")
```
如果返回值，说明引用正常。

---

## 二、VLOOKUP 类型匹配问题

### 2.1 常见错误

**问题**：VLOOKUP 返回"未找到值"错误

**原因**：查找值与数据源类型不匹配
- `SPLIT()` 返回字符串 `"10001"`
- 数据源可能是数字 `10001`
- 精确匹配时类型不同会失败

### 2.2 解决方案

**用 VALUE() 转换类型**：
```
=VLOOKUP(VALUE(查找值), 数据范围, 列号, FALSE)
```

**示例**：
```
=VLOOKUP(VALUE(INDEX(SPLIT(B5,"*"),2)), IMPORTRANGE("...","A:D"), 2, FALSE)
```

### 2.3 类型转换函数

| 函数 | 用途 |
|------|------|
| `VALUE()` | 字符串转数字 |
| `TEXT()` | 数字转字符串 |
| `INT()` | 取整 |
| `TRIM()` | 去除空格 |

---

## 三、字符串分割与提取

### 3.1 SPLIT 分隔字符串

```
=SPLIT(字符串, "分隔符")
```

**示例**：
```
=SPLIT("2*10001*1*10000", "*")  // 返回数组 [2, 10001, 1, 10000]
```

### 3.2 INDEX 提取元素

```
=INDEX(数组, 位置)
```

**示例**：
```
=INDEX(SPLIT("2*10001*1*10000", "*"), 2)  // 返回 10001（第2个元素）
```

### 3.3 组合使用

提取 `物品种类*物品ID*数量*权重` 格式中的物品ID：
```
=INDEX(SPLIT(B5, "*"), 2)
```

---

## 四、组合字段处理

### 4.1 问题描述

字段格式：`2*10001*1*10000|2*10002*1*5000`
- 用 `|` 分隔多个条目
- 每个条目用 `*` 分隔属性

### 4.2 处理公式

```
=IFERROR(
  TEXTJOIN("|", TRUE, 
    MAP(SPLIT(单元格, "|"), LAMBDA(x, 
      处理单个条目的公式
    ))
  ), 
  ""
)
```

### 4.3 完整示例

对组合字段中的每个物品ID进行VLOOKUP：
```
=IFERROR(
  TEXTJOIN("|", TRUE, 
    MAP(SPLIT(B5, "|"), LAMBDA(x, 
      VLOOKUP(VALUE(INDEX(SPLIT(x, "*"), 2)), IMPORTRANGE("...", "A:D"), 2, FALSE)
    ))
  ), 
  ""
)
```

**公式拆解**：
1. `SPLIT(B5, "|")` - 按组合分隔
2. `MAP(..., LAMBDA(x, ...))` - 对每个字段执行操作
3. `SPLIT(x, "*")` - 分隔单个条目
4. `INDEX(..., 2)` - 提取物品ID
5. `VALUE(...)` - 转为数字
6. `VLOOKUP(...)` - 查找名称
7. `TEXTJOIN("|", TRUE, ...)` - 组合结果
8. `IFERROR(..., "")` - 错误处理

---

## 五、常用公式模板

### 5.1 跨表VLOOKUP（单一字段）

```
=VLOOKUP(VALUE(INDEX(SPLIT(B5,"*"),2)), IMPORTRANGE("表格URL","'工作表'!A:D"), 2, FALSE)
```

### 5.2 跨表VLOOKUP（组合字段）

```
=IFERROR(TEXTJOIN("|",TRUE,MAP(SPLIT(B5,"|"),LAMBDA(x,VLOOKUP(VALUE(INDEX(SPLIT(x,"*"),2)),IMPORTRANGE("表格URL","'工作表'!A:D"),2,FALSE)))),"")
```

### 5.3 提取并重组字段

将 `类型*ID*数量*权重` 转为 `类型*名称*数量*权重`：
```
=IFERROR(TEXTJOIN("|",TRUE,MAP(SPLIT(B5,"|"),LAMBDA(x,LET(parts,SPLIT(x,"*"),INDEX(parts,1)&"*"&VLOOKUP(VALUE(INDEX(parts,2)),IMPORTRANGE("...","A:D"),2,FALSE)&"*"&INDEX(parts,3)&"*"&INDEX(parts,4))))),"")
```

---

## 六、错误排查清单

| 错误提示 | 可能原因 | 解决方案 |
|----------|----------|----------|
| 未找到值 | 类型不匹配 | 使用 VALUE() 转换 |
| #ERROR! | 公式语法错误 | 检查括号、引号 |
| #REF! | 引用无效 | 检查范围、授权 |
| #VALUE! | 参数类型错误 | 检查函数参数 |
| 公式显示为文本 | 格式问题 | 检查单元格格式 |

---

## 七、API vs 公式选择

### 7.1 使用API场景

- 批量处理大量数据
- 需要复杂计算逻辑
- 需要保留数据快照

### 7.2 使用公式场景

- 数据需要实时更新
- 用户需要自己修改
- 数据量适中

### 7.3 混合方案

对于大量数据，可以：
1. 用API写入公式模板
2. 用户复制公式到整列
3. 公式自动计算

---

## 八、版本历史

- v1.0 (2026-03-17): 初始版本，基于实际操作经验整理

---

**核心口诀**：
- 跨表引用用 IMPORTRANGE
- 类型匹配用 VALUE
- 组合处理用 SPLIT + MAP + TEXTJOIN
- 错误兜底用 IFERROR