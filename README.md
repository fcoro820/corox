# 🚀 Corox: Your Autonomous AI Engineering Partner

<p align="center">
  <img src="logo.svg" width="200" alt="Corox Logo">
</p>

[![NPM Version](https://img.shields.io/npm/v/corox-cli?style=flat-square&color=blue)](https://www.npmjs.com/package/corox-cli)

[![License](https://img.shields.io/npm/l/corox-cli?style=flat-square&color=green)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

**Corox** is no longer just a CLI tool. It is an **Autonomous AI Agent** designed to live inside your terminal and collaborate with you on your codebase. 

Instead of just answering questions, Corox **thinks, plans, and acts**. It can explore your project, read your code, execute shell commands, and apply precise edits—all while keeping you in the loop.

---

## 🌟 The Agentic Leap: What Makes Corox Different?

Most AI tools are "Chat-and-Paste". You copy code, paste it into a browser, and paste the fix back. **Corox eliminates this friction.**

### 🧠 1. Reasoning & Action (ReAct)
Corox operates on a **Reasoning $\rightarrow$ Acting $\rightarrow$ Observing** loop. When you give it a task, it doesn't just guess; it:
- **Plans**: Defines a high-level goal and a strategic roadmap.
- **Acts**: Uses built-in tools to interact with your system.
- **Observes**: Analyzes the output of those tools to refine its next step.

### 🛠️ 2. The Integrated Toolbelt
Corox has "hands" to manipulate your environment. It doesn't just suggest code; it implements it:
- `shell`: Execute any command in your system's default shell (bash, zsh, etc.).
- `read`: Deep-dive into any file in your project.
- `write`: Create new files or scaffold blueprints.
- `edit`: Perform surgical, precise text replacements without overwriting the whole file.
- `list_files`: Map out the project structure recursively.
- `search_code`: Find symbols or patterns across the entire codebase.

### 🗺️ 3. Deep Contextual Awareness
Corox doesn't just see the file you're in; it understands the **entire project**:
- **Symbol Indexing**: Automatically maps functions, classes, and interfaces across your project.
- **Project Rules**: Create a `.corox-context.md` file in your root directory. Define your coding standards, architectural preferences, or "don'ts", and Corox will follow them strictly.

### 🛡️ 4. Trust, but Verify (Human-in-the-Loop)
We believe in AI autonomy, but not at the cost of safety.
- **Security Gate**: Every dangerous action (`shell`, `write`, `edit`) requires your approval.
- **Trust List**: Once you trust a specific tool, you can mark it as "trusted" to allow seamless automation.

---

## 🖥️ Dual-Mode Experience

### ⚡ Linear Mode (`corox <command>`)
High-speed, prompt-driven interaction for quick tasks. Perfect for "one-off" fixes or system checks.

### 🎮 Command Center (`corox dashboard`)
A full-screen TUI experience that reveals the AI's "brain".
- **Reasoning Panel**: Watch the AI's internal monologue and roadmap in real-time.
- **Console Panel**: See the raw output of tools and commands.
- **System Monitor**: Keep an eye on your CPU/RAM usage while the agent works.

---

## 📦 Getting Started

### Installation
```bash
npm install -g corox-cli
```

### Configuration
Initialize your preferences and default AI provider:
```bash
corox config
```

### AI API Setup
Create a `.env` file in your home directory or project root:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
# For Local AI, install and run Ollama (ollama serve)
```

---

## 📖 Example Workflows

**The "Bug Hunter" Scenario:**
> *"Corox, there's a bug in the authentication flow where the token doesn't expire. Can you find the cause and fix it?"*
1. **AI** $\rightarrow$ `search_code` for "token expiry".
2. **AI** $\rightarrow$ `read` the identified auth service file.
3. **AI** $\rightarrow$ `edit` the logic to correctly handle timestamps.
4. **AI** $\rightarrow$ `shell` to run `npm test` and verify the fix.

**The "New Feature" Scenario:**
> *"Add a new 'User Profile' endpoint to the API following our project rules."*
1. **AI** $\rightarrow$ `get_project_map` to see how other endpoints are structured.
2. **AI** $\rightarrow$ `write` the new controller and route files.
3. **AI** $\rightarrow$ `shell` to restart the server.

---

## 🏗️ Engineering Architecture

Corox is built for scalability and extensibility:
- **Provider Pattern**: Easily switch between OpenAI, Claude, Gemini, Groq, or local Ollama models.
- **Memory System**: Session-based memory that persists in `~/.corox/memory.json`.
- **Modular Command Pattern**: Every CLI action is a decoupled module.

## 🤝 Contributing
We welcome contributions! Please follow the [Contributing Guide](CONTRIBUTING.md) and use Conventional Commits.

## 📄 License
Distributed under the **ISC License**. See `LICENSE` for more information.
