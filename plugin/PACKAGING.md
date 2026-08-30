# Publishing Tolten Aegis to npm

Goal: `npm install @tolten/aegis` → `dsh plugin --profile web add @tolten/aegis`,
so the plugin is durable on any machine (no per-session dynamic loading).

## 1. Why a small refactor is needed

The plugin currently runs as a **dynamic Cordis plugin**. Its Client half talks to
its Host half through `host.call` (package-private RPC of the dynamic runtime).
A **published** cordis package exposes its client via a **Remote service**
(`@deepseek-ai/dsh-api-remotes`), not `host.call`.

So packaging = wrap the code + swap the RPC mechanism:

| Step | File | Change |
|---|---|---|
| Host entry | `lib/index.js` | Wrap `plugin/host.js` as `export default { name, apply(ctx) }`. Expose the 6 handlers as `@Remote` methods (e.g. `status`, `mcp-list`, `mcp-save`, `kb-list`, `kb-read`, `kb-save`). |
| Client entry | `lib/client.js` | Move `plugin/client.js` here; replace `host.call('x', args)` with the Remote service client (`ctx.get('apiRemotes')` / generated client calls). |
| Manifest | `package.json` | Already scaffolded: `exports.{".","./client"}`, `dsh.client.platform: "web"`. Add real `dsh.client.inject` deps (`dsh-client-connection`, `dsh-client-runtime`, `dsh-api-remotes`). |

Reference implementation of the Remote pattern: `@deepseek-ai/dsh-tool-jobs`
(host `@Remote` exports + client consumption).

## 2. Steps

```bash
# in the repo root
mkdir -p lib/types/client
cp plugin/host.js   lib/index.js.tmp   # then convert to ESM export + @Remote
cp plugin/client.js lib/client.js.tmp  # then swap host.call → Remote client

# install peer deps for typing (optional)
npm install --save-dev @deepseek-ai/dsh-api-remotes @deepseek-ai/cordis

npm run build   # if you add a build step
npm pack        # dry-run the tarball contents
npm publish --access public
```

## 3. Verify after publishing

```bash
dsh plugin --profile web add @tolten/aegis
# restart dsh → Settings ▸ Tolten Aegis should appear; tools agents_* available
```

## 4. Alternative (no npm): keep it as a preset

The `preset/` folder ships the durable structure. Copy it to
`~/.dsh/.agent-presets/tolten-aegis` — the MCP rows mount; the dynamic plugin
code is loaded per session until the npm package exists.
