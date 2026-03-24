# Project

React 19 + TypeScript + Vite. TanStack Router for routing, TanStack Query for data fetching, Zustand + Immer for state, Tailwind CSS v4 for styling.

## Commands

```bash
pnpm dev         # dev server at http://localhost:3000
pnpm build       # tsc -b && vite build
pnpm lint        # eslint
```

## Path Aliases

Use `@/` to import from `src/`. Specific aliases:

- `@/components` → `src/components`
- `@/engine` → `src/engine`
- `@/hooks` → `src/hooks`
- `@/store` → `src/store`
- `@/types` → `src/types`
- `@/lib` → `src/lib`

## Code Style

- Use ES module imports (`import`), not CommonJS (`require`)
- Use path aliases (`@/components/Button`) over relative paths (`../../components/Button`)
- Use `clsx` + `tailwind-merge` via `cn()` in `@/lib` for conditional class names
- Use `class-variance-authority` for component variants
- Use Immer's `produce` for Zustand state mutations
- No test framework is set up — verify changes by running the dev server and linting

## Workflow

- After making code changes, run `pnpm lint` to catch type and lint errors
- Prefer `tsc --noEmit` for type checking without building
