import { test, expect } from '@jest/globals'
import { normalizeBlobError } from '../src/parts/NormalizeBlobError/NormalizeBlobError.ts'

class ProgressEvent {
  target: any = null
}

;(globalThis as any).ProgressEvent = ProgressEvent

test('normalizeBlobError should return target.error for ProgressEvent with target.error', () => {
  const targetError = new Error('Target error')
  const progressEvent = new ProgressEvent()
  progressEvent.target = { error: targetError }

  const result = normalizeBlobError(progressEvent)
  expect(result).toBe(targetError)
})

test('normalizeBlobError should return error as-is for regular Error', () => {
  const error = new Error('Regular error')
  const result = normalizeBlobError(error)
  expect(result).toBe(error)
})

test('normalizeBlobError should return error as-is for null', () => {
  const result = normalizeBlobError(null)
  expect(result).toBe(null)
})

test('normalizeBlobError should return error as-is for undefined', () => {
  const result = normalizeBlobError(undefined)
  expect(result).toBe(undefined)
})

test('normalizeBlobError should return error as-is for ProgressEvent without target', () => {
  const progressEvent = new ProgressEvent()
  const result = normalizeBlobError(progressEvent)
  expect(result).toBe(progressEvent)
})

test('normalizeBlobError should return error as-is for ProgressEvent with target but no error', () => {
  const progressEvent = new ProgressEvent()
  progressEvent.target = {}
  const result = normalizeBlobError(progressEvent)
  expect(result).toBe(progressEvent)
})

test('normalizeBlobError should return error as-is for string error', () => {
  const error = 'String error'
  const result = normalizeBlobError(error)
  expect(result).toBe(error)
})

test('normalizeBlobError should return error as-is for object error', () => {
  const error = { message: 'Object error' }
  const result = normalizeBlobError(error)
  expect(result).toBe(error)
})
