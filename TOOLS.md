# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## 📝 Lessons Learned

### Game Development
- **Mobile-first for games**: Always test on mobile devices. Include touch controls, responsive canvas sizing, and prevent default touch behaviors (scrolling, zooming).
- User jing reported breakout game didn't work on mobile (2026-03-10).

### Token Optimization
- **用户明确要求**（2026-03-11）：减少不必要的 token 消耗
- 简洁回复 > 冗长解释
- 引用链接 > 复制全文
- 合并工具调用 > 分开多次
- 写文件 > "记在脑子里"
- 详见 `docs/TOKEN-OPTIMIZATION.md`

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
