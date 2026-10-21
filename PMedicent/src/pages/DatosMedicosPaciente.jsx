import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TarjetaFormulario from '../components/TarjetaFormulario'
import CampoTexto from '../components/CampoTexto'
import Button from '../components/Button'
import API from '../api'

function DatosMedicosPaciente() {
  const navigate = useNavigate()
  const location = useLocation()
  const datosPersonales = location.state?.datosPersonales
  const [form, setForm] = useState({ eps: '', alergias: '', diagnostico: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!datosPersonales) {
      setError('Vuelve al paso de datos personales para completar el perfil.')
      return
    }
    setCargando(true)
    try {
      await API.crearPerfilPaciente({ ...datosPersonales, ...form })
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      localStorage.setItem('usuario', JSON.stringify({ ...usuario, perfil: 'paciente' }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil del paciente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <TarjetaFormulario titulo="Datos Médicos del Paciente" onSubmit={handleSubmit}>
      <CampoTexto label="EPS / Entidad de Salud" id="eps" placeholder="Ej: Sanitas" required value={form.eps} onChange={handleChange} />
      <CampoTexto label="Alergias Conocidas" id="alergias" placeholder="Ej: Ninguna, Penicilina..." required value={form.alergias} onChange={handleChange} />
      <CampoTexto label="Diagnóstico o Condición Principal" id="diagnostico" placeholder="Ej: Diabetes Tipo 2" required value={form.diagnostico} onChange={handleChange} />
      {error && <p role="alert" style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
      <Button texto={cargando ? 'Guardando...' : 'Finalizar Registro'} />
    </TarjetaFormulario>
  )
}

export default DatosMedicosPaciente