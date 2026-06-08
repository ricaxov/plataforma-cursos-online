import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import {
  cursoService,
  usuarioService,
  matriculaService,
  categoriaService,
  certificadoService,
  trilhaService,
} from '../services';
import type { Curso, Usuario, Categoria } from '../models';

interface Stat {
  label: string;
  value: number;
  color: string;
  to: string;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [cur, usr, mat, cat, cert, tri] = await Promise.all([
          cursoService.listar(),
          usuarioService.listar(),
          matriculaService.listar(),
          categoriaService.listar(),
          certificadoService.listar(),
          trilhaService.listar(),
        ]);
        setCursos(cur);
        setUsuarios(usr);
        setCategorias(cat);
        setStats([
          { label: 'Cursos', value: cur.length, color: 'primary', to: '/cursos' },
          { label: 'Usuários', value: usr.length, color: 'success', to: '/usuarios' },
          { label: 'Matrículas', value: mat.length, color: 'warning', to: '/matriculas' },
          { label: 'Categorias', value: cat.length, color: 'info', to: '/categorias' },
          { label: 'Certificados', value: cert.length, color: 'danger', to: '/certificados' },
          { label: 'Trilhas', value: tri.length, color: 'secondary', to: '/trilhas' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  const catNome = (id: number) => categorias.find((c) => c.id === id)?.Nome ?? '';

  return (
    <>
      <PageHeader icon="bi-speedometer2" title="Dashboard" subtitle="Visão geral da plataforma de cursos online" />

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-md-4 col-sm-6" key={s.label}>
            <Link to={s.to} className="text-decoration-none">
              <div className={`card card-stat border-${s.color}`}>
                <div className={`stat-number text-${s.color}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h5 className="mb-3">
              <i className="bi bi-journal-richtext me-2 text-primary" />
              Últimos Cursos
            </h5>
            {cursos.length === 0 ? (
              <p className="text-muted">Nenhum curso cadastrado.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {cursos.slice(-5).reverse().map((c) => (
                  <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <strong>{c.Titulo}</strong>
                      <br />
                      <small className="text-muted">
                        {catNome(c.ID_Categoria)} — {c.Nivel}
                      </small>
                    </div>
                    <span className="badge bg-primary rounded-pill">{c.TotalHoras}h</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-4 h-100">
            <h5 className="mb-3">
              <i className="bi bi-people me-2 text-success" />
              Últimos Usuários
            </h5>
            {usuarios.length === 0 ? (
              <p className="text-muted">Nenhum usuário cadastrado.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {usuarios.slice(-5).reverse().map((u) => (
                  <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <strong>{u.NomeCompleto}</strong>
                      <br />
                      <small className="text-muted">{u.Email}</small>
                    </div>
                    <small className="text-muted">{u.DataCadastro}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
