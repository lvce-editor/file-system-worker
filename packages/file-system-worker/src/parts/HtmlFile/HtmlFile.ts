export const getBinaryString = async (file: File): Promise<string> => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const chunks: string[] = []
  const chunkSize = 32_768
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCodePoint(...bytes.subarray(i, i + chunkSize)))
  }
  return chunks.join('')
}
