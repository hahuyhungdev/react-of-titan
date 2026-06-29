# AI Agent Skill Guide

Turning this repository into an AI-agent skill is a good direction. The repo is not just a starter app; it encodes architectural decisions that agents should follow repeatedly across projects.

The portable skill lives at:

```text
skill/react-of-titan/SKILL.md
```

Use it when an agent needs to:

- scaffold a React project with the React of Titan structure;
- refactor a type-based React app into feature-based modules;
- review whether a React project follows the architecture;
- add new features without breaking layer boundaries.

The skill should stay concise. Keep long examples and project documentation in this repo's `docs/` folder, and keep `SKILL.md` focused on action rules, placement decisions, and verification commands.

Quality bar for the skill:

- A fresh agent should add a page-backed feature without importing feature internals from pages.
- The agent should register explicit routes and navigation when requested.
- The agent should add a feature-level test and run the full verification command set.
- The agent should place styling in Tailwind classes or `styles.module.scss`, never JSX inline style props.
- Demo features may keep mock data inside feature hooks; network-bound code should use MSW in tests.

Recommended install target:

```text
~/.codex/skills/react-of-titan/SKILL.md
```

After copying it into an agent skills directory, test it with prompts like:

- "Add a products feature using React of Titan architecture."
- "Review this React repo for React of Titan boundary violations."
- "Refactor this dashboard module into feature-based slices."

## Validation Log

On 2026-06-28, the skill was tested with three isolated Codex sessions in disposable repository copies under `/tmp`.

| Trial | Prompted feature        | Result                                                                                                                             | Follow-up                                                                                                                                   |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Products feature        | Generated a feature slice, page, route, nav item, and tests. Format, lint, architecture check, typecheck, tests, and build passed. | Revealed ambiguity between local mock data and MSW. The skill was refined to distinguish demo/reference mock data from network-bound tests. |
| 2     | Billing summary feature | Generated a feature slice, page, route, nav item, and tests. Format, lint, architecture check, typecheck, tests, and build passed. | No skill change required.                                                                                                                   |
| 3     | Customer health feature | Generated after refinement. Architecture check, typecheck, tests, and build passed in an independent inspection.                   | Confirmed the refined page-backed feature checklist is practical.                                                                           |

The validation standard is not just "the agent finished." A generated feature should pass the repository checks and follow the architecture on inspection:

```bash
npm run format:check
npm run lint
npm run arch:check
npm run typecheck
npm test
npm run build
```
