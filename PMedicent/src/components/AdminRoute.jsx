import { Navigate } from 'react-router-dom'

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('usuario')

  if (!token || !userData) {
    return <Navigate to="/inicio-sesion" replace />
  }

  let user
  try {
    user = JSON.parse(userData)
  } catch {
    return <Navigate to="/inicio-sesion" replace />
  }

  if (user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
