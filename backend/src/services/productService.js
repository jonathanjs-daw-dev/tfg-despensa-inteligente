import prisma from '../config/db.js'

export async function getProductsByUser(userId) {
  return prisma.product.findMany({
    where: { userId },
    orderBy: {
      expiryDate: { sort: 'asc', nulls: 'last' },
    },
  })
}

export async function createProduct(userId, data) {
  return prisma.product.create({
    data: { ...data, userId },
  })
}

export async function updateProduct(id, userId, data) {
  const existing = await prisma.product.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    const error = new Error('Producto no encontrado')
    error.status = 404
    throw error
  }

  return prisma.product.update({
    where: { id },
    data,
  })
}

export async function deleteProduct(id, userId) {
  const existing = await prisma.product.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    const error = new Error('Producto no encontrado')
    error.status = 404
    throw error
  }

  return prisma.product.delete({
    where: { id },
  })
}
