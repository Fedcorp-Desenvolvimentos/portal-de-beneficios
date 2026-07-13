// PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import Loading from '../components/Loading/Loading'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation()
  const { isAuthenticated, isCheckingAuth, user } = useAuth()

  if (isCheckingAuth) {
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