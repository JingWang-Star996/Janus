# 📋 忆匣 (YiXia) v2.0.0 发布检查清单

## ✅ 本地准备工作 (已完成)

- [x] Git 仓库初始化
- [x] 初始提交 (commit c41eb5f)
- [x] 创建 v2.0.0 标签
- [x] 添加 LICENSE (MIT)
- [x] 添加 GITHUB_RELEASE.md
- [x] 添加 QUICK_PUSH.sh 脚本
- [x] 测试通过 (78/78)
- [x] package.json 更新为 v2.0.0

---

## 🚀 GitHub 发布步骤 (需手动执行)

### 1️⃣ 创建 GitHub 仓库

**URL**: https://github.com/new

- **Repository name**: `yixia`
- **Owner**: `openclaw` (或个人账号)
- **Visibility**: Public ✅
- **Initialize**: ❌ 不要勾选

---

### 2️⃣ 推送代码

**方法 A: 使用快速脚本**
```bash
cd /home/z3129119/.openclaw/workspace/yixia
./QUICK_PUSH.sh openclaw yixia
```

**方法 B: 手动推送**
```bash
cd /home/z3129119/.openclaw/workspace/yixia

# 添加远程仓库
git remote add origin https://github.com/openclaw/yixia.git

# 推送代码和标签
git push -u origin main
git push origin v2.0.0
```

---

### 3️⃣ 创建 GitHub Release

**URL**: https://github.com/openclaw/yixia/releases/new

- **Tag version**: `v2.0.0`
- **Target**: `main`
- **Release title**: `忆匣 (YiXia) v2.0.0 - 完整第二记忆系统`
- **Description**: 复制 `GITHUB_RELEASE.md` 内容
- **Publish**: 点击 "Publish release"

---

### 4️⃣ 验证发布

- [ ] 访问 https://github.com/openclaw/yixia 确认代码显示正常
- [ ] 访问 https://github.com/openclaw/yixia/releases 确认 Release 已创建
- [ ] 检查 README.md 渲染是否正确
- [ ] 检查 LICENSE 文件是否存在

---

## 📊 发布后优化 (可选)

### GitHub Actions CI/CD

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

### 发布到 npm

```bash
npm login
npm publish --access public
```

### 添加徽章到 README

```markdown
![Tests](https://github.com/openclaw/yixia/workflows/Tests/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-red.svg)
```

---

## 📞 问题排查

### Git 推送失败
```bash
# 检查远程仓库 URL
git remote -v

# 如果有误，删除后重新添加
git remote remove origin
git remote add origin https://github.com/openclaw/yixia.git
```

### 标签冲突
```bash
# 删除本地标签
git tag -d v2.0.0

# 重新创建
git tag -a v2.0.0 -m "忆匣 (YiXia) v2.0.0"
```

### 权限错误
确认你有仓库写入权限，或使用 Personal Access Token。

---

## 🎉 发布成功！

发布后更新以下文档：
- [ ] 更新 MEMORY.md 记录发布信息
- [ ] 通知团队成员
- [ ] 在社交媒体分享（可选）

---

**最后更新**: 2026-04-07 17:49  
**版本**: v2.0.0
