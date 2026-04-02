#!/usr/bin/env python3
"""
OpenClaw 状态监控插件

安装方式：
1. 复制此文件到 OpenClaw 插件目录
2. 在 Gateway 配置中启用此插件
3. 重启 Gateway

功能：
- 自动监控用户消息
- 识别任务意图
- 自动更新 status.json
- 零 Token 消耗（本地文件操作）
"""

import json
import re
from pathlib import Path
from datetime import datetime

STATUS_FILE = Path('/home/z3129119/.openclaw/workspace/status.json')

class StatusMonitorPlugin:
    """OpenClaw 状态监控插件"""
    
    def __init__(self):
        self.name = "status-monitor"
        self.version = "1.0.0"
        self.enabled = True
        self.current_task = None
        
        # 任务关键词
        self.task_keywords = [
            '开始任务', '帮我', '创建', '生成', '制作', '设计',
            '写一个', '做一个', '开发', '实现', '配置', '设置'
        ]
        
        # 完成关键词
        self.done_keywords = [
            '完成了', '做好了', '已经', '搞定', '完毕',
            '✅', '完成', '好了', '好了！'
        ]
        
    def on_message_received(self, message, sender):
        """
        用户消息接收回调
        
        @param message: 用户消息内容
        @param sender: 发送者 ID
        """
        if not self.enabled:
            return
            
        # 检测是否是任务开始
        if self._is_task_start(message):
            task_name = self._extract_task_name(message)
            self._start_task(task_name)
            
    def on_response_sent(self, response, sender):
        """
        AI 回复发送回调
        
        @param response: AI 回复内容
        @param sender: 接收者 ID
        """
        if not self.enabled:
            return
            
        # 检测任务是否完成
        if self._is_task_done(response):
            self._complete_task()
            
    def _is_task_start(self, message):
        """检测是否是任务开始"""
        # 已经有任务在进行中，不重复开启
        if self.current_task:
            return False
            
        # 检测关键词
        for keyword in self.task_keywords:
            if keyword in message:
                return True
        return False
        
    def _is_task_done(self, response):
        """检测任务是否完成"""
        if not self.current_task:
            return False
            
        # 检测完成关键词
        for keyword in self.done_keywords:
            if keyword in response:
                return True
        return False
        
    def _extract_task_name(self, message):
        """从消息中提取任务名称"""
        # 尝试提取"开始任务："后的内容
        match = re.search(r'开始任务 [：:]\s*(.+)', message)
        if match:
            return match.group(1).strip()
            
        # 否则使用整个消息
        return message.strip()[:50]
        
    def _start_task(self, task_name):
        """开始任务"""
        self.current_task = task_name
        
        # 写入状态文件
        self._write_status(
            enabled=True,
            current_task=task_name,
            progress=0,
            status="working",
            emoji="🔧"
        )
        
        print(f"[StatusMonitor] 任务开始：{task_name}")
        
    def _complete_task(self):
        """完成任务"""
        if not self.current_task:
            return
            
        task_name = self.current_task
        self.current_task = None
        
        # 添加到已完成列表
        completed = self._read_completed_tasks()
        completed.append({
            "task": task_name,
            "completed_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "emoji": "✅"
        })
        completed = completed[-20:]  # 保留最近 20 条
        
        # 写入状态文件
        self._write_status(
            enabled=False,
            current_task="待机中",
            progress=100,
            status="done",
            emoji="✅",
            completed_tasks=completed
        )
        
        print(f"[StatusMonitor] 任务完成：{task_name}")
        
    def update_progress(self, progress, subtask=None):
        """更新进度"""
        if not self.current_task:
            return
            
        self._write_status(
            enabled=True,
            current_task=self.current_task,
            progress=progress,
            status="working",
            emoji="🔧"
        )
        
    def _write_status(self, enabled, current_task, progress, status, emoji,
                     completed_tasks=None):
        """写入状态文件"""
        # 读取现有数据
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
                if completed_tasks is None:
                    completed_tasks = existing.get('completed_tasks', [])
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
            "start_time": datetime.now().isoformat(),
            "estimated_end": None,
            "subtasks": [],
            "completed_tasks": completed_tasks or [],
            "stats": stats
        }
        
        # 确保目录存在
        STATUS_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
    def _read_completed_tasks(self):
        """读取已完成任务"""
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('completed_tasks', [])
        except:
            return []

# 插件实例
plugin = StatusMonitorPlugin()

# OpenClaw 钩子注册（需要 OpenClaw 支持）
def register_hooks(gateway):
    """注册到 OpenClaw Gateway"""
    gateway.on_message_received(plugin.on_message_received)
    gateway.on_response_sent(plugin.on_response_sent)
    print(f"[StatusMonitor] 插件已加载 v{plugin.version}")

# 如果使用独立进程模式
if __name__ == '__main__':
    print("🔧 OpenClaw Status Monitor Plugin v1.0.0")
    print("")
    print("安装说明：")
    print("1. 复制此文件到 ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/plugins/")
    print("2. 在 openclaw.json 中启用插件：")
    print('   "plugins": ["status-monitor"]')
    print("3. 重启 Gateway: openclaw gateway restart")
    print("")
    print("功能：")
    print("- 自动识别任务开始（关键词：开始任务/帮我/创建/生成等）")
    print("- 自动识别任务完成（关键词：完成了/好了/✅等）")
    print("- 自动更新 status.json")
    print("- 零 Token 消耗（本地文件操作）")
