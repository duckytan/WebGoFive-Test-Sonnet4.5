# H5 五子棋游戏 v2.0

> 基于 HTML5 Canvas 的五子棋游戏，支持 PvP/PvE/EvE 模式，完整禁手规则，四级 AI 难度

## 🎮 功能特性

- ✅ **三种游戏模式**
  - PvP：双人本地对战
  - PvE：人机对战
  - EvE：双 AI 自动对战

- ✅ **完整禁手规则**
  - 三三禁手
  - 四四禁手
  - 长连禁手

- ✅ **四级 AI 难度**
  - 新手：随机 + 简单防守
  - 正常：Minimax + Alpha-Beta 剪枝
  - 困难：深度搜索 + 威胁序列
  - 地狱：高级搜索算法

- ✅ **辅助功能**
  - 悔棋
  - 提示
  - 存档/加载
  - 棋谱导出

## 🚀 快速开始

### 方式一：直接打开

1. 克隆或下载项目
2. 使用浏览器直接打开 `index.html`

### 方式二：使用本地服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:8080
```

## 📖 项目结构

```
h5-gomoku-v2/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── core/              # 核心模块
│   │   ├── GameState.js           # 游戏状态
│   │   ├── RuleEngine.js          # 规则引擎
│   │   ├── CandidateGenerator.js  # 候选点生成
│   │   ├── EvaluationService.js   # 评估服务
│   │   └── AIEngine.js            # AI 引擎
│   ├── ui/                # UI 模块
│   │   ├── CanvasRenderer.js      # Canvas 渲染
│   │   └── HudPanel.js            # 信息面板
│   ├── services/          # 服务模块
│   │   └── SaveLoadService.js     # 存档服务
│   ├── utils/             # 工具模块
│   │   ├── EventBus.js            # 事件总线
│   │   └── Logger.js              # 日志工具
│   ├── app/               # 应用层
│   │   └── ModeManager.js         # 模式管理
│   └── main.js            # 主入口
├── doc/                   # 文档
└── test/                  # 测试
```

## 🎯 使用说明

### 基本操作

1. **开始游戏**：点击"新游戏"按钮
2. **落子**：点击棋盘上的空位
3. **悔棋**：点击"悔棋"按钮（EvE 模式禁用）
4. **提示**：点击"提示"按钮获取 AI 建议

### 模式切换

- **PvP 模式**：双人轮流操作
- **PvE 模式**：玩家执黑，AI 执白
- **EvE 模式**：双 AI 自动对战，玩家观战

### 难度选择

- **新手**：适合初学者，AI 较弱
- **正常**：旗鼓相当的对手
- **困难**：有挑战性
- **地狱**：接近专家级水平

### 存档功能

- **保存**：保存当前棋局到浏览器本地存储
- **加载**：加载上次保存的棋局
- **导出**：导出棋谱为 JSON 文件

## 🛠️ 开发

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 📚 架构设计

本项目采用分层架构设计：

- **数据层**：GameState - 管理棋盘状态和历史记录
- **逻辑层**：RuleEngine、AIEngine - 处理规则和 AI 计算
- **应用层**：ModeManager - 控制游戏流程
- **展示层**：CanvasRenderer、HudPanel - 渲染和显示
- **服务层**：SaveLoadService - 提供横向服务

模块间通过 EventBus 进行松耦合通信。

## 🔧 技术栈

- **语言**：JavaScript ES2020
- **渲染**：Canvas 2D API
- **架构**：MVC + 事件驱动
- **存储**：LocalStorage
- **测试**：Vitest
- **工具**：ESLint + Prettier

## 📝 API 文档

### 全局对象

浏览器控制台中可访问：

```javascript
// 应用实例
window.gomokuApp

// 核心模块
window.GameState
window.RuleEngine
window.AIEngine
window.CanvasRenderer
// ...
```

### 调试工具

```javascript
// 查看当前状态
gomokuApp.gameState.getSnapshot()

// 查看棋盘
console.table(gomokuApp.gameState.board)

// 切换日志级别
Logger.setLevel('DEBUG')
```

## 🎨 特性展示

- **实时禁手检测**：黑棋落子时自动检测禁手，红色标记提示
- **最后落子高亮**：黑棋金色光晕，白棋粉色光晕
- **AI 思考提示**：显示 AI 思考状态和用时
- **响应式设计**：支持桌面端和移动端

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 项目文档：`doc/` 目录
- 开发指南：`doc/00_快速开始指南.md`
- 架构设计：`doc/02_技术架构设计文档.md`

---

> **提示**：本项目为重构版本，采用模块化设计，易于维护和扩展。详细文档请参阅 `doc/` 目录。
