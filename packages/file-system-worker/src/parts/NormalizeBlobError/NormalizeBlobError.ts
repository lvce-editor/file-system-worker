export const normalizeBlobError = (error: unknown): unknown => {
  const hasProgressEvent = typeof globalThis.ProgressEvent !== 'undefined'
  if (
    error &&
    hasProgressEvent &&
    error instanceof ProgressEvent &&
    error.target &&
    // @ts-expect-error - target.error may not be in the type definition
    error.target.error
  ) {
    // @ts-expect-error - target.error may not be in the type definition
    return error.target.error
  }
  return error
}
