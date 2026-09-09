# 🛡️ Tolten Aegis

> **The shield that makes DeepSeek Harness infallible on any project.**
>
> Rules enforced. Knowledge loaded. Control in your hands.

Tolten Aegis is a **universal plugin for DeepSeek Harness** that turns your project's
`.agents/` knowledge — **rules, skills and MCP servers** — into *enforced context*
and a **premium control center**. One plugin. Any project. Zero config drift.

> 🇲🇽 **Hecho en México** — crafted with pride by
> **Ing. Oscar Emmanuel Martínez Galán**
> · [oe.martinez03@gmail.com](mailto:oe.martinez03@gmail.com)

---

## Why Aegis?

Every project already has a brain: the rules the team agreed on, the skills that
encode *how to build*, the MCP servers that expose the app's tools. But your agent
**ignores them until you remind it**. Aegis changes that — permanently.

| Superpower | What it does |
|---|---|
| ⚖️ **Constitution, always in force** | Your project's rules (`rules/DEEPSEEK.md`) are injected into **every** model step. No more *"I didn't know the rules"*. |
| 📚 **Knowledge at your fingertips** | Browse, search and read `.agents/skills` + `.agents/rules` with three native tools (`agents_index`, `agents_read`, `agents_search`). |
| 🎛️ **Control Center panel** | A premium M3 panel: live status, MCP server management, knowledge editing — **global and per-project scopes**. |
| 🔌 **MCP where the project lives** | Global servers in `~/.dsh/aegis-mcp.json`, project servers in `.agents/mcp.json` — the standard MCP format. |

---

## 📂 The `.agents` standard

Aegis adopts the emerging world standard for project-level agent knowledge —
**one folder per project**, readable by any tool:

```
.agents/
├── skills/<skill>/SKILL.md     ← skills: how to build X, one folder per skill
├── rules/DEEPSEEK.md           ← your project constitution (the supreme law)
└── mcp.json                    ← project MCP servers (standard mcpServers format)
```

**Constitution fallbacks** (any of these works, `DEEPSEEK.md` wins):
`.agents/rules/DEEPSEEK.md` → `.agents/rules/CLAUDE.md` → `.agents/rules/AGENTS.md`
→ `.clinerules` (root) → `AGENTS.md` (root) → any `.agents/rules/*.md`.

`DEEPSEEK.md` is a plain Markdown file. Write the rules your team lives by —
architecture, code quality, conventions — and Aegis makes the agent **obey them
on every step**, automatically.

---

## 🚀 Install

Three ways — pick the one that fits your workflow:

### 1. Agent preset (recommended — durable & shareable)
```bash
git clone https://github.com/<your-org>/tolten-aegis.git
cp -r tolten-aegis/preset ~/.dsh/.agent-presets/tolten-aegis
# restart dsh, then pick "Tolten Aegis" in the preset selector
```

### 2. Dynamic plugin (fast demo)
Open a DSH session and load `plugin/host.js` + `plugin/client.js` as a dynamic
Cordis plugin (or paste them into the `cordis_define` tool). Approve the run.

### 3. Host composition (MCP bridge)
Add the MCP rows from `template/.agents/mcp.json.example` to your
`cordis.patch.yml` (global) or keep them per-project in `.agents/mcp.json`.

> **Note:** set `DSH_HOME` inside `plugin/host.js` to your install
> (`echo $DSH_HOME` — usually `~/.dsh`).

---

## 🎮 Usage

- **Panel**: Settings (⚙️) → **Tolten Aegis** — Overview / MCP Servers / Knowledge.
- **Tools** (native, callable by the agent):
  - `agents_index` — list every skill and rule in the project.
  - `agents_read` — read any file of `.agents/**` or the constitution.
  - `agents_search` — find which skill/rule covers a topic.
- **Constitution**: create `.agents/rules/DEEPSEEK.md` and it's enforced on every step.

---

## 🗂️ Repository layout

```
tolten-aegis/
├── README.md            ← you are here
├── LICENSE              ← MIT © Ing. Oscar Emmanuel Martínez Galán
├── plugin/
│   ├── host.js          ← Host half (knowledge + MCP bridge + handlers)
│   └── client.js        ← Client half (Control Center panel)
├── preset/              ← installable agent preset (durable)
│   ├── agent.cordis.yml
│   └── preset.yml
├── template/.agents/    ← drop this folder in any project
│   ├── rules/DEEPSEEK.md
│   ├── skills/README.md
│   └── mcp.json.example
└── examples/            ← real-world usage
```

---

## 🤝 Community

Tolten Aegis is open source and community-driven. We want the DeepSeek Harness
community to help sharpen the shield:

- 🐛 Report bugs, 💡 suggest features, or 🔧 open a PR — see
  [`CONTRIBUTING.md`](CONTRIBUTING.md).
- 🌱 Bring the `.agents` standard to your projects and tell us what's missing.
- 🧪 Known area to help: the `cordis.patch.yml` HMR bridge reload (see CONTRIBUTING).

## 🧪 License & credit

MIT — © **Ing. Oscar Emmanuel Martínez Galán** (🇲🇽).
Built on [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
