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
