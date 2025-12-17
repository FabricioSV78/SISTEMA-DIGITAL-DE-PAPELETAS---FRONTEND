import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Aut from './components/Aut';
import Admin from './components/Admin';
import RRHH from './components/RRHH';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Aut />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/rrhh" element={<RRHH />} />
        {/* Redirigir la ruta raíz a /login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
