import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js'
import { generate, getSaved, getSavedById, save, removeSaved } from '../controllers/recipeController.js'

const router = Router()

router.use(authenticate)

router.post('/generate', aiRateLimiter, generate)
router.get('/saved', getSaved)
router.get('/saved/:id', getSavedById)
router.post('/saved', save)
router.delete('/saved/:id', removeSaved)

export default router
