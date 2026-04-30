import rateLimit from 'express-rate-limit'
import { PostgresStore } from '@acpr/rate-limit-postgresql'
import { NODE_ENV, DATABASE_URL } from '../config/env.js'

const limiter = NODE_ENV === 'production'
  ? rateLimit({
      windowMs: 60 * 1000,
      max: 5,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde' },
      store: new PostgresStore({ connectionString: DATABASE_URL }),
    })
  : null

export const aiRateLimiter = limiter
  ? limiter
  : (_req, _res, next) => next()
