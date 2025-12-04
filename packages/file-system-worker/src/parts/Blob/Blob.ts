/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as BlobUtil from 'blob-util'
import * as NormalizeBlobError from '../NormalizeBlobError/NormalizeBlobError.ts'
import { VError } from '../VError/VError.ts'

export const base64StringToBlob = (base64String: string): Blob => {
  try {
    return BlobUtil.base64StringToBlob(base64String)
  } catch (error) {
    const normalizedError = NormalizeBlobError.normalizeBlobError(error)
    throw new VError(normalizedError, 'Failed to convert base64 string to blob')
  }
}

export const binaryStringToBlob = async (string: string, type?: string): Promise<Blob> => {
  try {
    return BlobUtil.binaryStringToBlob(string, type)
  } catch (error) {
    const normalizedError = NormalizeBlobError.normalizeBlobError(error)
    throw new VError(normalizedError, 'Failed to convert binary string to blob')
  }
}

export const blobToBinaryString = async (blob: Blob): Promise<string> => {
  try {
    return await BlobUtil.blobToBinaryString(blob)
  } catch (error) {
    const normalizedError = NormalizeBlobError.normalizeBlobError(error)
    throw new VError(normalizedError, 'Failed to convert blob to binary string')
  }
}
