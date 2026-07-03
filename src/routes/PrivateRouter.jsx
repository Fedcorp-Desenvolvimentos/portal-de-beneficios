// PrivateRoute.jsx
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import Loading from '../components/Loading/Loading'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation()
  const { isAuthenticated, isAuthenticatedCheck, user } = useAuth()
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('access') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('access') ||
        sessionStorage.getItem('token')

      if (token) {
        await isAuthenticatedCheck()
      }

      setIsAuthChecked(true)
    }

    checkAuth()
  }, [isAuthenticatedCheck])

  if (!isAuthChecked) {
    return <Loading fullScreen message="Carregando..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const userRole =
    user?.tipo_usuario ||
    user?.tipo ||
    user?.role ||
    user?.perfil ||
    ''

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/nao-autorizado" replace />
  }

  if (children) return children
  return <Outlet />
}

export default PrivateRoute