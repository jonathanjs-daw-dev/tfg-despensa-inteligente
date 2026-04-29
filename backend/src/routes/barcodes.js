import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { getBarcode } from '../controllers/barcodeController.js'

const router = Router()

router.use(authenticate)

router.get('/:code', getBarcode)

export default router
