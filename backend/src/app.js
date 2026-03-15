import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { CORS_ORIGIN } from './config/env.js'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'

const app = express()

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app
