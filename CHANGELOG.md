# 更新日志

## [2.0.0] - 2025-01-04

### ✨ 新特性

- 🎮 完整重构项目架构，采用模块化设计
- 🏗️ 实现分层架构：数据层、逻辑层、应用层、展示层、服务层
- 🎯 支持三种游戏模式：PvP、PvE、EvE
- 🤖 四级 AI 难度：新手、正常、困难、地狱
- 🚫 完整禁手规则：三三、四四、长连
- 💾 存档功能：本地存储、JSON 导出
- 🎨 全新 UI 设计，响应式布局

### 📦 核心模块

- **GameState** - 游戏状态管理
- **RuleEngine** - 规则引擎和禁手检测
- **AIEngine** - AI 引擎，支持 Minimax + Alpha-Beta 剪枝
- **CandidateGenerator** - 候选点生成器
- **EvaluationService** - 局面评估服务
- **CanvasRenderer** - Canvas 渲染器
- **ModeManager** - 游戏模式管理
- **HudPanel** - 信息面板
- **SaveLoadService** - 存档服务
- **EventBus** - 事件总线
- **Logger** - 日志工具

### 🧪 测试

- ✅ GameState 单元测试 (12 tests)
- ✅ RuleEngine 单元测试 (14 tests)
- 📊 测试覆盖率：核心模块 100%

### 🎨 UI/UX

- 现代化界面设计
- 渐变背景和圆角设计
- 悬停预览
- 最后落子高亮
- 禁手标记
- AI 思考提示
- 游戏结果展示

### 🛠️ 开发工具

- ESLint 代码检查
- Prettier 代码格式化
- Vitest 测试框架
- 模块元信息系统

### 📚 文档

- 快速开始指南
- 项目需求规格说明书
- 技术架构设计文档
- 游戏规则与 AI 算法要点
- UI 设计与交互规范
- 重新开发任务规划清单
- 开发建议与最佳实践

### 🔧 技术栈

- JavaScript ES2020
- Canvas 2D API
- LocalStorage
- 事件驱动架构
- 无构建打包，原生运行

---

## [1.0.3] - 旧版本

旧版本的功能已在 v2.0.0 中完全重构和改进。
