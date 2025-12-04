import * as RendererProcess from '../RendererProcess/RendererProcess.ts'

const getText = (file: File): Promise<string> => {
  return file.text()
}

export const getBinaryString = (file: File): Promise<string> => {
  return RendererProcess.invoke('Blob.blobToBinaryString', file) as Promise<string>
}
