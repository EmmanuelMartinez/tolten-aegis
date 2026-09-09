# Contributing to Tolten Aegis 🛡️

Thanks for helping make Tolten Aegis better! This is an open, community-driven
project — the more eyes on it, the sharper the shield.

## Ways to contribute

- **🐛 Report a bug** — open an Issue with: what you did, what you expected, and
  what happened. Include the DSH version and your `.agents/` structure if relevant.
- **💡 Suggest a feature** — open an Issue with the problem you're solving and a
  rough idea of the solution.
- **🔧 Write code** — fork, branch, and open a Pull Request. Small, focused PRs
  are fastest to merge.
- **📝 Improve docs / the `.agents` standard** — the template and README always
  need love.
- **🧪 Test on other platforms/OS** — report anything that behaves differently.

## Known area to investigate (help wanted!)

The harness's `cordis.patch.yml` HMR watcher does **not** apply MCP bridge
changes live in every environment. We worked around it with honest UI (the panel
tells you when a change needs a restart), but a real fix is welcome. See the
commit history around "honest live/saved MCP state" for context.

## Dev setup

The plugin is plain JavaScript (Host half in `plugin/host.js`, Client half in
`plugin/client.js`). No build step. Load it into DeepSeek Harness as a dynamic
Cordis plugin, or run the preset in `preset/`.

```bash
git clone git@github.com:EmmanuelMartinez/tolten-aegis.git
cd tolten-aegis
# edit plugin/host.js and plugin/client.js
```

Set `DSH_HOME` at the top of `plugin/host.js` to your install (`echo $DSH_HOME`).

## PR guidelines

- Keep changes small and focused on one concern.
- Update `README.md` if you change behavior or the `.agents` standard.
- Never commit secrets or real tokens — use placeholders and env vars.
- Match the existing style (single quotes, no TS, no build step).

## Code of conduct

Be kind. This is a friendly community for learning and building great tooling.
