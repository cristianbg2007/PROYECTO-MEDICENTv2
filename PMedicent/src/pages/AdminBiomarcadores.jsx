import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function AdminBiomarcadores() {
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    API.getAdminBiomarcadoresResumen()
      .then(setResumen)
      .catch((err) => setError(err.message || 'No se pudo cargar el resumen.'))
  }, [])

  return (
    <>
      <Header />
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '24px' }}>
        <h1>Resumen de biomarcadores</h1>
        <p style={{ lineHeight: 1.6, color: '#4b5563' }}>Consulta cantidades agrupadas por tipo, sin exponer valores ni identidades de pacientes.</p>
        {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
        {!resumen && !error && <p>Cargando resumen...</p>}
        {resumen && <section style={cardStyle}>
          <h2>Total de registros: {resumen.total}</h2>
          {!resumen.porTipo?.length ? <p>No hay biomarcadores registrados.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={cellStyle}>Tipo</th><th style={cellStyle}>Registros</th></tr></thead>
                <tbody>{resumen.porTipo.map((fila) => <tr key={fila.tipo}>
                  <td style={cellStyle}>{fila.tipo}</td><td style={cellStyle}>{fila.cantidad}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </section>}
        <Link to="/admin" style={{ display: 'inline-block', marginTop: '16px', color: '#1d3b5e', fontWeight: 600 }}>
          ← Volver al panel
        </Link>
      </main>
      <Footer />
    </>
  )
}

const cardStyle = { marginTop: '20px', padding: '20px', border: '1px solid #d7e0e8', borderRadius: '10px', background: '#f8fafc' }
const cellStyle = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }

export default AdminBiomarcadores
