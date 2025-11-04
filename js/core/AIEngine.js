/**
 * AIEngine - AI引擎
 * 职责：AI策略调度、落子计算
 */
class AIEngine {
  constructor(gameState, ruleEngine, candidateGenerator, evaluationService) {
    this.state = gameState;
    this.rules = ruleEngine;
    this.candidateGen = candidateGenerator;
    this.evaluation = evaluationService;

    this.difficulties = {
      BEGINNER: { maxDepth: 1, timeout: 600, name: '新手' },
      NORMAL: { maxDepth: 2, timeout: 1000, name: '正常' },
      HARD: { maxDepth: 3, timeout: 2000, name: '困难' },
      HELL: { maxDepth: 4, timeout: 2400, name: '地狱' },
    };

    this.currentDifficulty = 'NORMAL';
  }

  /**
   * 设置难度
   * @param {string} difficulty - 难度级别
   */
  setDifficulty(difficulty) {
    if (this.difficulties[difficulty]) {
      this.currentDifficulty = difficulty;
    }
  }

  /**
   * 计算AI落子
   * @param {number} player - 玩家
   * @param {string} [difficulty] - 难度（可选）
   * @returns {Promise<Object>} { x, y, score, thinkingTime }
   */
  async computeMove(player, difficulty) {
    const diff = difficulty || this.currentDifficulty;
    const config = this.difficulties[diff];
    const startTime = Date.now();

    let bestMove;

    if (diff === 'BEGINNER') {
      bestMove = this.computeBeginnerMove(player);
    } else {
      bestMove = this.computeMinimaxMove(player, config.maxDepth);
    }

    const thinkingTime = Date.now() - startTime;

    const minDelay = 300;
    if (thinkingTime < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - thinkingTime));
    }

    return {
      ...bestMove,
      thinkingTime: Date.now() - startTime,
    };
  }

  /**
   * 新手级别AI
   */
  computeBeginnerMove(player) {
    const opponent = player === 1 ? 2 : 1;

    const winMove = this.findWinningMove(player);
    if (winMove) {
      return { x: winMove.x, y: winMove.y, score: 1000000 };
    }

    const blockMove = this.findWinningMove(opponent);
    if (blockMove && Math.random() > 0.1) {
      return { x: blockMove.x, y: blockMove.y, score: 500000 };
    }

    const candidates = this.candidateGen.generate(2, 15);

    if (candidates.length === 0) {
      return this.findRandomMove();
    }

    const randomIndex = Math.floor(Math.random() * Math.min(candidates.length, 5));
    const move = candidates[randomIndex];

    return { x: move.x, y: move.y, score: move.priority };
  }

  /**
   * Minimax算法
   */
  computeMinimaxMove(player, maxDepth) {
    const candidates = this.candidateGen.generate(2, 20);

    if (candidates.length === 0) {
      return this.findRandomMove();
    }

    const winMove = this.findWinningMove(player);
    if (winMove) {
      return { x: winMove.x, y: winMove.y, score: 1000000 };
    }

    const opponent = player === 1 ? 2 : 1;
    const blockMove = this.findWinningMove(opponent);
    if (blockMove) {
      return { x: blockMove.x, y: blockMove.y, score: 500000 };
    }

    let bestMove = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const { x, y } = candidate;

      const validation = this.rules.validateMove(x, y, player);
      if (!validation.valid) continue;

      this.state.board[y][x] = player;

      const winCheck = this.rules.checkWin(x, y, player);
      if (winCheck.isWin) {
        this.state.board[y][x] = 0;
        return { x, y, score: 1000000 };
      }

      const score = this.minimax(opponent, maxDepth - 1, -Infinity, Infinity, false);

      this.state.board[y][x] = 0;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { x, y, score };
      }
    }

    return bestMove || this.findRandomMove();
  }

  /**
   * Minimax with Alpha-Beta剪枝
   */
  minimax(player, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluation.evaluate(isMaximizing ? player : (player === 1 ? 2 : 1));
    }

    const candidates = this.candidateGen.generate(2, 15);

    if (candidates.length === 0) {
      return this.evaluation.evaluate(player);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const candidate of candidates) {
        const { x, y } = candidate;

        const validation = this.rules.validateMove(x, y, player);
        if (!validation.valid) continue;

        this.state.board[y][x] = player;

        const winCheck = this.rules.checkWin(x, y, player);
        if (winCheck.isWin) {
          this.state.board[y][x] = 0;
          return 1000000 - depth;
        }

        const score = this.minimax(player === 1 ? 2 : 1, depth - 1, alpha, beta, false);

        this.state.board[y][x] = 0;

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        if (beta <= alpha) {
          break;
        }
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const candidate of candidates) {
        const { x, y } = candidate;

        const validation = this.rules.validateMove(x, y, player);
        if (!validation.valid) continue;

        this.state.board[y][x] = player;

        const winCheck = this.rules.checkWin(x, y, player);
        if (winCheck.isWin) {
          this.state.board[y][x] = 0;
          return -1000000 + depth;
        }

        const score = this.minimax(player === 1 ? 2 : 1, depth - 1, alpha, beta, true);

        this.state.board[y][x] = 0;

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        if (beta <= alpha) {
          break;
        }
      }

      return minScore;
    }
  }

  /**
   * 查找获胜落子
   */
  findWinningMove(player) {
    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        if (this.state.board[y][x] !== 0) continue;

        const validation = this.rules.validateMove(x, y, player);
        if (!validation.valid) continue;

        this.state.board[y][x] = player;
        const winCheck = this.rules.checkWin(x, y, player);
        this.state.board[y][x] = 0;

        if (winCheck.isWin) {
          return { x, y };
        }
      }
    }

    return null;
  }

  /**
   * 查找随机落子
   */
  findRandomMove() {
    const emptyPositions = [];

    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        if (this.state.board[y][x] === 0) {
          emptyPositions.push({ x, y });
        }
      }
    }

    if (emptyPositions.length === 0) {
      return { x: 7, y: 7, score: 0 };
    }

    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const move = emptyPositions[randomIndex];

    return { x: move.x, y: move.y, score: 0 };
  }
}

// 模块元信息
AIEngine.__moduleInfo = {
  name: 'AIEngine',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState', 'RuleEngine', 'CandidateGenerator', 'EvaluationService'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.AIEngine = AIEngine;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: AIEngine.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default AIEngine;
