const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/+$/, '');

const fechaLocalActual = () => {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  // Merge headers correctamente
  const mergedOptions = {
    ...options,
    headers: {
      ...defaults.headers,
      ...(options.headers || {})
    }
  };

  const res = await fetch(url, mergedOptions);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // Corrección: Flask envía 'error' o 'message', no 'mensaje'
    throw new Error(errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const API = {

  // ==========================================
  // AUTENTICACIÓN (Flask + MySQL)
  // ==========================================

  async login(correo, password) {
    return apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ correo: correo, email: correo, password: password })
    });
  },

  async crearUsuario(usuario) {
    return apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify(usuario)
    });
  },

  async solicitarRestablecimiento(correo) {
    return apiFetch('/password/solicitar-restablecimiento', {
      method: 'POST',
      body: JSON.stringify({ correo })
    });
  },

  async restablecerContrasena(token, nuevaContrasena) {
    return apiFetch('/password/restablecer', {
      method: 'POST',
      body: JSON.stringify({ token, nuevaContrasena })
    });
  },

  async crearPerfilPaciente(perfil) {
    return apiFetch('/perfil/paciente', { method: 'POST', body: JSON.stringify(perfil) });
  },

  async crearPerfilCuidador(perfil) {
    return apiFetch('/perfil/cuidador', { method: 'POST', body: JSON.stringify(perfil) });
  },

  async getVinculacion() {
    return apiFetch('/perfil/vinculacion');
  },

  async generarCodigoVinculacion() {
    return apiFetch('/perfil/vinculacion/codigo', { method: 'POST', body: JSON.stringify({}) });
  },

  async canjearCodigoVinculacion(codigo) {
    return apiFetch('/perfil/vinculacion/canjear', { method: 'POST', body: JSON.stringify({ codigo }) });
  },

  async desvincularCuidador(idCuidador) {
    return apiFetch(`/perfil/vinculacion/cuidadores/${idCuidador}`, { method: 'DELETE' });
  },

  async getPerfil() {
    return apiFetch('/perfil');
  },

  async actualizarPerfil(perfil) {
    return apiFetch('/perfil', { method: 'PUT', body: JSON.stringify(perfil) });
  },

  // ==========================================
  // TOMAS DE MEDICAMENTOS
  // ==========================================

  async generarReporteAdherencia(reporte) {
    return apiFetch('/adherencia/generar', { method: 'POST', body: JSON.stringify(reporte) });
  },

  async getReportesAdherencia(idTratamiento) {
    return apiFetch(`/adherencia/tratamiento/${idTratamiento}`);
  },

  async getUltimoReporteAdherencia() {
    return apiFetch('/adherencia/ultimo');
  },

  async getTomas() {
    return apiFetch('/tomas');
  },

  async getTomasHoy() {
    const hoy = fechaLocalActual();
    return apiFetch(`/tomas?fecha=${hoy}`);
  },

  async crearToma(toma) {
    return apiFetch('/tomas', {
      method: 'POST',
      body: JSON.stringify(toma)
    });
  },

  async eliminarToma(id) {
    return apiFetch(`/tomas/${id}`, { method: 'DELETE' });
  },

  // ==========================================
  // BIOMARCADORES
  // ==========================================

  async getBiomarcadores() {
    return apiFetch('/biomarcadores');
  },

  async getBiomarcadoresHoy() {
    const hoy = fechaLocalActual();
    return apiFetch(`/biomarcadores?fecha=${hoy}`);
  },

  async getBiomarcadoresPorFecha(fecha) {
    return apiFetch(`/biomarcadores?fecha=${fecha}`);
  },

  async crearBiomarcador(bio) {
    return apiFetch('/biomarcadores', {
      method: 'POST',
      body: JSON.stringify(bio)
    });
  },

  // ==========================================
  // INVENTARIO Y MEDICAMENTOS
  // ==========================================

  async getInventario() {
    return apiFetch('/inventario');
  },

  async actualizarInventario(idMedicamento, datos) {
    return apiFetch('/inventario/recargar', {
      method: 'POST',
      body: JSON.stringify({ ...datos, idMedicamento })
    });
  },

  async getOpcionesMedicamento() {
    return apiFetch('/medicamentos/opciones');
  },

  async getTratamientos() {
    return apiFetch('/tratamientos');
  },

  async getMedicamentos() {
    return apiFetch('/medicamentos');
  },

  async crearMedicamento(medicamento) {
    return apiFetch('/medicamentos', {
      method: 'POST',
      body: JSON.stringify(medicamento)
    });
  },

  async actualizarHorarioMedicamento(id, datos) {
    return apiFetch(`/medicamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  },

  async eliminarMedicamento(id) {
    return apiFetch(`/medicamentos/${id}`, { method: 'DELETE' });
  },

  // Próxima toma
  async getProximaToma() {
    return apiFetch('/proximaToma');
  },

  // ==========================================
  // ADMINISTRADOR
  // ==========================================

  // --- Usuarios ---
  async getAdminUsuarios() {
    return apiFetch('/admin/usuarios');
  },

  async crearAdmin(usuario) {
    return apiFetch('/admin/administradores', {
      method: 'POST',
      body: JSON.stringify(usuario)
    });
  },

  async actualizarUsuario(idUsuario, datos) {
    return apiFetch(`/admin/usuarios/${idUsuario}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  },

  async eliminarUsuario(idUsuario) {
    return apiFetch(`/admin/usuarios/${idUsuario}`, {
      method: 'DELETE'
    });
  },

  async cambiarEstadoUsuario(idUsuario, activo) {
    return apiFetch(`/admin/usuarios/${idUsuario}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo })
    });
  },

  async getAdminResumen() {
    return apiFetch('/admin/resumen');
  },

  async getAdminMedicamentosResumen() {
    return apiFetch('/admin/medicamentos/resumen');
  },

  async getAdminBiomarcadoresResumen() {
    return apiFetch('/admin/biomarcadores/resumen');
  }

};

export default API;
