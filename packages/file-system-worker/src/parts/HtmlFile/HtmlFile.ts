import * as RendererWorker from '../RendererWorker/RendererWorker.js'

export const getText = (file) => {
  return file.text()
}

export const getBinaryString = (file) => {
  return RendererWorker.invoke('Blob.blobToBinaryString', file)
}
