import { expect, jest, test } from '@jest/globals'
import * as Terminate from '../src/parts/Terminate/Terminate.ts'

test('terminate', () => {
  const mockClose = jest.fn()
  Object.defineProperty(globalThis, 'close', {
    configurable: true,
    value: mockClose,
  })
  Terminate.terminate()
  expect(mockClose).toHaveBeenCalled()
})
