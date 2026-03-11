/**
 * 俄罗斯方块游戏核心逻辑
 * Tetris Core Game Logic
 * 
 * 功能包括：
 * - 10x20 游戏区域
 * - 7 种标准方块 (I, O, T, S, Z, J, L)
 * - 方块旋转、移动、下落
 * - 碰撞检测
 * - 消除行计分
 * - 游戏结束检测
 */

// ==================== 常量定义 ====================

// 游戏区域尺寸
const COLS = 10;      // 列数
const ROWS = 20;      // 行数
const BLOCK_SIZE = 30; // 方块像素大小（用于渲染）

// 方块类型定义
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00FFFF'  // 青色
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFFF00'  // 黄色
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#800080'  // 紫色
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00FF00'  // 绿色
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#FF0000'  // 红色
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000FF'  // 蓝色
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#FFA500'  // 橙色
  }
};

// 方块类型名称数组（用于随机选择）
const TETROMINO_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// 计分规则
const SCORE_RULES = {
  SINGLE: 100,    // 消除 1 行
  DOUBLE: 300,    // 消除 2 行
  TRIPLE: 500,    // 消除 3 行
  TETRIS: 800     // 消除 4 行（俄罗斯方块）
};

// ==================== 游戏类定义 ====================

class TetrisGame {
  /**
   * 构造函数 - 初始化游戏状态
   */
  constructor() {
    // 游戏区域网格 (0 表示空，其他值表示颜色)
    this.board = this.createEmptyBoard();
    
    // 当前方块
    this.currentPiece = null;
    
    // 下一个方块
    this.nextPiece = null;
    
    // 游戏状态
    this.score = 0;           // 当前分数
    this.lines = 0;           // 消除的行数
    this.level = 1;           // 游戏等级
    this.gameOver = false;    // 游戏结束标志
    this.isPaused = false;    // 暂停标志
    
    // 下落计时器
    this.dropInterval = 1000;  // 初始下落间隔（毫秒）
    this.lastDropTime = 0;
    
    // 初始化游戏
    this.init();
  }

  /**
   * 创建空的游戏区域
   * @returns {Array} ROWS x COLS 的二维数组，初始值为 0
   */
  createEmptyBoard() {
    const board = [];
    for (let row = 0; row < ROWS; row++) {
      board[row] = [];
      for (let col = 0; col < COLS; col++) {
        board[row][col] = 0;  // 0 表示空位
      }
    }
    return board;
  }

  /**
   * 初始化游戏
   */
  init() {
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.dropInterval = 1000;
    
    // 生成第一个和下一个方块
    this.nextPiece = this.randomPiece();
    this.spawnPiece();
  }

  /**
   * 随机生成一个方块
   * @returns {Object} 包含形状和颜色的方块对象
   */
  randomPiece() {
    const name = TETROMINO_NAMES[Math.floor(Math.random() * TETROMINO_NAMES.length)];
    const tetromino = TETROMINOES[name];
    
    return {
      type: name,
      shape: tetromino.shape.map(row => [...row]),  // 深拷贝形状
      color: tetromino.color,
      x: Math.floor(COLS / 2) - Math.floor(tetromino.shape[0].length / 2),  // 水平居中
      y: 0  // 从顶部开始
    };
  }

  /**
   * 生成新方块（将下一个方块移到当前位置）
   */
  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    
    // 重置位置到顶部中央
    this.currentPiece.x = Math.floor(COLS / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentPiece.y = 0;
    
    // 检查生成时是否立即碰撞（游戏结束条件）
    if (this.checkCollision(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver = true;
    }
  }

  /**
   * 碰撞检测
   * @param {Array} shape - 方块形状
   * @param {number} offsetX - X 轴偏移
   * @param {number} offsetY - Y 轴偏移
   * @returns {boolean} 是否发生碰撞
   */
  checkCollision(shape, offsetX, offsetY) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        // 只检查方块的实心部分（值为 1 的位置）
        if (shape[row][col] !== 0) {
          const newX = offsetX + col;
          const newY = offsetY + row;
          
          // 检查边界
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          
          // 检查是否与已固定的方块碰撞（ newY < 0 表示在顶部上方，允许）
          if (newY >= 0 && this.board[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 方块左移
   * @returns {boolean} 移动是否成功
   */
  moveLeft() {
    if (this.gameOver || this.isPaused) return false;
    
    const newX = this.currentPiece.x - 1;
    if (!this.checkCollision(this.currentPiece.shape, newX, this.currentPiece.y)) {
      this.currentPiece.x = newX;
      return true;
    }
    return false;
  }

  /**
   * 方块右移
   * @returns {boolean} 移动是否成功
   */
  moveRight() {
    if (this.gameOver || this.isPaused) return false;
    
    const newX = this.currentPiece.x + 1;
    if (!this.checkCollision(this.currentPiece.shape, newX, this.currentPiece.y)) {
      this.currentPiece.x = newX;
      return true;
    }
    return false;
  }

  /**
   * 方块下移（软降落）
   * @returns {boolean} 移动是否成功
   */
  moveDown() {
    if (this.gameOver || this.isPaused) return false;
    
    const newY = this.currentPiece.y + 1;
    if (!this.checkCollision(this.currentPiece.shape, this.currentPiece.x, newY)) {
      this.currentPiece.y = newY;
      return true;
    }
    return false;
  }

  /**
   * 硬降落（直接落到底部）
   * @returns {number} 下落的行数（用于奖励分数）
   */
  hardDrop() {
    if (this.gameOver || this.isPaused) return 0;
    
    let dropDistance = 0;
    while (this.moveDown()) {
      dropDistance++;
    }
    
    // 硬降落奖励分数（每格 2 分）
    this.score += dropDistance * 2;
    
    return dropDistance;
  }

  /**
   * 旋转方块（顺时针）
   * @returns {boolean} 旋转是否成功
   */
  rotate() {
    if (this.gameOver || this.isPaused) return false;
    
    const shape = this.currentPiece.shape;
    const N = shape.length;
    
    // 创建旋转后的新形状（顺时针 90 度）
    const rotatedShape = [];
    for (let row = 0; row < N; row++) {
      rotatedShape[row] = [];
      for (let col = 0; col < N; col++) {
        // 顺时针旋转公式：new[col][N-1-row] = old[row][col]
        rotatedShape[col][N - 1 - row] = shape[row][col];
      }
    }
    
    // 检查旋转后是否碰撞
    if (!this.checkCollision(rotatedShape, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    
    // 墙踢（Wall Kick）- 尝试左右移动来完成旋转
    // 尝试向左移动 1 格
    if (!this.checkCollision(rotatedShape, this.currentPiece.x - 1, this.currentPiece.y)) {
      this.currentPiece.x -= 1;
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    
    // 尝试向右移动 1 格
    if (!this.checkCollision(rotatedShape, this.currentPiece.x + 1, this.currentPiece.y)) {
      this.currentPiece.x += 1;
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    
    // 尝试向左移动 2 格（针对 I 方块等）
    if (!this.checkCollision(rotatedShape, this.currentPiece.x - 2, this.currentPiece.y)) {
      this.currentPiece.x -= 2;
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    
    // 尝试向右移动 2 格
    if (!this.checkCollision(rotatedShape, this.currentPiece.x + 2, this.currentPiece.y)) {
      this.currentPiece.x += 2;
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    
    // 所有尝试都失败，无法旋转
    return false;
  }

  /**
   * 锁定当前方块到游戏区域
   */
  lockPiece() {
    const shape = this.currentPiece.shape;
    const color = this.currentPiece.color;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] !== 0) {
          const boardY = this.currentPiece.y + row;
          const boardX = this.currentPiece.x + col;
          
          // 只有当位置有效时才锁定
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            this.board[boardY][boardX] = color;
          }
        }
      }
    }
  }

  /**
   * 检查并消除完整的行
   * @returns {number} 消除的行数
   */
  clearLines() {
    let linesCleared = 0;
    
    // 从底部向上检查每一行
    for (let row = ROWS - 1; row >= 0; row--) {
      // 检查该行是否完整（所有位置都不为 0）
      let isLineFull = true;
      for (let col = 0; col < COLS; col++) {
        if (this.board[row][col] === 0) {
          isLineFull = false;
          break;
        }
      }
      
      if (isLineFull) {
        linesCleared++;
        
        // 消除该行：将上面的所有行下移
        for (let r = row; r > 0; r--) {
          for (let c = 0; c < COLS; c++) {
            this.board[r][c] = this.board[r - 1][c];
          }
        }
        
        // 顶部新增一行空行
        for (let c = 0; c < COLS; c++) {
          this.board[0][c] = 0;
        }
        
        // 因为行下移了，需要重新检查当前行
        row++;
      }
    }
    
    return linesCleared;
  }

  /**
   * 更新分数和等级
   * @param {number} linesCleared - 消除的行数
   */
  updateScore(linesCleared) {
    if (linesCleared === 0) return;
    
    // 根据消除行数更新分数
    let points = 0;
    switch (linesCleared) {
      case 1:
        points = SCORE_RULES.SINGLE;
        break;
      case 2:
        points = SCORE_RULES.DOUBLE;
        break;
      case 3:
        points = SCORE_RULES.TRIPLE;
        break;
      case 4:
        points = SCORE_RULES.TETRIS;
        break;
    }
    
    // 等级加成（每级增加 10%）
    points *= this.level;
    this.score += points;
    
    // 更新消除的总行数
    this.lines += linesCleared;
    
    // 每消除 10 行升一级
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      // 提高下落速度（最小 100ms）
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
    }
  }

  /**
   * 游戏主循环更新（在每一帧调用）
   * @param {number} currentTime - 当前时间（毫秒）
   * @returns {boolean} 是否需要渲染
   */
  update(currentTime) {
    if (this.gameOver || this.isPaused) return false;
    
    // 检查是否需要下落
    if (currentTime - this.lastDropTime > this.dropInterval) {
      this.lastDropTime = currentTime;
      
      // 尝试下移
      if (!this.moveDown()) {
        // 无法下移，锁定方块
        this.lockPiece();
        
        // 消除行并更新分数
        const linesCleared = this.clearLines();
        this.updateScore(linesCleared);
        
        // 生成新方块
        this.spawnPiece();
        
        // 检查游戏是否结束
        if (this.gameOver) {
          return true;
        }
      }
      
      return true;  // 需要渲染
    }
    
    return false;
  }

  /**
   * 暂停/继续游戏
   */
  togglePause() {
    if (this.gameOver) return;
    this.isPaused = !this.isPaused;
  }

  /**
   * 重置游戏
   */
  reset() {
    this.init();
  }

  /**
   * 获取游戏状态（用于渲染或保存）
   * @returns {Object} 游戏状态对象
   */
  getGameState() {
    return {
      board: this.board.map(row => [...row]),  // 深拷贝
      currentPiece: this.currentPiece ? {
        shape: this.currentPiece.shape.map(row => [...row]),
        x: this.currentPiece.x,
        y: this.currentPiece.y,
        color: this.currentPiece.color,
        type: this.currentPiece.type
      } : null,
      nextPiece: this.nextPiece ? {
        shape: this.nextPiece.shape.map(row => [...row]),
        type: this.nextPiece.type,
        color: this.nextPiece.color
      } : null,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      isPaused: this.isPaused
    };
  }

  /**
   * 获取预览方块（用于显示下一个方块）
   * @returns {Object} 下一个方块的信息
   */
  getNextPiece() {
    return this.nextPiece;
  }

  /**
   * 获取当前分数
   * @returns {number} 分数
   */
  getScore() {
    return this.score;
  }

  /**
   * 获取当前等级
   * @returns {number} 等级
   */
  getLevel() {
    return this.level;
  }

  /**
   * 获取消除的行数
   * @returns {number} 行数
   */
  getLines() {
    return this.lines;
  }
}

// ==================== 辅助函数 ====================

/**
 * 创建游戏实例的工厂函数
 * @returns {TetrisGame} 新的游戏实例
 */
function createTetrisGame() {
  return new TetrisGame();
}

/**
 * 获取所有方块类型信息（用于预览或选择）
 * @returns {Object} 所有方块的信息
 */
function getAllTetrominoes() {
  return TETROMINOES;
}

// ==================== 导出（支持 Node.js 和浏览器） ====================

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TetrisGame,
    createTetrisGame,
    getAllTetrominoes,
    COLS,
    ROWS,
    BLOCK_SIZE,
    TETROMINOES,
    SCORE_RULES
  };
}

// ==================== 使用示例 ====================

/*
// 浏览器环境使用示例：
const game = createTetrisGame();

// 游戏主循环
function gameLoop(currentTime) {
  const needRender = game.update(currentTime);
  if (needRender) {
    render(game.getGameState());
  }
  requestAnimationFrame(gameLoop);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      game.moveLeft();
      break;
    case 'ArrowRight':
      game.moveRight();
      break;
    case 'ArrowDown':
      game.moveDown();
      break;
    case 'ArrowUp':
      game.rotate();
      break;
    case ' ':  // 空格键
      game.hardDrop();
      break;
    case 'p':
    case 'P':
      game.togglePause();
      break;
  }
});

// 启动游戏
requestAnimationFrame(gameLoop);

// Node.js 环境使用示例：
const { TetrisGame, createTetrisGame } = require('./tetris.js');
const game = createTetrisGame();
console.log('游戏初始化完成');
console.log('初始分数:', game.getScore());
*/
