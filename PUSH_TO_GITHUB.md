# 📤 推送到 GitHub 指南

## ✅ 本地已完成

- [x] Git 仓库初始化
- [x] 初始提交 (commit)
- [x] 创建 v2.0.0 标签
- [x] 添加 LICENSE (MIT)
- [x] 添加 GITHUB_RELEASE.md

---

## 🚀 推送到 GitHub 步骤

### 1. 创建 GitHub 仓库

在 GitHub 上创建新仓库：

**选项 A: 使用 GitHub CLI**
```bash
gh repo create openclaw/janus --public --source=. --remote=origin --push
```

**选项 B: 手动创建**
1. 访问 https://github.com/new
2. 仓库名：`janus`
3. 组织：`openclaw` (或个人账号)
4. 可见性：**Public**
5. **不要** 勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

---

### 2. 添加远程仓库并推送

```bash
# 添加远程仓库
git remote add origin https://github.com/openclaw/janus.git

# 推送代码和标签
git push -u origin main
git push origin v2.0.0

# 或者一次性推送所有
git push -u origin main --tags
```

---

### 3. 创建 GitHub Release

**选项 A: 使用 GitHub CLI**
```bash
gh release create v2.0.0 \
  --title "Janus (Janus) v2.0.0 - 完整第二记忆系统" \
  --notes-file GITHUB_RELEASE.md \
  --generate-notes
```

**选项 B: 手动创建**
1. 访问 https://github.com/openclaw/janus/releases/new
2. Tag version: `v2.0.0`
3. Release title: `Janus (Janus) v2.0.0 - 完整第二记忆系统`
4. 描述：复制 `GITHUB_RELEASE.md` 内容
5. 点击 "Publish release"

---

### 4. 验证推送

```bash
# 查看远程仓库
git remote -v

# 查看标签
git tag -l

# 查看提交历史
git log --oneline
```

访问 https://github.com/openclaw/janus 确认代码已推送。

---

## 📝 后续优化建议

### 1. 添加 GitHub Actions CI/CD

创建 `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm test
```

### 2. 添加 README 徽章

```markdown
![Tests](https://github.com/openclaw/janus/workflows/Tests/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![npm](https://img.shields.io/badge/npm-v2.0.0-red)
```

### 3. 发布到 npm (可选)

```bash
# 登录 npm
npm login

# 发布
npm publish --access public
```

### 4. 添加 CONTRIBUTING.md

贡献指南文件，说明如何贡献代码。

### 5. 添加 CODE_OF_CONDUCT.md

社区行为准则。

---

## 🎯 检查清单

发布前确认：

- [ ] 仓库已创建 (https://github.com/openclaw/janus)
- [ ] 代码已推送 (`git push origin main`)
- [ ] 标签已推送 (`git push origin v2.0.0`)
- [ ] Release 已创建 (包含完整发布说明)
- [ ] README.md 可正常显示
- [ ] LICENSE 文件存在
- [ ] 测试通过 (78/78)

---

## 📞 需要帮助？

如果遇到问题：

1. **Git 推送失败**: 检查远程仓库 URL 是否正确
2. **权限错误**: 确认有仓库写入权限
3. **标签冲突**: 删除本地标签 `git tag -d v2.0.0` 后重新创建

---

**祝发布顺利！** 🎉
