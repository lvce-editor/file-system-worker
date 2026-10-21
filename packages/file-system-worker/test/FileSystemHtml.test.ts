import { beforeEach, expect, jest, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import * as FileHandlePermissionType from '../src/parts/FileHandlePermissionType/FileHandlePermissionType.ts'
import * as FileHandleType from '../src/parts/FileHandleType/FileHandleType.ts'
import { FileNotFoundError } from '../src/parts/FileNotFoundError/FileNotFoundError.ts'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts', () => {
  return {
    getChildHandles: jest.fn(() => {
      throw new Error('not implemented')
    }),
    getDirents: jest.fn(() => {
      throw new Error('not implemented')
    }),
    getFileHandle: jest.fn(() => {
      throw new Error('not implemented')
    }),
  }
})

jest.unstable_mockModule('../src/parts/FileSystemHandlePermission/FileSystemHandlePermission.ts', () => {
  return {
    queryPermission: jest.fn(() => {
      throw new Error('not implemented')
    }),
    requestPermission: jest.fn(() => {
      throw new Error('not implemented')
    }),
  }
})
jest.unstable_mockModule('../src/parts/PersistentFileHandle/PersistentFileHandle.ts', () => {
  return {
    addHandle: jest.fn(() => {
      throw new Error('not implemented')
    }),
    addHandles: jest.fn(() => {
      throw new Error('not implemented')
    }),
    getHandle: jest.fn(() => {
      throw new Error('not implemented')
    }),
    removeHandle: jest.fn(() => {
      throw new Error('not implemented')
    }),
  }
})

const FileSystemHtml = await import('../src/parts/FileSystemHtml/FileSystemHtml.ts')
const FileSystemDirectoryHandle = await import('../src/parts/FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts')
const FileSystemHandlePermission = await import('../src/parts/FileSystemHandlePermission/FileSystemHandlePermission.ts')
const PersistentFileHandle = await import('../src/parts/PersistentFileHandle/PersistentFileHandle.ts')

class NotAllowedError extends Error {
  constructor() {
    super('The request is not allowed by the user agent or the platform in the current context.')
    this.name = 'NotAllowedError'
  }
}

class UserActivationRequiredError extends Error {
  constructor() {
    super('User activation is required to request permissions.')
  }
}

class NoErrorThrownError extends Error {}

/**
 *
 * @param {any} promise
 * @returns {Promise<Error>}
 *  */
const getError = async (promise: Readonly<Promise<unknown>>): Promise<unknown> => {
  try {
    await promise
    throw new NoErrorThrownError()
  } catch (error) {
    // @ts-ignore
    return error
  }
}

test('exists - exists', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockResolvedValue({})
  await expect(FileSystemHtml.exists('html:///test')).resolves.toBe(true)
})

test('exists - does not exist', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockResolvedValue(undefined)
  await expect(FileSystemHtml.exists('html:///test')).resolves.toBe(false)
})

test('readDirWithFileTypes', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {}
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getChildHandles.mockImplementation(() => {
    return [
      {
        kind: FileHandleType.File,
        name: 'file-1.txt',
      },

      {
        kind: FileHandleType.Directory,
        name: 'folder-2',
      },
    ]
  })

  expect(await FileSystemHtml.readDirWithFileTypes('html:///test-folder')).toEqual([
    {
      name: 'file-1.txt',
      type: DirentType.File,
    },
    {
      name: 'folder-2',
      type: DirentType.Directory,
    },
  ])
})

test('readDirWithFileTypes - error', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {}
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getChildHandles.mockImplementation(() => {
    throw new TypeError('x is not a function')
  })
  await expect(FileSystemHtml.readDirWithFileTypes('test-folder')).rejects.toThrow(
    new Error('failed to read directory: failed to get child handles: TypeError: x is not a function'),
  )
})

test('readDirWithFileTypes - not allowed - fallback succeeds', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {}
  })
  let i = 0
  let j = 0
  // @ts-ignore
  FileSystemHandlePermission.requestPermission.mockImplementation(() => {
    return FileHandlePermissionType.Granted
  })
  // @ts-ignore
  FileSystemHandlePermission.queryPermission.mockImplementation(() => {
    switch (i++) {
      case 0:
        return FileHandlePermissionType.Prompt
      case 1:
        return FileHandlePermissionType.Granted
      default:
        return FileHandlePermissionType.Denied
    }
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getChildHandles.mockImplementation(() => {
    if (j++ === 0) {
      throw new NotAllowedError()
    }
    return [
      {
        kind: FileHandleType.File,
        name: 'file-1.txt',
      },
      {
        kind: FileHandleType.Directory,
        name: 'folder-2',
      },
    ]
  })
  expect(await FileSystemHtml.readDirWithFileTypes('test-folder')).toEqual([
    {
      name: 'file-1.txt',
      type: DirentType.File,
    },
    {
      name: 'folder-2',
      type: DirentType.Directory,
    },
  ])
})

test('readDirWithFileTypes - not allowed - fallback fails', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {}
  })
  let i = 0
  let j = 0
  // @ts-ignore
  FileSystemHandlePermission.requestPermission.mockImplementation(() => {
    return FileHandlePermissionType.Granted
  })
  // @ts-ignore
  FileSystemHandlePermission.queryPermission.mockImplementation(() => {
    switch (i++) {
      case 0:
        return FileHandlePermissionType.Prompt
      case 1:
        return FileHandlePermissionType.Granted
      default:
        return FileHandlePermissionType.Denied
    }
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getChildHandles.mockImplementation(() => {
    const error = j++ === 0 ? new NotAllowedError() : new TypeError('x is not a function')
    throw error
  })
  await expect(FileSystemHtml.readDirWithFileTypes('test-folder')).rejects.toThrow(new Error('failed to read directory: TypeError: x is not a function'))
})

test('readDirWithFileTypes - error - user activation required', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {}
  })
  let i = 0
  let j = 0
  // @ts-ignore
  FileSystemHandlePermission.requestPermission.mockImplementation(() => {
    return FileHandlePermissionType.Granted
  })
  // @ts-ignore
  FileSystemHandlePermission.queryPermission.mockImplementation(() => {
    switch (i++) {
      case 0:
        return FileHandlePermissionType.Prompt
      case 1:
        return FileHandlePermissionType.Granted
      default:
        return FileHandlePermissionType.Denied
    }
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getChildHandles.mockImplementation(() => {
    const error = j++ === 0 ? new NotAllowedError() : new UserActivationRequiredError()
    throw error
  })
  await expect(FileSystemHtml.readDirWithFileTypes('test-folder')).rejects.toThrow(
    new Error('failed to read directory: User activation is required to request permissions.'),
  )
})

test.skip('writeFile - not allowed', async () => {
  expect(await FileSystemHtml.readDirWithFileTypes('test-folder')).toEqual([])
})

test('readFile', async () => {
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    return {
      getFile(): { text: () => string } {
        return {
          text(): string {
            return 'test'
          },
        }
      },
    }
  })
  expect(await FileSystemHtml.readFile('html:///test/file.txt')).toBe('test')
})

test('readFile - Firefox file picker fallback is persisted as a read-only File', async () => {
  const file = new File(['selected content'], 'test.txt', { type: 'text/plain' })
  // @ts-ignore
  PersistentFileHandle.getHandle.mockResolvedValue({ file, kind: 'file', name: file.name, readonly: true })
  expect(await FileSystemHtml.readFile('html:///test.txt')).toBe('selected content')
  await expect(FileSystemHtml.isReadonly('html:///test.txt')).resolves.toBe(true)
  await expect(FileSystemHtml.writeFile('html:///test.txt', 'changed')).rejects.toThrow('File test.txt is read-only')
})

test('readFile - not found', async () => {
  let i = 0
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation(() => {
    if (i++ === 0) {
      return undefined
    }
    return {}
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getFileHandle.mockImplementation(() => {
    throw new DOMException('A requested file or directory could not be found at the time an operation was processed.', 'NotFoundError')
  })
  const error = await getError(FileSystemHtml.readFile('/test/not-found.txt'))
  expect(error).toBeInstanceOf(FileNotFoundError)
  expect((error as Error).message).toBe("File not found '/test/not-found.txt'")
})

test('writeFile - creates missing file', async () => {
  const write = jest.fn()
  const close = jest.fn()
  const createWritable = jest.fn(() => {
    return {
      close,
      write,
    }
  })
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation((uri) => {
    switch (uri) {
      case 'html:///test':
        return {}
      default:
        return undefined
    }
  })
  // @ts-ignore
  FileSystemDirectoryHandle.getFileHandle.mockImplementation((handle, name, options) => {
    expect(handle).toEqual({})
    expect(name).toBe('new-file.txt')
    expect(options).toEqual({
      create: true,
    })
    return {
      createWritable,
    }
  })

  await FileSystemHtml.writeFile('html:///test/new-file.txt', 'hello')

  expect(FileSystemDirectoryHandle.getFileHandle).toHaveBeenCalledTimes(1)
  expect(createWritable).toHaveBeenCalledTimes(1)
  expect(write).toHaveBeenCalledTimes(1)
  expect(write).toHaveBeenCalledWith('hello')
  expect(close).toHaveBeenCalledTimes(1)
})

test('writeBlob - creates missing file with the original binary content', async () => {
  const blob = new Blob([new Uint8Array([0, 255, 42])], { type: 'image/png' })
  const write = jest.fn()
  const close = jest.fn()
  const createWritable = jest.fn(() => ({ close, write }))
  const handle = { createWritable }
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation((uri) => (uri === 'html:///test' ? {} : undefined))
  // @ts-ignore
  FileSystemDirectoryHandle.getFileHandle.mockResolvedValue(handle)

  await FileSystemHtml.writeBlob('html:///test/image (2).png', blob)

  expect(FileSystemDirectoryHandle.getFileHandle).toHaveBeenCalledWith(expect.anything(), 'image (2).png', { create: true })
  expect(write).toHaveBeenCalledWith(blob)
  expect(close).toHaveBeenCalledTimes(1)
})

test('remove - file', async () => {
  const removeEntry = jest.fn()
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation((uri) => {
    switch (uri) {
      case 'html:///test':
        return {
          removeEntry,
        }
      case 'html:///test/file.txt':
        return {
          kind: FileHandleType.File,
        }
      default:
        return undefined
    }
  })
  // @ts-ignore
  PersistentFileHandle.removeHandle.mockImplementation(() => {})
  await FileSystemHtml.remove('html:///test/file.txt')
  expect(removeEntry).toHaveBeenCalledTimes(1)
  expect(removeEntry).toHaveBeenCalledWith('file.txt')
  expect(PersistentFileHandle.removeHandle).toHaveBeenCalledTimes(1)
  expect(PersistentFileHandle.removeHandle).toHaveBeenCalledWith('html:///test/file.txt')
})

test('remove - directory', async () => {
  const removeEntry = jest.fn()
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation((uri) => {
    switch (uri) {
      case '/test':
        return {
          removeEntry,
        }
      case '/test/folder':
        return {
          kind: FileHandleType.Directory,
        }
      default:
        return undefined
    }
  })
  // @ts-ignore
  PersistentFileHandle.removeHandle.mockImplementation(() => {})
  await FileSystemHtml.remove('/test/folder')
  expect(removeEntry).toHaveBeenCalledTimes(1)
  expect(removeEntry).toHaveBeenCalledWith('folder', { recursive: true })
  expect(PersistentFileHandle.removeHandle).toHaveBeenCalledTimes(1)
  expect(PersistentFileHandle.removeHandle).toHaveBeenCalledWith('/test/folder')
})

test('remove - error', async () => {
  const removeEntry = jest.fn(() => {
    throw new TypeError('x is not a function')
  })
  // @ts-ignore
  PersistentFileHandle.getHandle.mockImplementation((uri) => {
    switch (uri) {
      case '/test':
        return {
          removeEntry,
        }
      case '/test/file.txt':
        return {
          kind: FileHandleType.File,
        }
      default:
        return undefined
    }
  })
  await expect(FileSystemHtml.remove('/test/file.txt')).rejects.toThrow(new Error('Failed to remove: TypeError: x is not a function'))
})

test.each(['denied', 'prompt'])('directory enumeration retains %s permission behavior', async (permission) => {
  const handle = {} as FileSystemDirectoryHandle
  jest.mocked(FileSystemDirectoryHandle.getChildHandles).mockRejectedValue(new NotAllowedError())
  jest.mocked(FileSystemHandlePermission.queryPermission).mockResolvedValue(permission as PermissionState)
  jest.mocked(FileSystemHandlePermission.requestPermission).mockResolvedValue('denied')
  await expect(FileSystemHtml.getChildHandles(handle)).resolves.toEqual([])
  expect(FileSystemHandlePermission.requestPermission).toHaveBeenCalledTimes(permission === 'prompt' ? 1 : 0)
})
