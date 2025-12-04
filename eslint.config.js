import config from '@lvce-editor/eslint-config'
import actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config,
  ...actions,
  {
    rules: {
      'jest/no-restricted-jest-methods': 'off',
    },
  },
]
