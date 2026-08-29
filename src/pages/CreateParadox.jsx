import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useParadox } from '../context/ParadoxContext.jsx';

// Lista de las categorías para la paradoja
const CATEGORIES = [
  'Time',
  'Space',
  'Identity',
  'Knowledge',
  'Ethics',
  'Reality',
];

function CreateParadox() {
  // Traemos el usuario y la función para crear la paradoja del contexto
  const { currentUser, createParadox } = useParadox();
  const navigate = useNavigate();

  // Estado para guardar lo que escribe el usuario en el form
  const [form, setForm] = useState({
    title: '',
    statement: '',
    category: 'Time',
    layers: ['', ''], // arranca con 2 capas vacías obligatorias
  });
  const [error, setError] = useState('');

  // Si no está logueado, lo mandamos directo al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Función rápida para actualizar título, enunciado o categoría
  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Para cambiar el texto de una capa en específico por su índice
  const updateLayer = (index, value) => {
    setForm((current) => ({
      ...current,
      layers: current.layers.map((layer, i) => (i === index ? value : layer)),
    }));
  };

  // Agrega una nueva capa vacía a la lista
  const addLayer = () => {
    setForm((current) => ({
      ...current,
      layers: [...current.layers, ''],
    }));
  };

  // Quita la capa de la lista
  const removeLayer = (index) => {
    setForm((current) => ({
      ...current,
      layers: current.layers.filter((_, i) => i !== index),
    }));
  };

  // Cuando le dan a enviar el formulario
  const handleSubmit = (event) => {
    event.preventDefault();

    // Limpiamos espacios en blanco de las capas
    const layers = form.layers.map((layer) => layer.trim()).filter(Boolean);

    // Validamos que no falte nada importante
    if (
      !form.title.trim() ||
      !form.statement.trim() ||
      form.statement.length > 300 ||
      layers.length < 2
    ) {
      setError(
        'Completa título, enunciado (máximo 300 caracteres) y al menos dos capas.'
      );
      return;
    }

    // Creamos la paradoja con los datos listos
    const paradox = createParadox({
      ...form,
      title: form.title.trim(),
      statement: form.statement.trim(),
      layers,
    });

    // Si salió bien, lo mandamos a ver su paradoja
    if (paradox?.id) {
      navigate(`/paradox/${paradox.id}`);
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Nueva paradoja</p>
          <h1>Abre un nuevo problema</h1>
        </div>
      </div>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          {/* Campo para el título */}
          <div className="field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              required
            />
          </div>

          {/* Campo para el enunciado con contador */}
          <div className="field">
            <label htmlFor="statement">
              Enunciado ({form.statement.length}/300)
            </label>
            <textarea
              id="statement"
              maxLength={300}
              value={form.statement}
              onChange={(event) => setField('statement', event.target.value)}
              required
            />
          </div>

          {/* Select para elegir categoría */}
          <div className="field">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Sección para ir agregando/quitando capas */}
          <div className="stack">
            <div>
              <p className="eyebrow">Capas de debate</p>
              <p className="muted">
                Cada capa profundiza la pregunta original.
              </p>
            </div>

            {/* Mapeamos el arreglo de capas para mostrar los inputs */}
            {form.layers.map((layer, index) => (
              <div className="field" key={`layer-field-${index}`}>
                <label htmlFor={`layer-${index}`}>Capa {index + 1}</label>
                <input
                  id={`layer-${index}`}
                  value={layer}
                  onChange={(event) => updateLayer(index, event.target.value)}
                  required={index < 2}
                />
                <button
                  className="text-button"
                  type="button"
                  onClick={() => removeLayer(index)}
                  disabled={form.layers.length <= 2} // no deja borrar si hay 2 o menos
                >
                  Quitar capa
                </button>
              </div>
            ))}

            <button
              className="secondary-button"
              type="button"
              onClick={addLayer}
            >
              Agregar capa
            </button>
          </div>

          {/* Si hay error lo mostramos acá */}
          {error && <p className="error">{error}</p>}

          {/* Botones para guardar o cancelar */}
          <div className="actions">
            <button className="button" type="submit">
              Publicar paradoja
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate('/home')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateParadox;