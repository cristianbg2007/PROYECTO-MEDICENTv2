import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaFormulario from '../components/TarjetaFormulario';
import CampoTexto from '../components/CampoTexto';
import Button from '../components/Button';
import API from '../api';

function EditarPerfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '', fechaNacimiento: '', contactoEmergencia: '' });
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let activo = true;
    API.getPerfil()
      .then(({ user }) => {
        if (!activo || !user) return;
        setPerfil(user.perfil);
        setForm({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          correo: user.correo || '',
          telefono: user.telefono || '',
          fechaNacimiento: user.fechaNacimiento || '',
          contactoEmergencia: user.contactoEmergencia || ''
        });
      })
      .catch((err) => { if (activo) setError(err.message || 'No se pudo cargar el perfil.'); })
      .finally(() => { if (activo) setCargandoPerfil(false); });
    return () => { activo = false; };
  }, []);

  const handleChange = (e) => setForm((actual) => ({ ...actual, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setSuccess(false);

    try {
      const datos = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        telefono: form.telefono,
        fechaNacimiento: form.fechaNacimiento
      };
      if (perfil === 'paciente') datos.contactoEmergencia = form.contactoEmergencia;
      const respuesta = await API.actualizarPerfil(datos);
      if (respuesta?.user) localStorage.setItem('usuario', JSON.stringify(respuesta.user));

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <TarjetaFormulario titulo="Editar Perfil" onSubmit={handleSubmit}>
      {cargandoPerfil && <p>Cargando perfil...</p>}
      <CampoTexto
        label="Nombre"
        id="nombre"
        value={form.nombre}
        onChange={handleChange}
        required
      />
      <CampoTexto label="Apellido" id="apellido" value={form.apellido} onChange={handleChange} required />
      <CampoTexto
        label="Correo Electrónico"
        id="correo"
        type="email"
        value={form.correo}
        onChange={handleChange}
        required
      />
      <CampoTexto
        label="Teléfono de Contacto"
        id="telefono"
        type="tel"
        value={form.telefono}
        onChange={handleChange}
      />
      <CampoTexto
        label="Fecha de Nacimiento"
        id="fechaNacimiento"
        type="date"
        value={form.fechaNacimiento}
        onChange={handleChange}
        required
      />
      {perfil === 'paciente' && <CampoTexto label="Contacto de Emergencia" id="contactoEmergencia" placeholder="Nombre y teléfono de contacto" value={form.contactoEmergencia} onChange={handleChange} />}

      {error && <p style={{ color: 'red', textAlign: 'center', margin: '15px 0' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center', margin: '15px 0' }}>Cambios guardados correctamente</p>}

      <Button texto={cargandoPerfil ? 'Cargando perfil...' : guardando ? 'Guardando...' : 'Guardar Cambios'} />
    </TarjetaFormulario>
  );
}

export default EditarPerfil;
