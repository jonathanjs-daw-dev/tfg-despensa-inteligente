import 'dotenv/config'

export const PORT = process.env.PORT || 3000
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  console.error('ERROR: JWT secrets no están definidos en .env')
  process.exit(1)
}
