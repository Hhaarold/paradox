import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useParadox } from '../context/ParadoxContext.jsx';

function Duels() {
  // Sacamos los datos globales, el usuario logueado y la función para armar el duelo
  const { data, currentUser, createDuel } = useParadox();
  
  // Guardamos qué paradoja y a qué oponente eligió para el reto
  const [paradoxId, setParadoxId] = useState(data.paradoxes[0]?.id ?? '');
  const [opponentId, setOpponentId] = useState('');

  // Si no ha iniciado sesión, lo rebotamos al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Cuando le da a enviar el reto
  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await createDuel(paradoxId, opponentId);
    if (!result?.error) setOpponentId('');
  };

  // Filtramos los duelos donde participe el usuario (como retador o retado)
  const userDuels = data.duels.filter(
    (duel) =>
      duel.challengerId === currentUser.id || duel.opponentId === currentUser.id
  );

  return (
    <main className="page">
      {/* Título de la sección */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Desafíos</p>
          <h1>Duelos de paradojas</h1>
          <p className="muted">
            Dos filósofos intentan resolver la misma paradoja.
          </p>
        </div>
      </div>

      {/* Formulario para retar a otro usuario */}
      <section className="panel">
        <h2>Crear duelo</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Select para elegir la paradoja */}
            <div className="field">
              <label htmlFor="paradox-select">Paradoja</label>
              <select
                id="paradox-select"
                value={paradoxId}
                onChange={(event) => setParadoxId(event.target.value)}
              >
                {/* Ocultamos las paradojas con estado 'Frozen' */}
                {data.paradoxes
                  .filter((item) => item.status !== 'Frozen')
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Select para elegir el rival */}
            <div className="field">
              <label htmlFor="opponent-select">Oponente</label>
              <select
                id="opponent-select"
                value={opponentId}
                onChange={(event) => setOpponentId(event.target.value)}
                required
              >
                <option value="">Selecciona un filósofo</option>
                {/* No podemos retarnos a nosotros mismos */}
                {data.users
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.userName} · {user.philosophicalSchool}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button className="button" type="submit">
            Lanzar desafío
          </button>
        </form>
      </section>

      {/* Lista con los duelos activos o terminados del usuario */}
      <section className="stack" style={{ marginTop: 20 }}>
        <h2>Mis duelos</h2>
        {userDuels.length ? (
          userDuels.map((duel) => {
            // Buscamos los datos de la paradoja y los contrincantes
            const paradox = data.paradoxes.find(
              (item) => item.id === duel.paradoxId
            );
            const challenger = data.users.find(
              (user) => user.id === duel.challengerId
            );
            const opponent = data.users.find(
              (user) => user.id === duel.opponentId
            );

            return (
              <article className="duel" key={duel.id}>
                <div>
                  <span className="badge">{duel.status}</span>
                  <h3>{paradox?.title}</h3>
                  <p className="muted">
                    {challenger?.userName} vs. {opponent?.userName}
                  </p>
                </div>
                <Link
                  className="secondary-button"
                  to={`/paradox/${duel.paradoxId}`}
                >
                  Ir al debate
                </Link>
              </article>
            );
          })
        ) : (
          // Mensaje cuando no hay retos guardados
          <div className="panel">
            <p className="muted">Aún no participas en duelos.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Duels;