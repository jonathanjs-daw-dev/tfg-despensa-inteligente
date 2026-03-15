import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from '../config/env.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET)
    req.userId = payload.userId
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
