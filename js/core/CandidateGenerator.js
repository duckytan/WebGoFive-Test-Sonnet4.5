/**
 * CandidateGenerator - 候选点生成器
 * 职责：生成潜在落子点，减少搜索空间
 */
class CandidateGenerator {
  constructor(gameState) {
    this.state = gameState;
  }

  /**
   * 生成候选点
   * @param {number} [radius=2] - 搜索半径
   * @param {number} [maxCandidates=20] - 最大候选点数
   * @returns {Array} 候选点数组，按优先级排序
   */
  generate(radius = 2, maxCandidates = 20) {
    if (this.state.moveHistory.length === 0) {
      return [{ x: 7, y: 7, priority: 100 }];
    }

    const candidates = new Map();

    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        if (this.state.board[y][x] === 0) continue;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            if (!this.state.isValidPosition(nx, ny)) continue;
            if (this.state.board[ny][nx] !== 0) continue;

            const key = `${nx},${ny}`;
            const neighbors = this.countNeighbors(nx, ny, radius);
            const positional = this.calculatePositionalScore(nx, ny);
            const priority = neighbors * 10 + positional;

            if (!candidates.has(key) || candidates.get(key) < priority) {
              candidates.set(key, priority);
            }
          }
        }
      }
    }

    const result = Array.from(candidates.entries()).map(([key, priority]) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y, priority };
    });

    result.sort((a, b) => b.priority - a.priority);

    return result.slice(0, maxCandidates);
  }

  /**
   * 统计邻居数量
   */
  countNeighbors(x, y, radius) {
    let count = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (this.state.isValidPosition(nx, ny) && this.state.board[ny][nx] !== 0) {
          const distance = Math.max(Math.abs(dx), Math.abs(dy));
          count += (radius + 1 - distance);
        }
      }
    }

    return count;
  }

  /**
   * 计算位置分数（中心权重）
   */
  calculatePositionalScore(x, y) {
    const center = Math.floor(this.state.boardSize / 2);
    const distanceFromCenter = Math.abs(x - center) + Math.abs(y - center);
    return Math.max(0, 14 - distanceFromCenter);
  }
}

// 模块元信息
CandidateGenerator.__moduleInfo = {
  name: 'CandidateGenerator',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.CandidateGenerator = CandidateGenerator;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: CandidateGenerator.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default CandidateGenerator;
