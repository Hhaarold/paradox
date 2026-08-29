import { useMemo } from 'react';
import { useParadox } from '../context/ParadoxContext.jsx';

function Ranking() {
  const { data, getParadoxMetrics } = useParadox();

  // Se memorizan las listas ordenadas para evitar recalcular ordenamientos pesados en cada render
  const rankings = useMemo(() => {
    // 1. Orden por puntuación de paradoja
    const score = [...data.users].sort(
      (a, b) => b.paradoxScore - a.paradoxScore
    );

    // 2. Orden por índice de caos del usuario
    const chaos = [...data.users].sort(
      (a, b) => b.chaosIndex - a.chaosIndex
    );

    // 3. Orden por cantidad de paradojas resueltas
    const resolved = [...data.users]
      .map((user) => ({
        user,
        value: data.paradoxes.filter(
          (paradox) =>
            paradox.createdBy === user.id && paradox.status === 'Resolved'
        ).length,
      }))
      .sort((a, b) => b.value - a.value);

    // 4. Orden por cantidad total de paradojas creadas
    const creator = [...data.users]
      .map((user) => ({
        user,
        value: data.paradoxes.filter(
          (paradox) => paradox.createdBy === user.id
        ).length,
      }))
      .sort((a, b) => b.value - a.value);

    // Estructura para iterar fácilmente los 4 tableros en la interfaz
    return [
      {
        title: 'Gran Filósofo',
        list: score,
        label: (user) => `${user.paradoxScore} puntos`,
      },
      {
        title: 'Agente del Caos',
        list: chaos,
        label: (user) => `Caos ${user.chaosIndex}`,
      },
      {
        title: 'El Resolutor',
        list: resolved,
        label: (item) => `${item.value} resueltas`,
      },
      {
        title: 'El Creador',
        list: creator,
        label: (item) => `${item.value} creadas`,
      },
    ];
  }, [data.users, data.paradoxes]);

  // Se memoriza el Top 5 de paradojas con mayor índice de caos
  const chaoticParadoxes = useMemo(() => {
    return [...data.paradoxes]
      .sort((a, b) => getParadoxMetrics(b).chaos - getParadoxMetrics(a).chaos)
      .slice(0, 5);
  }, [data.paradoxes, getParadoxMetrics]);

  return (
    <main className="page">
      {/* Encabezado principal */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Reconocimientos</p>
          <h1>Ranking de filósofos</h1>
          <p className="muted">
            Los votos de usuarios con 150+ puntos pesan x1.5.
          </p>
        </div>
      </div>

      {/* Grid con las 4 categorías de rankings de usuarios */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {rankings.map(({ title, list, label }) => (
          <section className="panel" key={title}>
            <h2>{title}</h2>
            {list.slice(0, 5).map((item, index) => {
              // Maneja tanto el objeto de usuario directo como la estructura mapeada
              const user = item.user ?? item;
              return (
                <div className="ranking-row" key={user.id}>
                  <strong>{index + 1}</strong>
                  <div>
                    <strong>{user.userName}</strong>
                    <div className="muted">{user.philosophicalSchool}</div>
                  </div>
                  <span className="score">{label(item)}</span>
                </div>
              );
            })}
          </section>
        ))}
      </div>

      {/* Sección inferior con las paradojas más caóticas */}
      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Paradojas más caóticas</h2>
        {chaoticParadoxes.map((paradox) => {
          const metrics = getParadoxMetrics(paradox);
          return (
            <div className="ranking-row" key={paradox.id}>
              <span>•</span>
              <strong>{paradox.title}</strong>
              <span className="score">{metrics.chaos}</span>
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default Ranking;