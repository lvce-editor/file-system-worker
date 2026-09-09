import { defineConfig } from 'eslint/config'
import config, { recommendedActions, recommendedRegex } from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config,
  ...recommendedActions,
  ...recommendedRegex,
  {
    rules: {
      'jest/no-restricted-jest-methods': 'off',
      '@cspell/spellchecker': 'off',
      'e18e/prefer-string-fromcharcode': 'off',
    },
  },
])
