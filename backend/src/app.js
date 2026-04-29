import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { CORS_ORIGIN } from './config/env.js'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import shoppingListRoutes from './routes/shopping-list.js'
import barcodesRoutes from './routes/barcodes.js'
import recipesRoutes from './routes/recipes.js'

const app = express()
app.set('trust proxy', 1)

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/shopping-list', shoppingListRoutes)
app.use('/api/barcodes', barcodesRoutes)
app.use('/api/recipes', recipesRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app
