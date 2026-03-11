#!/usr/bin/env python3
"""
使用通义万相 wanx-v1 异步生成头像图片
"""

import requests
import json
import time

API_KEY = "sk-6e5325a331b145049ead02ffbf1bd27d"
# 异步提交 URL
SUBMIT_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"

PROMPT = "一个可爱友好的 AI 助手头像，机器人形象，科技感但温暖，蓝白色调，简约现代风格，圆形头像，高清，专业设计，3D 渲染，C4D 风格，柔和光线，白色背景"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-DashScope-Async": "enable"  # 启用异步
}

payload = {
    "model": "wanx-v1",
    "input": {
        "prompt": PROMPT
    },
    "parameters": {
        "size": "1024*1024",
        "n": 1
    }
}

print("🎨 正在生成头像...")
print(f"Prompt: {PROMPT}")
print()

# 提交任务
response = requests.post(SUBMIT_URL, headers=headers, json=payload)

if response.status_code != 200:
    print(f"❌ 提交失败：{response.status_code}")
    print(response.text)
    exit(1)

result = response.json()
task_id = result.get("output", {}).get("task_id")

if not task_id:
    print("❌ 未获取到 task_id")
    print(json.dumps(result, indent=2))
    exit(1)

print(f"✅ 任务已提交：{task_id}")
print("⏳ 等待生成...")

# 查询任务
TASK_URL = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"

for i in range(60):
    time.sleep(2)
    
    r = requests.get(TASK_URL, headers=headers)
    if r.status_code == 200:
        tr = r.json()
        status = tr.get("output", {}).get("task_status", "UNKNOWN")
        print(f"  状态：{status} ({i+1}/60)")
        
        if status == "SUCCEEDED":
            print("\n✅ 成功！")
            results = tr.get("output", {}).get("results", [])
            if results:
                url = results[0].get("url")
                print(f"🖼️ URL: {url}")
                
                # 下载
                img = requests.get(url)
                if img.status_code == 200:
                    with open("/home/z3129119/.openclaw/workspace/avatar.png", "wb") as f:
                        f.write(img.content)
                    print("✅ 已保存：avatar.png")
            break
        elif status in ["FAILED", "CANCELED"]:
            print(f"\n❌ 失败：{tr}")
            break
else:
    print("\n⏰ 超时")
