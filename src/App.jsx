import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

// Importación de componentes de la aplicación
import Header from "./components/header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateParadox from "./pages/CreateParadox";
import ParadoxDetail from "./pages/ParadoxDetail";
import Ranking from "./pages/Ranking";
import Duels from "./pages/Duels";

// Layout principal que incluye el Header y renderiza el contenido de las rutas hijas
function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas anidadas dentro del layout principal para compartir el Header */}
        <Route element={<AppLayout />}>
          {/* Redirección por defecto de la raíz a /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Vistas públicas y de navegación general */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Vistas de perfil (con parámetro opcional o dinámico) */}
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Vistas de gestión y detalle de paradojas */}
          <Route path="/paradox/create" element={<CreateParadox />} />
          <Route path="/paradox/:id" element={<ParadoxDetail />} />
          
          {/* Vistas de rankings y duelos */}
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/duels" element={<Duels />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;