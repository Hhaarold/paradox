import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useParadox } from '../context/ParadoxContext.jsx';

function Register() {
  // Consumimos el estado y funciones globales desde nuestro contexto de paradojas
  const { currentUser, register, schools } = useParadox();
  const navigate = useNavigate();

  // Estado local para controlar la información del formulario
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    philosophicalSchool: 'Stoic',
  });

  // Estado para capturar y mostrar mensajes de error del backend/contexto
  const [error, setError] = useState('');

  // Si el usuario ya inició sesión, lo redirigimos automáticamente a /home
  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  // Manejador genérico para actualizar los campos del formulario dinámicamente
  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  // Procesa el registro del nuevo usuario al enviar el formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await register(form);
    
    // Si hay un error al registrar (ej. usuario o correo duplicado), lo mostramos en pantalla
    if (result.error) {
      setError(result.error);
      return;
    }

    // Registro exitoso, redirigimos al home
    navigate('/home');
  };

  return (
    <main className="login-page">
      <section className="panel auth-panel">
        {/* Encabezado del formulario de registro */}
        <p className="eyebrow">Comunidad</p>
        <h1>Crear una cuenta</h1>

        <form className="form" onSubmit={handleSubmit}>
          {/* Campo: Nombre de usuario */}
          <div className="field">
            <label htmlFor="userName">Nombre de usuario</label>
            <input
              id="userName"
              value={form.userName}
              onChange={handleChange('userName')}
              required
            />
          </div>

          {/* Campo: Correo electrónico */}
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={handleChange('password')}
              required
            />
          </div>

          {/* Selector: Escuela filosófica */}
          <div className="field">
            <label htmlFor="school">Escuela filosófica</label>
            <select
              id="school"
              value={form.philosophicalSchool}
              onChange={handleChange('philosophicalSchool')}
            >
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Renderizado condicional del mensaje de error */}
          {error && <p className="error">{error}</p>}

          <button className="button" type="submit">
            Registrarme
          </button>
        </form>

        {/* Enlace para usuarios que ya poseen cuenta */}
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;