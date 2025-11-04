import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../js/core/GameState.js';

describe('GameState', () => {
  let state;

  beforeEach(() => {
    state = new GameState();
  });

  describe('初始化', () => {
    it('应正确初始化棋盘', () => {
      expect(state.boardSize).toBe(15);
      expect(state.board.length).toBe(15);
      expect(state.board[0].length).toBe(15);
      expect(state.currentPlayer).toBe(1);
      expect(state.gameStatus).toBe('ready');
    });

    it('应初始化空棋盘', () => {
      for (let y = 0; y < state.boardSize; y++) {
        for (let x = 0; x < state.boardSize; x++) {
          expect(state.board[y][x]).toBe(0);
        }
      }
    });
  });

  describe('落子', () => {
    it('应成功落子', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      expect(state.board[7][7]).toBe(1);
      expect(state.moveHistory.length).toBe(1);
      expect(state.gameStatus).toBe('playing');
    });

    it('应记录落子历史', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      const move = state.moveHistory[0];
      expect(move.x).toBe(7);
      expect(move.y).toBe(7);
      expect(move.player).toBe(1);
      expect(move.step).toBe(1);
    });

    it('应在已占位置抛出错误', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      expect(() => {
        state.applyMove({ x: 7, y: 7, player: 2 });
      }).toThrow('Position occupied');
    });

    it('应在无效位置抛出错误', () => {
      expect(() => {
        state.applyMove({ x: -1, y: 7, player: 1 });
      }).toThrow('Invalid position');

      expect(() => {
        state.applyMove({ x: 15, y: 7, player: 1 });
      }).toThrow('Invalid position');
    });
  });

  describe('悔棋', () => {
    it('应成功撤回落子', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      const undoneMove = state.undoMove();

      expect(undoneMove.x).toBe(7);
      expect(undoneMove.y).toBe(7);
      expect(state.board[7][7]).toBe(0);
      expect(state.moveHistory.length).toBe(0);
    });

    it('空历史时返回null', () => {
      const result = state.undoMove();
      expect(result).toBeNull();
    });
  });

  describe('玩家切换', () => {
    it('应正确切换玩家', () => {
      expect(state.currentPlayer).toBe(1);
      state.switchPlayer();
      expect(state.currentPlayer).toBe(2);
      state.switchPlayer();
      expect(state.currentPlayer).toBe(1);
    });
  });

  describe('快照和恢复', () => {
    it('应创建完整快照', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      const snapshot = state.getSnapshot();

      expect(snapshot.board[7][7]).toBe(1);
      expect(snapshot.moveHistory.length).toBe(1);
      expect(snapshot.currentPlayer).toBe(1);
    });

    it('应从快照恢复状态', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      state.applyMove({ x: 8, y: 8, player: 2 });
      const snapshot = state.getSnapshot();

      state.reset();
      expect(state.moveHistory.length).toBe(0);

      state.restoreSnapshot(snapshot);
      expect(state.board[7][7]).toBe(1);
      expect(state.board[8][8]).toBe(2);
      expect(state.moveHistory.length).toBe(2);
    });
  });

  describe('游戏结束', () => {
    it('应正确设置胜者', () => {
      state.applyMove({ x: 7, y: 7, player: 1 });
      state.finishGame(1, [{ x: 7, y: 7 }]);

      expect(state.gameStatus).toBe('finished');
      expect(state.winner).toBe(1);
      expect(state.winLine).toEqual([{ x: 7, y: 7 }]);
    });
  });
});
