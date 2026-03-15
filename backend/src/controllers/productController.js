import { createProductSchema, updateProductSchema } from '../utils/schemas.js'
import {
  getProductsByUser,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js'

export async function getProducts(req, res) {
  try {
    const products = await getProductsByUser(req.userId)
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function addProduct(req, res) {
  try {
    const parsed = createProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? 'Error de validación' })
    }

    const product = await createProduct(req.userId, parsed.data)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function editProduct(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de producto no válido' })
    }

    const parsed = updateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues?.[0]?.message ?? 'Error de validación' })
    }

    const product = await updateProduct(id, req.userId, parsed.data)
    res.status(200).json(product)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function removeProduct(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de producto no válido' })
    }

    await deleteProduct(id, req.userId)
    res.status(200).json({ message: 'Producto eliminado' })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
