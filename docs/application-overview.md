# 💻 Application Overview

A feature-based React application demonstrating scalable architecture patterns for production-ready frontend projects.

## What This Is

A reference architecture for building React applications organized by **business features** rather than file types. Each feature is self-contained — it owns its components, hooks, API calls, types, and utilities.

## Tech Stack

| Tool                  | Version | Purpose                   |
| --------------------- | ------- | ------------------------- |
| React                 | 19      | UI framework              |
| TypeScript            | 5.8     | Type safety               |
| Vite                  | 6.x     | Build tool and dev server |
| React Router          | 7.x     | Client-side routing       |
| Vitest                | 4.x     | Unit/integration tests    |
| React Testing Library | 16.x    | Component tests           |
| MSW                   | 2.x     | API mocking in tests      |
| ESLint                | 9.x     | Code linting              |
| Prettier              | 3.x     | Code formatting           |

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

# Architecture boundary check
npm run arch:check

# Test
npm test

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

## AI Agent Guidance

This project includes AI-agent guidance directly in the repository:

- `AGENTS.md` — repo-local instructions for agents working in this codebase.
- `skill/react-of-titan/SKILL.md` — portable skill guidance for applying this architecture to other projects.

Use the skill when scaffolding, refactoring, or reviewing React projects that should follow React of Titan architecture.
