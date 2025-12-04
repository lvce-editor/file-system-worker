import * as Blob from '../Blob/Blob.ts'

export const getBinaryString = (file: File): Promise<string> => {
  return Blob.blobToBinaryString(file)
}
