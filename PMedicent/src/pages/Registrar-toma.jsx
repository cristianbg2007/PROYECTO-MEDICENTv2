import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

const fechaLocalActual = () => {
  const ahora = new Date()
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
}

function RegistrarToma() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esCuidadorSinPaciente = usuario.perfil === 'cuidador' && usuario.pacienteVinculado !== true
  const [medicamentos, setMedicamentos] = useState([])
  const [mensajeExito, setMensajeExito] = useState(false)
  const [form, setForm] = useState({
    medicamento: '',
    dosis: '',
    hora: '',
    nota: ''
  })

  useEffect(() => {
    const cargarMedicamentos = async () => {
      try {
        const data = await API.getMedicamentos()
        setMedicamentos(data)
      } catch (error) {
        console.error('Error al traer medicamentos:', error)
      }
    }
    cargarMedicamentos()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const nuevaToma = {
      fecha: fechaLocalActual(),
      hora: form.hora,
      dosis: form.dosis,
      nota: form.nota,
      estado: 'tomado',
      idMedicamento: Number(form.medicamento),
    }
    await API.crearToma(nuevaToma)
    setMensajeExito(true)
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  } catch (error) {
    console.error('Error al registrar la toma:', error)
    alert('Hubo un error al guardar la toma. Inténtalo de nuevo.')
  }
}

  return (
    <>
      <Header />
      <main>
        <div className="registrar-toma-page">
          <h2>Registrar Toma</h2>
          {(esCuidadorSinPaciente || medicamentos.length === 0) && <p role="status">{esCuidadorSinPaciente ? 'Tu cuenta de cuidador aún no está vinculada a un paciente.' : 'Primero registra un medicamento en tu tratamiento.'} No se puede registrar una toma sin un medicamento asociado.</p>}
          <form onSubmit={handleSubmit} className="form-toma">
            <div className="campo-grupo" style={{ marginBottom: '16px' }}>
              <label htmlFor="medicamento">Medicamento</label>
              <select
                id="medicamento"
                value={form.medicamento}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar medicamento...</option>
                {medicamentos.map(med => (
                  <option key={med.idMedicamento} value={med.idMedicamento}>
                    {med.nombre} ({med.dosis})
                  </option>
                ))}
              </select>
            </div>

            <div className="campo-grupo" style={{ marginBottom: '16px' }}>
              <label htmlFor="dosis">
                Dosis <span style={{ color: '#ef4444', fontSize: '13px' }}>*</span>
              </label>
              <input
                type="text"
                id="dosis"
                placeholder="Ej: 500 mg, 1.5 ml, 2 tabletas"
                value={form.dosis}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-toma-grid">
              <div className="campo-grupo">
                <label htmlFor="hora">Hora de toma</label>
                <input
                  type="time"
                  id="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="campo-grupo">
                <label htmlFor="nota">Nota (opcional)</label>
                <textarea
                  id="nota"
                  placeholder="Escribe una nota opcional..."
                  value={form.nota}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-confirmar" disabled={esCuidadorSinPaciente || medicamentos.length === 0}>
              Confirmar Toma
            </button>

            {mensajeExito && (
              <div className="mensaje-exito" style={{ display: 'block' }}>
                ✅ ¡Toma registrada correctamente! Redirigiendo...
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default RegistrarToma
