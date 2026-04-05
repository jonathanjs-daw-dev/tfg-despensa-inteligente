import prisma from '../config/db.js'

export async function getAll(userId) {
  return prisma.shoppingList.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function create(userId, data) {
  return prisma.shoppingList.create({
    data: { ...data, userId },
  })
}

export async function update(userId, id, data) {
  const existing = await prisma.shoppingList.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    const error = new Error('Ítem no encontrado')
    error.status = 404
    throw error
  }

  return prisma.shoppingList.update({
    where: { id },
    data,
  })
}

export async function remove(userId, id) {
  const existing = await prisma.shoppingList.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    const error = new Error('Ítem no encontrado')
    error.status = 404
    throw error
  }

  return prisma.shoppingList.delete({
    where: { id },
  })
}

export async function removeChecked(userId) {
  return prisma.shoppingList.deleteMany({
    where: { userId, isChecked: true },
  })
}
