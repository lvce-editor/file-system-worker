import { expect, test } from '@jest/globals'
import * as CommandMap from '../src/parts/CommandMap/CommandMap.ts'

test('commandMap', async () => {
  expect(typeof CommandMap.commandMap).toBe('object')
})
