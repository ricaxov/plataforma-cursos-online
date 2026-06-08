import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Categorias } from './pages/Categorias';
import { Usuarios } from './pages/Usuarios';
import { Cursos } from './pages/Cursos';
import { ModulosAulas } from './pages/ModulosAulas';
import { Trilhas } from './pages/Trilhas';
import { Matriculas } from './pages/Matriculas';
import { Progresso } from './pages/Progresso';
import { Certificados } from './pages/Certificados';
import { Planos } from './pages/Planos';
import { Assinaturas } from './pages/Assinaturas';
import { Pagamentos } from './pages/Pagamentos';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="modulos-aulas" element={<ModulosAulas />} />
          <Route path="trilhas" element={<Trilhas />} />
          <Route path="matriculas" element={<Matriculas />} />
          <Route path="progresso" element={<Progresso />} />
          <Route path="certificados" element={<Certificados />} />
          <Route path="planos" element={<Planos />} />
          <Route path="assinaturas" element={<Assinaturas />} />
          <Route path="pagamentos" element={<Pagamentos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
