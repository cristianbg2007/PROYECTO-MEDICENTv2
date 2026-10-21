import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function AdminUsuarios() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null) // id del usuario que se está editando
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    documento: '',
    password: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [guardandoAdmin, setGuardandoAdmin] = useState(false)
  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    documento: '',
    fechaNacimiento: '',
    idTipoDocumento: '1',
    password: ''
  })

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await API.getAdminUsuarios()
      setUsuarios(data || [])
    } catch (error) {
      console.error(error)
      setMensaje('Error al cargar usuarios: ' + error.message)
    } finally {
      setCargando(false)
    }
  }, [])

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
    const cargarIniciales = async () => {
      try {
        const data = await API.getAdminUsuarios()
        setUsuarios(data || [])
      } catch (error) {
        console.error(error)
        setMensaje('Error al cargar usuarios: ' + error.message)
      } finally {
        setCargando(false)
      }
    }
    void cargarIniciales()
  }, [navigate])

  const empezarEdicion = (usuario) => {
    setEditando(usuario.idUsuario)
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      documento: usuario.documento || '',
      password: ''
    })
    setMensaje('')
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setForm({ nombre: '', apellido: '', correo: '', telefono: '', documento: '', password: '' })
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const guardarCambios = async (id) => {
    try {
      const datos = { ...form }
      if (!datos.password) {
        delete datos.password // no enviar contraseña vacía
      }
      await API.actualizarUsuario(id, datos)
      setMensaje('Usuario actualizado correctamente')
      setEditando(null)
      cargarUsuarios()
    } catch (error) {
      setMensaje('Error al actualizar: ' + error.message)
    }
  }

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que quieres eliminar al usuario "${nombre}"?`)) return

    try {
      await API.eliminarUsuario(id)
      setMensaje('Usuario eliminado correctamente')
      cargarUsuarios()
    } catch (error) {
      setMensaje('Error al eliminar: ' + error.message)
    }
  }

  const handleNuevoAdminChange = (e) => {
    setNuevoAdmin({ ...nuevoAdmin, [e.target.name]: e.target.value })
  }

  const crearAdministrador = async (e) => {
    e.preventDefault()
    setGuardandoAdmin(true)
    setMensaje('')

    try {
      const respuesta = await API.crearAdmin({
        ...nuevoAdmin,
        idTipoDocumento: Number(nuevoAdmin.idTipoDocumento)
      })
      setMensaje(respuesta?.message || 'Administrador creado correctamente')
      setNuevoAdmin({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        documento: '',
        fechaNacimiento: '',
        idTipoDocumento: '1',
        password: ''
      })
      await cargarUsuarios()
    } catch (error) {
      setMensaje('Error al crear administrador: ' + error.message)
    } finally {
      setGuardandoAdmin(false)
    }
  }
  return (
    <>
      <Header />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1>Gestión de Usuarios</h1>
          <Link to="/admin" style={{ color: '#1d3b5e', textDecoration: 'none', fontWeight: '500' }}>
            ← Volver al Panel
          </Link>
        </div>

        <section style={{ marginBottom: '28px', padding: '20px', background: '#f5f8fb', borderRadius: '8px', border: '1px solid #d7e0e8' }}>
          <h2 style={{ marginBottom: '14px' }}>Crear administrador</h2>
          <form onSubmit={crearAdministrador}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
              <label>Nombre<input name="nombre" value={nuevoAdmin.nombre} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
              <label>Apellido<input name="apellido" value={nuevoAdmin.apellido} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
              <label>Correo<input name="correo" type="email" value={nuevoAdmin.correo} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
              <label>Documento<input name="documento" value={nuevoAdmin.documento} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
              <label>Teléfono<input name="telefono" type="tel" value={nuevoAdmin.telefono} onChange={handleNuevoAdminChange} style={inputStyle} /></label>
              <label>Fecha de nacimiento<input name="fechaNacimiento" type="date" value={nuevoAdmin.fechaNacimiento} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
              <label>Tipo de documento
                <select name="idTipoDocumento" value={nuevoAdmin.idTipoDocumento} onChange={handleNuevoAdminChange} style={inputStyle} required>
                  <option value="1">Cédula de Ciudadanía</option>
                </select>
              </label>
              <label>Contraseña inicial<input name="password" type="password" minLength="6" value={nuevoAdmin.password} onChange={handleNuevoAdminChange} style={inputStyle} required /></label>
            </div>
            <button type="submit" disabled={guardandoAdmin} style={{ ...btnGuardar, marginTop: '14px', padding: '9px 14px' }}>
              {guardandoAdmin ? 'Creando...' : 'Crear administrador'}
            </button>
          </form>
        </section>
        <p style={{ color: '#526174' }}>Las cuentas con historial clínico se pueden desactivar para quitarles el acceso sin borrar sus datos.</p>
        {mensaje && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            background: mensaje.includes('Error') ? '#f8d7da' : '#d4edda',
            color: mensaje.includes('Error') ? '#721c24' : '#155724',
            borderRadius: '6px'
          }}>
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p>Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ background: '#1d3b5e', color: 'white' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Apellido</th>
                  <th style={thStyle}>Correo</th>
                  <th style={thStyle}>Teléfono</th>
                  <th style={thStyle}>Documento</th>
                  <th style={thStyle}>Rol</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.idUsuario} style={{ borderBottom: '1px solid #dee2e6' }}>
                    {editando === u.idUsuario ? (
                      <>
                        <td style={tdStyle}>{u.idUsuario}</td>
                        <td style={tdStyle}>
                          <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input name="apellido" value={form.apellido} onChange={handleChange} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input name="correo" value={form.correo} onChange={handleChange} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input name="telefono" value={form.telefono} onChange={handleChange} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input name="documento" value={form.documento} onChange={handleChange} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>{u.rol}</td>
                        <td style={tdStyle}>{u.activo ? 'Activa' : 'Inactiva'}</td>
                        <td style={tdStyle}>
                          <button onClick={() => guardarCambios(u.idUsuario)} style={btnGuardar}>Guardar</button>
                          <button onClick={cancelarEdicion} style={btnCancelar}>Cancelar</button>
                          <div style={{ marginTop: '6px' }}>
                            <input
                              name="password"
                              type="password"
                              placeholder="Nueva contraseña (opcional)"
                              value={form.password}
                              onChange={handleChange}
                              style={{ ...inputStyle, width: '140px' }}
                            />
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={tdStyle}>{u.idUsuario}</td>
                        <td style={tdStyle}>{u.nombre}</td>
                        <td style={tdStyle}>{u.apellido}</td>
                        <td style={tdStyle}>{u.correo}</td>
                        <td style={tdStyle}>{u.telefono || '-'}</td>
                        <td style={tdStyle}>{u.documento}</td>
                        <td style={tdStyle}>
                          <span style={{
                            background: u.rol === 'admin' ? '#e74c3c' : '#27ae60',
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}>
                            {u.rol}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ color: u.activo ? '#176b3a' : '#9b2c2c', fontWeight: 600 }}>
                            {u.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => empezarEdicion(u)} style={btnEditar}>Editar</button>
                          {u.rol !== 'admin' && <button
                            onClick={async () => {
                              const accion = u.activo ? 'desactivar' : 'reactivar'
                              if (!window.confirm(`¿Quieres ${accion} la cuenta de ${u.nombre}?`)) return
                              try {
                                const resultado = await API.cambiarEstadoUsuario(u.idUsuario, !u.activo)
                                setMensaje(resultado.message)
                                await cargarUsuarios()
                              } catch (error) {
                                setMensaje('Error al cambiar estado: ' + error.message)
                              }
                            }}
                            style={u.activo ? btnCancelar : btnGuardar}
                          >{u.activo ? 'Desactivar' : 'Reactivar'}</button>}
                          <button
                            onClick={() => eliminar(u.idUsuario, u.nombre)}
                            disabled={u.rol === 'admin' || Boolean(u.perfil)}
                            title={u.rol === 'admin' ? 'No se eliminan administradores desde esta pantalla' : u.perfil ? 'Se conserva el historial de las cuentas con perfil de salud' : ''}
                            style={{ ...btnEliminar, opacity: u.rol === 'admin' || Boolean(u.perfil) ? 0.5 : 1, cursor: u.rol === 'admin' || Boolean(u.perfil) ? 'not-allowed' : 'pointer' }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

// Estilos
const thStyle = { padding: '12px 10px', textAlign: 'left' }
const tdStyle = { padding: '10px', verticalAlign: 'middle' }
const inputStyle = { padding: '6px 8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }
const btnEditar = { background: '#2980b9', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }
const btnEliminar = { background: '#c0392b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }
const btnGuardar = { background: '#27ae60', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' }
const btnCancelar = { background: '#7f8c8d', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }

export default AdminUsuarios
