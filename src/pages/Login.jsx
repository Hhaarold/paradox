import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useParadox } from '../context/ParadoxContext.jsx';

function Login() {
  // Sacamos el usuario logueado y la función de login del contexto
  const { currentUser, login } = useParadox();
  const navigate = useNavigate();

  // Estados para controlar los inputs del form y los mensajes de error
  const [email, setEmail] = useState('camiv@paradox.local');
  const [password, setPassword] = useState('paradox123');
  const [error, setError] = useState('');

  // Si ya inició sesión, lo mandamos directo al home sin dejarlo ver el login
  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  // Manejamos el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault();

    // Intentamos validar las credenciales
    const result = login(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }

    // Si todo sale bien, entra al app
    navigate('/home');
  };

  return (
    <main className="login-page">
      <section className="panel auth-panel">
        <p className="eyebrow">ParadoX</p>
        <h1>Iniciar sesión</h1>
        <p className="muted">Accede para debatir, votar y crear paradojas.</p>

        {/* Formulario de autenticación */}
        <form className="form" onSubmit={handleSubmit}>
          {/* Input para el email */}
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {/* Input para la contraseña */}
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {/* Muestra mensaje si hubo fallo en las credenciales */}
          {error && <p className="error">{error}</p>}

          <button className="button" type="submit">
            Entrar
          </button>
        </form>

        {/* Texto con credenciales de prueba */}
        <p className="muted">
          Datos de prueba: sofia@paradox.local / paradox123
        </p>

        {/* Enlace para ir a la vista de registro */}
        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;