import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Pantry from './pages/Pantry'
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import ShoppingList from './pages/ShoppingList'
import Recipes from './pages/Recipes'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth()

  if (loading) return <p>Cargando...</p>
  if (!accessToken) return <Navigate to="/login" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <Layout>
              <AddProduct />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pantry"
        element={
          <ProtectedRoute>
            <Layout>
              <Pantry />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping-list"
        element={
          <ProtectedRoute>
            <Layout>
              <ShoppingList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Layout>
              <Recipes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
