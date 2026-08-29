
function ResponseCard({ response, author, selectedVote, canVote, onVote }) {
  return <div className="response"><p>{response.text}</p><small>{response.type === 'resolve' ? 'Propuesta de resolución' : 'Nueva complicación'} · {author?.userName}</small>{response.type === 'resolve' && canVote && <div className="vote-row">{[['agree', 'De acuerdo'], ['disagree', 'En desacuerdo'], ['abstain', 'Abstenerse']].map(([value, label]) => <button className={`vote-button ${selectedVote === value ? 'selected' : ''}`} key={value} onClick={() => onVote(value)}>{label}</button>)}</div>}</div>;
}
export default ResponseCard;
