import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useParadox } from '../context/ParadoxContext.jsx';

// Lista de enlaces estáticos para la barra de navegación principal
const NAV_LINKS = [
  { to: '/home', label: 'Explorar' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/duels', label: 'Duelos' },
];

function Header() {
  // Consumimos el usuario actual y la función de desautenticación del contexto
  const { currentUser, logout } = useParadox();
  const navigate = useNavigate();

  // Cierra la sesión activa y redirige al usuario a la vista principal
  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <header className="site-header">
      {/* Logotipo principal con redirección al inicio */}
      <Link to="/home" className="brand">
        Parado<span>X</span>
      </Link>

      <nav className="main-nav" aria-label="Navegación principal">
        {/* Renderizado dinámico de las opciones de navegación principal */}
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {label}
          </NavLink>
        ))}

        {/* Botón condicional para crear paradojas, visible solo si hay sesión activa */}
        {currentUser && (
          <NavLink
            to="/paradox/create"
            className={({ isActive }) =>
              `create-link ${isActive ? 'active' : ''}`.trim()
            }
          >
            Crear
          </NavLink>
        )}

        {/* Enlace al perfil de usuario */}
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Perfil
        </NavLink>

        {/* Muestra botón de salida si está autenticado o enlace de login si no */}
        {currentUser ? (
          <button type="button" className="text-button" onClick={handleLogout}>
            Salir
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Ingresar
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Header;