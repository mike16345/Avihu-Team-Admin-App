# Claude.md

Claude must read and follow `Agents.md` before making any code changes in this repository.

`Agents.md` is the canonical source for:

* Project architecture
* React and TypeScript conventions
* File organization
* API/data-flow patterns
* UI/UX rules
* Testing expectations
* Refactor limits
* Agent operating rules

Before editing code, Claude must:

1. Find and Read `Agents.md`.
2. Follow the existing structure and style of the touched feature.
3. Prefer targeted patches over full-file rewrites.
4. Avoid introducing new patterns unless they are consistent with `Agents.md`.
5. Preserve behavior unless the task explicitly asks for behavior changes.
6. Keep React files modular, readable, and ordered according to the React file structure rules in `Agents.md`.

If a requested change conflicts with `Agents.md`, Claude should stop and explain the conflict before proceeding.
