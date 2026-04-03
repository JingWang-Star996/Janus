/**
 * Orchestra Scratchpad - 跨 Worker 知识共享系统
 * 
 * 提供轻量级的键值存储，支持多个 Worker 之间的状态共享和同步
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

// ==================== 数据结构定义 ====================

/**
 * Scratchpad 条目元数据
 */
export interface ScratchpadEntry {
  key: string;              // 唯一标识符
  value: any;               // 存储的值（支持任意 JSON 可序列化类型）
  createdAt: number;        // 创建时间戳（毫秒）
  updatedAt: number;        // 最后更新时间戳（毫秒）
  version: number;          // 版本号（每次更新递增）
  workerId?: string;        // 最后写入的 Worker ID
  ttl?: number;             // 过期时间（毫秒），可选
  expiresAt?: number;       // 过期时间戳（毫秒），可选
  tags?: string[];          // 标签数组，用于分类检索
  metadata?: Record<string, any>; // 自定义元数据
}

/**
 * Scratchpad 数据存储结构
 */
export interface ScratchpadData {
  entries: Map<string, ScratchpadEntry>;
  version: number;          // 全局版本号
  lastSyncAt: number;       // 最后同步时间
}

/**
 * 读取选项
 */
export interface ReadOptions {
  includeExpired?: boolean; // 是否包含已过期的条目
  parseJson?: boolean;      // 是否自动解析 JSON 字符串
}

/**
 * 写入选项
 */
export interface WriteOptions {
  ttl?: number;             // 生存时间（毫秒）
  tags?: string[];          // 标签
  metadata?: Record<string, any>; // 自定义元数据
  workerId?: string;        // Worker ID
  overwrite?: boolean;      // 是否覆盖已存在的键（默认 true）
}

/**
 * 列表选项
 */
export interface ListOptions {
  pattern?: string;         // 键名匹配模式（支持通配符 *）
  tags?: string[];          // 按标签过滤
  includeExpired?: boolean; // 是否包含过期条目
  limit?: number;           // 返回数量限制
  offset?: number;          // 偏移量
}

/**
 * 清除选项
 */
export interface ClearOptions {
  pattern?: string;         // 按模式清除
  tags?: string[];          // 按标签清除
  expiredOnly?: boolean;    // 仅清除过期条目
}

// ==================== 事件定义 ====================

export interface ScratchpadEvents {
  'write': (key: string, entry: ScratchpadEntry) => void;
  'delete': (key: string) => void;
  'clear': () => void;
  'sync': (data: ScratchpadData) => void;
  'error': (error: Error) => void;
  'expired': (key: string) => void;
}

// ==================== 工具函数 ====================

/**
 * 检查条目是否已过期
 */
function isExpired(entry: ScratchpadEntry): boolean {
  if (!entry.expiresAt) return false;
  return Date.now() > entry.expiresAt;
}

/**
 * 深拷贝对象
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== Scratchpad 类实现 ====================

export class Scratchpad extends EventEmitter {
  private data: Map<string, ScratchpadEntry>;
  private storagePath: string;
  private workerId: string;
  private version: number = 1;
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 100;
  private readonly EXPIRY_CHECK_INTERVAL_MS = 60000; // 1 分钟
  private expiryCheckTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * 创建 Scratchpad 实例
   * @param storagePath 持久化存储路径
   * @param workerId 当前 Worker 的唯一标识
   */
  constructor(storagePath: string, workerId?: string) {
    super();
    this.storagePath = storagePath;
    this.workerId = workerId || `worker-${generateId()}`;
    this.data = new Map();
  }

  /**
   * 初始化 Scratchpad（加载持久化数据）
   */
  async initialize(): Promise<void> {
    try {
      await this.load();
      this.startExpiryCheck();
      this.isInitialized = true;
      this.emit('sync', this.exportData());
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 写入数据
   * @param key 键名
   * @param value 值
   * @param options 写入选项
   * @returns 写入的条目
   */
  async write(key: string, value: any, options: WriteOptions = {}): Promise<ScratchpadEntry> {
    if (!this.isInitialized) {
      throw new Error('Scratchpad not initialized. Call initialize() first.');
    }

    const now = Date.now();
    const existing = this.data.get(key);
    
    // 检查是否允许覆盖
    if (existing && options.overwrite === false) {
      throw new Error(`Key "${key}" already exists and overwrite is disabled.`);
    }

    const entry: ScratchpadEntry = {
      key,
      value: typeof value === 'string' ? value : deepClone(value),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      version: (existing?.version || 0) + 1,
      workerId: options.workerId || this.workerId,
      tags: options.tags ? [...options.tags] : undefined,
      metadata: options.metadata ? deepClone(options.metadata) : undefined,
    };

    // 设置 TTL
    if (options.ttl) {
      entry.ttl = options.ttl;
      entry.expiresAt = now + options.ttl;
    }

    this.data.set(key, entry);
    this.version++;
    
    // 防抖保存
    this.scheduleSave();
    
    // 触发事件
    this.emit('write', key, entry);

    return entry;
  }

  /**
   * 读取数据
   * @param key 键名
   * @param options 读取选项
   * @returns 条目或 undefined
   */
  async read(key: string, options: ReadOptions = {}): Promise<ScratchpadEntry | undefined> {
    if (!this.isInitialized) {
      throw new Error('Scratchpad not initialized. Call initialize() first.');
    }

    const entry = this.data.get(key);
    if (!entry) return undefined;

    // 检查是否过期
    if (isExpired(entry) && !options.includeExpired) {
      return undefined;
    }

    return deepClone(entry);
  }

  /**
   * 获取值（便捷方法）
   * @param key 键名
   * @param defaultValue 默认值（如果键不存在）
   * @returns 值或默认值
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    const entry = await this.read(key);
    if (!entry) {
      return defaultValue as T;
    }
    return entry.value as T;
  }

  /**
   * 删除数据
   * @param key 键名
   * @returns 是否删除成功
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Scratchpad not initialized. Call initialize() first.');
    }

    const existed = this.data.delete(key);
    if (existed) {
      this.version++;
      this.scheduleSave();
      this.emit('delete', key);
    }
    return existed;
  }

  /**
   * 列出条目
   * @param options 列表选项
   * @returns 条目数组
   */
  async list(options: ListOptions = {}): Promise<ScratchpadEntry[]> {
    if (!this.isInitialized) {
      throw new Error('Scratchpad not initialized. Call initialize() first.');
    }

    let entries = Array.from(this.data.values());

    // 过滤过期条目
    if (!options.includeExpired) {
      entries = entries.filter(e => !isExpired(e));
    }

    // 按模式过滤
    if (options.pattern) {
      const regex = new RegExp(
        '^' + options.pattern.replace(/\*/g, '.*') + '$'
      );
      entries = entries.filter(e => regex.test(e.key));
    }

    // 按标签过滤
    if (options.tags && options.tags.length > 0) {
      entries = entries.filter(e => 
        e.tags && options.tags!.some(tag => e.tags!.includes(tag))
      );
    }

    // 排序（按更新时间降序）
    entries.sort((a, b) => b.updatedAt - a.updatedAt);

    // 分页
    const offset = options.offset || 0;
    const limit = options.limit || entries.length;
    entries = entries.slice(offset, offset + limit);

    return entries.map(e => deepClone(e));
  }

  /**
   * 清除数据
   * @param options 清除选项
   * @returns 清除的条目数量
   */
  async clear(options: ClearOptions = {}): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Scratchpad not initialized. Call initialize() first.');
    }

    let keysToDelete: string[] = [];

    if (options.expiredOnly) {
      // 仅清除过期条目
      keysToDelete = Array.from(this.data.entries())
        .filter(([, entry]) => isExpired(entry))
        .map(([key]) => key);
    } else if (options.pattern || (options.tags && options.tags.length > 0)) {
      // 按模式或标签清除
      let entries = Array.from(this.data.values());

      if (options.pattern) {
        const regex = new RegExp(
          '^' + options.pattern.replace(/\*/g, '.*') + '$'
        );
        entries = entries.filter(e => regex.test(e.key));
      }

      if (options.tags && options.tags.length > 0) {
        entries = entries.filter(e => 
          e.tags && options.tags!.some(tag => e.tags!.includes(tag))
        );
      }

      keysToDelete = entries.map(e => e.key);
    } else {
      // 清除所有
      keysToDelete = Array.from(this.data.keys());
    }

    // 执行删除
    for (const key of keysToDelete) {
      this.data.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.version++;
      this.scheduleSave();
      this.emit('clear');
    }

    return keysToDelete.length;
  }

  /**
   * 检查键是否存在
   */
  async has(key: string): Promise<boolean> {
    const entry = await this.read(key);
    return entry !== undefined;
  }

  /**
   * 获取所有键名
   */
  async keys(): Promise<string[]> {
    const entries = await this.list();
    return entries.map(e => e.key);
  }

  /**
   * 获取存储大小（条目数量）
   */
  size(): number {
    return this.data.size;
  }

  /**
   * 导出完整数据（用于同步）
   */
  exportData(): ScratchpadData {
    return {
      entries: new Map(this.data),
      version: this.version,
      lastSyncAt: Date.now(),
    };
  }

  /**
   * 导入数据（用于同步）
   */
  importData(data: ScratchpadData): void {
    this.data = new Map(data.entries);
    this.version = data.version;
    this.emit('sync', data);
    this.scheduleSave();
  }

  /**
   * 保存到文件系统
   */
  async save(): Promise<void> {
    try {
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });

      const serializableData = {
        version: this.version,
        entries: Array.from(this.data.entries()),
        savedAt: Date.now(),
      };

      await fs.writeFile(
        this.storagePath,
        JSON.stringify(serializableData, null, 2),
        'utf-8'
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 从文件系统加载
   */
  async load(): Promise<void> {
    try {
      const exists = await fs.access(this.storagePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return; // 文件不存在，使用空数据
      }

      const content = await fs.readFile(this.storagePath, 'utf-8');
      const data = JSON.parse(content);

      this.version = data.version || 1;
      this.data = new Map(data.entries || []);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * 清理过期条目
   */
  async cleanupExpired(): Promise<number> {
    return await this.clear({ expiredOnly: true });
  }

  /**
   * 启动过期检查定时器
   */
  private startExpiryCheck(): void {
    this.expiryCheckTimer = setInterval(async () => {
      const count = await this.cleanupExpired();
      if (count > 0) {
        // 触发自定义事件
        for (let i = 0; i < count; i++) {
          // 注意：这里简化处理，实际应该追踪具体哪些键过期了
        }
      }
    }, this.EXPIRY_CHECK_INTERVAL_MS);

    // 允许进程退出时自动清理
    this.expiryCheckTimer.unref();
  }

  /**
   * 防抖保存
   */
  private scheduleSave(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.save().catch(err => this.emit('error', err));
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * 停止定时器并保存
   */
  async destroy(): Promise<void> {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    if (this.expiryCheckTimer) {
      clearInterval(this.expiryCheckTimer);
    }
    await this.save();
  }

  /**
   * 获取 Worker ID
   */
  getWorkerId(): string {
    return this.workerId;
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建并初始化 Scratchpad 实例
 */
export async function createScratchpad(
  storagePath: string,
  workerId?: string
): Promise<Scratchpad> {
  const scratchpad = new Scratchpad(storagePath, workerId);
  await scratchpad.initialize();
  return scratchpad;
}

// ==================== 默认导出 ====================

export default Scratchpad;
