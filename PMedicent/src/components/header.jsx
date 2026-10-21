import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const estaLogueado = !!localStorage.getItem('usuario');

  const showFullMenu = !['/', '/inicio-sesion', '/registro', '/elegir-rol'].includes(location.pathname);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/inicio-sesion');
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo">MEDICENT</Link>

        <ul className="nav-links">
          {showFullMenu && (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/tratamiento">Tratamiento</Link></li>
              <li><Link to="/tomar-biomarcadores">Biomarcadores</Link></li>
            </>
          )}

          {estaLogueado ? (
            <li>
              <button onClick={handleCerrarSesion} className="btn-cerrar-sesion">
                Cerrar sesión
              </button>
            </li>
          ) : (
            <>
              <li><Link to="/registro">Registrarse</Link></li>
              <li><Link to="/inicio-sesion">Iniciar sesión</Link></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;