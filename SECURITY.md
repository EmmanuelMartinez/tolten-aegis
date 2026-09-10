# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Email **[oe.martinez03@gmail.com](mailto:oe.martinez03@gmail.com)** with:

- the affected version or commit,
- a description of the impact,
- reproduction steps (a minimal case helps a lot),
- any suggested fix.

You can expect an acknowledgement within **72 hours** and an assessment shortly after.
Credit will be given in the release notes unless you prefer otherwise.

## Scope and design notes

- The knowledge tools read `.agents/**` **inside the current workspace only**.
- The MCP bridge rows **execute the commands you configure** in `.agents/mcp.json` /
- `~/.dsh/aegis-mcp.json`. Review them before enabling a server, and never commit real tokens
- (`*.example` files only).
- The plugin stores no credentials itself; tokens live in your MCP config or environment.

## Secrets hygiene

Never commit tokens, .env files or API keys. Anything committed to a public repository
should be treated as **already leaked** — rotate it.
