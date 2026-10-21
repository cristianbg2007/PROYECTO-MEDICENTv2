import { useCallback, useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

const TIPOS = {
  fc:      { label: 'Frecuencia Cardíaca', unidad: 'lpm' },
  spo2:    { label: 'Saturación de Oxígeno (SpO2)', unidad: '%' },
  temp:    { label: 'Temperatura', unidad: '°C' },
  glucosa: { label: 'Glucosa', unidad: 'mg/dL' }
}

const fechaHoraLocalActual = () => {
  const ahora = new Date()
  const fecha = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return fecha.toISOString().slice(0, 16)
}

const RANGOS = {
  fc:      { min: 60,   max: 100,  unidad: 'lpm' },
  spo2:    { min: 95,   max: 100,  unidad: '%' },
  temp:    { min: 36.1, max: 37.2, unidad: '°C' },
  glucosa: { min: 70,   max: 100,  unidad: 'mg/dL' }
}

function Biomarcadores() {
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esCuidadorSinPaciente = usuarioData.perfil === 'cuidador' && usuarioData.pacienteVinculado !== true
  const nombreCompleto = `${usuarioData.nombre || ''} ${usuarioData.apellido || ''}`.trim()

  const [biomarcadoresHoy, setBiomarcadoresHoy] = useState([])
  const [bioMes, setBioMes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const hoy = new Date()
  const mesActual = hoy.toLocaleString('es-CO', { month: 'long' })
  const anioActual = hoy.getFullYear()

  const [form, setForm] = useState({
    tipo: '',
    valor: '',
    fechaHora: fechaHoraLocalActual(),
    notas: ''
  })
  const [rangoInfo, setRangoInfo] = useState(null)
  const [errorForm, setErrorForm] = useState('')

  const cargarDatos = useCallback(async () => {
    try {
      const [hoyData, todosData] = await Promise.all([
        API.getBiomarcadoresHoy(),
        API.getBiomarcadores(),
      ])
      setBiomarcadoresHoy(hoyData)
      setBioMes(todosData)
    } catch (err) {
      console.error('Error cargando biomarcadores:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const cargarIniciales = async () => {
      try {
        const [hoyData, todosData] = await Promise.all([
          API.getBiomarcadoresHoy(),
          API.getBiomarcadores()
        ])
        setBiomarcadoresHoy(hoyData)
        setBioMes(todosData)
      } catch (err) {
        console.error('Error cargando biomarcadores:', err)
      } finally {
        setCargando(false)
      }
    }
    void cargarIniciales()
  }, [])

  const calcularEstado = () => {
    if (biomarcadoresHoy.length === 0) return null
    const hayAlerta = biomarcadoresHoy.some(b => {
      const rango = RANGOS[b.tipo]
      if (!rango) return false
      return b.valor < rango.min || b.valor > rango.max
    })
    return hayAlerta ? 'ALERTA' : 'BUENO'
  }

  const estadoPaciente = calcularEstado()

  const handleTipoChange = (e) => {
    const tipo = e.target.value
    setForm(f => ({ ...f, tipo }))
    if (tipo && RANGOS[tipo]) {
      const r = RANGOS[tipo]
      setRangoInfo(`Rango normal: ${r.min} – ${r.max} ${r.unidad}`)
    } else {
      setRangoInfo(null)
    }
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.id]: e.target.value }))

  const getEstadoBio = (tipo, valor) => {
    const r = RANGOS[tipo]
    if (!r) return 'desconocido'
    return (valor >= r.min && valor <= r.max) ? 'bueno' : 'alerta'
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setErrorForm('')
    if (!form.tipo) { setErrorForm('Selecciona un tipo de biomarcador.'); return }
    if (!form.valor) { setErrorForm('Ingresa un valor.'); return }

    const [fecha, hora] = form.fechaHora.split('T')
    const valor = parseFloat(form.valor)
    const estado = getEstadoBio(form.tipo, valor)

    setGuardando(true)
    try {
      await API.crearBiomarcador({
        tipo: form.tipo,
        nombre: TIPOS[form.tipo]?.label ?? form.tipo,
        valor,
        unidad: TIPOS[form.tipo]?.unidad ?? '',
        fecha,
        hora,
        estado,
        notas: form.notas
      })
      setModalAbierto(false)
      setForm({ tipo: '', valor: '', fechaHora: fechaHoraLocalActual(), notas: '' })
      setRangoInfo(null)
      await cargarDatos()
    } catch (err) {
      console.error(err)
      setErrorForm('Error al guardar el biomarcador.')
    } finally {
      setGuardando(false)
    }
  }

  const diasDelMes = () => {
    const year = hoy.getFullYear()
    const month = hoy.getMonth()
    const totalDias = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: totalDias }, (_, i) => {
      const d = i + 1
      const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const mediciones = bioMes.filter(b => b.fecha === fecha)
      return { dia: d, fecha, mediciones }
    })
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="tratamiento-container">

          <div className="tratamiento-usuario">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/user-male-circle.png"
              alt="Perfil" className="user-avatar"
            />
            <div className="nombre">{nombreCompleto || 'Usuario'}</div>
          </div>

          <h1 className="tratamiento-titulo">Biomarcadores</h1>
          {esCuidadorSinPaciente && <p role="status">Tu cuenta de cuidador todavía no está vinculada a un paciente; por eso no hay mediciones que mostrar ni se pueden registrar.</p>}

          <div className="text-center">
            <button className="btn-registrar" disabled={esCuidadorSinPaciente} onClick={() => setModalAbierto(true)}>
              <img src="https://img.icons8.com/ios-filled/24/ffffff/plus.png" alt="add" />
              Registrar Nuevo Biomarcador
            </button>
          </div>

          <div className="biomarcadores-hoy">
            <h2>Biomarcadores hoy</h2>

            {estadoPaciente && (
              <p className="estado">
                Estado de {usuarioData.nombre || 'paciente'}:{' '}
                <strong className={estadoPaciente === 'BUENO' ? 'bueno' : 'alerta'}>
                  {estadoPaciente}
                </strong>
              </p>
            )}

            <div className="mediciones-list">
              {cargando ? (
                <p style={{ color: '#888' }}>Cargando...</p>
              ) : biomarcadoresHoy.length === 0 ? (
                <p style={{ color: '#888' }}>No hay mediciones registradas hoy.</p>
              ) : (
                biomarcadoresHoy.map(b => (
                  <div key={b.idBiomarcador} className={`medicion-item estado-${b.estado}`}>
                    <div className="medicion-nombre">{b.nombre}</div>
                    <div className="medicion-valor">
                      <span className="valor-num">{b.valor}</span>
                      <span className="valor-unidad"> {b.unidad}</span>
                    </div>
                    <div className="medicion-hora">🕐 {b.hora}</div>
                    {RANGOS[b.tipo] && (
                      <div className="medicion-rango" style={{ fontSize: '12px', color: '#888' }}>
                        Rango: {RANGOS[b.tipo].min}–{RANGOS[b.tipo].max} {b.unidad}
                      </div>
                    )}
                    {b.estado === 'alerta' && (
                      <div className="medicion-alerta">⚠️ Fuera del rango normal</div>
                    )}
                    {b.notas && <div className="medicion-notas">{b.notas}</div>}
                  </div>
                ))
              )}
            </div>
          </div>

          <hr className="divider-biomarcadores" />

          <div className="biomarcadores-mes">
            <h2>Biomarcadores en el mes</h2>
            <h3 className="mes-titulo" style={{ textTransform: 'capitalize' }}>
              {mesActual} {anioActual}
            </h3>

            <div className="calendar-biomarcadores">
              {diasDelMes().map(({ dia, fecha, mediciones }) => (
                <div
                  key={fecha}
                  className={`dia-header ${mediciones.length > 0
                    ? mediciones.some(m => m.estado === 'alerta') ? 'dia-alerta' : 'dia-bueno'
                    : ''}`}
                  title={mediciones.length > 0
                    ? mediciones.map(m => `${m.nombre}: ${m.valor} ${m.unidad}`).join('\n')
                    : 'Sin mediciones'}
                >
                  <span className="dia-numero">{dia}</span>
                  {mediciones.length > 0 && (
                    <span className="dia-indicador">
                      {mediciones.some(m => m.estado === 'alerta') ? '⚠️' : '✓'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {modalAbierto && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <h2>Registrar Nuevo Biomarcador</h2>

            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label>Tipo de Biomarcador</label>
                <select id="tipo" value={form.tipo} onChange={handleTipoChange} required>
                  <option value="">Seleccionar...</option>
                  <option value="fc">Frecuencia Cardíaca (lpm)</option>
                  <option value="spo2">Saturación de Oxígeno (SpO2 %)</option>
                  <option value="temp">Temperatura (°C)</option>
                  <option value="glucosa">Glucosa (mg/dL)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>Valor</label>
                <input id="valor" type="number" step="0.1" placeholder="Ejemplo: 72"
                  value={form.valor} onChange={handleChange} required />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>Fecha y Hora</label>
                <input id="fechaHora" type="datetime-local"
                  value={form.fechaHora} onChange={handleChange} required />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>Notas (opcional)</label>
                <textarea id="notas" rows="3" placeholder="Observaciones..."
                  value={form.notas} onChange={handleChange} />
              </div>

              {rangoInfo && (
                <div className="rango-info">📊 {rangoInfo}</div>
              )}

              {errorForm && (
                <p style={{ color: 'red', fontSize: '0.88rem', marginBottom: '8px' }}>{errorForm}</p>
              )}

              <div className="modal-buttons">
                <button type="button" className="btn-cancelar"
                  onClick={() => { setModalAbierto(false); setErrorForm(''); setRangoInfo(null) }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {guardando ? 'Guardando...' : 'Guardar Medición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Biomarcadores
