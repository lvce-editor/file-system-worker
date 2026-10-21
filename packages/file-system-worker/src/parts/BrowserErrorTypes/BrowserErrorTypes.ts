const hasName = (error: unknown, name: string): boolean => {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === name
}

export const isNotAllowedError = (error: unknown): boolean => hasName(error, 'NotAllowedError')
export const isNotFoundError = (error: unknown): boolean => hasName(error, 'NotFoundError')
