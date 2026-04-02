#!/usr/bin/env python3
"""
OpenClaw 自动状态更新钩子

功能：
- 监听 OpenClaw 事件
- 自动更新 status.json
- 任务开始/结束自动开关监控

使用方式：
1. 在 Gateway 启动时加载此钩子
2. 或作为独立进程运行，监控会话日志
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATUS_FILE = Path.home() / '.openclaw' / 'workspace' / 'status.json'

class AutoStatusHook:
    def __init__(self):
        self.current_task = None
        self.task_start_time = None
        self.subtasks = []
        
    def start_task(self, task_name, emoji="🔧", subtasks=None):
        """开始新任务"""
        self.current_task = task_name
        self.task_start_time = datetime.now()
        self.subtasks = subtasks or []
        
        self._write_status(
            enabled=True,
            current_task=task_name,
            progress=0,
            status="working",
            emoji=emoji,
            subtasks=[{"name": t, "done": False, "emoji": "⚡"} for t in self.subtasks]
        )
        
        print(f"[STATUS] 任务开始：{task_name}")
        
    def update_progress(self, progress, subtask_name=None):
        """更新进度"""
        if subtask_name:
            # 标记子任务完成
            for t in self.subtasks:
                if isinstance(t, dict) and t.get('name') == subtask_name:
                    t['done'] = True
                    t['emoji'] = '✅'
        
        self._write_status(
            enabled=True,
            current_task=self.current_task or "未知任务",
            progress=progress,
            status="working",
            emoji="🔧",
            subtasks=self.subtasks
        )
        
        print(f"[STATUS] 进度更新：{progress}%")
        
    def complete_task(self, task_name=None):
        """完成任务"""
        task = task_name or self.current_task or "任务"
        
        # 添加到已完成列表
        completed_tasks = self._read_completed_tasks()
        completed_tasks.append({
            "task": task,
            "completed_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "emoji": "✅"
        })
        
        # 保留最近 20 条记录
        completed_tasks = completed_tasks[-20:]
        
        self._write_status(
            enabled=False,
            current_task="待机中",
            progress=100,
            status="done",
            emoji="✅",
            completed_tasks=completed_tasks
        )
        
        print(f"[STATUS] 任务完成：{task}")
        self.current_task = None
        
    def _read_completed_tasks(self):
        """读取已完成任务列表"""
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('completed_tasks', [])
        except:
            return []
            
    def _write_status(self, enabled, current_task, progress, status, emoji, 
                     subtasks=None, completed_tasks=None):
        """写入状态文件"""
        # 读取现有统计数据
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                stats = existing.get('stats', {
                    "total_tasks": 21,
                    "completed": 15,
                    "working": 1,
                    "pending": 5,
                    "success_rate": "94%"
                })
        except:
            stats = {
                "total_tasks": 21,
                "completed": 15,
                "working": 1,
                "pending": 5,
                "success_rate": "94%"
            }
        
        data = {
            "enabled": enabled,
            "current_task": current_task,
            "progress": progress,
            "status": status,
            "emoji": emoji,
            "start_time": self.task_start_time.isoformat() if self.task_start_time else None,
            "estimated_end": None,
            "subtasks": subtasks or [],
            "completed_tasks": completed_tasks or [],
            "stats": stats
        }
        
        # 确保目录存在
        STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

# 全局钩子实例
hook = AutoStatusHook()

# OpenClaw 事件监听器（需要集成到 OpenClaw 中）
def on_user_message(message):
    """用户发送消息时调用"""
    # 检测是否是任务开始
    task_keywords = ['开始任务', '帮我', '创建', '生成', '制作', '设计', '写一个']
    
    for keyword in task_keywords:
        if keyword in message:
            # 提取任务名称
            task_name = message.split(keyword, 1)[1].strip() if keyword in message else "新任务"
            hook.start_task(task_name, emoji="🔧")
            break

def on_tool_call(tool_name, args):
    """工具调用时调用"""
    # 更新进度（简单估算）
    hook.update_progress(50, subtask_name=f"调用 {tool_name}")

def on_response_sent(response):
    """发送回复时调用"""
    # 检查任务是否完成
    if '完成' in response or '好了' in response or '✅' in response:
        hook.complete_task()

# 如果使用独立进程模式
if __name__ == '__main__':
    print("🔧 Auto Status Hook - OpenClaw 自动状态更新")
    print("此脚本需要集成到 OpenClaw 中才能自动工作")
    print("")
    print("集成方法：")
    print("1. 在 Gateway 启动时加载此钩子")
    print("2. 或修改 OpenClaw 源码，在关键位置调用 hook 方法")
    print("")
    print("手动测试：")
    print("  hook.start_task('测试任务', emoji='🧪')")
    print("  hook.update_progress(50)")
    print("  hook.complete_task()")
