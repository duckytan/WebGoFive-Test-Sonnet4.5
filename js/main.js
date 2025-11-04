/**
 * main.js - 应用入口
 * 职责：初始化所有模块，设置全局应用
 */
class GomokuApp {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化应用
   */
  initialize() {
    if (this.initialized) {
      console.warn('[App] Already initialized');
      return;
    }

    try {
      Logger.info('App', '初始化五子棋应用...');

      this.eventBus = new EventBus();

      this.gameState = new GameState();

      this.ruleEngine = new RuleEngine(this.gameState);

      this.candidateGen = new CandidateGenerator(this.gameState);

      this.evaluation = new EvaluationService(this.gameState, this.ruleEngine);

      this.aiEngine = new AIEngine(
        this.gameState,
        this.ruleEngine,
        this.candidateGen,
        this.evaluation
      );

      this.modeManager = new ModeManager(
        this.gameState,
        this.aiEngine,
        this.ruleEngine,
        this.eventBus
      );

      this.renderer = new CanvasRenderer('game-canvas', this.gameState, this.eventBus);

      this.hudPanel = new HudPanel(this.gameState, this.eventBus);

      this.saveLoad = new SaveLoadService(this.gameState);

      this.setupEventHandlers();

      this.setupControlButtons();

      this.initialized = true;

      Logger.info('App', '初始化完成');

      this.eventBus.emit('app:initialized', {});
    } catch (error) {
      Logger.error('App', '初始化失败', error);
      throw error;
    }
  }

  /**
   * 设置事件处理
   */
  setupEventHandlers() {
    this.eventBus.on('canvas:click', async (pos) => {
      await this.modeManager.handleMove(pos.x, pos.y);
    });

    this.eventBus.on('game:finished', () => {
      this.renderer.render();
    });

    this.eventBus.on('move:undone', () => {
      this.renderer.render();
    });
  }

  /**
   * 设置控制按钮
   */
  setupControlButtons() {
    const btnNewGame = document.getElementById('btn-new-game');
    if (btnNewGame) {
      btnNewGame.addEventListener('click', () => {
        this.startNewGame();
      });
    }

    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        const result = this.modeManager.undoMove();
        if (!result.success) {
          this.hudPanel.showMessage(result.error, 'error', 1500);
        } else {
          this.renderer.render();
        }
      });
    }

    const btnHint = document.getElementById('btn-hint');
    if (btnHint) {
      btnHint.addEventListener('click', async () => {
        const result = await this.modeManager.getHint();
        if (result.success) {
          this.renderer.hintMove = { x: result.x, y: result.y };
          this.renderer.render();

          setTimeout(() => {
            this.renderer.hintMove = null;
            this.renderer.render();
          }, 3000);
        } else {
          this.hudPanel.showMessage(result.error, 'error', 1500);
        }
      });
    }

    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const success = this.saveLoad.save();
        if (success) {
          this.hudPanel.showMessage('💾 保存成功', 'success', 1500);
        } else {
          this.hudPanel.showMessage('💾 保存失败', 'error', 1500);
        }
      });
    }

    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        const success = this.saveLoad.load();
        if (success) {
          this.renderer.render();
          this.hudPanel.updateDisplay();
          this.hudPanel.showMessage('📂 加载成功', 'success', 1500);
        } else {
          this.hudPanel.showMessage('📂 无存档或加载失败', 'error', 1500);
        }
      });
    }

    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        this.saveLoad.exportJSON();
        this.hudPanel.showMessage('📤 已导出', 'success', 1500);
      });
    }

    const selectMode = document.getElementById('select-mode');
    if (selectMode) {
      selectMode.addEventListener('change', (e) => {
        this.setMode(e.target.value);
      });
    }

    const selectDifficulty = document.getElementById('select-difficulty');
    if (selectDifficulty) {
      selectDifficulty.addEventListener('change', (e) => {
        this.aiEngine.setDifficulty(e.target.value);
        this.gameState.settings.aiDifficulty = e.target.value;
        this.gameState.settings.blackAI = e.target.value;
        this.gameState.settings.whiteAI = e.target.value;
      });
    }
  }

  /**
   * 开始新游戏
   */
  startNewGame() {
    this.modeManager.startNewGame();
    this.renderer.render();
    this.hudPanel.updateDisplay();
  }

  /**
   * 设置模式
   */
  setMode(mode) {
    this.modeManager.setMode(mode);
    this.hudPanel.updateGameMode(mode);

    const difficultyGroup = document.getElementById('difficulty-group');
    if (difficultyGroup) {
      difficultyGroup.style.display = mode !== 'PvP' ? 'block' : 'none';
    }
  }
}

// 页面加载完成后初始化
if (typeof window !== 'undefined') {
  window.GomokuApp = GomokuApp;

  window.addEventListener('DOMContentLoaded', () => {
    try {
      const app = new GomokuApp();
      app.initialize();
      app.startNewGame();

      window.gomokuApp = app;

      console.log('%c五子棋 v2.0.0', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
      console.log('使用 window.gomokuApp 访问应用实例');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  });
}

// 模块元信息
if (typeof GomokuApp !== 'undefined') {
  GomokuApp.__moduleInfo = {
    name: 'GomokuApp',
    version: '2.0.0',
    author: 'Project Team',
    dependencies: [
      'GameState',
      'RuleEngine',
      'AIEngine',
      'ModeManager',
      'CanvasRenderer',
      'HudPanel',
      'EventBus',
      'Logger',
    ],
    optionalDependencies: ['SaveLoadService'],
  };
}
