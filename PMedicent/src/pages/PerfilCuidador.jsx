import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import API from '../api'

function PerfilCuidador() {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    API.getPerfil()
      .then(({ user }) => {
        if (activo) setPerfil(user || null)
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudo cargar tu perfil.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => { activo = false }
  }, [])

  return (
    <>
      <Header />
      <main>
        <section>
          <div className="tarjeta-perfil">
            <h2>Mi Perfil de Cuidador</h2>
            <div className="foto-ficticia" aria-hidden="true"></div>
            {cargando && <p role="status">Cargando perfil...</p>}
            {error && <p role="alert">{error}</p>}
            {!cargando && !error && perfil && (
              <>
                <p><strong>Nombre:</strong> {[perfil.nombre, perfil.apellido].filter(Boolean).join(' ') || 'Sin registrar'}</p>
                <p><strong>Correo:</strong> {perfil.correo || 'Sin registrar'}</p>
                <p><strong>Teléfono:</strong> {perfil.telefono || 'Sin registrar'}</p>
                <p><strong>Experiencia:</strong> {perfil.experienciaAnios ?? 0} años</p>
                <p><strong>Vinculación:</strong> {perfil.pacienteVinculado ? 'Vinculado a un paciente' : 'Sin paciente vinculado'}</p>
                <Link to="/editar-perfil">Editar Perfil</Link>
                <Link to="/dashboard">Volver al panel</Link>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default PerfilCuidador