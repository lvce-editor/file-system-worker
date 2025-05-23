import { expect, test, jest, beforeEach } from '@jest/globals'

const mockListen = jest.fn()

jest.unstable_mockModule('../src/parts/Listen/Listen.ts', () => ({
  listen: mockListen,
}))

const Main = await import('../src/parts/Main/Main.ts')

beforeEach(() => {
  mockListen.mockClear()
})

test('main calls listen', async () => {
  await Main.main()
  expect(mockListen).toHaveBeenCalled()
})

test('handles listen error', async () => {
  // @ts-ignore
  mockListen.mockRejectedValue(new Error('Failed to listen'))
  await expect(Main.main()).rejects.toThrow('Failed to listen')
})
