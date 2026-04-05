import { createShoppingItemSchema, updateShoppingItemSchema } from '../utils/schemas.js'
import { getAll, create, update, remove, removeChecked } from '../services/shoppingListService.js'

export async function getItems(req, res) {
  try {
    const items = await getAll(req.userId)
    res.status(200).json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function addItem(req, res) {
  try {
    const parsed = createShoppingItemSchema.safeParse(req.body)
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues?.[0]?.message ?? 'Error de validación' })
    }

    const item = await create(req.userId, parsed.data)
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function editItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' })
    }

    const parsed = updateShoppingItemSchema.safeParse(req.body)
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues?.[0]?.message ?? 'Error de validación' })
    }

    const item = await update(req.userId, id, parsed.data)
    res.status(200).json(item)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function removeItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID no válido' })
    }

    await remove(req.userId, id)
    res.status(200).json({ message: 'Ítem eliminado' })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function removeCheckedItems(req, res) {
  try {
    await removeChecked(req.userId)
    res.status(200).json({ message: 'Ítems comprados eliminados' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
