# feishu-sheet-formula 技能包

## 技能信息

- **名称**: feishu-sheet-formula
- **版本**: 1.0.0
- **描述**: 飞书表格公式与游戏配表技能
- **作者**: jing
- **创建时间**: 2026-03-19

## 包含文件

```
feishu-sheet-formula/
├── SKILL.md                    # 技能主文档
├── skill.json                  # 技能配置
└── 参考资料/
    ├── 公式速查表.md           # 公式速查
    └── 配表规范.md             # 配表规范
```

## 核心能力

1. **飞书表格公式** - 公式编写、调试、优化
2. **游戏配表** - 配置表设计、填写、管理
3. **数据验证** - 完整性检查、引用验证
4. **跨表引用** - IMPORTRANGE、数据同步

## 使用场景

- 编写复杂的飞书表格公式
- 设计和维护游戏配置表
- 验证配置表数据完整性
- 处理跨表数据引用问题
- 配表错误排查和调试

## 发布方法

### 方法 1: 使用 clawhub CLI

```bash
# 登录
clawhub login

# 发布
clawhub publish /home/z3129119/.openclaw/workspace/skills-public/feishu-sheet-formula
```

### 方法 2: 使用 clawhub sync

```bash
# 扫描并发布所有本地技能
clawhub sync
```

## 安装方法

发布后，其他人可以通过以下方式安装：

```bash
clawhub install feishu-sheet-formula
```

## 更新日志

### v1.0.0 (2026-03-19)
- 初始版本
- 包含基础公式速查表
- 包含配表规范和模板
- 支持 4 个核心能力

## 联系方式

- 作者：jing
- 项目：ZVP 游戏项目组
