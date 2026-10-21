import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
const DIAS_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const nuevaFecha = () => {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
}
const formularioInicial = () => ({
  nombre: '', dosis: '', idTipoMedicamento: '', idViaAdministracion: '', horario: '',
  frecuencia: 'Diario', fechaInicio: nuevaFecha(), fechaFin: '', fechaVencimiento: '', cantidadInicial: '0'
})

function Tratamiento() {
  const navigate = useNavigate()
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esCuidadorSinPaciente = usuarioData.perfil === 'cuidador' && usuarioData.pacienteVinculado !== true
  const [usuario] = useState({ nombre: `${usuarioData.nombre || ''} ${usuarioData.apellido || ''}`.trim() })
  const [medicamentos, setMedicamentos] = useState([])
  const [opciones, setOpciones] = useState({ tipos: [], vias: [] })
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState(formularioInicial)
  const [diasSel, setDiasSel] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [medEditando, setMedEditando] = useState(null)
  const [formHorario, setFormHorario] = useState({ horario: '', frecuencia: 'Diario', dias: [] })

  const cargarDatos = useCallback(async () => {
    setErrorCarga('')
    try {
      const [meds, datosOpciones] = await Promise.all([
        API.getMedicamentos(),
        API.getOpcionesMedicamento()
      ])
      setMedicamentos(meds)
      setOpciones(datosOpciones)
    } catch (err) {
      setErrorCarga(err.message || 'No se pudieron cargar los datos del tratamiento.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(cargarDatos)
  }, [cargarDatos])

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value })
  const toggleDia = (dia) => setDiasSel(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])
  const toggleDiaHorario = (dia) => setFormHorario(prev => ({
    ...prev,
    dias: prev.dias.includes(dia) ? prev.dias.filter(d => d !== dia) : [...prev.dias, dia]
  }))

  const abrirEdicionHorario = (medicamento) => {
    setMedEditando(medicamento)
    setFormHorario({
      horario: medicamento.horario || '',
      frecuencia: medicamento.frecuencia || 'Diario',
      dias: medicamento.dias || []
    })
    setErrorForm('')
  }

  const guardarHorario = async (e) => {
    e.preventDefault()
    setErrorForm('')
    if (formHorario.frecuencia === 'Días específicos' && formHorario.dias.length === 0) {
      setErrorForm('Selecciona al menos un día.')
      return
    }
    setGuardando(true)
    try {
      await API.actualizarHorarioMedicamento(medEditando.idMedicamento, formHorario)
      setMedEditando(null)
      await cargarDatos()
    } catch (err) {
      setErrorForm(err.message || 'No se pudo actualizar el horario.')
    } finally {
      setGuardando(false)
    }
  }

  const handleAgregarMed = async (e) => {
    e.preventDefault()
    setErrorForm('')
    if (form.frecuencia === 'Días específicos' && diasSel.length === 0) {
      setErrorForm('Selecciona al menos un día.')
      return
    }

    setGuardando(true)
    try {
      await API.crearMedicamento({
        ...form,
        idTipoMedicamento: Number(form.idTipoMedicamento),
        idViaAdministracion: Number(form.idViaAdministracion),
        cantidadInicial: Number(form.cantidadInicial || 0),
        dias: diasSel
      })
      setModalAbierto(false)
      setForm(formularioInicial())
      setDiasSel([])
      await cargarDatos()
    } catch (err) {
      setErrorForm(err.message || 'Error al guardar el medicamento.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="tratamiento-container">
          <div className="tratamiento-usuario">
            <img src="https://img.icons8.com/ios-filled/50/000000/user-male-circle.png" alt="Perfil" className="user-avatar" />
            <div className="nombre">{usuario.nombre}</div>
          </div>
          <h1 className="tratamiento-titulo">Tratamiento</h1>
          <p className="tratamiento-subtitulo">Medicamentos de tu perfil</p>
          {errorCarga && <p role="alert" style={{ color: '#b42318' }}>{errorCarga}</p>}
          {!cargando && !errorCarga && (!opciones.tipos.length || !opciones.vias.length) && <p role="alert" style={{ color: '#b42318' }}>No se cargaron los tipos o las vías de administración. Recarga la página o pide que revisen el catálogo de medicamentos.</p>}
          {esCuidadorSinPaciente && <p role="status">Tu cuenta de cuidador todavía no está vinculada a un paciente. Puedes consultar este panel, pero las acciones clínicas estarán disponibles cuando se realice esa vinculación.</p>}

          {cargando ? <p style={{ textAlign: 'center', padding: '20px' }}>Cargando medicamentos...</p> : (
            <div className="calendar-table-container">
              <table className="calendar-table">
                <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Horario</th><th>Vía</th><th>Configuración</th></tr></thead>
                <tbody>
                  {medicamentos.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No hay medicamentos registrados.</td></tr>
                  ) : medicamentos.map(med => (
                    <tr key={med.idMedicamento}>
                      <td>{med.nombre}</td><td>{med.dosis}</td>
                      <td>{med.frecuencia || `${med.frecuenciaDiaria} vez/día`}</td>
                      <td>{med.horario || 'Sin configurar'}</td><td>{med.via || '—'}</td><td>{!med.horario || !med.frecuencia ? <button type="button" onClick={() => abrirEdicionHorario(med)}>Completar horario</button> : 'Configurado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="botones-tratamiento">
            <button className="btn btn-primary" disabled={esCuidadorSinPaciente} onClick={() => { setErrorForm(''); setModalAbierto(true) }}>Agregar Medicamento</button>
            <button className="btn btn-primary" disabled={esCuidadorSinPaciente} onClick={() => navigate('/registrar-toma')}>Registrar Toma</button>
          </div>
        </div>
      </main>

      {modalAbierto && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h2>Agregar Medicamento</h2>
            {(!opciones.tipos.length || !opciones.vias.length) && <p role="alert">Faltan opciones de tipo o vía de administración. No se puede guardar hasta que cargue el catálogo.</p>}
            <form onSubmit={handleAgregarMed}>
              <div style={{ marginBottom: '12px' }}><label htmlFor="nombre">Nombre del medicamento</label><input id="nombre" type="text" placeholder="Ej: Ibuprofeno" required value={form.nombre} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}><label htmlFor="dosis">Dosis y unidad</label><input id="dosis" type="text" placeholder="Ej: 500 mg, 10 ml" required value={form.dosis} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="idTipoMedicamento">Tipo de medicamento</label>
                <select id="idTipoMedicamento" value={form.idTipoMedicamento} onChange={handleChange} required disabled={!opciones.tipos.length}>
                  <option value="">Seleccionar...</option>{opciones.tipos.map(tipo => <option key={tipo.idTipoMedicamento} value={tipo.idTipoMedicamento}>{tipo.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="idViaAdministracion">Vía de administración</label>
                <select id="idViaAdministracion" value={form.idViaAdministracion} onChange={handleChange} required disabled={!opciones.vias.length}>
                  <option value="">Seleccionar...</option>{opciones.vias.map(via => <option key={via.idViaAdministracion} value={via.idViaAdministracion}>{via.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}><label htmlFor="horario">Hora de toma</label><input id="horario" type="time" required value={form.horario} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="frecuencia">Frecuencia</label>
                <select id="frecuencia" value={form.frecuencia} onChange={handleChange}>
                  <option value="Diario">Diario</option><option value="Cada 8 horas">Cada 8 horas</option>
                  <option value="Cada 12 horas">Cada 12 horas</option><option value="Días específicos">Días específicos</option>
                </select>
              </div>
              {form.frecuencia === 'Días específicos' && (
                <div style={{ marginBottom: '12px' }}>
                  <label>Días de la semana</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {DIAS.map((dia, i) => <button key={dia} type="button" onClick={() => toggleDia(dia)} style={{ padding: '6px 12px', borderRadius: '20px', border: '2px solid', borderColor: diasSel.includes(dia) ? '#0D6E6E' : '#ccc', background: diasSel.includes(dia) ? '#0D6E6E' : '#fff', color: diasSel.includes(dia) ? '#fff' : '#333', cursor: 'pointer' }}>{DIAS_LABEL[i].slice(0, 3)}</button>)}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '12px' }}><label htmlFor="fechaInicio">Inicio del tratamiento</label><input id="fechaInicio" type="date" required value={form.fechaInicio} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}><label htmlFor="fechaFin">Fin del tratamiento</label><input id="fechaFin" type="date" min={form.fechaInicio} required value={form.fechaFin} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}><label htmlFor="fechaVencimiento">Vencimiento del medicamento</label><input id="fechaVencimiento" type="date" required value={form.fechaVencimiento} onChange={handleChange} /></div>
              <div style={{ marginBottom: '12px' }}><label htmlFor="cantidadInicial">Unidades disponibles (opcional)</label><input id="cantidadInicial" type="number" min="0" value={form.cantidadInicial} onChange={handleChange} /></div>
              {errorForm && <p role="alert" style={{ color: 'red', fontSize: '0.88rem', marginBottom: '8px' }}>{errorForm}</p>}
              <div className="modal-buttons">
                <button type="button" className="btn-cancelar" onClick={() => { setModalAbierto(false); setErrorForm('') }}>Cancelar</button>
                <button type="submit" className="btn-guardar" disabled={guardando || !opciones.tipos.length || !opciones.vias.length}>{guardando ? 'Guardando...' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {medEditando && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h2>Horario de {medEditando.nombre}</h2>
            <form onSubmit={guardarHorario}>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="horarioMedicamento">Hora de la primera toma</label>
                <input id="horarioMedicamento" type="time" required value={formHorario.horario}
                  onChange={(e) => setFormHorario({ ...formHorario, horario: e.target.value })} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="frecuenciaMedicamento">Frecuencia</label>
                <select id="frecuenciaMedicamento" value={formHorario.frecuencia}
                  onChange={(e) => setFormHorario({ ...formHorario, frecuencia: e.target.value })}>
                  <option value="Diario">Diario</option>
                  <option value="Cada 8 horas">Cada 8 horas</option>
                  <option value="Cada 12 horas">Cada 12 horas</option>
                  <option value="Días específicos">Días específicos</option>
                </select>
              </div>
              {formHorario.frecuencia === 'Días específicos' && (
                <div style={{ marginBottom: '12px' }}>
                  <label>Días de la semana</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {DIAS.map((dia, i) => <button key={dia} type="button" onClick={() => toggleDiaHorario(dia)}
                      style={{ padding: '6px 12px', borderRadius: '20px', border: '2px solid', borderColor: formHorario.dias.includes(dia) ? '#0D6E6E' : '#ccc', background: formHorario.dias.includes(dia) ? '#0D6E6E' : '#fff', color: formHorario.dias.includes(dia) ? '#fff' : '#333', cursor: 'pointer' }}>
                      {DIAS_LABEL[i].slice(0, 3)}
                    </button>)}
                  </div>
                </div>
              )}
              {errorForm && <p role="alert" style={{ color: 'red' }}>{errorForm}</p>}
              <div className="modal-buttons">
                <button type="button" className="btn-cancelar" onClick={() => setMedEditando(null)}>Cancelar</button>
                <button type="submit" className="btn-guardar" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar horario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}

export default Tratamiento
