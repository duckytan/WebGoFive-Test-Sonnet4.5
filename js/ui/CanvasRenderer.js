/**
 * CanvasRenderer - Canvas渲染器
 * 职责：棋盘与棋子绘制、坐标转换、视觉特效
 */
class CanvasRenderer {
  constructor(canvasId, gameState, eventBus) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.ctx = this.canvas.getContext('2d');
    this.state = gameState;
    this.eventBus = eventBus;

    this.cellSize = 36;
    this.padding = 40;
    this.pieceRadius = 15;

    this.lastMove = null;
    this.hintMove = null;
    this.forbiddenHighlight = null;
    this.hoverPosition = null;

    this.colors = {
      board: '#f4e4bc',
      line: '#8b7355',
      star: '#8b7355',
      black: '#2f2f2f',
      white: '#f0f0f0',
      blackHighlight: 'rgba(255, 215, 0, 0.6)',
      whiteHighlight: 'rgba(255, 105, 180, 0.6)',
      forbidden: 'rgba(211, 47, 47, 0.85)',
      hint: 'rgba(76, 175, 80, 0.6)',
    };

    this.initCanvas();
    this.setupEventListeners();
  }

  /**
   * 初始化Canvas
   */
  initCanvas() {
    const canvasSize = this.cellSize * (this.state.boardSize - 1) + this.padding * 2;
    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;

    this.canvas.style.width = canvasSize + 'px';
    this.canvas.style.height = canvasSize + 'px';
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    if (this.eventBus) {
      this.eventBus.on('move:applied', (data) => {
        this.lastMove = { x: data.x, y: data.y, player: data.player };
        this.render();
      });

      this.eventBus.on('game:reset', () => {
        this.lastMove = null;
        this.hintMove = null;
        this.forbiddenHighlight = null;
        this.render();
      });
    }
  }

  /**
   * 渲染主函数
   */
  render() {
    this.clearCanvas();
    this.drawBoard();
    this.drawStarPoints();
    this.drawPieces();
    this.drawEffects();
  }

  /**
   * 清空画布
   */
  clearCanvas() {
    this.ctx.fillStyle = this.colors.board;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制棋盘线条
   */
  drawBoard() {
    this.ctx.strokeStyle = this.colors.line;
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.state.boardSize; i++) {
      const pos = this.padding + i * this.cellSize;

      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, pos);
      this.ctx.lineTo(
        this.padding + (this.state.boardSize - 1) * this.cellSize,
        pos
      );
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(pos, this.padding);
      this.ctx.lineTo(
        pos,
        this.padding + (this.state.boardSize - 1) * this.cellSize
      );
      this.ctx.stroke();
    }
  }

  /**
   * 绘制星位点
   */
  drawStarPoints() {
    const starPositions = this.getStarPositions();
    this.ctx.fillStyle = this.colors.star;

    starPositions.forEach((pos) => {
      const screenPos = this.gridToScreen(pos.x, pos.y);
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * 获取星位坐标
   */
  getStarPositions() {
    if (this.state.boardSize === 15) {
      return [
        { x: 3, y: 3 },
        { x: 11, y: 3 },
        { x: 7, y: 7 },
        { x: 3, y: 11 },
        { x: 11, y: 11 },
      ];
    }
    return [{ x: 7, y: 7 }];
  }

  /**
   * 绘制所有棋子
   */
  drawPieces() {
    for (let y = 0; y < this.state.boardSize; y++) {
      for (let x = 0; x < this.state.boardSize; x++) {
        const piece = this.state.board[y][x];
        if (piece !== 0) {
          this.drawPiece(x, y, piece);
        }
      }
    }
  }

  /**
   * 绘制单个棋子
   */
  drawPiece(x, y, player) {
    const screenPos = this.gridToScreen(x, y);
    const color = player === 1 ? this.colors.black : this.colors.white;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, this.pieceRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = player === 1 ? '#000' : '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  /**
   * 绘制特效
   */
  drawEffects() {
    if (this.lastMove) {
      this.highlightLastMove(this.lastMove);
    }

    if (this.hintMove) {
      this.showHint(this.hintMove);
    }

    if (this.forbiddenHighlight) {
      this.showForbidden(this.forbiddenHighlight);
    }

    if (this.hoverPosition && this.state.board[this.hoverPosition.y][this.hoverPosition.x] === 0) {
      this.drawHoverPreview(this.hoverPosition);
    }

    if (this.state.winLine) {
      this.highlightWinLine(this.state.winLine);
    }
  }

  /**
   * 高亮最后落子
   */
  highlightLastMove(move) {
    const screenPos = this.gridToScreen(move.x, move.y);
    const color = move.player === 1 ? this.colors.blackHighlight : this.colors.whiteHighlight;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, this.pieceRadius + 4, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  /**
   * 显示提示
   */
  showHint(move) {
    const screenPos = this.gridToScreen(move.x, move.y);

    this.ctx.strokeStyle = this.colors.hint;
    this.ctx.lineWidth = 2;

    const size = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x - size, screenPos.y);
    this.ctx.lineTo(screenPos.x + size, screenPos.y);
    this.ctx.moveTo(screenPos.x, screenPos.y - size);
    this.ctx.lineTo(screenPos.x, screenPos.y + size);
    this.ctx.stroke();
  }

  /**
   * 显示禁手标记
   */
  showForbidden(pos) {
    const screenPos = this.gridToScreen(pos.x, pos.y);

    this.ctx.strokeStyle = this.colors.forbidden;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, this.pieceRadius + 6, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = this.colors.forbidden;
    this.ctx.lineWidth = 2;
    const size = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(screenPos.x - size, screenPos.y - size);
    this.ctx.lineTo(screenPos.x + size, screenPos.y + size);
    this.ctx.moveTo(screenPos.x + size, screenPos.y - size);
    this.ctx.lineTo(screenPos.x - size, screenPos.y + size);
    this.ctx.stroke();
  }

  /**
   * 绘制悬停预览
   */
  drawHoverPreview(pos) {
    const screenPos = this.gridToScreen(pos.x, pos.y);
    const color = this.state.currentPlayer === 1 ? this.colors.black : this.colors.white;

    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, this.pieceRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * 高亮获胜连线
   */
  highlightWinLine(winLine) {
    if (!winLine || winLine.length < 5) return;

    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    this.ctx.lineWidth = 4;

    const start = this.gridToScreen(winLine[0].x, winLine[0].y);
    const end = this.gridToScreen(winLine[4].x, winLine[4].y);

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  /**
   * 屏幕坐标转网格坐标
   */
  screenToGrid(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round((screenX - rect.left - this.padding) / this.cellSize);
    const y = Math.round((screenY - rect.top - this.padding) / this.cellSize);
    return { x, y };
  }

  /**
   * 网格坐标转屏幕坐标
   */
  gridToScreen(x, y) {
    return {
      x: this.padding + x * this.cellSize,
      y: this.padding + y * this.cellSize,
    };
  }

  /**
   * 点击事件处理
   */
  handleClick(event) {
    const pos = this.screenToGrid(event.clientX, event.clientY);

    if (this.state.isValidPosition(pos.x, pos.y)) {
      if (this.eventBus) {
        this.eventBus.emit('canvas:click', pos);
      }
    }
  }

  /**
   * 鼠标移动事件处理
   */
  handleMouseMove(event) {
    const pos = this.screenToGrid(event.clientX, event.clientY);

    if (this.state.isValidPosition(pos.x, pos.y)) {
      this.hoverPosition = pos;
    } else {
      this.hoverPosition = null;
    }

    this.render();
  }

  /**
   * 鼠标离开事件处理
   */
  handleMouseLeave() {
    this.hoverPosition = null;
    this.render();
  }
}

// 模块元信息
CanvasRenderer.__moduleInfo = {
  name: 'CanvasRenderer',
  version: '2.0.0',
  author: 'Project Team',
  dependencies: ['GameState', 'EventBus'],
  optionalDependencies: [],
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.CanvasRenderer = CanvasRenderer;

  window.dispatchEvent(
    new CustomEvent('moduleLoaded', {
      detail: CanvasRenderer.__moduleInfo,
    })
  );
}

// 支持 ES Module
export default CanvasRenderer;
