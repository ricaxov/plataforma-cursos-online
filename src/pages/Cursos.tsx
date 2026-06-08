import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { cursoService, categoriaService, usuarioService } from '../services';
import type { Curso, Categoria, Usuario, Nivel } from '../models';
import { isRequired, hoje } from '../utils/validation';

const NIVEIS: Nivel[] = ['Iniciante', 'Intermediário', 'Avançado'];

const nivelBadge: Record<Nivel, string> = {
  Iniciante: 'bg-success',
  Intermediário: 'bg-warning text-dark',
  Avançado: 'bg-danger',
};

interface FormState {
  Titulo: string;
  Descricao: string;
  ID_Categoria: string;
  ID_Instrutor: string;
  Nivel: Nivel;
  DataPublicacao: string;
  TotalAulas: string;
  TotalHoras: string;
}

const emptyForm: FormState = {
  Titulo: '',
  Descricao: '',
  ID_Categoria: '',
  ID_Instrutor: '',
  Nivel: 'Iniciante',
  DataPublicacao: hoje(),
  TotalAulas: '0',
  TotalHoras: '0',
};

export function Cursos() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  async function load() {
    setLoading(true);
    try {
      const [cur, cat, usr] = await Promise.all([
        cursoService.listar(),
        categoriaService.listar(),
        usuarioService.listar(),
      ]);
      setCursos(cur);
      setCategorias(cat);
      setUsuarios(usr);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cursosFiltrados = useMemo(
    () => (filtro ? cursos.filter((c) => c.ID_Categoria === Number(filtro)) : cursos),
    [cursos, filtro]
  );

  const catNome = (id: number) => categorias.find((c) => c.id === id)?.Nome ?? '—';
  const userNome = (id: number) => usuarios.find((u) => u.id === id)?.NomeCompleto ?? '—';

  function abrirNovo() {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

  function abrirEditar(c: Curso) {
    setEditId(c.id);
    setForm({
      Titulo: c.Titulo,
      Descricao: c.Descricao,
      ID_Categoria: String(c.ID_Categoria),
      ID_Instrutor: String(c.ID_Instrutor),
      Nivel: c.Nivel,
      DataPublicacao: c.DataPublicacao,
      TotalAulas: String(c.TotalAulas),
      TotalHoras: String(c.TotalHoras),
    });
    setErrors({});
    setShowModal(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function salvar() {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!isRequired(form.Titulo)) errs.Titulo = 'O título é obrigatório.';
    if (!isRequired(form.ID_Categoria)) errs.ID_Categoria = 'Selecione uma categoria.';
    if (!isRequired(form.ID_Instrutor)) errs.ID_Instrutor = 'Selecione um instrutor.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      Titulo: form.Titulo.trim(),
      Descricao: form.Descricao.trim(),
      ID_Categoria: Number(form.ID_Categoria),
      ID_Instrutor: Number(form.ID_Instrutor),
      Nivel: form.Nivel,
      DataPublicacao: form.DataPublicacao || hoje(),
      TotalAulas: parseInt(form.TotalAulas) || 0,
      TotalHoras: parseFloat(form.TotalHoras) || 0,
    };

    if (editId) {
      await cursoService.atualizar(editId, payload);
      showToast('Curso atualizado com sucesso.');
    } else {
      await cursoService.criar(payload);
      showToast('Curso cadastrado com sucesso.');
    }
    setShowModal(false);
    load();
  }

  function excluir(c: Curso) {
    confirm('Deseja realmente excluir este curso?', async () => {
      await cursoService.remover(c.id);
      showToast('Curso excluído com sucesso.');
      load();
    });
  }

  return (
    <>
      <PageHeader icon="bi-journal-richtext" title="Cursos" subtitle="Cadastre e gerencie os cursos" />

      <div className="row mb-3">
        <div className="col-md-4">
          <select className="form-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.Nome}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-8 text-end">
          <button className="btn btn-primary" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Novo Curso
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : cursosFiltrados.length === 0 ? (
        <EmptyState message="Nenhum curso cadastrado." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Instrutor</th>
                <th>Nível</th>
                <th>Aulas</th>
                <th>Horas</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cursosFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <strong>{c.Titulo}</strong>
                  </td>
                  <td>{catNome(c.ID_Categoria)}</td>
                  <td>{userNome(c.ID_Instrutor)}</td>
                  <td>
                    <span className={`badge badge-nivel ${nivelBadge[c.Nivel]}`}>{c.Nivel}</span>
                  </td>
                  <td>{c.TotalAulas}</td>
                  <td>{c.TotalHoras}h</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(c)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(c)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        show={showModal}
        size="lg"
        title={editId ? 'Editar Curso' : 'Novo Curso'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvar}>
              <i className="bi bi-check-lg me-1" />
              Salvar
            </button>
          </>
        }
      >
        <div className="row">
          <FormField label="Título" required error={errors.Titulo} className="col-md-8">
            <input
              className={`form-control ${errors.Titulo ? 'is-invalid' : ''}`}
              value={form.Titulo}
              onChange={(e) => set('Titulo', e.target.value)}
            />
          </FormField>
          <FormField label="Nível" className="col-md-4">
            <select className="form-select" value={form.Nivel} onChange={(e) => set('Nivel', e.target.value as Nivel)}>
              {NIVEIS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Descrição">
          <textarea
            className="form-control"
            rows={2}
            value={form.Descricao}
            onChange={(e) => set('Descricao', e.target.value)}
          />
        </FormField>
        <div className="row">
          <FormField label="Categoria" required error={errors.ID_Categoria} className="col-md-6">
            <select
              className={`form-select ${errors.ID_Categoria ? 'is-invalid' : ''}`}
              value={form.ID_Categoria}
              onChange={(e) => set('ID_Categoria', e.target.value)}
            >
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.Nome}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Instrutor" required error={errors.ID_Instrutor} className="col-md-6">
            <select
              className={`form-select ${errors.ID_Instrutor ? 'is-invalid' : ''}`}
              value={form.ID_Instrutor}
              onChange={(e) => set('ID_Instrutor', e.target.value)}
            >
              <option value="">Selecione...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.NomeCompleto}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="row">
          <FormField label="Data Publicação" className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={form.DataPublicacao}
              onChange={(e) => set('DataPublicacao', e.target.value)}
            />
          </FormField>
          <FormField label="Total de Aulas" className="col-md-4">
            <input
              type="number"
              min={0}
              className="form-control"
              value={form.TotalAulas}
              onChange={(e) => set('TotalAulas', e.target.value)}
            />
          </FormField>
          <FormField label="Total de Horas" className="col-md-4">
            <input
              type="number"
              min={0}
              step={0.5}
              className="form-control"
              value={form.TotalHoras}
              onChange={(e) => set('TotalHoras', e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {ConfirmElement}
    </>
  );
}
