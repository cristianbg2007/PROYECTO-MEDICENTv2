import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TarjetaFormulario from '../components/TarjetaFormulario'
import CampoTexto from '../components/CampoTexto'
import Button from '../components/Button'

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

function DatosPersonalesPaciente() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ estatura: '', peso: '', tipoSangre: '', contactoEmergencia: '', dieta: '' })
  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/datos-medicos-paciente', { state: { datosPersonales: form } })
  }

  return (
    <TarjetaFormulario titulo="Datos Personales del Paciente" onSubmit={handleSubmit}>
      <CampoTexto label="Estatura (metros, por ejemplo 1.70)" id="estatura" type="number" step="0.01" placeholder="1.70" required value={form.estatura} onChange={handleChange} />
      <CampoTexto label="Peso (kg)" id="peso" type="number" step="0.01" placeholder="Ej: 65" required value={form.peso} onChange={handleChange} />
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="tipoSangre" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Tipo de sangre</label>
        <select id="tipoSangre" value={form.tipoSangre} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
          <option value="">Selecciona una opción</option>
          {TIPOS_SANGRE.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
        </select>
      </div>
      <CampoTexto label="Contacto de Emergencia" id="contactoEmergencia" placeholder="Nombre y teléfono de contacto" required value={form.contactoEmergencia} onChange={handleChange} />
      <CampoTexto label="Dieta (opcional)" id="dieta" placeholder="Ej: baja en azúcar" value={form.dieta} onChange={handleChange} />
      <Button texto="Siguiente: Datos Médicos" />
    </TarjetaFormulario>
  )
}

export default DatosPersonalesPaciente