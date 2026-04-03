/**
 * Orchestra Scratchpad - 跨 Worker 知识共享系统
 * 
 * @package orchestra-scratchpad
 * @version 1.0.0
 */

export {
  Scratchpad,
  createScratchpad,
  ScratchpadEntry,
  ScratchpadData,
  ReadOptions,
  WriteOptions,
  ListOptions,
  ClearOptions,
  ScratchpadEvents,
} from './scratchpad';

export {
  SyncManager,
  createSyncManager,
  SyncManagerOptions,
  SyncResult,
} from './sync-manager';

export {
  WorkerBridge,
  createWorkerBridge,
  WorkerBridgeOptions,
  WorkerMessage,
  WorkerMessageResponse,
} from './worker-bridge';
