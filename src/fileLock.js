/**
 * 文件锁机制 - 防止并发写入冲突
 * 简单的基于文件的锁实现，保证数据一致性
 */

const fs = require('fs');
const path = require('path');

class FileLock {
  constructor(lockDir = '../data/locks') {
    this.lockDir = path.resolve(__dirname, lockDir);
    this._ensureLockDir();
    this._locks = new Map(); // 内存中的锁状态
  }

  _ensureLockDir() {
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  /**
   * 获取锁文件路径
   * @param {string} resourceId - 资源 ID（文件路径或资源标识）
   * @returns {string} 锁文件路径
   */
  _getLockFile(resourceId) {
    // 将路径转换为安全的文件名
    const safeName = resourceId.replace(/[\/\\:]/g, '_');
    return path.join(this.lockDir, `${safeName}.lock`);
  }

  /**
   * 尝试获取锁（非阻塞）
   * @param {string} resourceId - 资源 ID
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<boolean>} 是否成功获取锁
   */
  async tryAcquire(resourceId, timeout = 5000) {
    const lockFile = this._getLockFile(resourceId);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // 检查锁文件是否存在且未过期
        if (fs.existsSync(lockFile)) {
          const lockContent = fs.readFileSync(lockFile, 'utf-8');
          const lockData = JSON.parse(lockContent);
          
          // 检查锁是否过期（超过 30 秒视为死锁）
          const lockAge = Date.now() - lockData.timestamp;
          if (lockAge > 30000) {
            // 死锁，强制释放
            fs.unlinkSync(lockFile);
            console.log(`[锁] 检测到死锁，强制释放：${resourceId}`);
          } else {
            // 锁仍有效
            await this._sleep(50);
            continue;
          }
        }

        // 尝试创建锁文件
        const lockData = {
          resourceId,
          timestamp: Date.now(),
          pid: process.pid
        };

        // 使用原子操作创建锁文件
        fs.writeFileSync(lockFile, JSON.stringify(lockData), {
          flag: 'wx' // 如果文件已存在则失败
        });

        this._locks.set(resourceId, lockData);
        console.log(`[锁] 获取锁：${resourceId}`);
        return true;

      } catch (error) {
        if (error.code === 'EEXIST') {
          // 文件已存在，等待重试
          await this._sleep(50);
          continue;
        }
        throw error;
      }
    }

    console.log(`[锁] 获取锁超时：${resourceId}`);
    return false;
  }

  /**
   * 获取锁（阻塞直到成功）
   * @param {string} resourceId - 资源 ID
   * @param {number} maxWait - 最大等待时间（毫秒）
   * @returns {Promise<boolean>} 是否成功获取锁
   */
  async acquire(resourceId, maxWait = 30000) {
    return this.tryAcquire(resourceId, maxWait);
  }

  /**
   * 释放锁
   * @param {string} resourceId - 资源 ID
   * @returns {boolean} 是否成功释放
   */
  async release(resourceId) {
    const lockFile = this._getLockFile(resourceId);

    try {
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
        this._locks.delete(resourceId);
        console.log(`[锁] 释放锁：${resourceId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[锁] 释放锁失败：${resourceId}`, error);
      return false;
    }
  }

  /**
   * 检查是否持有锁
   * @param {string} resourceId - 资源 ID
   * @returns {boolean} 是否持有锁
   */
  isLocked(resourceId) {
    const lockFile = this._getLockFile(resourceId);
    
    if (!fs.existsSync(lockFile)) {
      return false;
    }

    try {
      const lockContent = fs.readFileSync(lockFile, 'utf-8');
      const lockData = JSON.parse(lockContent);
      
      // 检查锁是否过期
      const lockAge = Date.now() - lockData.timestamp;
      if (lockAge > 30000) {
        return false; // 已过期
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 执行带锁操作（自动获取和释放锁）
   * @param {string} resourceId - 资源 ID
   * @param {Function} operation - 要执行的操作（异步函数）
   * @param {number} timeout - 获取锁超时时间
   * @returns {Promise<any>} 操作结果
   */
  async withLock(resourceId, operation, timeout = 5000) {
    const acquired = await this.tryAcquire(resourceId, timeout);
    
    if (!acquired) {
      throw new Error(`无法获取锁：${resourceId}`);
    }

    try {
      return await operation();
    } finally {
      await this.release(resourceId);
    }
  }

  /**
   * 清理过期锁
   * @returns {number} 清理的锁数量
   */
  cleanup() {
    const files = fs.readdirSync(this.lockDir);
    let cleaned = 0;

    for (const file of files) {
      if (!file.endsWith('.lock')) continue;

      const lockFile = path.join(this.lockDir, file);
      try {
        const lockContent = fs.readFileSync(lockFile, 'utf-8');
        const lockData = JSON.parse(lockContent);
        
        const lockAge = Date.now() - lockData.timestamp;
        if (lockAge > 30000) { // 30 秒过期
          fs.unlinkSync(lockFile);
          cleaned++;
        }
      } catch (error) {
        // 忽略损坏的锁文件
        fs.unlinkSync(lockFile);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[锁] 清理了 ${cleaned} 个过期锁`);
    }

    return cleaned;
  }

  /**
   * 获取所有活跃锁
   * @returns {Array} 活跃锁列表
   */
  getActiveLocks() {
    const files = fs.readdirSync(this.lockDir);
    const activeLocks = [];

    for (const file of files) {
      if (!file.endsWith('.lock')) continue;

      const lockFile = path.join(this.lockDir, file);
      try {
        const lockContent = fs.readFileSync(lockFile, 'utf-8');
        const lockData = JSON.parse(lockContent);
        
        const lockAge = Date.now() - lockData.timestamp;
        if (lockAge <= 30000) {
          activeLocks.push({
            file,
            ...lockData,
            age: lockAge
          });
        }
      } catch (error) {
        // 忽略损坏的锁文件
      }
    }

    return activeLocks;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
const defaultLock = new FileLock();

module.exports = {
  FileLock,
  defaultLock
};
