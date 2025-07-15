import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import Inventario from './pages/Inventario';
import Home from './pages/Home';
import ListaSpesa from './pages/ListaSpesa';

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            🧊 InventoryHomeAPP
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-lg-3">
              <li className="nav-item">
                <Link className="nav-link" to="/">🏠 Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/inventario">📦 Inventario</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/lista-spesa">🛒 Lista della Spesa</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/lista-spesa" element={<ListaSpesa />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
