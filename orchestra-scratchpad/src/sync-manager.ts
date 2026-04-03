/**
 * Orchestra Scratchpad 同步管理器
 * 
 * 负责多个 Worker 之间的数据同步，使用文件锁机制保证并发安全
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Scratchpad, ScratchpadData, ScratchpadEntry } from './scratchpad';
import { EventEmitter } from 'events';

// ==================== 文件锁实现 ====================

interface FileLock {
  pid: number;
  workerId: string;
  acquiredAt: number;
}

class FileLockManager {
  private lockPath: string;
  private currentLock: FileLock | null = null;
  private readonly LOCK_TIMEOUT_MS = 30000; // 30 秒超时

  constructor(lockPath: string) {
    this.lockPath = lockPath;
  }

  /**
   * 尝试获取锁
   */
  async acquire(workerId: string): Promise<boolean> {
    try {
      // 检查锁文件是否存在
      const exists = await fs.access(this.lockPath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        // 读取现有锁
        const content = await fs.readFile(this.lockPath, 'utf-8');
        const lock: FileLock = JSON.parse(content);

        // 检查锁是否超时
        const now = Date.now();
        if (now - lock.acquiredAt < this.LOCK_TIMEOUT_MS) {
          // 锁仍然有效
          if (lock.workerId === workerId) {
            // 是自己持有的锁
            this.currentLock = lock;
            return true;
          }
          // 锁被其他 Worker 持有
          return false;
        }
        // 锁已超时，可以抢占
      }

      // 获取锁
      const newLock: FileLock = {
        pid: process.pid,
        workerId,
        acquiredAt: Date.now(),
      };

      await fs.writeFile(
        this.lockPath,
        JSON.stringify(newLock),
        { flag: 'wx' } // 排他写入，文件已存在则失败
      );

      this.currentLock = newLock;
      return true;
    } catch (error: any) {
      if (error.code === 'EEXIST') {
        // 文件已存在（竞态条件）
        return false;
      }
      throw error;
    }
  }

  /**
   * 释放锁
   */
  async release(): Promise<void> {
    if (!this.currentLock) return;

    try {
      await fs.unlink(this.lockPath);
      this.currentLock = null;
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 刷新锁（延长有效期）
   */
  async refresh(): Promise<boolean> {
    if (!this.currentLock) return false;

    try {
      this.currentLock.acquiredAt = Date.now();
      await fs.writeFile(
        this.lockPath,
        JSON.stringify(this.currentLock),
        'utf-8'
      );
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== 同步管理器 ====================

export interface SyncManagerOptions {
  storagePath: string;
  workerId: string;
  syncIntervalMs?: number;      // 自动同步间隔（默认 5000ms）
  autoSync?: boolean;           // 是否启用自动同步（默认 true）
}

export interface SyncResult {
  success: boolean;
  merged: number;               // 合并的条目数
  conflicts: number;            // 冲突数
  error?: string;
}

export class SyncManager extends EventEmitter {
  private scratchpad: Scratchpad;
  private lockManager: FileLockManager;
  private storagePath: string;
  private workerId: string;
  private syncIntervalMs: number;
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private lastSyncAt = 0;

  constructor(options: SyncManagerOptions) {
    super();
    this.storagePath = options.storagePath;
    this.workerId = options.workerId;
    this.syncIntervalMs = options.syncIntervalMs || 5000;
    
    this.scratchpad = new Scratchpad(options.storagePath, options.workerId);
    this.lockManager = new FileLockManager(
      path.join(path.dirname(options.storagePath), '.scratchpad.lock')
    );
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    await this.scratchpad.initialize();
    
    if (this.syncIntervalMs > 0) {
      this.startAutoSync();
    }
  }

  /**
   * 获取 Scratchpad 实例
   */
  getScratchpad(): Scratchpad {
    return this.scratchpad;
  }

  /**
   * 执行同步
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        merged: 0,
        conflicts: 0,
        error: 'Sync already in progress',
      };
    }

    this.isSyncing = true;

    try {
      // 尝试获取锁
      const lockAcquired = await this.lockManager.acquire(this.workerId);
      if (!lockAcquired) {
        return {
          success: false,
          merged: 0,
          conflicts: 0,
          error: 'Failed to acquire lock',
        };
      }

      try {
        // 读取持久化文件
        const diskData = await this.readDiskData();
        const localData = this.scratchpad.exportData();

        // 合并数据
        const { merged, conflicts } = await this.mergeData(diskData, localData);

        // 保存合并后的数据
        await this.scratchpad.save();
        this.lastSyncAt = Date.now();

        this.emit('sync', { merged, conflicts });

        return {
          success: true,
          merged,
          conflicts,
        };
      } finally {
        // 释放锁
        await this.lockManager.release();
      }
    } catch (error: any) {
      this.emit('error', error);
      return {
        success: false,
        merged: 0,
        conflicts: 0,
        error: error.message,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 从磁盘读取数据
   */
  private async readDiskData(): Promise<ScratchpadData> {
    try {
      const exists = await fs.access(this.storagePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return {
          entries: new Map(),
          version: 0,
          lastSyncAt: 0,
        };
      }

      const content = await fs.readFile(this.storagePath, 'utf-8');
      const data = JSON.parse(content);

      return {
        entries: new Map(data.entries || []),
        version: data.version || 0,
        lastSyncAt: data.savedAt || 0,
      };
    } catch (error) {
      return {
        entries: new Map(),
        version: 0,
        lastSyncAt: 0,
      };
    }
  }

  /**
   * 合并数据（使用最后写入获胜策略）
   */
  private async mergeData(
    diskData: ScratchpadData,
    localData: ScratchpadData
  ): Promise<{ merged: number; conflicts: number }> {
    let merged = 0;
    let conflicts = 0;

    // 合并磁盘数据到本地
    for (const [key, diskEntry] of diskData.entries) {
      const localEntry = localData.entries.get(key);

      if (!localEntry) {
        // 本地没有，直接添加
        this.scratchpad.importData({
          entries: new Map([[key, diskEntry]]),
          version: localData.version + 1,
          lastSyncAt: Date.now(),
        });
        merged++;
      } else {
        // 都存在，检查版本和时间戳
        if (diskEntry.updatedAt > localEntry.updatedAt) {
          // 磁盘数据更新，覆盖本地
          this.scratchpad.importData({
            entries: new Map([[key, diskEntry]]),
            version: localData.version + 1,
            lastSyncAt: Date.now(),
          });
          merged++;
          conflicts++;
        }
      }
    }

    return { merged, conflicts };
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(): void {
    this.stopAutoSync();
    
    this.autoSyncTimer = setInterval(async () => {
      await this.sync();
    }, this.syncIntervalMs);

    this.autoSyncTimer.unref();
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }

  /**
   * 销毁（清理资源）
   */
  async destroy(): Promise<void> {
    this.stopAutoSync();
    await this.lockManager.release();
    await this.scratchpad.destroy();
  }

  /**
   * 获取最后同步时间
   */
  getLastSyncAt(): number {
    return this.lastSyncAt;
  }

  /**
   * 是否正在同步
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建并初始化 SyncManager
 */
export async function createSyncManager(
  options: SyncManagerOptions
): Promise<SyncManager> {
  const manager = new SyncManager(options);
  await manager.initialize();
  return manager;
}

export default SyncManager;
