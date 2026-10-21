import { expect, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import * as FileHandleType from '../src/parts/FileHandleType/FileHandleType.ts'
import * as FileHandleTypeMap from '../src/parts/FileHandleTypeMap/FileHandleTypeMap.ts'

test('getDirentType for Directory', () => {
  const result = FileHandleTypeMap.getDirentType(FileHandleType.Directory)
  expect(result).toBe(DirentType.Directory)
})

test('getDirentType for File', () => {
  const result = FileHandleTypeMap.getDirentType(FileHandleType.File)
  expect(result).toBe(DirentType.File)
})

test('getDirentType for unknown', () => {
  const result = FileHandleTypeMap.getDirentType('unknown')
  expect(result).toBe(DirentType.Unknown)
})
