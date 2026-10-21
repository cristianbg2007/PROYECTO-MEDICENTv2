import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function RecuperarContrasena() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const enviar = async (event) => {
    event.preventDefault()
    setMensaje('')
    setError('')
    setCargando(true)
    try {
      if (!token) {
        const respuesta = await API.solicitarRestablecimiento(correo)
        setMensaje(respuesta.message)
      } else {
        if (contrasena !== confirmacion) {
          setError('Las contraseñas no coinciden.')
          return
        }
        const respuesta = await API.restablecerContrasena(token, contrasena)
        setMensaje(respuesta.message)
      }
    } catch (err) {
      setError(err.message || 'No se pudo completar la solicitud.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: '520px', margin: '48px auto', padding: '28px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 18px #00000012' }}>
        <h1>{token ? 'Crear una nueva contraseña' : 'Recuperar contraseña'}</h1>
        <p style={{ color: '#526174', lineHeight: 1.6 }}>
          {token
            ? 'Elige una contraseña de al menos 8 caracteres. El enlace solo se puede usar una vez y vence en 30 minutos.'
            : 'Escribe el correo asociado a tu cuenta. Si está registrado, recibirás un enlace para cambiar tu contraseña.'}
        </p>
        <form onSubmit={enviar}>
          {!token ? (
            <label style={labelStyle}>Correo electrónico
              <input type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} required autoComplete="email" style={inputStyle} />
            </label>
          ) : (
            <>
              <label style={labelStyle}>Nueva contraseña
                <input type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
              </label>
              <label style={labelStyle}>Confirmar contraseña
                <input type="password" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
              </label>
            </>
          )}
          {mensaje && <p role="status" style={{ color: '#176b3a' }}>{mensaje}</p>}
          {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
          <button type="submit" disabled={cargando} style={buttonStyle}>
            {cargando ? 'Procesando...' : token ? 'Cambiar contraseña' : 'Enviar enlace'}
          </button>
        </form>
        <p><Link to="/inicio-sesion">Volver al inicio de sesión</Link></p>
      </main>
      <Footer />
    </>
  )
}

const labelStyle = { display: 'block', margin: '18px 0', fontWeight: 600, color: '#1d3b5e' }
const inputStyle = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '11px', marginTop: '7px', border: '1px solid #cbd5e1', borderRadius: '6px' }
const buttonStyle = { background: '#1d3b5e', color: 'white', border: 0, padding: '11px 18px', borderRadius: '6px', cursor: 'pointer' }

export default RecuperarContrasena
