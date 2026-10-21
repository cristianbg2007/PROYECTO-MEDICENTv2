import { Navigate, Outlet } from 'react-router-dom'

function UserRoute() {
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

  if (user.rol === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default UserRoute
