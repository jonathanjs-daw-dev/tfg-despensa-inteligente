import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import {
  getItems,
  addItem,
  editItem,
  removeItem,
  removeCheckedItems,
} from '../controllers/shoppingListController.js'

const router = Router()

router.use(authenticate)

router.get('/', getItems)
router.post('/', addItem)
router.put('/:id', editItem)
router.delete('/checked', removeCheckedItems)
router.delete('/:id', removeItem)

export default router
