/**
 * Orchestra Worker 桥接器
 * 
 * 为 Worker 环境提供 Scratchpad 访问接口，支持跨 Worker 通信
 */

import { Scratchpad, createScratchpad, ScratchpadEntry, WriteOptions, ReadOptions, ListOptions, ClearOptions } from './scratchpad';
import { SyncManager, createSyncManager } from './sync-manager';
import { EventEmitter } from 'events';

// ==================== Worker 消息协议 ====================

export interface WorkerMessage {
  type: 'READ' | 'WRITE' | 'DELETE' | 'LIST' | 'CLEAR' | 'SYNC';
  key?: string;
  value?: any;
  options?: any;
  requestId: string;
  senderWorkerId: string;
}

export interface WorkerMessageResponse {
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
}

// ==================== Worker 桥接器配置 ====================

export interface WorkerBridgeOptions {
  storagePath: string;
  workerId: string;
  enableSync?: boolean;        // 是否启用跨 Worker 同步
  syncIntervalMs?: number;     // 同步间隔
  broadcastChanges?: boolean;  // 是否广播变更到其他 Worker
}

// ==================== Worker 桥接器 ====================

export class WorkerBridge extends EventEmitter {
  private scratchpad: Scratchpad;
  private syncManager?: SyncManager;
  private workerId: string;
  private options: WorkerBridgeOptions;
  private isInitialized = false;

  constructor(options: WorkerBridgeOptions) {
    super();
    this.options = options;
    this.workerId = options.workerId;
    this.scratchpad = new Scratchpad(options.storagePath, options.workerId);
  }

  /**
   * 初始化桥接器
   */
  async initialize(): Promise<void> {
    await this.scratchpad.initialize();

    if (this.options.enableSync) {
      this.syncManager = new SyncManager({
        storagePath: this.options.storagePath,
        workerId: this.workerId,
        syncIntervalMs: this.options.syncIntervalMs,
        autoSync: true,
      });
      await this.syncManager.initialize();

      // 监听同步事件
      this.syncManager.on('sync', (result) => {
        this.emit('sync', result);
      });

      this.syncManager.on('error', (error) => {
        this.emit('error', error);
      });
    }

    this.isInitialized = true;
    this.emit('ready');
  }

  /**
   * 写入数据
   */
  async write(key: string, value: any, options?: WriteOptions): Promise<ScratchpadEntry> {
    if (!this.isInitialized) {
      throw new Error('WorkerBridge not initialized');
    }

    const entry = await this.scratchpad.write(key, value, {
      ...options,
      workerId: this.workerId,
    });

    // 广播变更
    if (this.options.broadcastChanges) {
      this.broadcastChange('WRITE', key, entry);
    }

    return entry;
  }

  /**
   * 读取数据
   */
  async read(key: string, options?: ReadOptions): Promise<ScratchpadEntry | undefined> {
    if (!this.isInitialized) {
      throw new Error('WorkerBridge not initialized');
    }

    return await this.scratchpad.read(key, options);
  }

  /**
   * 获取值（便捷方法）
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    return await this.scratchpad.get(key, defaultValue);
  }

  /**
   * 删除数据
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('WorkerBridge not initialized');
    }

    const result = await this.scratchpad.delete(key);

    if (result && this.options.broadcastChanges) {
      this.broadcastChange('DELETE', key);
    }

    return result;
  }

  /**
   * 列出条目
   */
  async list(options?: ListOptions): Promise<ScratchpadEntry[]> {
    if (!this.isInitialized) {
      throw new Error('WorkerBridge not initialized');
    }

    return await this.scratchpad.list(options);
  }

  /**
   * 清除数据
   */
  async clear(options?: ClearOptions): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('WorkerBridge not initialized');
    }

    const result = await this.scratchpad.clear(options);

    if (result > 0 && this.options.broadcastChanges) {
      this.broadcastChange('CLEAR', undefined, undefined, options);
    }

    return result;
  }

  /**
   * 强制同步
   */
  async sync(): Promise<void> {
    if (!this.syncManager) {
      throw new Error('Sync is not enabled');
    }

    await this.syncManager.sync();
  }

  /**
   * 处理来自其他 Worker 的消息
   */
  async handleMessage(message: WorkerMessage): Promise<WorkerMessageResponse> {
    try {
      let data: any;

      switch (message.type) {
        case 'READ':
          data = await this.scratchpad.read(message.key!, message.options);
          break;

        case 'WRITE':
          data = await this.scratchpad.write(
            message.key!,
            message.value,
            message.options
          );
          break;

        case 'DELETE':
          data = await this.scratchpad.delete(message.key!);
          break;

        case 'LIST':
          data = await this.scratchpad.list(message.options);
          break;

        case 'CLEAR':
          data = await this.scratchpad.clear(message.options);
          break;

        case 'SYNC':
          if (this.syncManager) {
            data = await this.syncManager.sync();
          }
          break;

        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }

      return {
        requestId: message.requestId,
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        requestId: message.requestId,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 广播变更到其他 Worker
   */
  private broadcastChange(
    type: 'WRITE' | 'DELETE' | 'CLEAR',
    key?: string,
    entry?: ScratchpadEntry,
    options?: any
  ): void {
    const message: WorkerMessage = {
      type,
      key,
      value: entry?.value,
      options,
      requestId: `broadcast-${Date.now()}`,
      senderWorkerId: this.workerId,
    };

    // 通过事件机制广播（实际实现中可能通过 IPC、消息队列等）
    this.emit('broadcast', message);
  }

  /**
   * 获取 Scratchpad 实例
   */
  getScratchpad(): Scratchpad {
    return this.scratchpad;
  }

  /**
   * 获取 Worker ID
   */
  getWorkerId(): string {
    return this.workerId;
  }

  /**
   * 销毁桥接器
   */
  async destroy(): Promise<void> {
    if (this.syncManager) {
      await this.syncManager.destroy();
    }
    await this.scratchpad.destroy();
    this.emit('destroy');
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建并初始化 WorkerBridge
 */
export async function createWorkerBridge(
  options: WorkerBridgeOptions
): Promise<WorkerBridge> {
  const bridge = new WorkerBridge(options);
  await bridge.initialize();
  return bridge;
}

export default WorkerBridge;
