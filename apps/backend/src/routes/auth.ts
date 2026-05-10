import { Elysia } from 'elysia'
import { AdminAuthService, ForbiddenError } from '../services/admin-auth'
import { getGithubOAuthLoginUrl } from '../services/github-auth'

export const authRoutes = new Elysia({ prefix: '/auth/github' })
  .get('/login', ({ query, set }) => {
    try {
      const state = typeof query.state === 'string' ? query.state : crypto.randomUUID()
      const loginUrl = getGithubOAuthLoginUrl(state)

      // Use explicit redirect response for maximum compatibility.
      return new Response(null, {
        status: 302,
        headers: {
          Location: loginUrl,
        },
      })
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to build GitHub OAuth URL',
      }
    }
  })
  .get('/callback', async ({ query, set }) => {
    const code = typeof query.code === 'string' ? query.code : ''

    if (!code) {
      set.status = 400
      return { success: false, error: 'Missing OAuth code' }
    }

    try {
      const result = await AdminAuthService.loginWithGithubCode(code)
      return {
        success: true,
        token: result.token,
        expiresAt: result.expiresAt,
        user: result.user,
      }
    } catch (error) {
      if (error instanceof ForbiddenError) {
        set.status = 403
        return { success: false, error: error.message }
      }

      set.status = 401
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GitHub authentication failed',
      }
    }
  })
  .post('/logout', async ({ headers, set }) => {
    const authHeader = headers.authorization
    if (!authHeader) {
      set.status = 400
      return { success: false, error: 'Missing Authorization header' }
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      set.status = 400
      return { success: false, error: 'Invalid Authorization header' }
    }

    await AdminAuthService.logout(token)
    return { success: true }
  })
