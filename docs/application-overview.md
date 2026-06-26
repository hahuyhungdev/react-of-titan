# 💻 Application Overview

A feature-based React application demonstrating scalable architecture patterns for production-ready frontend projects.

## What This Is

A reference architecture for building React applications organized by **business features** rather than file types. Each feature is self-contained — it owns its components, hooks, API calls, types, and utilities.

## Tech Stack

| Tool         | Version | Purpose                   |
| ------------ | ------- | ------------------------- |
| React        | 19      | UI framework              |
| TypeScript   | 5.8     | Type safety               |
| Vite         | 6.x     | Build tool and dev server |
| React Router | 7.x     | Client-side routing       |
| ESLint       | 9.x     | Code linting              |
| Prettier     | 3.x     | Code formatting           |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable            | Default | Description               |
| ------------------- | ------- | ------------------------- |
| `VITE_API_BASE_URL` | `/api`  | Base URL for API requests |

## AI Coding Config

This project uses [ai-coding-config](https://github.com/hahuyhungdev/ai-coding-config) for standardized AI assistant behavior. It provides specialized agents (`architect`, `code-reviewer`, `security-reviewer`, `tdd-guide`), skills (`frontend-design`, `tdd-workflow`, `verification-loop`), and coding rules that enforce quality standards.

To install or update:

```bash
python3 ~/.claude/skills/*/install.py --project . --claude
```

The agents and skills help maintain consistency when AI assistants work on this codebase — use them for architecture decisions, code reviews, security analysis, and TDD workflows.
