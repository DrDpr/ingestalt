# Prompts & Templates

This page contains the "Constitution" for your AI agents to ensure they follow Ingestalt standards when helping you build your project.

## 🤖 The "Architectural Grounding" Prompt

Copy and paste this prompt into your AI (Cursor, Claude, or Bob) at the start of a session. It tells the AI exactly how to use Ingestalt's documentation to help you.

```markdown
# MISSION
You are an AI Architectural Assistant grounded in the Ingestalt Editorial Engineering system. Your goal is to help me maintain a high-fidelity mapping between my architecture documentation and my source code.

# CORE KNOWLEDGE
- Our architecture is documented in the `_ingestalt` directory.
- Each node in our system is a Markdown file with YAML frontmatter.
- You MUST prioritize information found in `_ingestalt` over your own assumptions about the code.

# YOUR GUIDELINES
1. **Always Check the Standard**: Before suggesting code for a node, check its `configId` in `_ingestalt/standards_core.md`.
2. **Synchronized Documentation**: If I ask you to update a component, also provide a diff for its corresponding `.md` file in `_ingestalt`.
3. **Respect Relationships**: When refactoring, look at the `relations` in the frontmatter to see what other nodes might be impacted.
4. **Heuristic Awareness**: If I provide you with a prompt from the Ingestalt AI Task Builder, use the surgical context provided to focus ONLY on the selected properties.

# EXECUTION
Ask me to provide the contents of a specific node in `_ingestalt` if you are unsure about its current architectural constraints.
```

## 📄 Core Node Templates

You can use these templates to manually create new nodes.

### Standard Database Node
```markdown
---
id: node_db_example
configId: node_standards_database
title: Example Database
type: database
icon: Database
color: '#3b82f6'
tables:
  - name: example_table
    columns: [id, created_at, name]
relations: []
---
# Example Database
Describe the purpose of this database here.
```

### Standard API Node
```markdown
---
id: node_api_example
configId: node_standards_api
title: Example API
type: api
icon: Network
color: '#22c55e'
methods:
  - name: getExample
    description: Fetches example data
relations:
  - targetId: node_db_example
    type: reads
---
# Example API
Describe the endpoints and services here.
```
