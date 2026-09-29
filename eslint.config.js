import { defineConfig } from 'eslint/config'
import config, { recommendedActions } from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config,
  ...recommendedActions,
  {
    rules: {
      'jest/no-restricted-jest-methods': 'off',
      '@cspell/spellchecker': 'off',
      'e18e/prefer-string-fromcharcode': 'off',
    },
  },
  {
    // The pinned application supplies its own Node runtime.
    files: ['.github/workflows/integration.yml'],
    rules: { 'github-actions/node-version-file': 'off', 'github-actions/on': 'off' },
  },
  {
    // The application runner supplies mutable API objects to these scenarios.
    files: ['packages/e2e-integration/src/**/*.ts'],
    rules: { '@typescript-eslint/prefer-readonly-parameter-types': 'off' },
  },
])
