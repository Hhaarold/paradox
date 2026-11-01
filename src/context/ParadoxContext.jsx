import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.jsx';

const ParadoxContext = createContext(null);
const TOKEN_KEY = 'paradox-token';
export const schools = ['Skeptic', 'Stoic', 'Nihilist', 'Existentialist', 'Cynic'];

const idOf = (value) => value && typeof value === 'object' ? String(value._id ?? value.id ?? '') : String(value ?? '');

function mapUser(user) {
  if (!user) return null;
  return {
    id: idOf(user._id ?? user.id),
    userName: user.username ?? user.userName ?? 'Usuario',
    philosophicalSchool: user.school ?? user.philosophicalSchool ?? 'Skeptic',
    email: user.email ?? '',
    paradoxScore: Number(user.paradoxScore ?? 0),
    chaosIndex: Number(user.chaosIndex ?? 0),
    role: user.role ?? 'user',
    isBanned: Boolean(user.isBanned),
    createdAt: user.createdAt,
  };
}

function mapParadox(item) {
  const creator = mapUser(item.createdBy);
  return {
    id: idOf(item._id ?? item.id),
    title: item.title,
    statement: item.statement,
    category: item.category,
    status: item.status,
    createdBy: idOf(item.createdBy),
    author: creator,
    createdAt: item.createdAt,
    layers: (item.layers ?? []).map((layer) => ({
      id: idOf(layer._id ?? layer.id),
      question: layer.question,
      responses: (layer.responses ?? []).map((response) => ({
        id: idOf(response._id ?? response.id),
        authorId: idOf(response.authorId),
        author: mapUser(response.authorId),
        text: response.text,
        type: response.type ?? 'resolve',
        createdAt: response.createdAt,
        votes: response.votes instanceof Map ? Object.fromEntries(response.votes) : (response.votes ?? {}),
      })),
    })),
  };
}

function mapDuel(item) {
  return {
    id: idOf(item._id ?? item.id),
    paradoxId: idOf(item.paradoxId),
    challengerId: idOf(item.challengerId),
    opponentId: idOf(item.opponentId),
    status: item.status,
    winnerId: idOf(item.winnerId),
  };
}

function getLayerScore(layer, users) {
  const proposals = (layer.responses ?? []).filter((response) => response.type === 'resolve');
  let total = 0;
  let weight = 0;
  proposals.forEach((response) => Object.entries(response.votes ?? {}).forEach(([userId, vote]) => {
    const voter = users.find((user) => user.id === userId);
    const voterWeight = voter?.paradoxScore >= 150 ? 1.5 : 1;
    total += (vote === 'agree' ? 1 : vote === 'disagree' ? -1 : 0) * voterWeight;
    weight += voterWeight;
  }));
  return weight ? Math.max(0, Math.min(100, Math.round(50 + (total / weight) * 50))) : 0;
}

function getParadoxMetrics(paradox, users) {
  const layers = paradox.layers ?? [];
  const scores = layers.map((layer) => getLayerScore(layer, users));
  const attempts = layers.reduce((sum, layer) => sum + (layer.responses?.length ?? 0), 0);
  const resolutionScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  return {
    layerScores: scores,
    attempts,
    resolutionScore,
    chaos: Math.max(0, Math.round(attempts * 2 + layers.length * 5 - resolutionScore * 0.5)),
    isResolved: scores.length > 0 && scores.every((score) => score > 70),
  };
}

export function ParadoxProvider({ children }) {
  const [data, setData] = useState({ users: [], paradoxes: [], duels: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const [paradoxResult, rankingResult] = await Promise.all([api.paradoxes(), api.ranking()]);
    setData((current) => ({
      ...current,
      paradoxes: (paradoxResult.paradoxes ?? []).map(mapParadox),
      users: (rankingResult.ranking ?? []).map(mapUser),
    }));
    if (localStorage.getItem(TOKEN_KEY)) {
      try {
        const result = await api.me();
        const user = mapUser(result.user);
        setCurrentUser(user);
        setData((current) => ({ ...current, users: [...current.users.filter((item) => item.id !== user.id), user] }));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setCurrentUser(null);
      }
    }
  }, []);

  const refreshDuels = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const result = await api.duels();
      setData((current) => ({ ...current, duels: (result.duels ?? []).map(mapDuel) }));
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refresh();
        if (active && localStorage.getItem(TOKEN_KEY)) await refreshDuels();
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refresh, refreshDuels]);

  const login = async (email, password) => {
    try {
      const result = await api.login({ email, password });
      localStorage.setItem(TOKEN_KEY, result.token);
      setCurrentUser(mapUser(result.user));
      await refresh();
      await refreshDuels();
      setError('');
      return { user: mapUser(result.user) };
    } catch (requestError) {
      return { error: requestError.message };
    }
  };

  const register = async (payload) => {
    try {
      const result = await api.register({
        username: payload.userName.trim(),
        email: payload.email.trim(),
        password: payload.password,
        school: payload.philosophicalSchool,
      });
      localStorage.setItem(TOKEN_KEY, result.token);
      setCurrentUser(mapUser(result.user));
      await refresh();
      setError('');
      return { user: mapUser(result.user) };
    } catch (requestError) {
      return { error: requestError.message };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setData((current) => ({ ...current, duels: [] }));
  };

  const createParadox = async ({ title, statement, category, layers }) => {
    try {
      const result = await api.createParadox({ title, statement, category, layers: layers.map((question) => ({ question })) });
      await refresh();
      return mapParadox(result.paradox);
    } catch (requestError) {
      setError(requestError.message);
      return null;
    }
  };

  const addResponse = async (paradoxId, layerId, text, type) => {
    const paradox = data.paradoxes.find((item) => item.id === paradoxId);
    const layerIndex = paradox?.layers.findIndex((item) => item.id === layerId) ?? -1;
    if (layerIndex < 0) return { error: 'No se encontró la capa seleccionada.' };
    try {
      await api.addResponse(paradoxId, layerIndex, { text: text.trim(), type });
      await refresh();
      return { ok: true };
    } catch (requestError) {
      setError(requestError.message);
      return { error: requestError.message };
    }
  };

  const vote = async (paradoxId, layerId, responseId, value) => {
    try {
      await api.vote(paradoxId, responseId, value);
      await refresh();
      return { ok: true };
    } catch (requestError) {
      setError(requestError.message);
      return { error: requestError.message };
    }
  };

  const createDuel = async (paradoxId, opponentId) => {
    try {
      await api.createDuel({ paradoxId, opponentId });
      await refreshDuels();
      return { ok: true };
    } catch (requestError) {
      setError(requestError.message);
      return { error: requestError.message };
    }
  };

  const updateProfile = async (payload) => {
    try {
      const result = await api.updateProfile({
        username: payload.userName,
        email: payload.email,
        school: payload.philosophicalSchool,
      });
      const user = mapUser(result.user);
      setCurrentUser(user);
      setData((current) => ({ ...current, users: current.users.map((item) => item.id === user.id ? user : item) }));
      return { user };
    } catch (requestError) {
      return { error: requestError.message };
    }
  };
  const getLayerScoreForData = (layer) => getLayerScore(layer, data.users);
  const getMetrics = (paradox) => getParadoxMetrics(paradox, data.users);

  const value = useMemo(() => ({
    data, currentUser, schools, loading, error, refresh, refreshDuels,
    login, register, logout, updateProfile, createParadox, addResponse, vote, createDuel,
    getLayerScore: getLayerScoreForData, getParadoxMetrics: getMetrics,
  }), [data, currentUser, loading, error, refresh, refreshDuels]);
  return <ParadoxContext.Provider value={value}>{children}</ParadoxContext.Provider>;
}

export function useParadox() {
  const context = useContext(ParadoxContext);
  if (!context) throw new Error('useParadox debe usarse dentro de ParadoxProvider');
  return context;
}
