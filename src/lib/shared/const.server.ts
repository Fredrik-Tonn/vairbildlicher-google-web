import { env } from '$env/dynamic/private'

// Server-only constants that use environment variables
export const isDebug = env.NODE_ENV === 'development'
