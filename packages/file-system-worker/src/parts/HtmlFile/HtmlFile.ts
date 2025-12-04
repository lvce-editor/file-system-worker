import * as RendererProcess from '../RendererProcess/RendererProcess.ts'

export const getBinaryString = (file: File): Promise<string> => {
  return RendererProcess.invoke('Blob.blobToBinaryString', file) as Promise<string>
}
