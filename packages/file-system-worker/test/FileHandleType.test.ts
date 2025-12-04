import { expect, test } from '@jest/globals'
import * as FileHandleType from '../src/parts/FileHandleType/FileHandleType.ts'

test('Directory constant', () => {
  expect(FileHandleType.Directory).toBe('directory')
})

test('File constant', () => {
  expect(FileHandleType.File).toBe('file')
})

