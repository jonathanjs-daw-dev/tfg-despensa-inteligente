import { useState, useEffect } from 'react'
import { productsApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const CATEGORY_LABELS = {
  LACTEOS: 'Lácteos',
  CARNES_PESCADOS: 'Carnes y pescados',
  FRUTAS_VERDURAS: 'Frutas y verduras',
  CEREALES: 'Cereales',
  CONSERVAS: 'Conservas',
  BEBIDAS: 'Bebidas',
  CONGELADOS: 'Congelados',
  CONDIMENTOS: 'Condimentos',
  LIMPIEZA: 'Limpieza',
  OTROS: 'Otros',
}

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

const now = new Date()
const getDays = (dateStr) => Math.ceil((new Date(dateStr) - now) / 86400000)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function Dashboard() {
  const { accessToken } = useAuth()
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function load() {
      const res = await productsApi.getAll(accessToken)
      if (!res) return
      const data = await res.json()
      setProducts(data)
    }
    load()
  }, [accessToken])

  const totalProducts = products.length

  const expiring = products.filter(
    (p) => p.expiryDate && getDays(p.expiryDate) >= 0 && getDays(p.expiryDate) <= 7,
  )
  const urgent = expiring.filter((p) => getDays(p.expiryDate) <= 3)

  const nextFive = [...products]
    .filter((p) => p.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 5)

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {}),
  ).map(([cat, value]) => ({ name: CATEGORY_LABELS[cat] ?? cat, value }))

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total en despensa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Próximos a caducar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-gray-900">{expiring.length}</p>
              {urgent.length > 0 ? (
                <Badge className="bg-red-500 text-white">¡Urgente!</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Al día</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximos a caducar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caduca pronto</CardTitle>
          </CardHeader>
          <CardContent>
            {nextFive.length === 0 ? (
              <p className="text-sm text-gray-500">No hay productos con fecha de caducidad.</p>
            ) : (
              <ul className="space-y-2">
                {nextFive.map((p) => {
                  const days = getDays(p.expiryDate)
                  return (
                    <li key={p.id} className="flex justify-between items-center text-sm">
                      <span className={days <= 3 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {p.name}
                      </span>
                      <span className={`text-xs ${days <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatDate(p.expiryDate)} · {days}d
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Distribución por categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos de categorías aún.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
