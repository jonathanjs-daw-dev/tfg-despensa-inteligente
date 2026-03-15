import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// --- Product schemas ---
const CATEGORIES = [
  'LACTEOS', 'CARNES_PESCADOS', 'FRUTAS_VERDURAS', 'CEREALES',
  'CONSERVAS', 'BEBIDAS', 'CONGELADOS', 'CONDIMENTOS', 'LIMPIEZA', 'OTROS',
]

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(CATEGORIES).default('OTROS'),
  quantity: z.number().positive('La cantidad debe ser mayor que 0'),
  unit: z.string().min(1, 'La unidad es requerida'),
  expiryDate: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  imageUrl: z.string().url('URL de imagen no válida').nullable().optional(),
})

export const updateProductSchema = createProductSchema.partial()
