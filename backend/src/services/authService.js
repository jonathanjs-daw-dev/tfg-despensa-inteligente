import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} from '../config/env.js'

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN })
}

export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const error = new Error('El email ya está registrado')
    error.status = 409
    throw error
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  })

  return user
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const error = new Error('Credenciales incorrectas')
    error.status = 401
    throw error
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const error = new Error('Credenciales incorrectas')
    error.status = 401
    throw error
  }

  return { id: user.id, name: user.name, email: user.email }
}
