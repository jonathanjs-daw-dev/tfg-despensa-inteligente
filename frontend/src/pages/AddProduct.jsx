import { useState } from 'react'
import { productsApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/DatePicker'
import { BarcodeScanner } from '@/components/BarcodeScanner'

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

const EMPTY_FORM = {
  name: '',
  category: 'OTROS',
  quantity: '',
  unit: 'unidad',
  expiryDate: '',
  barcode: '',
}

export default function AddProduct() {
  const { accessToken } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSuccess(false)
  }

  function handleScanResult(data) {
    setForm((prev) => ({
      ...prev,
      name: data.name || prev.name,
      category: data.category || prev.category,
      barcode: data.barcode || prev.barcode,
      quantity: data.quantity != null ? String(data.quantity) : prev.quantity,
      unit: data.unit || prev.unit,
    }))
    setShowScanner(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!form.expiryDate) {
      setError('La fecha de caducidad es obligatoria')
      return
    }

    const payload = {
      ...form,
      quantity: parseFloat(form.quantity),
      expiryDate: new Date(form.expiryDate).toISOString(),
    }

    const res = await productsApi.create(accessToken, payload)
    if (!res) return

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      return
    }

    setForm(EMPTY_FORM)
    setSuccess(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Añadir producto</h1>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Nuevo producto</CardTitle>
        </CardHeader>
        <CardContent>
          {showScanner ? (
            <BarcodeScanner onResult={handleScanResult} onClose={() => setShowScanner(false)} />
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4"
              onClick={() => { setForm(EMPTY_FORM); setError(''); setSuccess(false); setShowScanner(true) }}
            >
              Escanear código de barras
            </Button>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" value={form.name} onChange={handleFormChange} required />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(val) => {
                  setForm({ ...form, category: val })
                  setSuccess(false)
                }}
              >
                <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select
                  value={form.unit}
                  onValueChange={(val) => {
                    setForm({ ...form, unit: val })
                    setSuccess(false)
                  }}
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
            </div>

            <div className="space-y-2">
              <Label>Fecha caducidad</Label>
              <DatePicker
                value={form.expiryDate}
                onChange={(val) => {
                  setForm({ ...form, expiryDate: val })
                  setSuccess(false)
                }}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Producto añadido correctamente.
              </p>
            )}

            <Button type="submit" className="w-full">
              Añadir producto
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
