import { createContext, useContext, useState } from 'react';

// Creación del contexto y constantes para LocalStorage
const ParadoxContext = createContext(null);
const STORAGE_KEY = 'paradox-data-v1';
const SESSION_KEY = 'user';

// Escuelas filosóficas disponibles en la plataforma
export const schools = [
  'Skeptic',
  'Stoic',
  'Nihilist',
  'Existentialist',
  'Cynic',
];

// datos de prueba
function makeSeedData() {
  const users = [
    ['Sofia', 'Skeptic', 178, 44],
    ['Martin', 'Skeptic', 154, 38],
    ['Lucia', 'Skeptic', 126, 35],
    ['Dario', 'Skeptic', 111, 29],
    ['Clara', 'Stoic', 190, 52],
    ['Hector', 'Stoic', 162, 41],
    ['Iris', 'Stoic', 138, 34],
    ['Bruno', 'Stoic', 118, 31],
    ['Vera', 'Existentialist', 205, 61],
    ['Nora', 'Existentialist', 171, 48],
    ['Leo', 'Existentialist', 147, 40],
    ['Elena', 'Existentialist', 132, 37],
  ].map(([userName, philosophicalSchool, paradoxScore, chaosIndex], index) => ({
    id: `u${index + 1}`,
    userName,
    philosophicalSchool,
    paradoxScore,
    chaosIndex,
    email: `${userName.toLowerCase()}@paradox.local`,
    password: 'paradox123',
  }));

  const definitions = [
    [
      'El barco de Teseo',
      'Si cada pieza de un barco es reemplazada, ¿sigue siendo el mismo barco?',
      'Identity',
      'Active',
    ],
    [
      'El mentiroso',
      'Esta afirmación es falsa. ¿Puede tener un valor de verdad coherente?',
      'Knowledge',
      'Active',
    ],
    [
      'El abuelo',
      'Si viajas al pasado e impides el encuentro de tus abuelos, ¿quién realizó el viaje?',
      'Time',
      'Active',
    ],
    [
      'La habitación china',
      '¿Manipular símbolos con reglas equivale a comprender un idioma?',
      'Reality',
      'Active',
    ],
    [
      'El demonio de Laplace',
      'Si todo está determinado, ¿queda espacio para elegir?',
      'Ethics',
      'Resolved',
    ],
    [
      'Aquiles y la tortuga',
      '¿Cómo alcanza Aquiles a la tortuga si antes debe recorrer infinitos puntos?',
      'Space',
      'Resolved',
    ],
    [
      'El asno de Buridán',
      '¿Puede una decisión perfectamente equilibrada producir inmovilidad?',
      'Ethics',
      'Draft',
    ],
    [
      'El cerebro en una cubeta',
      '¿Qué evidencia distinguiría la realidad de una simulación perfecta?',
      'Reality',
      'Draft',
    ],
    [
      'La identidad digital',
      '¿Una copia exacta de una mente conserva la identidad de la persona?',
      'Identity',
      'Draft',
    ],
    [
      'La flecha inmóvil',
      '¿Cómo puede haber movimiento si en cada instante la flecha ocupa un lugar?',
      'Time',
      'Frozen',
    ],
  ];

  const paradoxes = definitions.map(
    ([title, statement, category, status], index) => ({
      id: `p${index + 1}`,
      title,
      statement,
      category,
      status,
      createdBy: users[index % users.length].id,
      createdAt: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
      layers: [
        {
          id: `p${index + 1}-l1`,
          question: `¿Cuál es el problema central de ${title}?`,
          responses: [],
        },
        {
          id: `p${index + 1}-l2`,
          question: '¿Qué supuesto debemos cuestionar para avanzar?',
          responses: [],
        },
        {
          id: `p${index + 1}-l3`,
          question: '¿Qué consecuencia tendría una posible solución?',
          responses: [],
        },
      ],
    })
  );

  const responses = [
    'La contradicción aparece porque tratamos el lenguaje como si siempre describiera hechos.',
    'Podemos separar la continuidad física de la continuidad narrativa.',
    'La pregunta obliga a distinguir conocer de estar seguro.',
  ];

  let responseIndex = 0;
  paradoxes.forEach((paradox, paradoxIndex) => {
    paradox.layers.forEach((layer) => {
      const count = paradoxIndex < 10 && responseIndex < 30 ? 1 : 0;
      for (let i = 0; i < count; i += 1) {
        const id = `r${responseIndex + 1}`;
        layer.responses.push({
          id,
          authorId: users[(responseIndex + 2) % users.length].id,
          text: responses[responseIndex % responses.length],
          type: responseIndex % 3 === 0 ? 'complicate' : 'resolve',
          createdAt: new Date(
            Date.now() - responseIndex * 3600000
          ).toISOString(),
          votes:
            responseIndex < 15
              ? {
                  [users[responseIndex % users.length].id]:
                    responseIndex % 4 === 0 ? 'disagree' : 'agree',
                }
              : {},
        });
        responseIndex += 1;
      }
    });
  });

  return {
    users,
    paradoxes,
    duels: [
      {
        id: 'd1',
        paradoxId: 'p1',
        challengerId: 'u1',
        opponentId: 'u5',
        status: 'active',
      },
      {
        id: 'd2',
        paradoxId: 'p2',
        challengerId: 'u9',
        opponentId: 'u2',
        status: 'active',
      },
      {
        id: 'd3',
        paradoxId: 'p6',
        challengerId: 'u6',
        opponentId: 'u10',
        status: 'completed',
      },
    ],
  };
}

// Carga la información guardada en LocalStorage o recurre a los datos semilla
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : makeSeedData();
  } catch {
    return makeSeedData();
  }
}

// Calcula la puntuación ponderada de una capa en función de las votaciones
function getLayerScore(layer, users) {
  const proposals = layer.responses.filter(
    (response) => response.type === 'resolve'
  );
  if (!proposals.length) return 0;

  let total = 0;
  let weight = 0;

  proposals.forEach((response) => {
    Object.entries(response.votes).forEach(([userId, vote]) => {
      const voter = users.find((user) => user.id === userId);
      const voterWeight = voter?.paradoxScore >= 150 ? 1.5 : 1;
      total +=
        (vote === 'agree' ? 1 : vote === 'disagree' ? -1 : 0) * voterWeight;
      weight += voterWeight;
    });
  });

  return weight
    ? Math.max(0, Math.min(100, Math.round(50 + (total / weight) * 50)))
    : 0;
}

// Obtiene métricas calculadas sobre el estado de resolución y caos de la paradoja
function getParadoxMetrics(paradox, users) {
  const scores = paradox.layers.map((layer) => getLayerScore(layer, users));
  const attempts = paradox.layers.reduce(
    (total, layer) => total + layer.responses.length,
    0
  );
  const resolutionScore = scores.length
    ? Math.round(
        scores.reduce((total, score) => total + score, 0) / scores.length
      )
    : 0;

  return {
    layerScores: scores,
    attempts,
    resolutionScore,
    chaos: Math.max(
      0,
      Math.round(attempts * 2 + paradox.layers.length * 5 - resolutionScore * 0.5)
    ),
    isResolved: scores.length > 0 && scores.every((score) => score > 70),
  };
}

// Proveedor principal del contexto global
export function ParadoxProvider({ children }) {
  const [data, setData] = useState(loadData);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem(SESSION_KEY));
      return data.users.find((user) => user.id === storedUser?.id) ?? null;
    } catch {
      return null;
    }
  });

  // Guarda la información en el estado local y sincroniza con localStorage
  const commit = (nextData) => {
    setData(nextData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  };

  // Autenticación de usuario existente
  const login = (email, password) => {
    const user = data.users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!user) {
      return { error: 'Correo o contraseña incorrectos.' };
    }

    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  };

  // Registro de nuevo usuario en el sistema
  const register = (payload) => {
    if (
      data.users.some(
        (user) => user.email.toLowerCase() === payload.email.toLowerCase()
      )
    ) {
      return { error: 'Ya existe una cuenta con ese correo.' };
    }

    const user = {
      id: `u-${Date.now()}`,
      paradoxScore: 0,
      chaosIndex: 0,
      ...payload,
    };

    const nextData = { ...data, users: [...data.users, user] };
    commit(nextData);
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    return { user };
  };

  // Cierre de sesión de la cuenta activa
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  // Actualización de los datos del perfil actual
  const updateProfile = (payload) => {
    if (!currentUser) return;

    const user = { ...currentUser, ...payload };
    const nextData = {
      ...data,
      users: data.users.map((item) => (item.id === user.id ? user : item)),
    };

    commit(nextData);
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  // Crea una nueva paradoja y asigna puntos al creador
  const createParadox = ({ title, statement, category, layers }) => {
    if (!currentUser) return null;

    const paradox = {
      id: `p-${Date.now()}`,
      title,
      statement,
      category,
      status: 'Active',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      layers: layers.map((question, index) => ({
        id: `l-${Date.now()}-${index}`,
        question,
        responses: [],
      })),
    };

    const user = {
      ...currentUser,
      paradoxScore: currentUser.paradoxScore + 20,
    };

    commit({
      ...data,
      paradoxes: [paradox, ...data.paradoxes],
      users: data.users.map((item) => (item.id === user.id ? user : item)),
    });

    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    return paradox;
  };

  // Agrega una respuesta o propuesta a una capa de una paradoja
  const addResponse = (paradoxId, layerId, text, type) => {
    if (!currentUser || !text.trim()) return;

    const nextData = {
      ...data,
      paradoxes: data.paradoxes.map((paradox) =>
        paradox.id !== paradoxId
          ? paradox
          : {
              ...paradox,
              layers: paradox.layers.map((layer) =>
                layer.id !== layerId
                  ? layer
                  : {
                      ...layer,
                      responses: [
                        ...layer.responses,
                        {
                          id: `r-${Date.now()}`,
                          authorId: currentUser.id,
                          text: text.trim(),
                          type,
                          createdAt: new Date().toISOString(),
                          votes: {},
                        },
                      ],
                    }
              ),
            }
      ),
    };

    commit(nextData);
  };

  // Registra votos en las respuestas y actualiza puntos/estado si la paradoja se resuelve
  const vote = (paradoxId, layerId, responseId, value) => {
    if (!currentUser) return;

    let resolvedNow = false;

    const nextData = {
      ...data,
      paradoxes: data.paradoxes.map((paradox) => {
        if (paradox.id !== paradoxId) return paradox;

        const updated = {
          ...paradox,
          layers: paradox.layers.map((layer) =>
            layer.id !== layerId
              ? layer
              : {
                  ...layer,
                  responses: layer.responses.map((response) =>
                    response.id !== responseId
                      ? response
                      : {
                          ...response,
                          votes: {
                            ...response.votes,
                            [currentUser.id]: value,
                          },
                        }
                  ),
                }
          ),
        };

        const metrics = getParadoxMetrics(updated, data.users);
        resolvedNow = updated.status !== 'Resolved' && metrics.isResolved;

        return {
          ...updated,
          status: metrics.isResolved ? 'Resolved' : updated.status,
        };
      }),
    };

    let users = nextData.users;
    if (resolvedNow) {
      const owner = data.paradoxes.find((p) => p.id === paradoxId)?.createdBy;
      users = users.map((user) => {
        if (user.id === currentUser.id) {
          return { ...user, paradoxScore: user.paradoxScore + 10 };
        }
        if (user.id === owner) {
          return { ...user, paradoxScore: user.paradoxScore + 50 };
        }
        return user;
      });
    }

    commit({ ...nextData, users });

    const refreshedUser = users.find((user) => user.id === currentUser.id);
    setCurrentUser(refreshedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedUser));
  };

  // Inicia un nuevo duelo entre el usuario actual y un oponente
  const createDuel = (paradoxId, opponentId) => {
    if (!currentUser || !opponentId) return;

    commit({
      ...data,
      duels: [
        {
          id: `d-${Date.now()}`,
          paradoxId,
          challengerId: currentUser.id,
          opponentId,
          status: 'active',
        },
        ...data.duels,
      ],
    });
  };

  const value = {
    data,
    currentUser,
    schools,
    login,
    register,
    logout,
    updateProfile,
    createParadox,
    addResponse,
    vote,
    createDuel,
    getLayerScore: (layer) => getLayerScore(layer, data.users),
    getParadoxMetrics: (paradox) => getParadoxMetrics(paradox, data.users),
  };

  return (
    <ParadoxContext.Provider value={value}>
      {children}
    </ParadoxContext.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente
export function useParadox() {
  const context = useContext(ParadoxContext);
  if (!context) {
    throw new Error('useParadox debe usarse dentro de ParadoxProvider');
  }
  return context;
}