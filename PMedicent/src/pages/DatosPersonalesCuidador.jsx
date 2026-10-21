import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TarjetaFormulario from '../components/TarjetaFormulario'
import CampoTexto from '../components/CampoTexto'
import Button from '../components/Button'
import API from '../api'

function DatosPersonalesCuidador() {
  const navigate = useNavigate()
  const [experienciaAnios, setExperienciaAnios] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await API.crearPerfilCuidador({ experienciaAnios: Number(experienciaAnios) })
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      localStorage.setItem('usuario', JSON.stringify({ ...usuario, perfil: 'cuidador' }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil del cuidador.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <TarjetaFormulario titulo="Datos Profesionales del Cuidador" onSubmit={handleSubmit}>
      <p>Usaremos el nombre, documento, teléfono y correo que registraste en tu cuenta.</p>
      <CampoTexto label="Años de Experiencia" id="experienciaAnios" type="number" placeholder="Ej: 3" required value={experienciaAnios} onChange={(e) => setExperienciaAnios(e.target.value)} />
      {error && <p role="alert" style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
      <Button texto={cargando ? 'Guardando...' : 'Crear Perfil de Cuidador'} />
    </TarjetaFormulario>
  )
}

export default DatosPersonalesCuidador