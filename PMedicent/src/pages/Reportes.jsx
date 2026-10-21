import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

const fechaLocal = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const hoyLocal = () => fechaLocal(new Date())
const formatearFechaGeneracion = (valor) => {
  if (!valor) return '—'
  const conZona = /(?:Z|[+-]\d{2}:\d{2})$/i.test(valor)
    ? valor
    : `${valor.replace(' ', 'T')}Z`
  const fecha = new Date(conZona)
  return Number.isNaN(fecha.getTime())
    ? valor
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha)
}
const inicioMesLocal = () => {
  const hoy = new Date()
  return fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
}

function Reportes() {
  const [tratamientos, setTratamientos] = useState([])
  const [idTratamiento, setIdTratamiento] = useState('')
  const [fechaInicio, setFechaInicio] = useState(inicioMesLocal())
  const [fechaFin, setFechaFin] = useState(hoyLocal())
  const [reportes, setReportes] = useState([])
  const [reporteNuevo, setReporteNuevo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const lista = await API.getTratamientos()
        setTratamientos(lista)
        if (lista.length) setIdTratamiento(String(lista[0].idTratamiento))
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los tratamientos.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    if (!idTratamiento) return
    let activo = true
    API.getReportesAdherencia(idTratamiento)
      .then((lista) => { if (activo) setReportes(lista) })
      .catch((err) => { if (activo) setError(err.message || 'No se pudo cargar el historial de reportes.') })
    return () => { activo = false }
  }, [idTratamiento])

  const handleGenerar = async (e) => {
    e.preventDefault()
    setError('')
    setReporteNuevo(null)
    if (!idTratamiento) {
      setError('Selecciona un tratamiento.')
      return
    }
    if (fechaInicio > fechaFin) {
      setError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    setGenerando(true)
    try {
      const reporte = await API.generarReporteAdherencia({
        idTratamiento: Number(idTratamiento), fechaInicio, fechaFin
      })
      setReporteNuevo(reporte)
      const historial = await API.getReportesAdherencia(idTratamiento)
      setReportes(historial)
    } catch (err) {
      setError(err.message || 'No se pudo generar el reporte.')
    } finally {
      setGenerando(false)
    }
  }

  const tratamientoSeleccionado = tratamientos.find((tratamiento) => String(tratamiento.idTratamiento) === idTratamiento)

  return (
    <>
      <Header />
      <main>
        <section className="reportes-container" style={{ maxWidth: '1000px', margin: '32px auto', padding: '24px' }}>
          <h1>Reportes de adherencia</h1>
          <p>Consulta las dosis esperadas y las tomas registradas de tus tratamientos.</p>

          {error && <p role="alert" style={{ color: '#b42318', background: '#fef3f2', padding: '12px', borderRadius: '8px' }}>{error}</p>}
          {cargando ? <p>Cargando tratamientos...</p> : tratamientos.length === 0 ? (
            <p>{(JSON.parse(localStorage.getItem('usuario') || '{}').perfil === 'cuidador' && JSON.parse(localStorage.getItem('usuario') || '{}').pacienteVinculado !== true) ? 'Tu cuenta de cuidador todavía no está vinculada a un paciente.' : 'No hay tratamientos registrados para esta cuenta.'}</p>
          ) : (
            <>
              <form onSubmit={handleGenerar} style={{ display: 'grid', gap: '14px', maxWidth: '540px', margin: '20px 0' }}>
                <label>
                  Tratamiento
                  <select value={idTratamiento} onChange={(e) => { setIdTratamiento(e.target.value); setReporteNuevo(null) }} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
                    {tratamientos.map((tratamiento) => (
                      <option key={tratamiento.idTratamiento} value={tratamiento.idTratamiento}>
                        {tratamiento.medicamentos.join(', ') || 'Tratamiento'} ({tratamiento.fechaInicio} a {tratamiento.fechaFin})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Desde
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
                </label>
                <label>
                  Hasta
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
                </label>
                <button type="submit" disabled={generando} className="btn btn-primary">
                  {generando ? 'Generando...' : 'Generar reporte'}
                </button>
              </form>

              {tratamientoSeleccionado && <p>Periodo del tratamiento: {tratamientoSeleccionado.fechaInicio} a {tratamientoSeleccionado.fechaFin}</p>}
              {reporteNuevo && (
                <article style={{ border: '1px solid #d0d5dd', borderRadius: '10px', padding: '16px', margin: '20px 0' }}>
                  <h2>Reporte generado: {reporteNuevo.porcentaje}%</h2>
                  <p>{reporteNuevo.totalRealizadas} de {reporteNuevo.totalProgramadas} dosis esperadas registradas como tomadas.</p>
                  <p>{reporteNuevo.observaciones}</p>
                </article>
              )}

              <h2>Historial de reportes</h2>
              {reportes.length === 0 ? <p>Aún no hay reportes para este tratamiento.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="calendar-table">
                    <thead><tr><th>Generado</th><th>Periodo</th><th>Dosis tomadas</th><th>Adherencia</th><th>Resultado</th></tr></thead>
                    <tbody>{reportes.map((reporte) => (
                      <tr key={reporte.idAdherencia}>
                        <td>{formatearFechaGeneracion(reporte.fechaGeneracion)}</td>
                        <td>{reporte.periodoInicio} a {reporte.periodoFin}</td>
                        <td>{reporte.totalRealizadas} / {reporte.totalProgramadas}</td>
                        <td>{reporte.porcentaje}%</td>
                        <td>{reporte.observaciones}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Reportes
