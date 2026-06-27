<!-- GENERATED FILE - DO NOT EDIT DIRECTLY. EDIT templates/base_instructions.md INSTEAD -->

# Global Copilot Instructions for ECC

## 1. Core Workflow

- **Research-first development**: Always inspect existing code and architecture before proposing changes.
- **Strict Planning**: For complex features, generate a step-by-step implementation plan before coding.
- **TDD / Verification**: Use Test-Driven Development (TDD) for behavior changes and risky refactors by writing tests first. For documentation, configurations, or non-functional changes, validate with syntax checks, lints, or smoke tests as appropriate.
- **Strict TDD Enforcement**: You must decline any requests to skip TDD or write production code first for behavioral or functional logic changes. Always insist on writing failing test cases first (RED phase), even if the user asks to save time.
- **Conventional Commits**: Format commit messages as `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

## 2. Token & Context Management

- **RTK (Rust Token Killer)**: Always prefix terminal commands with `rtk` to save tokens. Use `rtk proxy <cmd>` only when full output is required (e.g. debugging verbose build/test errors).
- **On-Demand Skills (Balanced)**: To preserve context and avoid token bloat, load and read specific skills under `~/.claude/skills/<skill-name>/SKILL.md (or ~/.codex/skills/)` when the current task aligns with the skill's domain. **Inspect the local `skills/` or global skills folder first to discover available skills (e.g., `frontend-design`, `design-system`, `frontend-patterns` for UI tasks).** Graphify is the exception in graph-enabled projects: if the project Graphify block applies, run the listed `rtk graphify ...` command first instead of reading skill files or listing directories. Avoid pre-loading unrelated skills at startup.
- **Avoid Dual-Calling Skills**: Avoid loading overlapping skills in the same turn. For example, use `tdd-workflow` during active development, and `verification-loop` for final verification (build/lint/typecheck) at the end of a task rather than calling both concurrently. Refer to `security-review` as a checklist for sensitive paths and for deep, language-specific security reviews.
- **Strategic Compaction**: For long-running tasks, proactively call the `compact` skill at logical milestones to summarize progress, keep latency fast, and prevent token bloat.

## 2.5. Anti-Loop Debugging

- **Blocked Tool Recovery**: If a hook or policy blocks a tool call, do not retry the same blocked tool call or attempt equivalent bypasses. Use the context already available, run the required Graphify query if applicable, or switch to a documented diagnostic command.
- **No Fresh-Session Bypasses**: Do not spawn subagents or fresh sessions to bypass blocked tools, Graphify quota, or current session scope restrictions. If the current session is blocked, report the blocker and the next safe diagnostic path.
- **Prefer Existing Diagnostics**: Before creating any temporary debugging helper, check for existing diagnostic scripts, tests, or project utilities that already answer the question. For conversation log debugging in this repo, use `rtk python3 scripts/inspect_conversation.py <conversation_id> --step-index <n> --keyword "<text>"`; add `--compare-logs` when comparing compact vs full transcripts.
- **No Scratch Reader Bypasses**: Do not create or run scratch reader scripts to bypass blocked direct reads/searches or Graphify policy. Scratch scripts are allowed only for durable diagnostics when no project utility exists, and they must not hard-code magic transcript indexes without also validating the total count and search keyword.
- **Validate Full Data When Debugging Truncation**: When investigating missing or clipped text, capture full lengths and keyword presence. Do not rely on substring-only previews as proof that the source data is truncated.
- **Stop After Two Failed Attempts**: If two consecutive attempts to inspect the same fact are blocked or inconclusive, stop and report the blocker, the exact fact still unknown, and the next safe diagnostic path instead of continuing to loop.

## 3. MCP & Tools Integration

- **MCP Server Discovery & Management**: Core servers (`playwright`, `context7`, `memory`, `sequential-thinking`) are enabled by default for frontend/documentation tasks. Optional servers (`postgres`, `sqlite`, `docker`, `aws`) are registered but disabled. **Run `python3 scripts/mcp-toggle.py list` to inspect status, and `python3 scripts/mcp-toggle.py enable <name>` to enable optional servers dynamically if needed.** After enabling, restart the CLI session to activate the new server.
- **MCP Fallback Strategy**: When an optional MCP server is disabled, do NOT attempt to call its tools. Instead, fall back to equivalent shell commands (e.g., `rtk sqlite3 db.sqlite ".schema"` instead of SQLite MCP, `docker ps` instead of Docker MCP). Always check server availability before proposing MCP-dependent workflows.
- **Browser Automation**: Run E2E tests and visual verification using Playwright MCP on the `msedge` (Microsoft Edge) channel.

## 4. UI/UX Aesthetics

- **Aesthetic Ownership**: Follow the strict anti-slop guidelines in `rules/ecc/design-quality.md`. **Avoid generic "AI slop" aesthetics (e.g., cliched purple-to-blue gradients, overused sans-serif font stacks like Inter/Roboto, or purposeless glassmorphic cards).**
- **Decline AI Slop Requests**: If the user or a parent agent explicitly requests generic purple/blue gradients, glassmorphism blur effects on cards, or other stock templates, you MUST politely decline and refuse to implement them, explaining that they represent generic 'AI slop' aesthetics. Instead, propose and guide the user to a more distinct and contextual design direction.
- **Premium Interfaces**: Use the `frontend-design` and `design-system` skills to build premium interfaces. **Choose a bold, intentional design direction (e.g., brutalist, minimal, retro-futuristic, editorial) tailored to the product context.** Align with the existing design system and product context; prefer clean, restrained, and usable layouts. Pair a distinctive display font with a readable body font, and use CSS custom properties for color tokens. Apply richer visual treatment only when appropriate for the context.

## 5. Specialized Agents

Load and delegate complex tasks to specialized agents under `~/.claude/agents/ (or ~/.codex/agents/)` using the `/agent` command, following these practical guidelines:

- **Practical Delegation**: Spawning child agents is recommended when the task aligns with their dedicated role (e.g., delegating complex database queries to `database-reviewer` or security reviews to `security-reviewer`), or when you need an isolated context/background run.
- **Avoid Over-spawning & Overlap**: Solve simple tasks within the main conversation first. Avoid spawning multiple subagents concurrently. Do NOT spawn multiple review agents for the same changes unless it is a mixed-stack project (where TS/JS and non-TS/JS files both changed, and separate reviewers are scoped to their respective domains). For pure TypeScript/JavaScript changes, use ONLY `typescript-reviewer`. For non-TS/JS changes, use ONLY `code-reviewer`. Use `reviewer` only as a final verification check before submitting a PR.
- **Architect vs Planner**: Use `architect` to decide design patterns and schemas first, then use `planner` to break down implementation tasks.
- **Liveness Protection**: Always schedule a liveness timer (using the `schedule` tool) when spawning subagents to prevent CLI hangs in case they get stuck or fail to report back.
- **Termination Contract**: Always instruct subagents in their prompt to call the `send_message` tool back to the parent conversation ID upon completion (regardless of success or failure).

| Agent                 | Purpose                            | When to Use                        |
| --------------------- | ---------------------------------- | ---------------------------------- |
| reviewer              | PR review (correctness + security) | After writing code                 |
| docs-researcher       | API/docs verification              | Before implementing APIs           |
| planner               | Implementation planning            | Complex features, refactoring      |
| code-reviewer         | Code quality review                | After writing code                 |
| security-reviewer     | Security analysis                  | Auth, user input, API endpoints    |
| build-error-resolver  | Fix build/type errors              | When build fails                   |
| tdd-guide             | Test-driven development            | New features, bug fixes            |
| typescript-reviewer   | TypeScript/JS review               | All TS/JS changes                  |
| database-reviewer     | PostgreSQL specialist              | Schema changes, query optimization |
| e2e-runner            | Playwright E2E testing             | Critical user flows                |
| performance-optimizer | Performance analysis               | Slow code, bundle size             |
| refactor-cleaner      | Dead code cleanup                  | Code maintenance                   |
| architect             | System design                      | Architecture decisions             |

## 6. Graphify — Knowledge Graph Navigation

<!-- ai-coding-config:graphify-start -->

## graphify

⚠️ GRAPHIFY WORKFLOW RULES (MANDATORY — READ BEFORE ANY CODEBASE EXPLORATION):

**CRITICAL: For ANY question about codebase structure, architecture, or file relationships, your VERY FIRST tool call MUST be `rtk graphify query "<question>"`. Do NOT use `list_dir`, `grep_search`, `find`, `cat`, or `view_file` as your first exploration step. Graphify-first is non-negotiable.**

Commands:

- Architecture questions → `rtk graphify query "question"`
- Code relationships → `rtk graphify path "A" "B"`
- Deep-dive concepts → `rtk graphify explain "concept"`
- Impact analysis / reverse dependencies → `rtk graphify affected "SymbolName"`

Rules:

- For broad codebase exploration, use **Graphify-first**. Do NOT use view_file, list_dir, cat, grep, sed, awk, or inline scripts to discover unknown files or architecture.
- For architecture or relationship questions, do not inspect Graphify skill files, list workspace directories, or check permissions before the first Graphify query. Use the commands listed above directly.
- Exact user-provided file paths may be read normally first. Use Graphify after that when mapping those files to routes, components, dependencies, or architecture.
- Use at most **20 Graphify calls** total per question. After 20 calls, hard stop and synthesize from available context.
- **Focus queries on specific symbols** — prefer `graphify query "what does X do"` over `graphify query "explain the codebase"`.
- **Synthesize architecture/discovery answers from Graphify context first.** Supplement with targeted direct file reads only when the file path is explicit or Graphify has identified it.
- **If a tool call is blocked, do not retry.** Proceed and answer using the available context.
- Dirty `graphify-out/` files are expected after hooks or incremental updates and are not a reason to skip Graphify.
- Do not manually read or parse graphify-out/graph.json; it is an internal artifact. Use the graphify CLI (`rtk graphify query/path/explain/affected`) instead. Existence probes such as `test -f graphify-out/graph.json` are acceptable.
- When the user provides an exact `@path` or file path, read that path directly if useful; do not list parent directories to locate it.
- Explicit docs or source files may be read as user-provided context before Graphify. Mapping those files to source code, routes, components, or architecture still requires Graphify.
- Do not create or run scratch reader scripts such as `scratch_read.py` to inspect files; use Graphify or targeted direct reads after Graphify instead.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only when scoped queries are insufficient or the user requests a broad report.

Post-Discovery Reads (exceptions):

- After Graphify discovery, targeted raw reads ARE allowed for: **editing**, **debugging**, and **config review** of specific files already identified by Graphify.
- You MUST have run at least one Graphify query before reading source files directly.
- When reading after discovery, state your justification (e.g., "Reading for editing" or "Verifying config structure").
- After modifying code, run `graphify update .`.

Blocked Tool Recovery:

- If a hook blocks a direct read/search or inline script, do not retry the same blocked call or attempt an equivalent bypass.
- Do not spawn subagents or fresh sessions to bypass blocked tools, Graphify quota, or current session scope restrictions.
- Do not create or run scratch reader scripts to bypass direct read/search restrictions. Scratch scripts are allowed only for durable diagnostics when no project utility exists.
- For conversation log debugging in this repo, use `rtk python3 scripts/inspect_conversation.py <conversation_id> --step-index <n> --keyword "<text>"`; add `--compare-logs` when comparing compact vs full transcripts.
- When debugging truncation, measure full content length and keyword presence; do not use substring-only previews as evidence.
<!-- ai-coding-config:graphify-end -->
