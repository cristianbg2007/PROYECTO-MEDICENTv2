import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function HistorialTomas() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esCuidadorSinPaciente = usuario.perfil === 'cuidador' && usuario.pacienteVinculado !== true
  const [tomas, setTomas] = useState([])
  const [fecha, setFecha] = useState('')
  const [cargando, setCargando] = useState(!esCuidadorSinPaciente)
  const [error, setError] = useState('')

  useEffect(() => {
    if (esCuidadorSinPaciente) return
    let activo = true
    API.getTomas()
      .then((lista) => {
        if (activo) setTomas(lista)
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudo cargar el historial de tomas.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => { activo = false }
  }, [esCuidadorSinPaciente])

  const tomasFiltradas = useMemo(
    () => fecha ? tomas.filter((toma) => toma.fecha === fecha) : tomas,
    [fecha, tomas]
  )

  return (
    <>
      <Header />
      <main>
        <section style={{ maxWidth: '1000px', margin: '32px auto', padding: '24px' }}>
          <h1>Historial de tomas</h1>
          <p>Consulta las dosis registradas y filtra el historial por fecha.</p>

          {error && <p role="alert" style={{ color: '#b42318', background: '#fef3f2', padding: '12px', borderRadius: '8px' }}>{error}</p>}
          {esCuidadorSinPaciente ? (
            <p role="status">Tu cuenta de cuidador todavía no está vinculada a un paciente. El historial aparecerá cuando se complete esa vinculación.</p>
          ) : cargando ? (
            <p>Cargando historial...</p>
          ) : (
            <>
              <label style={{ display: 'block', maxWidth: '320px', margin: '20px 0' }}>
                Filtrar por fecha
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginTop: '5px' }} />
              </label>

              {tomasFiltradas.length === 0 ? (
                <p>{fecha ? 'No hay tomas registradas para esa fecha.' : 'Todavía no hay tomas registradas.'}</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="calendar-table">
                    <thead><tr><th>Fecha y hora</th><th>Medicamento</th><th>Dosis</th><th>Vía</th><th>Estado</th><th>Nota</th></tr></thead>
                    <tbody>
                      {tomasFiltradas.map((toma) => (
                        <tr key={toma.idToma}>
                          <td>{toma.fecha} {String(toma.hora || '').slice(0, 5)}</td>
                          <td>{toma.medicamento || '—'}</td>
                          <td>{toma.dosis}</td>
                          <td>{toma.via || '—'}</td>
                          <td>{toma.estado || 'Sin estado'}</td>
                          <td>{toma.nota || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
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

export default HistorialTomas
