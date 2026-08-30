# Installing Tolten Aegis

Pick the path that matches your workflow. Aegis is a **dynamic Cordis plugin**
(Host + Client) — the code in `host.js` and `client.js` is the same code you
load into DeepSeek Harness.

## 1. Agent preset (durable, shareable)

```bash
git clone <your-repo-url> tolten-aegis
cp -r tolten-aegis/preset "$HOME/.dsh/.agent-presets/tolten-aegis"
```

Restart `dsh` and pick **Tolten Aegis** in the preset selector. The preset mounts
the MCP bridge rows; the dynamic plugin code (knowledge tools + panel) is loaded
per session until the plugin is published as an npm package.

## 2. Dynamic plugin (fast demo)

In a DSH session, use the `cordis_define` tool with:
- `code.host` → the contents of `host.js`
- `code.client` → the contents of `client.js`

Then `cordis_run`. Approve the run (the Client half needs a checkmark).

## 3. Host composition (MCP bridge only)

Add the rows from `template/.agents/mcp.json.example` to your profile patch:

```bash
$EDITOR "$HOME/.dsh/profiles/web/cordis.patch.yml"
```

Then HMR hot-reloads the bridge — no restart needed.

## ⚙️ Machine config

Edit `host.js` before loading:

```js
const DSH_HOME = '/Users/emmanuel/.dsh'  // ← echo $DSH_HOME on your machine
```

The dynamic-plugin sandbox has no `process`, so `DSH_HOME` is a constant.

## 📦 Publishing (future — makes it durable everywhere)

1. Create `package.json` with `name: "@<org>/aegis"`.
2. Move `host.js`/`client.js` into the package as a Cordis plugin.
3. `npm publish`.
4. Add `- id: aegis\n  name: '@<org>/aegis'` to any preset or profile.
