import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function Inventario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esCuidadorSinPaciente = usuario.perfil === 'cuidador' && usuario.pacienteVinculado !== true
  const [medicamentos, setMedicamentos] = useState([])
  const [inventario, setInventario] = useState([])
  const [idMedicamento, setIdMedicamento] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [cargando, setCargando] = useState(!esCuidadorSinPaciente)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const obtenerDatos = useCallback(() => Promise.all([
        API.getMedicamentos(),
        API.getInventario()
      ]), [])

  const cargarDatos = useCallback(async () => {
    try {
      const [listaMedicamentos, listaInventario] = await obtenerDatos()
      setMedicamentos(listaMedicamentos)
      setInventario(listaInventario)
      setIdMedicamento((actual) => actual || String(listaMedicamentos[0]?.idMedicamento || ''))
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario.')
    } finally {
      setCargando(false)
    }
  }, [obtenerDatos])

  useEffect(() => {
    if (esCuidadorSinPaciente) return
    let activo = true
    obtenerDatos()
      .then(([listaMedicamentos, listaInventario]) => {
        if (!activo) return
        setMedicamentos(listaMedicamentos)
        setInventario(listaInventario)
        setIdMedicamento((actual) => actual || String(listaMedicamentos[0]?.idMedicamento || ''))
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudo cargar el inventario.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => { activo = false }
  }, [esCuidadorSinPaciente, obtenerDatos])

  const filas = useMemo(() => medicamentos.map((medicamento) => {
    const stock = inventario.find((item) =>
      Number(item.idMedicamento ?? item.id_medicamento) === Number(medicamento.idMedicamento)
    )
    return { medicamento, stock }
  }), [medicamentos, inventario])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    const cantidadNumerica = Number(cantidad)
    if (!idMedicamento || !Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setError('Selecciona un medicamento e ingresa una cantidad entera mayor que cero.')
      return
    }

    setGuardando(true)
    try {
      await API.actualizarInventario(Number(idMedicamento), {
        cantidad: cantidadNumerica,
        ...(fechaVencimiento && { fecha_vencimiento: fechaVencimiento })
      })
      setCantidad('')
      setFechaVencimiento('')
      setMensaje('La recarga se registró y el stock quedó actualizado.')
      await cargarDatos()
    } catch (err) {
      setError(err.message || 'No se pudo registrar la recarga.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Header />
      <main>
        <section style={{ maxWidth: '1000px', margin: '32px auto', padding: '24px' }}>
          <h1>Inventario de medicamentos</h1>
          <p>Consulta las unidades disponibles y registra las recargas de tus medicamentos.</p>

          {error && <p role="alert" style={{ color: '#b42318', background: '#fef3f2', padding: '12px', borderRadius: '8px' }}>{error}</p>}
          {mensaje && <p role="status" style={{ color: '#067647', background: '#ecfdf3', padding: '12px', borderRadius: '8px' }}>{mensaje}</p>}

          {esCuidadorSinPaciente ? (
            <p role="status">Tu cuenta de cuidador todavía no está vinculada a un paciente. El inventario aparecerá cuando se complete esa vinculación.</p>
          ) : cargando ? (
            <p>Cargando inventario...</p>
          ) : medicamentos.length === 0 ? (
            <p>No hay medicamentos registrados. Primero agrega un medicamento en <Link to="/tratamiento">Tratamiento</Link>.</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', maxWidth: '540px', margin: '24px 0' }}>
                <h2 style={{ marginBottom: 0 }}>Registrar una recarga</h2>
                <label>
                  Medicamento
                  <select value={idMedicamento} onChange={(e) => setIdMedicamento(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }}>
                    {medicamentos.map((medicamento) => (
                      <option key={medicamento.idMedicamento} value={medicamento.idMedicamento}>
                        {medicamento.nombre} — {medicamento.dosis}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Unidades que agregas
                  <input type="number" min="1" step="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
                </label>
                <label>
                  Vencimiento de este lote (opcional)
                  <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
                </label>
                <button type="submit" disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Registrar recarga'}
                </button>
              </form>

              <h2>Stock actual</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="calendar-table">
                  <thead><tr><th>Medicamento</th><th>Disponible</th><th>Vencimiento del lote</th><th>Estado</th></tr></thead>
                  <tbody>
                    {filas.map(({ medicamento, stock }) => (
                      <tr key={medicamento.idMedicamento}>
                        <td>{medicamento.nombre} ({medicamento.dosis})</td>
                        <td>{stock?.cantidad_actual ?? 0} unidades</td>
                        <td>{stock?.fecha_vencimiento_lote || 'No registrado'}</td>
                        <td>{stock ? (stock.es_bajo_stock ? 'Stock bajo' : 'Disponible') : 'Sin inventario'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: '12px' }}>El stock bajo se marca según el mínimo configurado para cada medicamento.</p>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Inventario
