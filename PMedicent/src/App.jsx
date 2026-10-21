import { Routes, Route } from 'react-router-dom'
import './styles/estilos.css'
import Inicio from './pages/Inicio'
import SesionIniciada from './pages/Sesioniniciada'
import RegistrarToma from './pages/Registrar-toma'
import Registro from './pages/Registro'
import InicioSesion from './pages/InicioSesion'
import ElegirRol from './pages/Elegir_rol'
import DatosPersonalesPaciente from './pages/DatosPersonalesPaciente'
import DatosMedicosPaciente from './pages/DatosMedicosPaciente'
import DatosPersonalesCuidador from './pages/DatosPersonalesCuidador'
import PerfilCuidador from './pages/PerfilCuidador'
import EditarPerfil from './pages/EditarPerfil'
import Tratamiento from './pages/Tratamiento'
import Reportes from './pages/Reportes'
import Inventario from './pages/Inventario'
import HistorialTomas from './pages/HistorialTomas'
import Biomarcadores from './pages/Biomarcadores'
import AdminDashboard from './pages/AdminDashboard'
import AdminBiomarcadores from './pages/AdminBiomarcadores'
import AdminMedicamentos from './pages/AdminMedicamentos'
import AdminUsuarios from './pages/AdminUsuarios'
import RecuperarContrasena from './pages/RecuperarContrasena'
import AdminRoute from './components/AdminRoute'
import UserRoute from './components/UserRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/inicio-sesion" element={<InicioSesion />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/restablecer-contrasena" element={<RecuperarContrasena />} />
      <Route element={<UserRoute />}>
        <Route path="/dashboard" element={<SesionIniciada />} />
        <Route path="/registrar-toma" element={<RegistrarToma />} />
        <Route path="/elegir-rol" element={<ElegirRol />} />
        <Route path="/datos-personales-paciente" element={<DatosPersonalesPaciente />} />
        <Route path="/datos-medicos-paciente" element={<DatosMedicosPaciente />} />
        <Route path="/datos-personales-cuidador" element={<DatosPersonalesCuidador />} />
        <Route path="/perfil-cuidador" element={<PerfilCuidador />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/tratamiento" element={<Tratamiento />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/historial-tomas" element={<HistorialTomas />} />
        <Route path="/tomar-biomarcadores" element={<Biomarcadores />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
      <Route path="/admin/medicamentos" element={<AdminRoute><AdminMedicamentos /></AdminRoute>} />
      <Route path="/admin/biomarcadores" element={<AdminRoute><AdminBiomarcadores /></AdminRoute>} />
    </Routes>
  )
}

export default App
