import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { usePageHeader } from '@/context/PageHeaderContext'
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

function ExpiringBadge({ days }) {
  const cls =
    days <= 3
      ? 'bg-amber-100 text-amber-700 border border-amber-200'
      : days <= 7
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200'
  return <Badge className={cls}>{days}d</Badge>
}

export default function Dashboard() {
  usePageHeader('Dashboard')
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

  const expiringSoonAll = [...products]
    .filter((p) => p.expiryDate && getDays(p.expiryDate) >= 0 && getDays(p.expiryDate) <= 7)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))

  const expiredAll = [...products]
    .filter((p) => p.expiryDate && getDays(p.expiryDate) < 0)
    .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate))

  const expiringSoon = expiringSoonAll.slice(0, 5)
  const expired = expiredAll.slice(0, 5)

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {}),
  ).map(([cat, value]) => ({ name: CATEGORY_LABELS[cat] ?? cat, value }))

  return (
    <div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-2 sm:col-span-1">
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Caducados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-gray-900">{expiredAll.length}</p>
              {expiredAll.length > 0 && (
                <Badge className="bg-red-100 text-red-700">Revisar</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Link
          to="/recipes"
          className="flex items-center justify-between px-4 py-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-green-800">Recetas sugeridas con IA</p>
            <p className="text-xs text-green-600">Genera recetas basadas en lo que tienes en tu despensa</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Expiry cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Caduca pronto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caduca pronto</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-gray-500">No hay productos próximos a caducar.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {expiringSoon.map((p) => {
                    const days = getDays(p.expiryDate)
                    return (
                      <li key={p.id} className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-700 truncate">{p.name}</span>
                        <span className="flex items-center gap-2 shrink-0 text-xs text-gray-400">
                          {formatDate(p.expiryDate)}
                          <ExpiringBadge days={days} />
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {expiringSoonAll.length > 5 && (
                  <Link
                    to="/pantry?estado=PROXIMO_CADUCAR"
                    className="mt-3 block text-xs text-amber-600 hover:underline"
                  >
                    Ver todos los que caducan pronto ({expiringSoonAll.length}) →
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Productos caducados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos caducados</CardTitle>
          </CardHeader>
          <CardContent>
            {expired.length === 0 ? (
              <p className="text-sm text-gray-500">No tienes productos caducados.</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {expired.map((p) => {
                    const days = Math.abs(getDays(p.expiryDate))
                    return (
                      <li key={p.id} className="flex justify-between items-center text-sm gap-2">
                        <span className="text-red-600 font-medium truncate">{p.name}</span>
                        <span className="flex items-center gap-2 shrink-0 text-xs text-gray-400">
                          {formatDate(p.expiryDate)}
                          <Badge className="bg-red-100 text-red-700 border border-red-200">{days}d</Badge>
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {expiredAll.length > 5 && (
                  <Link
                    to="/pantry?estado=CADUCADO"
                    className="mt-3 block text-xs text-red-500 hover:underline"
                  >
                    Ver todos los productos caducados ({expiredAll.length}) →
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
  )
}
