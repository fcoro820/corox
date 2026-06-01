# 📜 Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-06-01
### 🚀 Major Features: The Agentic Leap
- **Autonomous AI Agent**: Transitioned from a basic CLI to a full AI Agent using the ReAct (Reasoning & Acting) loop.
- **Integrated Toolbelt**: AI can now perform real system actions via built-in tools:
  - `shell`: Execute commands in the system's default shell.
  - `read`/`write`: Full file system interaction.
  - `edit`: Surgical text replacement for precise code modifications.
  - `list_files`/`search_code`: Deep codebase exploration.
- **Cognitive Memory**: Added a session-based memory system to maintain context across interactions.
- **Advanced Contextual Awareness**:
  - **Symbol Indexing**: Automatic mapping of functions and classes across the project.
  - **Project Rules**: Support for `.corox-context.md` to enforce project-specific coding standards.

### 🖥️ Interface & UX
- **TUI Command Center**: A new 3-panel dashboard for real-time monitoring of AI reasoning, execution, and system stats.
- **Visual Terminal Mode**: Enhanced terminal output with a "Thought Sidebar" and structured visual separators.
- **Roadmap Visualization**: AI now defines and tracks a strategic plan (Goal & Steps) for every task.

### 🛡️ Security & Stability
- **Human-in-the-Loop (HITL)**: Added a security gate for dangerous actions with a "Trust List" for seamless automation.
- **Graceful Interruption**: Implemented `SIGINT` handling to stop the agent safely without crashing the app.
- **Performance Optimization**: Added symbol caching to drastically reduce indexing time in large projects.
- **Type Safety**: Full TypeScript refactor for zero-error production builds.

### 🐛 Bug Fixes
- Fixed memory leaks in the TUI dashboard.
- Resolved issue with shell execution on different platforms.
- Corrected AI provider response parsing for various LLM models.
