/**
 * Tolten Aegis — Host half
 * =========================
 * Universal project intelligence for DeepSeek Harness.
 *
 * Reads a project's `.agents/` knowledge (skills, rules, constitution),
 * manages MCP servers (global + project), and serves the Control Center
 * panel. Agnostic: works on ANY project that follows the `.agents` standard.
 *
 * Machine config: set DSH_HOME to your install (`echo $DSH_HOME`, usually ~/.dsh).
 * (The dynamic-plugin sandbox has no `process`, so this is a constant.)
 */
return {
  name: 'tolten-aegis',
  apply(ctx) {
    const fs = ctx.get('fs')
    const tools = ctx.get('tools')
    const systemPrompt = ctx.get('systemPrompt')
    if (fs === undefined) return

    // ── machine-level config ────────────────────────────────────────
    const DSH_HOME = '/Users/emmanuel/.dsh' // ← set to your DSH_HOME
    const PATCH = DSH_HOME + '/profiles/web/cordis.patch.yml'
    const MCP_JSON = DSH_HOME + '/aegis-mcp.json'
    const CONSTITUTION_MAX = 12000

    // ── project root: current workspace, or empty fallback ──────────
    function projectRoot() {
      const wr = ctx.get('workspaceRegistry')
      if (wr !== undefined) {
        try {
          const list = wr.list()
          if (Array.isArray(list) && list.length > 0 && list[0] && list[0].path) return list[0].path
        } catch (e) {}
      }
      return ''
    }

    // ── Constitution: .agents/rules/DEEPSEEK.md (world standard) ─────
    const CONSTITUTION_CANDIDATES = [
      '.agents/rules/DEEPSEEK.md',
      '.agents/rules/CLAUDE.md',
      '.agents/rules/AGENTS.md',
      '.clinerules',
      'AGENTS.md',
    ]

    async function readConstitution(root) {
      for (const c of CONSTITUTION_CANDIDATES) {
        try {
          const target = await fs.resolve(root + '/' + c, {})
          const info = await fs.stat(target)
          if (info !== undefined && info.type === 'file') {
            const text = await fs.readText(target)
            if (text && text.trim().length > 0) return text.slice(0, CONSTITUTION_MAX)
          }
        } catch (e) {}
      }
      try {
        const rd = await fs.listDir(await fs.resolve(root + '/.agents/rules', {}))
        for (const r of rd) {
          if (r.type !== 'file' || !/\.md$/i.test(r.name)) continue
          try {
            const text = await fs.readText(r.target)
            if (text && text.trim().length > 0) return text.slice(0, CONSTITUTION_MAX)
          } catch (e) {}
        }
      } catch (e) {}
      return null
    }

    let constitution = ''
    readConstitution(projectRoot()).then(function (t) { if (t) constitution = t }).catch(function () {})

    if (systemPrompt !== undefined) {
      systemPrompt.section({
        name: 'aegis-constitution',
        order: -50,
        text: function () {
          if (constitution) {
            return '## ⚖️ Project Constitution (always in force — Tolten Aegis)\n\n' + constitution
          }
          return '## ⚖️ Tolten Aegis\nThis project has no constitution yet. Create `.agents/rules/DEEPSEEK.md` and it will be enforced on every step. Use `agents_index`, `agents_read`, `agents_search` to explore `.agents`.'
        },
      })
    }

    // ── YAML serializer for the global MCP patch ─────────────────────
    function yq(s) {
      return "'" + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'"
    }

    function serializePatch(servers) {
      const lines = [
        '# Your patch layer for this dsh profile, applied after every bundle layer:',
        '# a top-level YAML array of loader patch entries (id-targeted config',
        '# overrides, disables, and insert lists; `!!js` expressions allowed).',
        '- insert:',
      ]
      for (const s of servers) {
        lines.push('    - id: ' + (s.id || ('mcp-' + s.serverName)))
        if (s.disabled) lines.push('      disabled: true')
        lines.push('      name: ' + yq('@deepseek-ai/dsh-mcp-client'))
        lines.push('      config:')
        lines.push('        serverName: ' + s.serverName)
        lines.push('        transport: ' + s.transport)
        if (s.transport === 'stdio') {
          lines.push('        command: ' + s.command)
          if (Array.isArray(s.args) && s.args.length) lines.push('        args: [' + s.args.map(yq).join(', ') + ']')
          if (s.cwd) lines.push('        cwd: ' + s.cwd)
        } else {
          if (s.url) lines.push('        url: ' + s.url)
        }
        if (Array.isArray(s.headers) && s.headers.length) {
          lines.push('        headers:')
          for (const h of s.headers) {
            const v = String(h.value == null ? '' : h.value)
            lines.push('          ' + h.name + ': ' + (v.charAt(0) === '`' ? '!!js ' + yq(v) : yq(v)))
          }
        }
        lines.push('        failOnStartupError: false')
        lines.push('')
      }
      return lines.join('\n').replace(/\n+$/, '\n')
    }

    // ── live MCP tool counts from the tool registry ─────────────────
    function mcpCounts() {
      const counts = {}
      if (tools !== undefined) {
        try {
          const schemas = tools.schemas() || []
          for (const t of schemas) {
            const parts = String(t.name || '').split('__')
            if (parts.length >= 3 && parts[0] === 'mcp') {
              const server = parts[1]
              counts[server] = (counts[server] || 0) + 1
            }
          }
        } catch (e) {}
      }
      return counts
    }

    // ── MCP config: global sidecar + project .agents/mcp.json ───────
    async function readGlobalServers() {
      let servers = null
      try {
        servers = JSON.parse(await fs.readText(await fs.resolve(MCP_JSON, {})))
      } catch (e) {}
      return Array.isArray(servers) ? servers : []
    }

    // .agents/mcp.json uses the STANDARD { mcpServers: { name: config } } shape.
    async function readProjectServers() {
      const root = projectRoot()
      try {
        const target = await fs.resolve(root + '/.agents/mcp.json', {})
        const info = await fs.stat(target)
        if (info === undefined) return []
        const parsed = JSON.parse(await fs.readText(target))
        const map = parsed && parsed.mcpServers
        if (!map || typeof map !== 'object') return []
        return Object.keys(map).map(function (name) {
          const c = map[name] || {}
          const headers = c.headers && typeof c.headers === 'object'
            ? Object.keys(c.headers).map(function (k) { return { name: k, value: String(c.headers[k]) } })
            : []
          return {
            id: 'proj-' + name,
            serverName: name,
            transport: c.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
            command: c.command || '',
            args: Array.isArray(c.args) ? c.args : [],
            cwd: c.cwd || '',
            url: c.url || '',
            headers: headers,
            disabled: !!c.disabled,
          }
        })
      } catch (e) { return [] }
    }

    function withStats(servers) {
      const counts = mcpCounts()
      return servers.map(function (s) {
        const n = counts[s.serverName] || 0
        return { id: s.id, serverName: s.serverName, transport: s.transport, command: s.command || '', args: s.args || [], cwd: s.cwd || '', url: s.url || '', headers: s.headers || [], disabled: !!s.disabled, toolCount: n, connected: n > 0 }
      })
    }

    // bridge = global + project, deduped; global wins
    async function regenerateBridge(globalList, projectList) {
      const merged = []
      const names = {}
      for (const s of globalList.concat(projectList)) {
        if (names[s.serverName]) continue
        names[s.serverName] = true
        merged.push(s)
      }
      await fs.writeText(await fs.resolve(PATCH, {}), serializePatch(merged))
      return merged.length
    }

    // write .agents/mcp.json (standard mcpServers format) and refresh the bridge
    async function writeProjectServers(servers) {
      const root = projectRoot()
      const map = {}
      for (const s of servers) {
        const c = { disabled: !!s.disabled }
        if (s.transport === 'streamable-http') {
          c.transport = 'streamable-http'
          if (s.url) c.url = s.url
          if (Array.isArray(s.headers) && s.headers.length) {
            c.headers = {}
            for (const h of s.headers) c.headers[h.name] = h.value
          }
        } else {
          if (s.command) c.command = s.command
          if (Array.isArray(s.args) && s.args.length) c.args = s.args
          if (s.cwd) c.cwd = s.cwd
        }
        map[s.serverName] = c
      }
      await fs.writeText(await fs.resolve(root + '/.agents/mcp.json', {}), JSON.stringify({ mcpServers: map }, null, 2))
      const global = await readGlobalServers()
      await regenerateBridge(global, servers)
      return servers.length
    }

    // ── knowledge path helpers ───────────────────────────────────────
    function normRel(rel) {
      return String(rel || '').replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^\/+/, '')
    }

    async function resolveKnowledge(rel) {
      const n = normRel(rel)
      const root = projectRoot()
      const agentsBase = await fs.resolve(root + '/.agents', {})
      if (n === '.clinerules' || n === 'AGENTS.md' || n.indexOf('.agents/') === 0) {
        const target = await fs.resolve(root + '/' + n, {})
        if (n.indexOf('.agents/') === 0 && !fs.contains(agentsBase, target)) throw new Error('outside knowledge base: ' + n)
        return target
      }
      const target = await fs.resolve(root + '/.agents/' + n, {})
      if (!fs.contains(agentsBase, target)) throw new Error('outside knowledge base: ' + n)
      return target
    }

    async function listRecursive(dirTarget, files, prefix) {
      let entries
      try { entries = await fs.listDir(dirTarget) } catch (e) { return }
      for (const entry of entries) {
        const rel = prefix ? prefix + '/' + entry.name : entry.name
        if (entry.type === 'directory') await listRecursive(entry.target, files, rel)
        else if (entry.type === 'file') files.push({ rel: rel, target: entry.target, size: entry.size || 0 })
      }
    }

    function frontmatter(text) {
      const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
      if (!m) return {}
      const out = {}
      const nm = /^name:\s*(.+)$/m.exec(m[1]); if (nm) out.name = nm[1].trim().replace(/^['"]|['"]$/g, '')
      const ds = /^description:\s*(.+)$/m.exec(m[1]); if (ds) out.description = ds[1].trim().replace(/^['"]|['"]$/g, '')
      return out
    }

    function numbered(text, start) {
      return text.split('\n').map(function (line, i) {
        return String(start + i).padStart(4, ' ') + '  ' + line
      }).join('\n')
    }

    const MAX_CHARS = 60000

    // ── knowledge tools (agent-visible) ──────────────────────────────
    harness.registerTool(ctx, harness.defineTool({
      name: 'agents_index',
      description: 'List this project knowledge base: every skill in .agents/skills (name + description) and every rule file under .agents/rules, plus the constitution. Use this to discover which skill/rule to load before writing code in a domain.',
      parameters: {},
      output: {
        schema: { type: 'string' },
        render: function (_args, value) { return [{ type: 'text', text: value }] },
      },
      async execute() {
        const root = projectRoot()
        const out = ['# Project knowledge base', '', '## Constitution', '- .agents/rules/DEEPSEEK.md  (or .clinerules / AGENTS.md fallbacks)', '', '## Skills (.agents/skills)']
        let skills = []
        try { skills = await fs.listDir(await fs.resolve(root + '/.agents/skills', {})) } catch (e) {}
        for (const s of skills) {
          if (s.type !== 'directory') continue
          let text = ''
          try { text = await fs.readText(await fs.resolve(root + '/.agents/skills/' + s.name + '/SKILL.md', {})) } catch (e) { continue }
          const fm = frontmatter(text)
          out.push('- **' + (fm.name || s.name) + '** — ' + (fm.description || '(no description)'))
          let rules = []
          try { rules = await fs.listDir(await fs.resolve(root + '/.agents/skills/' + s.name + '/rules', {})) } catch (e) {}
          for (const r of rules) if (r.type === 'file') out.push('    - rules/' + r.name)
        }
        out.push('', '## Rules (.agents/rules)')
        let glob = []
        try { glob = await fs.listDir(await fs.resolve(root + '/.agents/rules', {})) } catch (e) {}
        for (const g of glob) if (g.type === 'file') out.push('- rules/' + g.name)
        out.push('', 'Use agents_read with a relative path (e.g. `skills/<name>/SKILL.md` or `rules/DEEPSEEK.md`) to load full content.')
        return out.join('\n')
      },
    }))

    harness.registerTool(ctx, harness.defineTool({
      name: 'agents_read',
      description: 'Read one file from the project knowledge base (.agents/** or the constitution) with line numbers. Use agents_index first to discover paths.',
      parameters: {
        path: { type: 'string', required: true, description: 'Knowledge-base-relative path, e.g. skills/<name>/SKILL.md, rules/DEEPSEEK.md, rules/<file>.md, or .clinerules.' },
        offset: { type: 'integer', description: '1-based first line to return (default 1).' },
        limit: { type: 'integer', description: 'Maximum lines to return (default 400).' },
      },
      output: {
        schema: { type: 'string' },
        render: function (_args, value) { return [{ type: 'text', text: value }] },
      },
      async execute(args) {
        const rel = normRel(args.path)
        const target = await resolveKnowledge(rel)
        const info = await fs.stat(target)
        if (info === undefined) throw new Error('knowledge file not found: ' + rel)
        if (info.type !== 'file') throw new Error('not a file: ' + rel)
        const text = await fs.readText(target)
        if (text.length > MAX_CHARS) {
          return numbered(text.slice(0, MAX_CHARS), 1) + '\n\n[truncated: file is ' + text.length + ' chars; showing first ' + MAX_CHARS + ']'
        }
        const offset = Math.max(1, Math.floor(Number(args.offset) || 1))
        const limit = Math.max(1, Math.floor(Number(args.limit) || 400))
        const lines = text.split('\n')
        const slice = lines.slice(offset - 1, offset - 1 + limit)
        const header = rel + '  (' + lines.length + ' lines total)'
        const body = numbered(slice.join('\n'), offset)
        const more = offset - 1 + slice.length < lines.length ? '\n\n[use offset=' + (offset + slice.length) + ' to continue]' : ''
        return header + '\n' + body + more
      },
    }))

    harness.registerTool(ctx, harness.defineTool({
      name: 'agents_search',
      description: 'Search the project knowledge base (.agents/** and constitution) for a literal substring; returns file:line matches. Use it to find which skill or rule covers a topic.',
      parameters: {
        query: { type: 'string', required: true, description: 'Literal text to find (case-insensitive unless caseSensitive is true).' },
        caseSensitive: { type: 'boolean', description: 'Match case (default false).' },
        maxMatches: { type: 'integer', description: 'Maximum matches to return (default 60, cap 200).' },
      },
      output: {
        schema: { type: 'string' },
        render: function (_args, value) { return [{ type: 'text', text: value }] },
      },
      async execute(args) {
        const root = projectRoot()
        const needle = String(args.query || '')
        if (needle.length === 0) throw new Error('query must not be empty')
        const hay = args.caseSensitive === true ? needle : needle.toLowerCase()
        const max = Math.min(200, Math.max(1, Math.floor(Number(args.maxMatches) || 60)))
        const files = []
        await listRecursive(await fs.resolve(root + '/.agents', {}), files, '')
        try {
          files.push({ rel: '.clinerules', target: await fs.resolve(root + '/.clinerules', {}), size: 0 })
          files.push({ rel: 'AGENTS.md', target: await fs.resolve(root + '/AGENTS.md', {}), size: 0 })
        } catch (e) {}
        const out = []
        let matched = 0
        for (const f of files) {
          if (matched >= max) break
          if (!/\.(md|json|txt)$/i.test(f.rel)) continue
          let text
          try { text = await fs.readText(f.target) } catch (e) { continue }
          const lines = text.split('\n')
          for (let i = 0; i < lines.length && matched < max; i++) {
            const line = lines[i]
            const probe = args.caseSensitive === true ? line : line.toLowerCase()
            if (probe.indexOf(hay) === -1) continue
            out.push(f.rel + ':' + (i + 1) + ': ' + line.slice(0, 200))
            matched++
          }
        }
        if (out.length === 0) return 'No matches for "' + needle + '" in the knowledge base.'
        return 'Matches for "' + needle + '" (' + out.length + (matched >= max ? '+ (capped)' : '') + '):\n' + out.join('\n')
      },
    }))

    // ── config handlers for the Control Center panel ─────────────────
    harness.handle('status', async function () {
      const root = projectRoot()
      const global = withStats(await readGlobalServers())
      const project = withStats(await readProjectServers())
      let skillCount = 0, ruleCount = 0
      try {
        const sd = await fs.listDir(await fs.resolve(root + '/.agents/skills', {}))
        for (const e of sd) if (e.type === 'directory') skillCount++
        const rd = await fs.listDir(await fs.resolve(root + '/.agents/rules', {}))
        for (const e of rd) if (e.type === 'file') ruleCount++
      } catch (e) {}
      return {
        workspace: root,
        mcp: global,
        projectMcp: project,
        knowledge: { skillCount: skillCount, ruleCount: ruleCount },
        constitution: constitution ? 'active' : 'missing',
      }
    })

    harness.handle('mcp-list', async function () {
      return { servers: withStats(await readGlobalServers()), project: withStats(await readProjectServers()) }
    })

    harness.handle('mcp-save', async function (args) {
      const servers = Array.isArray(args && args.servers) ? args.servers : []
      for (const s of servers) {
        if (!s.serverName || !s.transport) throw new Error('each server needs serverName and transport')
        if (!/^[A-Za-z0-9_-]{1,32}$/.test(s.serverName)) throw new Error('invalid serverName: ' + s.serverName)
      }
      const seen = {}
      for (const s of servers) {
        if (seen[s.serverName]) throw new Error('duplicate serverName: ' + s.serverName)
        seen[s.serverName] = true
      }
      await fs.writeText(await fs.resolve(MCP_JSON, {}), JSON.stringify(servers, null, 2))
      const project = await readProjectServers()
      await regenerateBridge(servers, project)
      return { ok: true, servers: servers.length, project: project.length, message: 'Global MCP saved. The bridge applies it on the next harness restart.' }
    })

    harness.handle('mcp-project-save', async function (args) {
      const servers = Array.isArray(args && args.servers) ? args.servers : []
      for (const s of servers) {
        if (!s.serverName || !s.transport) throw new Error('each server needs serverName and transport')
        if (!/^[A-Za-z0-9_-]{1,32}$/.test(s.serverName)) throw new Error('invalid serverName: ' + s.serverName)
      }
      await writeProjectServers(servers)
      return { ok: true, servers: servers.length, message: 'Project MCP saved to .agents/mcp.json. The bridge applies it on the next harness restart.' }
    })

    harness.handle('kb-list', async function () {
      const root = projectRoot()
      const skills = []
      let sd = []
      try { sd = await fs.listDir(await fs.resolve(root + '/.agents/skills', {})) } catch (e) {}
      for (const s of sd) {
        if (s.type !== 'directory') continue
        let text = ''
        try { text = await fs.readText(await fs.resolve(root + '/.agents/skills/' + s.name + '/SKILL.md', {})) } catch (e) { continue }
        const fm = frontmatter(text)
        skills.push({ path: 'skills/' + s.name + '/SKILL.md', name: fm.name || s.name, description: fm.description || '' })
      }
      const rules = []
      let rd = []
      try { rd = await fs.listDir(await fs.resolve(root + '/.agents/rules', {})) } catch (e) {}
      for (const r of rd) if (r.type === 'file') rules.push({ path: 'rules/' + r.name })
      return { skills: skills, rules: rules, constitution: '.agents/rules/DEEPSEEK.md' }
    })

    harness.handle('kb-read', async function (args) {
      const rel = normRel(args && args.path)
      const target = await resolveKnowledge(rel)
      const text = await fs.readText(target)
      return { path: rel, content: text }
    })

    harness.handle('kb-save', async function (args) {
      const rel = normRel(args && args.path)
      const target = await resolveKnowledge(rel)
      const content = String(args && args.content != null ? args.content : '')
      await fs.writeText(target, content)
      return { ok: true, path: rel }
    })
  },
}
