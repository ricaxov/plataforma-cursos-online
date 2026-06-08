import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <>
      <Navbar />
      <main className="container my-4">
        <Outlet />
      </main>
      <footer className="rp-footer">
        <div className="container">
          <small>Ricardo Plataforma &copy; 2026 — Plataforma de Cursos Online</small>
        </div>
      </footer>
    </>
  );
}
