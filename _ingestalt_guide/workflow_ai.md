# AI-Powered Workflow

Ingestalt is designed to be the "Context Layer" between your brain and your IDE. The goal is to move from **Architectural Intent** to **Implementation** with zero friction.

## The "Editorial Engineering" Loop

1. **Curate**: Use the **Inspector** to ensure a node's properties (Tables, Interfaces) accurately reflect the system state.
2. **Inject**: Open the **AI Tasks** tab in the Inspector.
3. **Select**: Use the **Architectural Field Selection** to pick only the relevant sub-properties.
4. **Prompt**: Copy the generated prompt into your IDE's AI assistant (e.g., Cursor, IBM Bob, or GitHub Copilot).

## Using the AI Task Prompt Builder

The Prompt Builder isn't just a text generator; it's a **Context Filter**.

### 1. Granular Context Selection
Don't overwhelm the AI with the entire node. Use the toggles to selectively include:
- **Markdown Content**: For high-level intent and documentation.
- **Node Properties**: For structured data (like DB schemas or API methods).
- **Graph Relationships**: To show the AI how this node fits into the larger system.

### 2. Heuristic Discovery
If you are working with a `database` node, Ingestalt "reads" your Markdown to find `interface` definitions. You can select these "Virtual Fields" to give the AI a perfect understanding of your data models without manually typing them into a YAML file.

## IDE Integration Strategy

### Scenario: Implementing a New API Endpoint
1. Select the **API Node** on the canvas.
2. Ensure the `methods` list reflects the new endpoint signature.
3. Select the related **Database Node** and draw a `reads` edge to the API node.
4. In the **AI Task Builder**, select:
    - The API node's `methods`.
    - The Database node's `schema`.
5. The generated prompt will contain the exact endpoint definition AND the database schema it needs to query.

### Scenario: Refactoring a Frontend Component
1. Select the **Frontend Node**.
2. Select the `components` property to show current sub-components.
3. In the generated prompt, the AI will see exactly what dependencies it has and can suggest a cleaner decomposition.

## The Grounding Loop (IDE ↔ Ingestalt)

For the AI Task Builder to be effective, it must use the latest state of your code.
- **Edit in IDE**: If you change a database schema or API signature in VS Code.
- **Re-Sync**: Click the **Refresh** icon in Ingestalt to pull those changes into the database.
- **Generate**: Open the AI Task Builder. It will now use the **Live Code State** to generate its prompt.
- **Implement**: Paste the prompt back into your IDE.

This loop ensures that the AI is never working with stale architectural data.

## Best Practices
- **Keep Nodes Atomic**: A node should represent a single conceptual unit (a file, a table, a service).
- **Use Edges for Context**: The AI can better understand a bug if it knows which other service provides the data.
- **Surgical Injection**: Only select the fields the AI *actually* needs for the current task to keep context windows clean.
