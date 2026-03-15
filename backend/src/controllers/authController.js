import { registerSchema, loginSchema } from '../utils/schemas.js'
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
} from '../services/authService.js'
import jwt from 'jsonwebtoken'
import { JWT_REFRESH_SECRET } from '../config/env.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export async function register(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }

    const user = await registerUser(parsed.data)
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.status(201).json({ accessToken, user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message })
    }

    const user = await loginUser(parsed.data)
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    res.status(200).json({ accessToken, user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ error: 'No hay sesión activa' })
    }

    const payload = jwt.verify(token, JWT_REFRESH_SECRET)
    const accessToken = generateAccessToken(payload.userId)

    res.status(200).json({ accessToken })
  } catch (err) {
    res.status(401).json({ error: 'Sesión expirada o inválida' })
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken', COOKIE_OPTIONS)
  res.status(200).json({ message: 'Sesión cerrada' })
}
