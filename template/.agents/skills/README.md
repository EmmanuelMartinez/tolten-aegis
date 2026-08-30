# How to add a skill

Each skill is a folder under `.agents/skills/` with a `SKILL.md` file.
The folder name is the skill id.

```
.agents/skills/
└── my-skill/
    ├── SKILL.md     ← required: the instructions (YAML frontmatter + markdown)
    └── rules/       ← optional: extra rule files loaded with the skill
        └── my-rule.md
```

## SKILL.md format

```markdown
---
name: my-skill
description: 'One sentence: when to activate this skill and what it enforces.'
---

# My Skill

Full instructions the agent must follow when this skill applies.
```

- `name` — the skill id (must match the folder name).
- `description` — shown in `agents_index` and the panel; it tells the agent
  *when* to activate the skill.

## Checklist

1. Create the folder `.agents/skills/<name>/`.
2. Write `SKILL.md` with frontmatter + instructions.
3. Run `agents_index` (or open the Aegis panel → Knowledge) to confirm it appears.
