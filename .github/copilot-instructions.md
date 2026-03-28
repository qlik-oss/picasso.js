# Copilot Instructions for picasso.js

## Project Overview

**picasso.js** is a data visualization charting library for the Qlik product suites. It's a monorepo using **pnpm** workspaces and **lerna** for package management, containing:
- `packages/picasso.js` - main charting library
- `packages/test-utils` - shared testing utilities
- `plugins/hammer` - HammerJS gesture support plugin
- `plugins/q` - Qlik hypercube integration plugin

## Quick Start

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages (production)
pnpm build:dev        # Build for development (faster, unminified)
pnpm build:watch      # Watch mode for development
pnpm lint             # Check code style
pnpm test             # Run all tests
```

## Build, Test & Lint

### Builds

- **`pnpm build`** - Builds all packages in production mode (minified UMD + ESM)
- **`pnpm build:dev`** - Faster dev build (same output, unminified)
- **`pnpm build:watch`** - Watches and rebuilds on file changes

Individual packages are built using **Rollup** (see `rollup.config.js`). Each package generates:
- UMD bundle: `dist/[package-name].js`
- ESM bundle: `dist/[package-name].esm.js`
- Source maps included

### Testing

- **`pnpm test`** - Runs both unit and component tests
- **`pnpm test:unit`** - Jest unit tests only (pattern: `**/src/**/__tests__/*.spec.[jt]s`)
- **`pnpm test:unit:watch`** - Unit tests in watch mode
- **`pnpm test:component`** - Component tests (pattern: `**/test/component/**/*.comp.js`)
- **`pnpm test:integration:local`** - Integration tests (requires `jest.integration.config.js`)
- **`pnpm test:integration:ci`** - CI integration tests (uses `test/scripts/run-integration-tests.js`)

Jest is configured in `jest.config.js` with:
- **Test setup**: Chai (expect/assert), Sinon (mocks/stubs), jsdom environment
- **Transform**: Babel (supports TypeScript, JSX with pragma `h`)
- **Transform ignore**: Preact and d3.* are transformed (not ignored)
- **Reports**: JUnit XML to `reports/junit/`, coverage to `reports/coverage/`

### Linting

- **`pnpm lint`** - Check code style across all packages
- **`pnpm lint:fix`** - Auto-fix style issues (in individual packages)

Uses **ESLint** with:
- Config: `@qlik/eslint-config` (qlik rules)
- **Prettier** integration (formatting)
- JSX support via `@babel/plugin-transform-react-jsx` with pragma `h` (Preact-style)
- TypeScript via `@typescript-eslint/parser`

## Key Conventions & Patterns

### Monorepo Structure

This project uses **lerna v9** with **pnpm v10** (`pnpm-workspace.yaml`):
- Packages are published from `packages/` and `plugins/` directories
- The `docs` package and `test-utils` are excluded from publishing (see `lerna.json` config)
- Common root-level configuration is in `babel.config.js`, `tsconfig.base.json`, `rollup.config.js`

When modifying packages:
- Each package has its own `src/`, `dist/`, and `tsconfig.json`
- Individual packages can be built with `lerna run build -- --scope={package-name}`
- Use `pnpm -r` to run scripts across workspaces

### TypeScript & JSX

- **JSX pragma**: Uses `h` (Preact-style), configured in Babel and `tsconfig.base.json`
- **TypeScript target**: Babel preset with support for TypeScript, JSX, and React transforms
- **Strict mode**: Disabled globally in `tsconfig.base.json` (noImplicitAny, strictNullChecks, etc. are all false)
- **Type checking**: Run `pnpm types:check` to verify types without building

### Testing Patterns

**Setup** (`jest.setup.js`):
- Globally exposes `expect`, `chai`, `sinon` (no imports needed in tests)
- Uses `chai-subset` for partial object matching
- jsdom for browser-like environment

**Test file locations**:
- Unit tests: `packages/*/src/__tests__/*.spec.js` or `*.spec.ts`
- Component tests: `packages/*/test/component/**/*.comp.js`
- Integration tests: `test/integration/`

**Test framework**:
- Assertions: Chai (BDD style with `expect`)
- Mocks/Stubs: Sinon + sinon-chai plugin
- Test runner: Jest with jsdom environment

### Git & Commits

**Conventional Commits** (enforced by husky + commitlint):
- Type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`, `revert`
- Scope (optional): Describe the affected area (e.g., `fix(data)`, `docs(examples)`)
- Example: `fix(axis): prevent label overflow` or `docs: update API reference`

**Workflow**:
- Work on `master` branch (pull requests into `master`)
- Base feature branches on `master`
- Use conventional commits for automatic changelog generation (lerna + conventional commits)

### Commit Message Formatting

Use **conventional commits** format:
```
<type>(<scope>): <subject>

<body>
```

Examples:
- `feat(components): add custom axis markers`
- `fix(core): resolve scale domain calculation`
- `docs: update contribution guidelines`

### Build Output

- **Main package** (`picasso.js`):
  - UMD: `packages/picasso.js/dist/picasso.js`
  - ESM: `packages/picasso.js/dist/picasso.esm.js`
  - Types: `packages/picasso.js/types/index.d.ts`
- **Plugins**: Similar structure under `plugins/*/dist`

### Code Style

- **Formatter**: Prettier (configured in `.prettierrc`)
  - Line width: 120
  - Single quotes
  - Trailing commas (ES5)
  - LF line endings
- **Linter**: ESLint with Prettier plugin
  - Exceptions: bitwise ops, continue, multi-assign, param reassignment allowed
  - No console restrictions in browser code

### Publishing & Versioning

**Lerna v9** manages publishing:
- Conventional commits trigger version bumps automatically
- Commit format determines SemVer: `fix:` = patch, `feat:` = minor, `BREAKING CHANGE:` = major
- Publishing to npm requires pushing to `master` branch
- Changelog auto-generated from commit messages

Use `pnpm bump` to bump versions (does not push).

## Common Tasks

### Add a new package
```bash
pnpm lerna create my-plugin --yes
```

### Run a script on a single package
```bash
pnpm -r run build --filter=picasso.js
# or
lerna run build --scope=picasso.js
```

### Clean & reinstall
```bash
pnpm clean
pnpm install
```

### Check types without building
```bash
pnpm types:check
```

### Format code
```bash
pnpm format
```

## Key Files & Configuration

| File | Purpose |
|------|---------|
| `package.json` (root) | Workspace scripts, shared dev dependencies |
| `pnpm-workspace.yaml` | Defines package locations |
| `lerna.json` | Lerna config (versioning, publishing, scope) |
| `tsconfig.base.json` | Root TypeScript config (JSX, strict settings) |
| `babel.config.js` | Root Babel config (presets for all packages) |
| `rollup.config.js` | Root Rollup config (UMD/ESM builds) |
| `jest.config.js` | Root Jest config (unit & component tests) |
| `eslint.config.mjs` | ESLint config (latest flat format) |
| `.prettierrc` | Prettier formatting rules |
| `.commitlintrc.js` | Commit message validation |
| `renovate.json` | Dependency update automation |

## Notes for Copilot Sessions

- When modifying multiple packages, remember to `pnpm build:dev` before testing to see changes reflected
- Integration tests can be slow; use `pnpm test:unit` during development
- Always run `pnpm lint` and `pnpm test` before committing
- Use `pnpm types:check` to catch TypeScript errors without a full build
- For bug fixes, add test cases to `packages/*/src/__tests__/` or `packages/*/test/component/`
- When adding dependencies, run `pnpm install` in the affected package directory
