# 🏫 Indie Dev Toolkit: Architecture & Best Practices Handbook

Welcome to the **Architecture & Best Practices Handbook**, a structured educational resource designed to teach you modern software engineering patterns for frontend and full-stack development. 

This handbook is modeled section-by-section after the **Indie Dev Toolkit** series on [upskills.dev](https://upskills.dev/tutorials/series/indie-dev-toolkit) and enriched with production-grade code illustrations, architectural blueprints, and interactive diagrams.

---

## 🗺️ Learning Roadmap

This handbook is structured into 6 comprehensive, English-language lessons. Follow them sequentially to build a complete mental model of modern software architecture:

```
architecture-docs/
├── README.md                               # Map of the roadmap & overview (You are here)
├── 01-nx-monorepo-architecture.md          # Lesson 1: Nx Monorepo Architecture (7 Sections)
├── 02-nx-monorepo-hands-on.md               # Lesson 2: Hands-on Nx Workspace Setup (8 Sections)
├── 03-react-rendering-strategies.md         # Lesson 3: React Rendering Strategies (6 Sections)
├── 04-react-frontend-architecture.md        # Lesson 4: Frontend Architecture Selection (5 Sections)
├── 05-react-client-and-server-state.md      # Lesson 5: Client vs Server State Separation (6 Sections)
└── 06-react-forms-done-right.md             # Lesson 6: High-Performance React Forms (5 Sections)
```

---

## 📚 Lesson Summaries & Focus Areas

### 📁 [Lesson 1: Nx Monorepo Architecture](./01-nx-monorepo-architecture.md)
*   **Focus**: Large-scale codebase organization, code-sharing, and decoupling.
*   **Key Sections**: Polyrepo vs Monorepo, the "Thin Apps" philosophy, the 4 library categories (Feature, UI, Data-Access, Utility), module boundary rules, and build caching theory.

### 🛠️ [Lesson 2: Hands-on Nx Workspace Setup](./02-nx-monorepo-hands-on.md)
*   **Focus**: Practical implementation, tooling configurations, and workflow orchestration.
*   **Key Sections**: Creating workspaces from scratch, installing framework plugins, path alias routing, task pipelines (`dependsOn`), named input cache strategies, and GitHub Actions pipelines.

### ⚛️ [Lesson 3: React Rendering Strategies](./03-react-rendering-strategies.md)
*   **Focus**: Mastering how, when, and where React code gets converted into HTML.
*   **Key Sections**: CSR (SPA) request waterfalls, SSR and DOM hydration mechanics, SSG/ISR static hosting, React Server Components (RSC) vs SSR, Server Actions, and progressive HTML streaming.

### 🏗️ [Lesson 4: Frontend Architecture Selection](./04-react-frontend-architecture.md)
*   **Focus**: Evaluating and matching technical architectures to team size and business needs.
*   **Key Sections**: The Tech Stack Trap, SPA + API Server decoupling, Full-stack Frameworks (Next.js/Remix), Micro-frontends (MFE) with BFFs (Backend-for-Frontend), and a product-minded architectural checklist.

### 🧠 [Lesson 5: Client vs Server State Separation](./05-react-client-and-server-state.md)
*   **Focus**: Drawing clear boundaries between local UI variables and remote database caching.
*   **Key Sections**: The legacy of Redux-for-everything, Server State attributes & caching lifecycles (TanStack Query), Client State scoping (useState -> Zustand), and deep-linkable URL Query State (`nuqs`).

### 📝 [Lesson 6: High-Performance React Forms](./06-react-forms-done-right.md)
*   **Focus**: Designing forms that are highly responsive, secure, type-safe, and accessible.
*   **Key Sections**: The 4 jobs of a form, React 19 Native Forms + Server Actions, complex Multi-step Wizards (TanStack Form + Zod), editable tables with dynamic Field Arrays, and race-condition prevention via `AbortSignal`.

---

## 🚀 How to Practice

1.  **Read the Handbooks**: Study the markdown documents inside this `architecture-docs/` folder to understand the underlying theory, diagrams, and code snippets.
2.  **Inspect Raw Material**: View the raw downloaded text files in `.playwright-mcp/` at the root of the project to cross-reference the original guides.
3.  **Code and Test**: Open your code editor, boot up local dev servers, inspect component re-renders using React DevTools, and verify that module boundaries are correctly caught by ESLint.
