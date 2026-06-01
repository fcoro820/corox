# 🚀 Corox CLI

**Corox** is a high-performance, interactive command-line ecosystem designed to transform the developer's workflow. It's not just a tool; it's a **Productivity Hub** that combines AI-powered assistance, system diagnostics, project scaffolding, and automation into a single, elegant interface.

![NPM Version](https://img.shields.io/npm/v/corox-cli?style=flat-square&color=blue)
![License](https://img.shields.io/npm/l/corox-cli?style=flat-square&color=green)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

---

## 🌟 Key Pillars of Corox

### 🤖 1. Hybrid AI Intelligence
Corox breaks the dependency on a single AI provider. It features a **Provider-Agnostic Architecture**, allowing you to switch between cloud and local LLMs seamlessly.

- **Multi-Provider Support**: 
  - ☁️ **Cloud**: OpenAI, Anthropic (Claude), Google (Gemini), Groq (Ultra-Fast).
  - 🏠 **Local**: Full integration with **Ollama** for 100% private, free AI.
- **AI-Powered Commands**:
  - `corox ai-explain <file>`: Get deep technical explanations of any code file.
  - `corox ai-fix <error>`: Paste a terminal error and get a step-by-step fix.
  - `corox commit`: Analyzes your `git diff` and writes professional Conventional Commit messages.

### ⚙️ 2. Workflow Automation
Stop repeating the same 5 commands. Corox allows you to define complex task sequences in a `.coroxrc` file.

- **Custom Workflows**: Define sequential or parallel shell commands.
- **Dynamic Variables**: Use variables like `${branch}` to make workflows adaptive.
- **One-Command Execution**: Run entire pipelines with `corox run <workflow-name>`.

### 🛠️ 3. Developer Power Tools
A suite of utilities that solve real-world developer frustrations:

- **Advanced Scaffolder**: Generate projects with industry-standard architectures (e.g., Clean Architecture for Express.js).
- **Port Killer**: Instantly terminate processes blocking your ports (`corox port 3000`).
- **API Client**: A lightweight HTTP client with beautiful tabular output (`corox request GET <url>`).
- **Smart Cleaner**: Recursively wipe `node_modules` across multiple projects to reclaim disk space.

### 🧩 4. Extensible Plugin System
Corox is designed to grow. You can extend its functionality without touching the core code.

- **Dynamic Loading**: Install plugins via URL.
- **Lifecycle Hooks**: Plugins can hook into `beforeCommand` and `afterCommand` events to modify Corox's behavior.

---

## 🖥️ Dual-Mode Experience

Corox offers two ways to interact:
1. **Linear Mode (`corox`)**: A fast, prompt-driven interface for quick tasks.
2. **TUI Dashboard (`corox dashboard`)**: A full-screen interactive terminal dashboard with real-time system monitoring, keyboard navigation, and a persistent console.

---

## 📦 Installation

### ⚡ Quick Install (via curl)
```bash
curl -sSL https://raw.githubusercontent.com/fcoro820/corox/main/install.sh | bash
```

### 📦 Via NPM
```bash
npm install -g corox-cli
```

---

## 🚀 Quick Start Guide

### 1. Configuration
Run the config menu to set up your AI provider and theme:
```bash
corox config
```

### 2. AI Setup (.env)
To use AI features, add your keys to a `.env` file in your project or home directory:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
# For Local AI, just install Ollama and run: ollama serve
```

### 3. Example Commands
```bash
# Initialize a professional project
corox init

# Explain a complex function
corox ai-explain src/utils/auth.ts

# Kill a hanging process on port 8080
corox port 8080

# Clean up disk space
corox clean .

# Launch the TUI Dashboard
corox dashboard
```

---

## 🏗️ Engineering Architecture

Corox is built with a focus on scalability and maintainability:

- **Language**: TypeScript (Strict Mode)
- **Router**: `commander` for robust CLI argument parsing.
- **TUI**: `blessed` & `blessed-contrib` for the interactive dashboard.
- **State**: `conf` for persistent user settings.
- **Testing**: `Vitest` for unit and integration testing.
- **Pattern**: Provider Pattern for AI and Command Pattern for logic separation.

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new AI provider, a useful plugin, or a bug fix.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the ISC License. See `LICENSE` for more information.
