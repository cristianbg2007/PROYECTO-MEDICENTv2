import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function AdminDashboard() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const [stats, setStats] = useState({
    usuarios: 0,
    medicamentos: 0,
    biomarcadores: 0
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('usuario')
    if (!userData) {
      navigate('/inicio-sesion')
      return
    }

    const user = JSON.parse(userData)
    if (user.rol !== 'admin') {
      alert('No tienes permisos de administrador')
      navigate('/dashboard')
      return
    }

    const cargarEstadisticas = async () => {
      try {
        const resumen = await API.getAdminResumen()
        setStats({
          usuarios: resumen.usuarios || 0,
          medicamentos: resumen.medicamentos || 0,
          biomarcadores: resumen.biomarcadores || 0
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setCargando(false)
      }
    }

    void cargarEstadisticas()
  }, [navigate])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/inicio-sesion')
  }

  if (cargando) {
    return (
      <>
        <Header />
        <main style={{ padding: '40px', textAlign: 'center' }}>
          <p>Cargando panel de administrador...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Panel de Administrador</h1>
            <p>Bienvenido, {usuario?.nombre} {usuario?.apellido}</p>
          </div>
          <button 
            onClick={cerrarSesion}
            style={{
              background: '#c0392b',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={tarjetaEstilo}>
            <h3>Usuarios</h3>
            <p style={numeroEstilo}>{stats.usuarios}</p>
            <Link to="/admin/usuarios" style={linkEstilo}>Gestionar →</Link>
          </div>

          <div style={tarjetaEstilo}>
            <h3>Medicamentos</h3>
            <p style={numeroEstilo}>{stats.medicamentos}</p>
            <Link to="/admin/medicamentos" style={linkEstilo}>Ver resumen →</Link>
          </div>

          <div style={tarjetaEstilo}>
            <h3>Biomarcadores</h3>
            <p style={numeroEstilo}>{stats.biomarcadores}</p>
            <Link to="/admin/biomarcadores" style={linkEstilo}>Ver resumen →</Link>
          </div>
        </div>

        {/* Accesos rápidos */}
        <section>
          <h2>Accesos Rápidos</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
            <Link to="/admin/usuarios" style={botonEstilo}>Ver Usuarios</Link>
            <Link to="/admin/medicamentos" style={botonEstilo}>Medicamentos</Link>
            <Link to="/admin/biomarcadores" style={botonEstilo}>Biomarcadores</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

// Estilos simples
const tarjetaEstilo = {
  background: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '10px',
  padding: '25px',
  textAlign: 'center'
}

const numeroEstilo = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  margin: '10px 0',
  color: '#1d3b5e'
}

const linkEstilo = {
  color: '#2980b9',
  textDecoration: 'none',
  fontWeight: '500'
}


const botonEstilo = {
  background: '#1d3b5e',
  color: 'white',
  padding: '12px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500'
}

export default AdminDashboard
