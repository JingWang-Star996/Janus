#!/usr/bin/env python3
"""
使用通义万相生成头像图片
"""

import requests
import json
import time

API_KEY = "sk-6e5325a331b145049ead02ffbf1bd27d"
API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

# 头像 prompt
PROMPT = """
一个可爱友好的 AI 助手头像，机器人形象，科技感但温暖，
蓝白色调，简约现代风格，圆形头像，高清，专业设计
"""

# 异步任务提交 URL
SUBMIT_URL = API_URL

# 异步任务查询 URL
TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "wanx-v1",
    "input": {
        "prompt": PROMPT
    },
    "parameters": {
        "style": "<auto>",
        "size": "1024*1024",
        "n": 1
    }
}

print("🎨 正在生成头像...")
print(f"Prompt: {PROMPT}")
print()

# Step 1: 提交任务
response = requests.post(SUBMIT_URL, headers=headers, json=payload)

if response.status_code != 200:
    print(f"❌ 提交失败：{response.status_code}")
    print(response.text)
    exit(1)

result = response.json()
print("📤 任务已提交")
task_id = result.get("output", {}).get("task_id")

if not task_id:
    print("❌ 未获取到 task_id")
    print(json.dumps(result, indent=2))
    exit(1)

print(f"Task ID: {task_id}")
print()

# Step 2: 轮询任务状态
print("⏳ 等待生成完成...")
for i in range(30):  # 最多等待 30 次
    time.sleep(2)
    
    task_response = requests.get(f"{TASK_URL}/{task_id}", headers=headers)
    if task_response.status_code != 200:
        print(f"❌ 查询失败：{task_response.status_code}")
        continue
    
    task_result = task_response.json()
    task_status = task_result.get("output", {}).get("task_status", "UNKNOWN")
    
    print(f"  状态：{task_status} ({i+1}/30)")
    
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
        print(f"\n❌ 任务失败：{task_result}")
        break
else:
    print("\n⏰ 超时，任务仍在进行中")
    print(f"你可以稍后用 task_id 查询：{task_id}")
