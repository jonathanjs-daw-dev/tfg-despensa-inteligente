import { useState, useEffect } from 'react'
import { shoppingListApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { usePageHeader } from '@/context/PageHeaderContext'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const UNITS = ['kg', 'g', 'mg', 'L', 'ml', 'cl', 'oz', 'lb', 'unidad', 'docena', 'pack', 'lata', 'bote', 'bolsa', 'caja', 'sobre']

export default function ShoppingList() {
  const { accessToken } = useAuth()

  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'unidad' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    const res = await shoppingListApi.getAll(accessToken)
    if (!res) return
    const data = await res.json()
    setItems(data)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.quantity || !form.unit.trim()) return

    setAdding(true)
    const res = await shoppingListApi.create(accessToken, {
      name: form.name.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit.trim(),
    })
    setAdding(false)

    if (!res || !res.ok) return
    setForm({ name: '', quantity: '', unit: '' })
    loadItems()
  }

  async function handleToggle(item) {
    const res = await shoppingListApi.update(accessToken, item.id, {
      isChecked: !item.isChecked,
    })
    if (!res) return
    loadItems()
  }

  async function handleDelete(id) {
    const res = await shoppingListApi.remove(accessToken, id)
    if (!res) return
    loadItems()
  }

  async function handleClearChecked() {
    const res = await shoppingListApi.removeChecked(accessToken)
    if (!res) return
    loadItems()
  }

  const pending = items.filter((i) => !i.isChecked)
  const checked = items.filter((i) => i.isChecked)

  usePageHeader(
    'Lista de la compra',
    checked.length > 0 ? (
      <Button variant="outline" size="sm" onClick={handleClearChecked}>
        Limpiar comprados ({checked.length})
      </Button>
    ) : null,
  )

  return (
    <div>

      {/* Formulario añadir ítem */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Añadir ítem</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-40">
              <Input
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Cantidad"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="w-32">
              <Select
                value={form.unit}
                onValueChange={(val) => setForm({ ...form, unit: val })}
              >
                <SelectTrigger>
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
            </div>
            <Button type="submit" disabled={adding}>
              Añadir
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista pendientes */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Pendiente ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">No hay ítems pendientes.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pending.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Lista comprados */}
      {checked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-400">Comprado ({checked.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {checked.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ItemRow({ item, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={item.isChecked}
        onChange={() => onToggle(item)}
        className="h-4 w-4 rounded border-gray-300 text-[#10b981] accent-[#10b981] cursor-pointer"
      />
      <span
        className={`flex-1 text-sm ${
          item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
      >
        {item.name}
      </span>
      <span className="text-sm text-gray-500 shrink-0">
        {item.quantity} {item.unit}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
        aria-label="Eliminar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
