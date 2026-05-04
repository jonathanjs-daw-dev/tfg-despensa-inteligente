import app from './src/app.js'
import { PORT } from './src/config/env.js'

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
