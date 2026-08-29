import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import LayerCard from '../components/LayerCard.jsx';
import { useParadox } from '../context/ParadoxContext.jsx';

function ParadoxDetail() {
  // Sacamos el ID de la paradoja que viene en la URL
  const { id } = useParams();

  // Jalamos los datos y funciones del contexto
  const {
    data,
    currentUser,
    addResponse,
    vote,
    getLayerScore,
    getParadoxMetrics,
  } = useParadox();

  // Estados para manejar las respuestas que escribe el usuario en cada capa
  const [drafts, setDrafts] = useState({});
  const [modes, setModes] = useState({});

  // Buscamos la paradoja actual por ID
  const paradox = useMemo(
    () => data.paradoxes.find((item) => item.id === id),
    [data.paradoxes, id]
  );

  // Buscamos al usuario que creó esta paradoja
  const author = useMemo(
    () => data.users.find((user) => user.id === paradox?.createdBy),
    [data.users, paradox?.createdBy]
  );

  // Si la paradoja no existe, devolvemos al usuario al home
  if (!paradox) {
    return <Navigate to="/home" replace />;
  }

  // Métricas de caos e intentos
  const metrics = getParadoxMetrics(paradox);

  // Actualiza el texto borrador de la capa correspondiente
  const handleDraftChange = (layerId, value) => {
    setDrafts((current) => ({ ...current, [layerId]: value }));
  };

  // Cambia el modo de respuesta (por ejemplo: resolver / profundizar)
  const handleModeChange = (layerId, value) => {
    setModes((current) => ({ ...current, [layerId]: value }));
  };

  // Envía la respuesta a la capa indicada
  const handleSubmitResponse = (layerId) => {
    const content = drafts[layerId] ?? '';
    const mode = modes[layerId] ?? 'resolve';

    if (!content.trim()) return;

    addResponse(paradox.id, layerId, content, mode);

    // Limpiamos la casilla de texto de esa capa
    setDrafts((current) => ({ ...current, [layerId]: '' }));
  };

  // Función para registrar los votos en las respuestas
  const handleVote = (layerId, responseId, value) => {
    vote(paradox.id, layerId, responseId, value);
  };

  return (
    <main className="page">
      {/* Botón para volver al listado general */}
      <Link className="secondary-button" to="/home">
        Volver a explorar
      </Link>

      <article className="stack" style={{ marginTop: 18 }}>
        {/* Información principal de la paradoja */}
        <section className="panel">
          <div className="badge-row">
            <span className="badge">{paradox.category}</span>
            <span className="badge">{paradox.status}</span>
          </div>

          <h1>{paradox.title}</h1>
          <p>{paradox.statement}</p>

          <p className="muted">
            Creada por {author?.userName} · {metrics.attempts} intentos · Índic‌e
            de caos {metrics.chaos}
          </p>
        </section>

        {/* Mapeamos y mostramos cada capa con sus respuestas y controles */}
        {paradox.layers.map((layer, index) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            index={index}
            score={getLayerScore(layer)}
            users={data.users}
            currentUser={currentUser}
            draft={drafts[layer.id] ?? ''}
            mode={modes[layer.id] ?? 'resolve'}
            onDraftChange={(value) => handleDraftChange(layer.id, value)}
            onModeChange={(value) => handleModeChange(layer.id, value)}
            onRespond={() => handleSubmitResponse(layer.id)}
            onVote={(responseId, value) => handleVote(layer.id, responseId, value)}
          />
        ))}
      </article>
    </main>
  );
}

export default ParadoxDetail;