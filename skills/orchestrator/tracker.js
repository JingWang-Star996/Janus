#!/usr/bin/env node

/**
 * Orchestrator v1.0 - 进度跟踪器
 * 
 * 功能：跟踪每个子任务状态，计算整体进度，写入 status.json
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 进度跟踪器配置
 */
const TRACKER_CONFIG = {
  statusFilePath: path.join(process.cwd(), 'skills/orchestrator/status.json'),
  updateInterval: 5000 // 5 秒更新一次
};

/**
 * 任务状态枚举
 */
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RETRYING: 'retrying'
};

/**
 * 初始化进度跟踪
 */
async function initProgress(mainTask, subtasks) {
  console.log('[Orchestrator.Tracker] 初始化进度跟踪...');
  
  const status = {
    task_id: generateTaskId(),
    main_task: mainTask,
    progress: 0,
    status: TaskStatus.RUNNING,
    subtasks: subtasks.map(subtask => ({
      ...subtask,
      status: TaskStatus.PENDING,
      retry_count: 0,
      started_at: null,
      completed_at: null
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // 写入 status.json
  await saveStatus(status);
  
  console.log('[Orchestrator.Tracker] 初始化完成，任务 ID:', status.task_id);
  
  return status;
}

/**
 * 更新子任务状态
 */
async function updateSubtaskStatus(taskId, subtaskId, status, output = null) {
  console.log('[Orchestrator.Tracker] 更新子任务状态...');
  console.log('[Orchestrator.Tracker] 子任务 ID:', subtaskId);
  console.log('[Orchestrator.Tracker] 状态:', status);
  
  // 读取当前状态
  const currentStatus = await loadStatus();
  
  if (!currentStatus || currentStatus.task_id !== taskId) {
    throw new Error('任务 ID 不匹配');
  }
  
  // 找到对应的子任务
  const subtaskIndex = currentStatus.subtasks.findIndex(s => s.id === subtaskId);
  
  if (subtaskIndex === -1) {
    throw new Error('子任务不存在');
  }
  
  // 更新状态
  const subtask = currentStatus.subtasks[subtaskIndex];
  subtask.status = status;
  
  if (status === TaskStatus.RUNNING) {
    subtask.started_at = new Date().toISOString();
  }
  
  if (status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) {
    subtask.completed_at = new Date().toISOString();
  }
  
  if (output) {
    subtask.output = output;
  }
  
  // 更新整体进度
  currentStatus.progress = calculateProgress(currentStatus.subtasks);
  currentStatus.status = calculateOverallStatus(currentStatus.subtasks);
  currentStatus.updated_at = new Date().toISOString();
  
  // 保存状态
  await saveStatus(currentStatus);
  
  console.log('[Orchestrator.Tracker] 更新完成，整体进度:', currentStatus.progress + '%');
  
  return currentStatus;
}

/**
 * 计算整体进度
 */
function calculateProgress(subtasks) {
  if (subtasks.length === 0) {
    return 0;
  }
  
  const completedCount = subtasks.filter(s => 
    s.status === TaskStatus.COMPLETED
  ).length;
  
  return Math.round((completedCount / subtasks.length) * 100);
}

/**
 * 计算整体状态
 */
function calculateOverallStatus(subtasks) {
  const hasFailed = subtasks.some(s => s.status === TaskStatus.FAILED);
  const hasRunning = subtasks.some(s => s.status === TaskStatus.RUNNING);
  const hasPending = subtasks.some(s => s.status === TaskStatus.PENDING);
  
  if (hasFailed) {
    return TaskStatus.FAILED;
  }
  
  if (hasRunning || hasPending) {
    return TaskStatus.RUNNING;
  }
  
  return TaskStatus.COMPLETED;
}

/**
 * 获取当前进度
 */
async function getProgress(taskId) {
  const status = await loadStatus();
  
  if (!status || status.task_id !== taskId) {
    return null;
  }
  
  return {
    task_id: status.task_id,
    main_task: status.main_task,
    progress: status.progress,
    status: status.status,
    total: status.subtasks.length,
    completed: status.subtasks.filter(s => s.status === TaskStatus.COMPLETED).length,
    failed: status.subtasks.filter(s => s.status === TaskStatus.FAILED).length,
    updated_at: status.updated_at
  };
}

/**
 * 生成任务 ID
 */
function generateTaskId() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `orch-${timestamp}`;
}

/**
 * 保存状态到文件
 */
async function saveStatus(status) {
  try {
    // 确保目录存在
    const dir = path.dirname(TRACKER_CONFIG.statusFilePath);
    await fs.mkdir(dir, { recursive: true });
    
    // 写入文件
    await fs.writeFile(
      TRACKER_CONFIG.statusFilePath,
      JSON.stringify(status, null, 2),
      'utf8'
    );
    
    console.log('[Orchestrator.Tracker] 状态已保存:', TRACKER_CONFIG.statusFilePath);
    
  } catch (e) {
    console.error('[Orchestrator.Tracker] 保存状态失败:', e.message);
    throw e;
  }
}

/**
 * 从文件加载状态
 */
async function loadStatus() {
  try {
    const content = await fs.readFile(TRACKER_CONFIG.statusFilePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    }
    console.error('[Orchestrator.Tracker] 加载状态失败:', e.message);
    throw e;
  }
}

// 导出
module.exports = {
  initProgress,
  updateSubtaskStatus,
  getProgress,
  saveStatus,
  loadStatus,
  TaskStatus,
  TRACKER_CONFIG
};
