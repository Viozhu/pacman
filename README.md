# 👾 Pac-Man

A faithful Pac-Man clone built with React 19, TypeScript, and a custom game engine — running entirely in the browser.

```
████████████████████████████████████████████████████████
█ · · · · · · · · · · · · · · · · · · · · · · · · · · █
█ · ██ · ████████ · ██████ · ████████ · ██ · █
█ ● ██ · ████████ · ██████ · ████████ · ██ ● █
█ · ██ · · · · · · · · · · · · · · · · ██ · █
█ · ████ · ██ · ████████████ · ██ · ████ · █
█ · · · · · ██ · · · ██ · · · ██ · · · · · █
████████ · ████ · ███   ███ · ████ · ████████
         · ██ · ██ BLINKY ██ · ██ ·
         · · · ██           ██ · · ·
████████ · ██ · ██████████████ · ██ · ████████
█ · · · · · · · · · · · · · · · · · · · · · █
█ · ██ · ████████ · ██████ · ████████ · ██ · █
█ ● · · · · · · ·  C>    · · · · · · · · ● █
█ · ██████ · ██ · ██████████ · ██ · ██████ · █
████████████████████████████████████████████████████████
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8 |
| Routing | TanStack Router |
| Data Fetching | TanStack Query |
| State Management | Zustand + Immer |
| Styling | Tailwind CSS v4 |
| Backend | Supabase |

---

## Architecture

```
src/
├── engine/               # Game engine (framework-agnostic)
│   ├── core/             # Game, GameLoop, InputManager, Renderer
│   ├── entities/         # Pac-Man, Ghost, Pellet entities
│   ├── maze/             # Maze parser and level data
│   │   └── levels/       # level1.ts (28×31 grid)
│   ├── systems/          # Game systems (collision, scoring, AI)
│   └── utils/            # Vector2D, Direction, Constants
├── components/           # React UI components
├── routes/               # TanStack Router pages
├── store/                # Zustand global state
├── hooks/                # Custom React hooks
├── services/             # Supabase API calls
└── types/                # Shared TypeScript types
```

### Game Engine

The engine is completely decoupled from React. It runs on a fixed `GameLoop` that ticks at 60fps, processes `InputManager` events, and renders each frame via `Renderer`. The React layer simply mounts a `<canvas>` and subscribes to the Zustand store for UI state (score, lives, etc.).

```
InputManager → GameLoop → systems → entities → Renderer
                   ↑                              ↓
             [60fps tick]                    [canvas 2D]
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.19 or ≥ 22.12
- pnpm

### Install & Run

```bash
# Install dependencies
pnpm install

# Start dev server at http://localhost:3000
pnpm dev
```

### Other Commands

```bash
pnpm build          # Type-check + production build
pnpm lint           # ESLint
pnpm tsc --noEmit   # Type-check only (no emit)
pnpm test           # Run tests with Vitest
pnpm test:watch     # Watch mode
```

---

## Path Aliases

```ts
@/components  →  src/components
@/engine      →  src/engine
@/hooks       →  src/hooks
@/store       →  src/store
@/types       →  src/types
@/lib         →  src/lib
```

---

## TypeScript Rules

This project uses strict TypeScript settings:

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no `enum`, use `const` objects with `as const`
- `noUnusedLocals/Params: true` — no unused variables or parameters

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm tsc --noEmit` — both must pass
4. Open a PR using the provided template

---

## License

MIT
