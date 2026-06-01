# 🚀 Corox CLI: The Ultimate Developer Productivity Hub

**Corox** is a high-performance, interactive command-line ecosystem designed to eliminate friction in the modern development lifecycle. It is not just a CLI tool; it is a **Productivity Hub** that merges AI-driven intelligence, system diagnostics, automated project scaffolding, and a full-screen TUI experience into one elegant interface.

![NPM Version](https://img.shields.io/npm/v/corox-cli?style=flat-square&color=blue)
![License](https://img.shields.io/npm/l/corox-cli?style=flat-square&color=green)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

---

## 🌟 Core Pillars

### 🤖 1. Hybrid AI Intelligence
Corox removes the vendor lock-in. Through a **Provider-Agnostic Architecture**, you can switch between cutting-edge cloud LLMs and completely private local models.

- **Supported Providers**: 
  - ☁️ **Cloud**: OpenAI, Anthropic (Claude), Google (Gemini), Groq (Ultra-Fast).
  - 🏠 **Local**: Native integration with **Ollama** for 100% privacy.
- **Intelligence Suite**:
  - `ai-explain`: Deep technical decomposition of complex code.
  - `ai-fix`: Error diagnostics and step-by-step remediation.
  - `commit`: Context-aware AI commit messages based on `git diff`.

### ⚙️ 2. Workflow Automation
Automate repetitive terminal sequences. Define complex pipelines in a `.coroxrc` file and execute them with a single command.

- **Dynamic Workflows**: Sequence shell commands, handle parallel execution, and use environment-aware variables (e.g., `${branch}`).
- **Remote Import**: Import professional workflow templates via URL to standardize team processes.

### 🛠️ 3. Developer Power Tools
Utility tools designed to solve the "small frustrations" that break developer flow:

- **Industry Scaffolder**: Generate projects following Clean Architecture or Layered patterns.
- **Port Killer**: Instantly find and terminate zombie processes blocking your ports.
- **HTTP Client**: A lightweight API tester with beautifully formatted tabular output.
- **Disk Purge**: Recursively find and wipe `node_modules` to reclaim gigabytes of space.

### 🧩 4. Extensible Plugin System
Corox is an open platform. You can inject new functionality without modifying the core engine.

- **Dynamic Loading**: Install and load plugins at runtime via URL.
- **Lifecycle Hooks**: Plugins can register `beforeCommand` and `afterCommand` hooks to modify behavior or add telemetry.

---

## 🖥️ Dual-Mode Interaction

Corox adapts to your current need:

1. **Linear Mode (`corox <command>`)**: High-speed, prompt-driven interaction for quick tasks.
2. **TUI Dashboard (`corox dashboard`)**: A full-screen interactive terminal dashboard featuring:
   - Real-time system monitoring (CPU/RAM).
   - Keyboard-driven menu navigation.
   - Integrated persistent console output.

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

## 🚀 Getting Started

### 1. Configuration
Initialize your preferences, theme, and default AI provider:
```bash
corox config
```

### 2. AI API Setup
Create a `.env` file in your home directory or project root:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
GROQ_API_KEY=gsk_...
# For Local AI, simply install Ollama and run: ollama serve
```

---

## 📖 Command Reference

### 🛠️ General Commands
| Command | Description | Example |
| :--- | :--- | :--- |
| `dashboard` | Launch full-screen TUI Dashboard | `corox dashboard` |
| `init` | Scaffold a new project from template | `corox init` |
| `status` | Check system and tool status | `corox status` |
| `sys-info` | Display detailed system diagnostics | `corox sys-info` |
| `config` | Open settings menu | `corox config` |

### 🤖 AI Intelligence
| Command | Description | Example |
| :--- | :--- | :--- |
| `ai-explain` | Explain a specific code file | `corox ai-explain src/auth.ts` |
| `ai-fix` | Get a fix for a terminal error | `corox ai-fix "Error: EADDRINUSE"` |
| `commit` | AI-generated conventional commit | `corox commit` |
| `model` | List available local Ollama models | `corox model` |

### ⚙️ Automation & Tools
| Command | Description | Example |
| :--- | :--- | :--- |
| `run <name>` | Execute a workflow from `.coroxrc` | `corox run deploy-prod` |
| `workflows` | List all registered workflows | `corox workflows` |
| `import <url>` | Import remote workflow templates | `corox import https://...` |
| `port <num>` | Kill process on specific port | `corox port 3000` |
| `request` | Make an HTTP request | `corox request GET https://api.com` |
| `clean <path>` | Wipe node_modules recursively | `corox clean .` |

---

## 🏗️ Engineering Architecture

Corox is engineered for scalability using professional design patterns:

### 🧩 Provider Pattern (AI)
The `AIProvider` interface abstracts the communication with different LLMs. Adding a new AI provider only requires implementing a new class without touching the core logic.

### ⚡ Command Pattern (CLI)
Each CLI action is decoupled into standalone command modules. This ensures that the `index.ts` remains a thin router, and each command can be tested and developed in isolation.

### 🔄 Plugin Lifecycle
Plugins hook into the `runSafe` execution wrapper:
`beforeCommand` $\rightarrow$ `Command Logic` $\rightarrow$ `afterCommand`

### 📁 Project Structure
```text
corox-cli/
├── src/
│   ├── commands/      # Individual command implementations
│   ├── tui/           # Blessed-based TUI Dashboard logic
│   ├── utils/
│   │   ├── ai/        # AI Provider implementations (OpenAI, Ollama, etc.)
│   │   ├── api.ts     # Version checking & remote API calls
│   │   └── logger.ts  # Chalk-powered consistent logging
│   ├── templates/     # Project scaffolding blueprints
│   ├── types/         # TypeScript interfaces and types
│   └── index.ts       # Entry point and Command Router
├── tests/             # Vitest unit and integration tests
└── .coroxrc           # (User-defined) Workflow configurations
```

---

## 🤝 Contributing

We welcome contributions from the community! 

1. **Fork** the repository.
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** using Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
4. **Push** and open a Pull Request.

## 📄 License
Distributed under the **ISC License**. See `LICENSE` for more information.
