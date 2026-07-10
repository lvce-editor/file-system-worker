import { beforeEach, expect, jest, test } from '@jest/globals'

type MockInvoke = jest.MockedFunction<(method: string, ...params: readonly unknown[]) => Promise<unknown>>

const createInvokeMock = (): MockInvoke => {
  return jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
}

beforeEach(() => {
  jest.resetModules()
})

test('getFileHandles', async () => {
  const invokeMock = createInvokeMock()
  const mockHandles = [{ kind: 'file', name: 'file1' }]
  invokeMock.mockResolvedValue(mockHandles)

  jest.unstable_mockModule('../src/parts/RendererProcess/RendererProcess.ts', () => ({
    invoke: invokeMock,
  }))

  const FileSystemHandle = await import('../src/parts/FileSystemHandle/FileSystemHandle.ts')

  const result = await FileSystemHandle.getFileHandles(['id1'])

  expect(result).toEqual(mockHandles)
  expect(invokeMock).toHaveBeenCalledWith('FileHandles.get', ['id1'])
})

test('addFileHandle', async () => {
  const invokeMock = createInvokeMock()
  const mockHandle = { kind: 'file', name: 'file1' }
  invokeMock.mockResolvedValue(undefined)

  jest.unstable_mockModule('../src/parts/RendererProcess/RendererProcess.ts', () => ({
    invoke: invokeMock,
  }))

  const FileSystemHandle = await import('../src/parts/FileSystemHandle/FileSystemHandle.ts')

  await FileSystemHandle.addFileHandle(mockHandle as FileSystemHandle)

  expect(invokeMock).toHaveBeenCalledWith('FileSystemHandle.addFileHandle', mockHandle)
})
