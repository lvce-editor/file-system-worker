import { isHttp } from '../IsHttp/IsHttp.ts'

// Disk paths and built-in HTTP reads stay in this worker. Other URI schemes
// need the renderer's filesystem dispatcher, which activates extension providers.
export const isProviderUri = (uri: string): boolean => {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(uri) && !uri.startsWith('file:') && !isHttp(uri)
}
