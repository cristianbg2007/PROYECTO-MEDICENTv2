import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TarjetaFormulario from '../components/TarjetaFormulario'
import CampoTexto from '../components/CampoTexto'
import Button from '../components/Button'
import API from '../api'

function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', 
    apellido: '', 
    idTipoDocumento: '1',
    documento: '',
    telefono: '', // <-- AGREGADO: Campo obligatorio en tu backend
    fechaNacimiento: '',
    correo: '', 
    contrasena: '', 
    confirmar: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setCargando(true)

    try {
      await API.crearUsuario({
        nombre: form.nombre,          
        apellido: form.apellido,       
        correo: form.correo,
        password: form.contrasena,
        idTipoDocumento: parseInt(form.idTipoDocumento),
        documento: form.documento,
        fechaNacimiento: form.fechaNacimiento,
        telefono: form.telefono // <-- AGREGADO: Se envía al backend
      })

      alert("¡Registro exitoso! Ahora puedes iniciar sesión.")
      navigate('/inicio-sesion') // Redirigir al inicio de sesión

    } catch (err) {
      console.error("Error completo:", err)
      setError(err.message || 'No se pudo registrar. Verifica que el backend esté corriendo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <TarjetaFormulario titulo="Registrarse" onSubmit={handleSubmit}>
      <CampoTexto label="Nombre" id="nombre" placeholder="Ingrese su nombre" required value={form.nombre} onChange={handleChange} />
      <CampoTexto label="Apellido" id="apellido" placeholder="Ingrese su apellido" required value={form.apellido} onChange={handleChange} />
      
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="idTipoDocumento" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          TIPO DE DOCUMENTO
        </label>
        <select 
          id="idTipoDocumento" 
          value={form.idTipoDocumento} 
          onChange={handleChange}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0' }}
          required
        >
          <option value="1">Cédula de Ciudadanía</option>
          <option value="2">Tarjeta de Identidad</option>
          <option value="3">Cédula de Extranjería</option>
        </select>
      </div>

      <CampoTexto label="Número de Documento" id="documento" placeholder="Ingrese su documento" required value={form.documento} onChange={handleChange} />
      
      {/* AGREGADO: Campo visual para el teléfono */}
      <CampoTexto label="Teléfono" id="telefono" type="tel" placeholder="Ingrese su teléfono" required value={form.telefono} onChange={handleChange} />

      <CampoTexto label="Fecha de Nacimiento" id="fechaNacimiento" type="date" required value={form.fechaNacimiento} onChange={handleChange} />
      <CampoTexto label="Correo" id="correo" type="email" placeholder="Ingrese su correo" required value={form.correo} onChange={handleChange} />
      <CampoTexto label="Contraseña" id="contrasena" type="password" placeholder="Mínimo 6 caracteres" required value={form.contrasena} onChange={handleChange} />
      <CampoTexto label="Confirmar Contraseña" id="confirmar" type="password" placeholder="Repita la contraseña" required value={form.confirmar} onChange={handleChange} />
      
      {error && <p style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
      
      <Button texto={cargando ? 'Registrando...' : 'Confirmar'} />
      <p>¿Ya tienes una cuenta? <Link to="/inicio-sesion">Inicia sesión</Link></p>
    </TarjetaFormulario>
  )
}

export default Registro