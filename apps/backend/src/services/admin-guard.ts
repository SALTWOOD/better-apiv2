import { AdminAuthService, ForbiddenError, UnauthorizedError } from './admin-auth'

function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader) return ''

  const [scheme, token] = authHeader.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return ''
  return token.trim()
}

export async function requireAdminByAuthorizationHeader(authHeader: string | undefined) {
  const token = extractBearerToken(authHeader)
  try {
    return await AdminAuthService.getAdminUserByToken(token)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { error: 'unauthorized', message: error.message }
    }
    if (error instanceof ForbiddenError) {
      return { error: 'forbidden', message: error.message }
    }
    throw error
  }
}
