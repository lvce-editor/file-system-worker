import { expect, test } from '@jest/globals'
import * as FileHandlePermissionType from '../src/parts/FileHandlePermissionType/FileHandlePermissionType.ts'

test('Granted constant', () => {
  expect(FileHandlePermissionType.Granted).toBe('granted')
})

test('Prompt constant', () => {
  expect(FileHandlePermissionType.Prompt).toBe('prompt')
})

test('Denied constant', () => {
  expect(FileHandlePermissionType.Denied).toBe('denied')
})
