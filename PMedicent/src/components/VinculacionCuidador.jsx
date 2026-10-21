import { useEffect, useState } from 'react'
import API from '../api'

function VinculacionCuidador({ usuario, onVinculacionCambiada }) {
  const [estado, setEstado] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const cargar = async () => {
    try {
      setEstado(await API.getVinculacion())
    } catch (err) {
      setError(err.message || 'No se pudo consultar la vinculación.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true
    API.getVinculacion()
      .then((resultado) => { if (activo) setEstado(resultado) })
      .catch((err) => { if (activo) setError(err.message || 'No se pudo consultar la vinculación.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [])

  const generarCodigo = async () => {
    setError(''); setMensaje(''); setGuardando(true)
    try {
      const resultado = await API.generarCodigoVinculacion()
      setCodigoGenerado(resultado)
      setMensaje('Comparte este código con tu cuidador. Solo se puede usar una vez y vence en 30 minutos.')
      await cargar()
    } catch (err) {
      setError(err.message || 'No se pudo generar el código.')
    } finally { setGuardando(false) }
  }

  const canjear = async (event) => {
    event.preventDefault(); setError(''); setMensaje(''); setGuardando(true)
    try {
      const resultado = await API.canjearCodigoVinculacion(codigo)
      setMensaje(`Ya estás vinculado con ${resultado.paciente.nombre} ${resultado.paciente.apellido}.`)
      setCodigo(''); await cargar(); await onVinculacionCambiada()
    } catch (err) {
      setError(err.message || 'No se pudo canjear el código.')
    } finally { setGuardando(false) }
  }

  const desvincular = async (idCuidador, nombre) => {
    if (!window.confirm(`¿Quieres quitar el acceso de ${nombre}?`)) return
    setError(''); setMensaje('')
    try {
      await API.desvincularCuidador(idCuidador)
      setMensaje('Se quitó el acceso del cuidador.')
      await cargar()
    } catch (err) {
      setError(err.message || 'No se pudo quitar el acceso.')
    }
  }

  if (!['paciente', 'cuidador'].includes(usuario?.perfil)) return null

  return (
    <section aria-labelledby="vinculacion-titulo" style={{ maxWidth: 760, margin: '20px auto', padding: 20, background: '#fff', borderRadius: 12 }}>
      <h2 id="vinculacion-titulo">Acceso de cuidadores</h2>
      {cargando ? <p>Consultando vínculo...</p> : usuario.perfil === 'paciente' ? (
        <>
          <p>Genera un código para autorizar a un cuidador a consultar y ayudar con tu seguimiento.</p>
          <button type="button" className="btn-accion" disabled={guardando} onClick={generarCodigo}>
            {guardando ? 'Generando...' : 'Generar código de invitación'}
          </button>
          {codigoGenerado && <p role="status"><strong>Código: {codigoGenerado.codigo}</strong><br />Vence: {new Date(codigoGenerado.expiraEn).toLocaleString('es-CO')}</p>}
          {estado?.cuidadores?.length > 0 && <>
            <h3>Cuidadores vinculados</h3>
            <ul>{estado.cuidadores.map((c) => <li key={c.idCuidador}>
              {c.nombre} {c.apellido} ({c.correo}){' '}
              <button type="button" onClick={() => desvincular(c.idCuidador, `${c.nombre} ${c.apellido}`)}>Quitar acceso</button>
            </li>)}</ul>
          </>}
        </>
      ) : estado?.paciente ? (
        <p role="status">Tu cuenta está vinculada con {estado.paciente.nombre} {estado.paciente.apellido}.</p>
      ) : (
        <>
          <p>Solicita un código al paciente. El código vence a los 30 minutos y solo se puede usar una vez.</p>
          <form onSubmit={canjear} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <label htmlFor="codigo-vinculacion">Código de invitación</label>
            <input id="codigo-vinculacion" value={codigo} onChange={(event) => setCodigo(event.target.value.toUpperCase())} maxLength={24} autoComplete="off" required />
            <button type="submit" disabled={guardando}>{guardando ? 'Vinculando...' : 'Vincular con paciente'}</button>
          </form>
        </>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
      {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
    </section>
  )
}

export default VinculacionCuidador
