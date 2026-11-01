import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ParadoxCard from '../components/ParadoxCard.jsx';
import { useParadox } from '../context/ParadoxContext.jsx';

// Categorías para filtrar las paradojas en la pantalla
const categories = [
  'All',
  'Time',
  'Space',
  'Identity',
  'Knowledge',
  'Ethics',
  'Reality',
];

// Estados posibles para filtrar las publicaciones
const statuses = ['All', 'Active', 'Resolved', 'Draft', 'Frozen'];

function Home() {
  // Sacamos la data del context, el usuario actual y las métricas
  const { data, currentUser, getParadoxMetrics, loading, error } = useParadox();
  
  // Guardamos los filtros que seleccione el usuario
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Filtramos las paradojas dependiendo de lo que haya seleccionado en categoría y estado
  const paradoxes = useMemo(() => {
    return data.paradoxes.filter(
      (paradox) =>
        (category === 'All' || paradox.category === category) &&
        (status === 'All' || paradox.status === status)
    );
  }, [data.paradoxes, category, status]);

  // Guardamos un Map con los usuarios por ID para encontrar rápido quién escribió cada paradoja
  const usersById = useMemo(() => {
    return new Map(data.users.map((user) => [user.id, user]));
  }, [data.users]);

  return (
    <main className="page">
      {/* Encabezado principal */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Comunidad de paradojas</p>
          <h1>Explora lo que nadie ha resuelto</h1>
          <p className="muted">
            Debate por capas, propone resoluciones y mide el caos.
          </p>
        </div>

        {/* Solo mostramos el botón de crear si hay alguien logueado */}
        {currentUser && (
          <Link to="/paradox/create" className="button">
            Crear paradoja
          </Link>
        )}
      </div>

      {/* Botones para aplicar los filtros */}
      <div className="filters">
        {/* Filtro por categoría */}
        <div className="filter-group">
          {categories.map((item) => (
            <button
              key={item}
              className={`filter ${category === item ? 'selected' : ''}`}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item === 'All' ? 'Todas' : item}
            </button>
          ))}
        </div>

        {/* Filtro por estado */}
        <div className="filter-group">
          {statuses.map((item) => (
            <button
              key={item}
              className={`filter ${status === item ? 'selected' : ''}`}
              type="button"
              onClick={() => setStatus(item)}
            >
              {item === 'All' ? 'Todos los estados' : item}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="panel"><p className="muted">Cargando paradojas…</p></div>}
      {error && <div className="panel"><p className="error">{error}</p></div>}

      {/* Grid con la lista de tarjetas de paradojas */}
      <div className="grid paradox-grid">
        {paradoxes.map((paradox) => (
          <ParadoxCard
            key={paradox.id}
            paradox={paradox}
            author={usersById.get(paradox.createdBy) ?? paradox.author}
            metrics={getParadoxMetrics(paradox)}
          />
        ))}
      </div>

      {/* Si el filtro no da resultados mostramos este mensaje */}
      {!paradoxes.length && (
        <div className="panel">
          <p className="muted">No hay paradojas con esos filtros.</p>
        </div>
      )}
    </main>
  );
}

export default Home;