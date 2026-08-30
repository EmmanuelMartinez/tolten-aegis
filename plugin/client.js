/**
 * Tolten Aegis — Client half
 * ===========================
 * The Control Center panel, registered as a Settings section
 * ("Tolten Aegis"). Tabs: Overview / MCP Servers / Knowledge.
 * Pure browser half — all data comes from the Host via host.call.
 */
const CSS = `
.tc-root{display:flex;flex-direction:column;gap:16px;padding:4px 2px 24px;color:var(--dsw-alias-label-primary);font-family:inherit}
.tc-hero{padding:18px 20px;border-radius:16px;background:linear-gradient(135deg,var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));border:1px solid var(--dsw-alias-border-l1)}
.tc-hero h2{margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:-.02em}
.tc-hero p{margin:0;font-size:13px;color:var(--dsw-alias-label-secondary)}
.tc-badge{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:11px;font-weight:700;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);padding:4px 10px;border-radius:999px}
.tc-tabs{display:flex;gap:4px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.tc-tab{appearance:none;background:none;border:none;padding:10px 14px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);cursor:pointer;border-bottom:2px solid transparent;transition:.15s}
.tc-tab:hover{color:var(--dsw-alias-label-primary)}
.tc-tab.on{color:var(--dsw-alias-brand-primary);border-bottom-color:var(--dsw-alias-brand-primary)}
.tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.tc-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:14px 16px}
.tc-card h4{margin:0;font-size:14px;font-weight:700}
.tc-sub{margin:4px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary);word-break:break-all}
.tc-pill{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px}
.tc-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.tc-ok{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-bg-layer-2)}
.tc-bad{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2)}
.tc-warn{color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-bg-layer-2)}
.tc-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.tc-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.tc-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;padding:7px 12px;border-radius:9px;cursor:pointer;transition:.15s}
.tc-btn:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.tc-btn.primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border-color:transparent;font-weight:700}
.tc-btn.danger:hover{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.tc-field{margin-bottom:12px}
.tc-field label{display:block;font-size:11px;font-weight:700;color:var(--dsw-alias-label-secondary);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
.tc-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);border-radius:9px;padding:8px 10px;font-size:13px;font-family:inherit}
.tc-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
textarea.tc-input{min-height:90px;resize:vertical;font-family:ui-monospace,Menlo,monospace;font-size:12px}
.tc-note{font-size:12px;color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:10px 12px}
.tc-msg{font-size:12px;color:var(--dsw-alias-state-success-primary)}
.tc-list{display:flex;flex-direction:column;gap:8px}
.tc-li{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:11px 14px;cursor:pointer;transition:.15s}
.tc-li:hover{border-color:var(--dsw-alias-brand-primary)}
.tc-li h5{margin:0;font-size:13px;font-weight:700}
.tc-li p{margin:3px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.tc-kv{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:4px}
.tc-empty{color:var(--dsw-alias-label-secondary);font-size:13px;padding:20px;text-align:center;border:1px dashed var(--dsw-alias-border-l2);border-radius:14px}
.tc-h3{margin:18px 0 10px;font-size:15px;font-weight:700}
`

return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    styles.insert(CSS)
    const h = React.createElement

    function pill(ok, text) {
      return h('span', { className: 'tc-pill ' + (ok ? 'tc-ok' : 'tc-bad') }, h('span', { className: 'tc-dot' }), text)
    }

    function Field(props) {
      return h('div', { className: 'tc-field' },
        h('label', null, props.label),
        props.area
          ? h('textarea', { className: 'tc-input', value: props.value, onChange: function (e) { props.onChange(e.target.value) }, placeholder: props.placeholder })
          : h('input', { className: 'tc-input', value: props.value, onChange: function (e) { props.onChange(e.target.value) }, placeholder: props.placeholder }),
      )
    }

    function ControlCenter() {
      const [tab, setTab] = React.useState('overview')
      const [status, setStatus] = React.useState(null)
      const [servers, setServers] = React.useState([])
      const [project, setProject] = React.useState([])
      const [kb, setKb] = React.useState(null)
      const [editingKey, setEditingKey] = React.useState(null)
      const [draft, setDraft] = React.useState(null)
      const [msg, setMsg] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [open, setOpen] = React.useState(null)
      const [openText, setOpenText] = React.useState('')

      const refresh = React.useCallback(function () {
        host.call('status').then(function (st) { setStatus(st) }).catch(function () {})
        host.call('mcp-list').then(function (ml) { setServers(ml.servers || []); setProject(ml.project || []) }).catch(function () {})
        host.call('kb-list').then(function (kl) { setKb(kl) }).catch(function () {})
      }, [])

      React.useEffect(function () { refresh() }, [refresh])

      function tabBtn(id, label) {
        return h('button', { className: 'tc-tab' + (tab === id ? ' on' : ''), onClick: function () { setTab(id) } }, label)
      }

      function beginEdit(s) {
        setEditingKey(s ? s.serverName : null)
        setDraft(s ? JSON.parse(JSON.stringify(s)) : { id: '', serverName: '', transport: 'stdio', command: '', args: [], cwd: '', url: '', headers: [], disabled: false })
        setMsg(null)
      }

      function setField(k, v) {
        setDraft(function (d) { var nd = Object.assign({}, d); nd[k] = v; return nd })
      }

      function saveCurrent() {
        const d = draft
        if (!d.serverName) { setMsg('serverName is required'); return }
        d.id = 'mcp-' + d.serverName
        const list = editingKey
          ? servers.map(function (x) { return x.serverName === editingKey ? d : x })
          : servers.concat([d])
        setBusy(true)
        host.call('mcp-save', { servers: list }).then(function (r) {
          setMsg(r.message || 'Saved')
          setEditingKey(null); setDraft(null)
          refresh()
        }).catch(function (e) { setMsg('Save failed: ' + (e && e.message || e)) }).finally(function () { setBusy(false) })
      }

      function toggleServer(s) {
        const list = servers.map(function (x) { return x.serverName === s.serverName ? Object.assign({}, x, { disabled: !x.disabled }) : x })
        setBusy(true)
        host.call('mcp-save', { servers: list }).then(function (r) { setMsg(r.message); refresh() }).catch(function (e) { setMsg(String(e && e.message || e)) }).finally(function () { setBusy(false) })
      }

      function removeServer(s) {
        host.call('mcp-save', { servers: servers.filter(function (x) { return x.serverName !== s.serverName }) }).then(function (r) { setMsg(r.message); refresh() }).catch(function (e) { setMsg(String(e && e.message || e)) })
      }

      function openFile(path) {
        setOpen(path); setOpenText('')
        host.call('kb-read', { path: path }).then(function (r) { setOpenText(r.content) }).catch(function (e) { setMsg(String(e && e.message || e)) })
      }

      function saveFile() {
        setBusy(true)
        host.call('kb-save', { path: open, content: openText }).then(function (r) { setMsg('Saved ' + r.path); refresh() }).catch(function (e) { setMsg(String(e && e.message || e)) }).finally(function () { setBusy(false) })
      }

      function mcpEditor() {
        const d = draft
        return h('div', { className: 'tc-card' },
          h('h4', null, 'Server configuration'),
          h('p', { className: 'tc-sub' }, 'Persists to the global bridge and hot-reloads via HMR.'),
          Field({ label: 'serverName', value: d.serverName, onChange: function (v) { setField('serverName', v) }, placeholder: 'e.g. my-server' }),
          h('div', { className: 'tc-field' },
            h('label', null, 'Transport'),
            h('select', { className: 'tc-input', value: d.transport, onChange: function (e) { setField('transport', e.target.value) } },
              h('option', { value: 'stdio' }, 'stdio'),
              h('option', { value: 'streamable-http' }, 'streamable-http'),
            ),
          ),
          d.transport === 'stdio'
            ? h('div', null,
                Field({ label: 'Command', value: d.command, onChange: function (v) { setField('command', v) }, placeholder: 'bash' }),
                Field({ label: 'Args (one per line)', value: (d.args || []).join('\n'), area: true, onChange: function (v) { setField('args', v.split('\n').filter(function (x) { return x.length > 0 })) }, placeholder: '-c\n./vendor/bin/sail artisan boost:mcp' }),
                Field({ label: 'Working directory (cwd)', value: d.cwd, onChange: function (v) { setField('cwd', v) }, placeholder: '/path/to/project' }),
              )
            : h('div', null,
                Field({ label: 'URL', value: d.url, onChange: function (v) { setField('url', v) }, placeholder: 'https://mcp.example.com/mcp' }),
                Field({ label: 'Headers (Name: value, one per line; start value with ` for a JS expression)', value: (d.headers || []).map(function (x) { return x.name + ': ' + x.value }).join('\n'), area: true, onChange: function (v) { setField('headers', v.split('\n').filter(function (x) { return x.length > 0 }).map(function (line) { var i = line.indexOf(':'); return i < 0 ? { name: line.trim(), value: '' } : { name: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } })) }, placeholder: 'Authorization: `Bearer ${process.env.MY_TOKEN}`' }),
              ),
          h('div', { className: 'tc-actions' },
            h('button', { className: 'tc-btn primary', disabled: busy, onClick: saveCurrent }, busy ? 'Saving…' : 'Save server'),
            h('button', { className: 'tc-btn', onClick: function () { setEditingKey(null); setDraft(null) } }, 'Cancel'),
          ),
        )
      }

      function knowledgeEditor() {
        return h('div', { className: 'tc-card' },
          h('h4', null, open),
          h('textarea', { className: 'tc-input', style: { minHeight: '320px' }, value: openText, onChange: function (e) { setOpenText(e.target.value) } }),
          h('div', { className: 'tc-actions' },
            h('button', { className: 'tc-btn primary', disabled: busy, onClick: saveFile }, 'Save file'),
            h('button', { className: 'tc-btn', onClick: function () { setOpen(null) } }, 'Back'),
          ),
        )
      }

      function statCard(label, value) {
        return h('div', { className: 'tc-card', style: { flex: '1 1 140px' } },
          h('div', { className: 'tc-sub', style: { textTransform: 'uppercase', fontSize: '10px', letterSpacing: '.06em' } }, label),
          h('div', { style: { fontSize: '24px', fontWeight: '800', marginTop: '6px' } }, value),
        )
      }

      function mcpCard(s) {
        return h('div', { className: 'tc-card' },
          h('div', { className: 'tc-row' },
            h('h4', null, s.serverName),
            s.connected ? pill(true, 'online · ' + s.toolCount) : (s.disabled ? pill(false, 'disabled') : pill(false, 'offline')),
          ),
          h('p', { className: 'tc-sub' }, (s.transport === 'stdio' ? (s.command + ' ' + (s.args || []).join(' ')) : s.url).slice(0, 70)),
          h('div', { className: 'tc-actions' },
            h('button', { className: 'tc-btn', onClick: function () { beginEdit(s) } }, 'Edit'),
            h('button', { className: 'tc-btn', onClick: function () { toggleServer(s) } }, s.disabled ? 'Enable' : 'Disable'),
            h('button', { className: 'tc-btn danger', onClick: function () { removeServer(s) } }, 'Remove'),
          ),
        )
      }

      function overview() {
        const st = status
        if (!st) return h('div', { className: 'tc-empty' }, 'Loading…')
        const totalTools = (st.mcp || []).reduce(function (a, s) { return a + s.toolCount }, 0)
        return h('div', null,
          h('div', { className: 'tc-hero' },
            h('h2', null, 'Tolten Aegis 🛡️'),
            h('p', null, 'The shield that makes DeepSeek Harness infallible on any project.'),
            h('div', null,
              h('span', { className: 'tc-badge' }, 'Project: ' + (st.workspace || '—')),
              h('span', { className: 'tc-badge', style: { marginLeft: '8px' } }, st.constitution === 'active' ? '⚖️ Constitution active' : '⚖️ No constitution yet'),
            ),
          ),
          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '14px 0 6px' } },
            statCard('MCP global', String((st.mcp || []).length)),
            statCard('MCP project', String((st.projectMcp || []).length)),
            statCard('MCP tools live', String(totalTools)),
            statCard('Skills', String(st.knowledge.skillCount)),
            statCard('Rules', String(st.knowledge.ruleCount)),
          ),
          h('div', { className: 'tc-h3' }, 'MCP servers (global scope)'),
          h('div', { className: 'tc-grid' }, (st.mcp || []).map(function (s) { return mcpCard(s) })),
          h('div', { className: 'tc-h3' }, 'MCP servers (project scope — .agents/mcp.json)'),
          (st.projectMcp || []).length === 0
            ? h('div', { className: 'tc-empty' }, 'No project MCP configured. Add .agents/mcp.json to define per-project servers.')
            : h('div', { className: 'tc-grid' }, (st.projectMcp || []).map(function (s) { return mcpCard(s) })),
        )
      }

      function mcpView() {
        return h('div', null,
          h('div', { className: 'tc-row', style: { marginBottom: '12px' } },
            h('div', { className: 'tc-h3', style: { margin: 0 } }, 'MCP servers — global scope'),
            h('button', { className: 'tc-btn primary', onClick: function () { beginEdit(null) } }, '+ Add server'),
          ),
          editingKey !== null ? mcpEditor() : null,
          h('div', { className: 'tc-grid' }, servers.map(function (s) { return mcpCard(s) })),
          h('div', { className: 'tc-h3' }, 'MCP servers — project scope (.agents/mcp.json)'),
          project.length === 0
            ? h('div', { className: 'tc-empty' }, 'No project servers. Edit .agents/mcp.json to define them.')
            : h('div', { className: 'tc-grid' }, project.map(function (s) { return mcpCard(s) })),
        )
      }

      function knowledgeView() {
        if (open) return knowledgeEditor()
        if (!kb) return h('div', { className: 'tc-empty' }, 'Loading…')
        return h('div', null,
          h('div', { className: 'tc-h3', style: { margin: '0 0 4px' } }, 'Knowledge base — .agents/'),
          h('p', { className: 'tc-sub', style: { margin: '0 0 12px' } }, 'Skills, rules and the constitution. Click any entry to open and edit it.'),
          h('div', { className: 'tc-list' },
            h('div', { className: 'tc-li', onClick: function () { openFile(kb.constitution) } },
              h('h5', null, '⚖️ Project Constitution'),
              h('p', null, kb.constitution + ' — the supreme law'),
            ),
          ),
          h('div', { className: 'tc-h3' }, 'Skills'),
          h('div', { className: 'tc-list' },
            (kb.skills || []).map(function (s) {
              return h('div', { key: s.path, className: 'tc-li', onClick: function () { openFile(s.path) } },
                h('h5', null, s.name),
                h('p', null, s.description),
                h('div', { className: 'tc-kv' }, s.path),
              )
            }),
          ),
          h('div', { className: 'tc-h3' }, 'Rules'),
          h('div', { className: 'tc-list' },
            (kb.rules || []).map(function (r) {
              return h('div', { key: r.path, className: 'tc-li', onClick: function () { openFile(r.path) } },
                h('h5', null, r.path),
              )
            }),
          ),
        )
      }

      return h('div', { className: 'tc-root' },
        h('div', { className: 'tc-tabs' },
          tabBtn('overview', 'Overview'),
          tabBtn('mcp', 'MCP Servers'),
          tabBtn('knowledge', 'Knowledge'),
        ),
        msg ? h('div', { className: msg.indexOf('fail') >= 0 ? 'tc-note' : 'tc-msg' }, msg) : null,
        tab === 'overview' ? overview() : (tab === 'mcp' ? mcpView() : knowledgeView()),
      )
    }

    slots.inject('settings.section', function () {
      return slots.register(
        { name: 'settings.section', id: 'tolten-aegis', order: 30, label: 'Tolten Aegis' },
        function () { return h(ControlCenter) },
      )
    })
  },
}
