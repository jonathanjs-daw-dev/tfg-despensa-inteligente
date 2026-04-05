import { useState, useEffect } from 'react'
import { productsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/DatePicker'

const UNITS = ['kg', 'g', 'mg', 'L', 'ml', 'cl', 'oz', 'lb', 'unidad', 'docena', 'pack', 'lata', 'bote', 'bolsa', 'caja', 'sobre']

const CATEGORIES = [
  'LACTEOS',
  'CARNES_PESCADOS',
  'FRUTAS_VERDURAS',
  'CEREALES',
  'CONSERVAS',
  'BEBIDAS',
  'CONGELADOS',
  'CONDIMENTOS',
  'LIMPIEZA',
  'OTROS',
]

function expiryStatus(dateStr) {
  if (!dateStr) return '—'
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return `CADUCADO (hace ${Math.abs(days)}d)`
  if (days <= 3) return `URGENTE (${days}d)`
  if (days <= 7) return `PRÓXIMO (${days}d)`
  return `OK (${days}d)`
}

function getStatusKey(dateStr) {
  if (!dateStr) return 'NONE'
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'CADUCADO'
  if (days <= 3) return 'URGENTE'
  if (days <= 7) return 'PRÓXIMO'
  return 'OK'
}

export default function Pantry() {
  const { accessToken } = useAuth()

  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const res = await productsApi.getAll(accessToken)
    if (!res) return
    const data = await res.json()
    setProducts(data)
  }

  function startEdit(product) {
    setEditingId(product.id)
    setEditForm({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
    })
  }

  async function handleEdit(id) {
    const payload = {
      ...editForm,
      quantity: parseFloat(editForm.quantity),
      expiryDate: editForm.expiryDate ? new Date(editForm.expiryDate).toISOString() : null,
    }

    const res = await productsApi.update(accessToken, id, payload)
    if (!res) return

    setEditingId(null)
    loadProducts()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    const res = await productsApi.remove(accessToken, id)
    if (!res) return
    loadProducts()
  }

  const statusBadge = (dateStr) => {
    const key = getStatusKey(dateStr)
    const text = expiryStatus(dateStr)
    const cls =
      key === 'CADUCADO'
        ? 'bg-red-500 text-white'
        : key === 'URGENTE'
          ? 'bg-amber-500 text-white'
          : key === 'PRÓXIMO'
            ? 'bg-yellow-400 text-black'
            : key === 'OK'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-500'
    return <Badge className={cls}>{text}</Badge>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Mi Despensa</h1>

      {/* Tabla de productos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Productos ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">No tienes productos en la despensa.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Caducidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      {editingId === p.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.category}
                              onValueChange={(val) => setEditForm({ ...editForm, category: val })}
                            >
                              <SelectTrigger className="h-8 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.quantity}
                              onChange={(e) =>
                                setEditForm({ ...editForm, quantity: e.target.value })
                              }
                              className="h-8 w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.unit}
                              onValueChange={(val) => setEditForm({ ...editForm, unit: val })}
                            >
                              <SelectTrigger className="h-8 w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UNITS.map((u) => (
                                  <SelectItem key={u} value={u}>
                                    {u}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              value={editForm.expiryDate}
                              onChange={(val) => setEditForm({ ...editForm, expiryDate: val })}
                            />
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleEdit(p.id)}>
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell>{p.quantity}</TableCell>
                          <TableCell>{p.unit}</TableCell>
                          <TableCell>{p.expiryDate ? p.expiryDate.split('T')[0] : '—'}</TableCell>
                          <TableCell>{statusBadge(p.expiryDate)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(p.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
