import { Link } from 'react-router-dom';

function ParadoxCard({ paradox, author, metrics }) {
  return <article className="paradox-card"><div className="badge-row"><span className="badge">{paradox.category}</span><span className={`badge ${paradox.status.toLowerCase()}`}>{paradox.status}</span></div><h2>{paradox.title}</h2><p className="muted">{paradox.statement}</p><div className="card-meta"><span className="muted">{paradox.layers.length} capas · {metrics.attempts} intentos</span><strong className="score">Caos {metrics.chaos}</strong></div><p className="muted">Por {author?.userName ?? 'Anónimo'}</p><Link className="secondary-button" to={`/paradox/${paradox.id}`}>Abrir debate</Link></article>;
}

export default ParadoxCard;
