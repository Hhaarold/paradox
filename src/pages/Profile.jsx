import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useParadox } from '../context/ParadoxContext.jsx';

function Profile() {
  const { currentUser, data, updateProfile, getParadoxMetrics } = useParadox();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  if (!currentUser) return <Navigate to="/login" replace />;
  const authored = data.paradoxes.filter((paradox) => paradox.createdBy === currentUser.id);
  const attempts = data.paradoxes.reduce((total, paradox) => total + paradox.layers.reduce((count, layer) => count + layer.responses.filter((response) => response.authorId === currentUser.id).length, 0), 0);
  const startEdit = () => { setForm({ userName: currentUser.userName, email: currentUser.email, philosophicalSchool: currentUser.philosophicalSchool }); setEditing(true); };
  const save = async (event) => { event.preventDefault(); const result = await updateProfile(form); if (result?.error) window.alert(result.error); else setEditing(false); };
  return <main className="page"><div className="page-heading"><div><p className="eyebrow">Perfil de filósofo</p><h1>{currentUser.userName}</h1><p className="muted">{currentUser.philosophicalSchool} · {currentUser.email}</p></div><button className="secondary-button" onClick={startEdit}>Editar perfil</button></div><div className="grid stats"><div className="stat">Puntuación<strong>{currentUser.paradoxScore}</strong></div><div className="stat">Índice de caos<strong>{currentUser.chaosIndex}</strong></div><div className="stat">Paradojas creadas<strong>{authored.length}</strong></div><div className="stat">Aportaciones<strong>{attempts}</strong></div></div>{editing && <section className="panel" style={{ marginTop: 20 }}><form className="form" onSubmit={save}><div className="form-row"><div className="field"><label>Nombre</label><input value={form.userName} onChange={(event) => setForm({ ...form, userName: event.target.value })} required /></div><div className="field"><label>Correo</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div></div><div className="field"><label>Escuela</label><select value={form.philosophicalSchool} onChange={(event) => setForm({ ...form, philosophicalSchool: event.target.value })}>{['Skeptic', 'Stoic', 'Nihilist', 'Existentialist', 'Cynic'].map((school) => <option key={school}>{school}</option>)}</select></div><div className="actions"><button className="button">Guardar</button><button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancelar</button></div></form></section>}<section className="stack" style={{ marginTop: 20 }}><h2>Mis paradojas</h2>{authored.length ? authored.map((paradox) => <article className="panel" key={paradox.id}><strong>{paradox.title}</strong><p className="muted">{paradox.status} · Caos {getParadoxMetrics(paradox).chaos}</p></article>) : <div className="panel"><p className="muted">Todavía no has creado paradojas.</p></div>}</section></main>;
}
export default Profile;
