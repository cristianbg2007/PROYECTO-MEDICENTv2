import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function AdminMedicamentos() {
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    API.getAdminMedicamentosResumen()
      .then(setResumen)
      .catch((err) => setError(err.message || 'No se pudo cargar el resumen.'))
  }, [])

  return (
    <>
      <Header />
      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '24px' }}>
        <h1>Resumen de medicamentos</h1>
        <p style={{ lineHeight: 1.6, color: '#4b5563' }}>Consulta cifras generales del sistema. Este panel no muestra dosis ni datos clínicos individuales.</p>
        {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
        {!resumen && !error && <p>Cargando resumen...</p>}
        {resumen && <>
          <div style={gridStyle}>
            <article style={cardStyle}><h2>Total registrados</h2><p style={numberStyle}>{resumen.total}</p></article>
            <article style={cardStyle}><h2>Tratamientos activos</h2><p style={numberStyle}>{resumen.tratamientosActivos}</p></article>
          </div>
          <div style={gridStyle}>
            <section style={cardStyle}><h2>Por tipo</h2><ResumenTabla filas={resumen.porTipo} /></section>
            <section style={cardStyle}><h2>Por vía de administración</h2><ResumenTabla filas={resumen.porVia} /></section>
          </div>
        </>}
        <Link to="/admin" style={{ display: 'inline-block', marginTop: '16px', color: '#1d3b5e', fontWeight: 600 }}>
          ← Volver al panel
        </Link>
      </main>
      <Footer />
    </>
  )
}

function ResumenTabla({ filas }) {
  if (!filas?.length) return <p>No hay datos para mostrar.</p>
  return <ul style={{ paddingLeft: '20px', lineHeight: 1.9 }}>{filas.map((fila) => <li key={fila.nombre}>{fila.nombre}: {fila.cantidad}</li>)}</ul>
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }
const cardStyle = { padding: '20px', border: '1px solid #d7e0e8', borderRadius: '10px', background: '#f8fafc' }
const numberStyle = { margin: '8px 0 0', fontSize: '2rem', fontWeight: 700, color: '#1d3b5e' }

export default AdminMedicamentos
