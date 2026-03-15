import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi, authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'LACTEOS', 'CARNES_PESCADOS', 'FRUTAS_VERDURAS', 'CEREALES',
  'CONSERVAS', 'BEBIDAS', 'CONGELADOS', 'CONDIMENTOS', 'LIMPIEZA', 'OTROS',
]

const EMPTY_FORM = {
  name: '', category: 'OTROS', quantity: '', unit: '', expiryDate: '',
}

function expiryStatus(dateStr) {
  if (!dateStr) return '—'
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return `CADUCADO (hace ${Math.abs(days)}d)`
  if (days <= 3) return `URGENTE (${days}d)`
  if (days <= 7) return `PRÓXIMO (${days}d)`
  return `OK (${days}d)`
}

export default function Pantry() {
  const { accessToken, user, closeSession } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const res = await productsApi.getAll(accessToken)
    if (!res) return
    const data = await res.json()
    setProducts(data)
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')

    const payload = {
      ...form,
      quantity: parseFloat(form.quantity),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
    }

    const res = await productsApi.create(accessToken, payload)
    if (!res) return

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      return
    }

    setForm(EMPTY_FORM)
    loadProducts()
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

  async function handleLogout() {
    await closeSession()
    navigate('/login')
  }

  return (
    <div>
      <h1>Despensa — {user?.name}</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>

      <hr />

      <h2>Mis productos ({products.length})</h2>

      {products.length === 0 ? (
        <p>No tienes productos en la despensa.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Caducidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                {editingId === p.id ? (
                  <>
                    <td><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></td>
                    <td>
                      <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td><input type="number" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} /></td>
                    <td><input value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })} /></td>
                    <td><input type="date" value={editForm.expiryDate} onChange={e => setEditForm({ ...editForm, expiryDate: e.target.value })} /></td>
                    <td>—</td>
                    <td>
                      <button onClick={() => handleEdit(p.id)}>Guardar</button>
                      <button onClick={() => setEditingId(null)}>Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.quantity}</td>
                    <td>{p.unit}</td>
                    <td>{p.expiryDate ? p.expiryDate.split('T')[0] : '—'}</td>
                    <td>{expiryStatus(p.expiryDate)}</td>
                    <td>
                      <button onClick={() => startEdit(p)}>Editar</button>
                      <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>Añadir producto</h2>
      <form onSubmit={handleAdd}>
        <div>
          <label>Nombre </label>
          <input name="name" value={form.name} onChange={handleFormChange} required />
        </div>
        <div>
          <label>Categoría </label>
          <select name="category" value={form.category} onChange={handleFormChange}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Cantidad </label>
          <input type="number" step="0.1" name="quantity" value={form.quantity} onChange={handleFormChange} required />
        </div>
        <div>
          <label>Unidad </label>
          <input name="unit" value={form.unit} onChange={handleFormChange} placeholder="kg, l, unidades..." required />
        </div>
        <div>
          <label>Fecha caducidad </label>
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleFormChange} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Añadir</button>
      </form>
    </div>
  )
}
