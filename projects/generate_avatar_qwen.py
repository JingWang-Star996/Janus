#!/usr/bin/env python3
"""
使用 Qwen-Image-2.0 生成头像图片
"""

import requests
import json
import time
import os

API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")
if not API_KEY:
    print("❌ 错误：请设置环境变量 DASHSCOPE_API_KEY")
    print("   运行：export DASHSCOPE_API_KEY=your_api_key")
    exit(1)

# Qwen-Image-2.0 图像生成 API
API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

# 头像 prompt
PROMPT = "一个可爱友好的 AI 助手头像，机器人形象，科技感但温暖，蓝白色调，简约现代风格，圆形头像，高清，专业设计，3D 渲染，C4D 风格，柔和光线，白色背景"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 使用通义万相 wanx-v1 模型
payload = {
    "model": "wanx-v1",
    "input": {
        "prompt": PROMPT
    },
    "parameters": {
        "size": "1024*1024",
        "n": 1,
        "style": "<auto>"
    }
}

print("🎨 正在使用 Qwen-Image-2.0 生成头像...")
print(f"Prompt: {PROMPT}")
print()

# 提交异步任务
response = requests.post(API_URL, headers=headers, json=payload)

if response.status_code != 200:
    print(f"❌ 提交失败：{response.status_code}")
    print(response.text)
    exit(1)

result = response.json()
print("📤 任务已提交")

# 获取 task_id
task_id = result.get("output", {}).get("task_id")
if not task_id:
    print("❌ 未获取到 task_id")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    exit(1)

print(f"Task ID: {task_id}")
print()

# 轮询任务状态
TASK_URL = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
print("⏳ 等待生成完成...")

for i in range(60):
    time.sleep(2)
    
    task_response = requests.get(TASK_URL, headers=headers)
    if task_response.status_code != 200:
        print(f"❌ 查询失败：{task_response.status_code}")
        continue
    
    task_result = task_response.json()
    task_status = task_result.get("output", {}).get("task_status", "UNKNOWN")
    
    print(f"  状态：{task_status} ({i+1}/60)")
    
    if task_status == "SUCCEEDED":
        print("\n✅ 生成成功！")
        
        # 提取图片 URL
        results = task_result.get("output", {}).get("results", [])
        if results:
            image_url = results[0].get("url")
            print(f"\n🖼️ 图片 URL: {image_url}")
            
            # 下载图片
            print("\n⬇️  正在下载图片...")
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                with open("/home/z3129119/.openclaw/workspace/avatar.png", "wb") as f:
                    f.write(img_response.content)
                print("✅ 图片已保存到：/home/z3129119/.openclaw/workspace/avatar.png")
            else:
                print(f"❌ 下载失败：{img_response.status_code}")
        break
    elif task_status in ["FAILED", "CANCELED"]:
        print(f"\n❌ 任务失败：{json.dumps(task_result, indent=2, ensure_ascii=False)}")
        break
else:
    print("\n⏰ 超时，任务仍在进行中")
    print(f"Task ID: {task_id}")
