# ESLint to Oxlint Migration Plan

## Current State

### ESLint Setup
- Config: `eslint.config.mjs` (flat config format)
- Base: `@qlik/eslint-config` v1.4.30 with recommended + cjs configs
- Prettier integration: eslint-config-prettier + eslint-plugin-prettier
- Test overrides for Jest/Puppeteer globals
- Custom rule disables for project-specific policies

### Current Rules Disabled
- `no-bitwise`, `no-continue`, `no-multi-assign`
- `no-param-reassign`, `no-redeclare`, `no-restricted-globals`
- `no-return-assign`, `no-useless-call`, `one-var`
- `prefer-const`, `prefer-object-has-own`
- Test overrides: `no-unused-expressions`, `no-loss-of-precision`

## Migration Strategy

### Phase 1: Dependency Updates
- Add: `oxlint`, `@qlik/oxlint-config`
- Remove ESLint packages only when no rules require them
- Remove obsolete plugins and compatibility packages

### Phase 2: Configuration
- Create minimal `oxlint.config.ts`
- Use `extends: [qlik.esm]` for base config
- Add root `ignorePatterns` from .eslintignore
- Scope test globals via overrides (if needed)

### Phase 3: Scripts & Validation
- Update npm scripts to use oxlint
- Fix remaining lint failures (prefer code fixes)
- Validate all checks pass

### Phase 4: Cleanup
- Remove eslint.config.mjs
- Update .eslintignore references in docs
- Document any remaining ESLint usage (if any)

## Success Criteria
- ✅ Clean oxlint run
- ✅ All tests passing
- ✅ Type checks passing
- ✅ Minimal config (~20 lines)
- ✅ No manual rule lists copied
