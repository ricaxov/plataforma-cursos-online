import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { trilhaService, trilhaCursoService, cursoService, categoriaService } from '../services';
import type { Trilha, TrilhaCurso, Curso, Categoria } from '../models';
import { isRequired } from '../utils/validation';

export function Trilhas() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilhasCursos, setTrilhasCursos] = useState<TrilhaCurso[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [err, setErr] = useState('');

  const [showAssoc, setShowAssoc] = useState(false);
  const [trilhaAssoc, setTrilhaAssoc] = useState<Trilha | null>(null);
  const [cursoAssoc, setCursoAssoc] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [tri, tc, cur, cat] = await Promise.all([
        trilhaService.listar(),
        trilhaCursoService.listar(),
        cursoService.listar(),
        categoriaService.listar(),
      ]);
      setTrilhas(tri);
      setTrilhasCursos(tc);
      setCursos(cur);
      setCategorias(cat);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const catNome = (id: number | null) => categorias.find((c) => c.id === id)?.Nome ?? '—';
  const cursoNome = (id: number) => cursos.find((c) => c.id === id)?.Titulo ?? '—';
  const cursosDaTrilha = (trilhaId: number) =>
    trilhasCursos.filter((tc) => tc.ID_Trilha === trilhaId).sort((a, b) => a.Ordem - b.Ordem);

  function abrirNovo() {
    setEditId(null);
    setTitulo('');
    setDescricao('');
    setIdCategoria('');
    setErr('');
    setShowModal(true);
  }

  function abrirEditar(t: Trilha) {
    setEditId(t.id);
    setTitulo(t.Titulo);
    setDescricao(t.Descricao);
    setIdCategoria(t.ID_Categoria ? String(t.ID_Categoria) : '');
    setErr('');
    setShowModal(true);
  }

  async function salvar() {
    if (!isRequired(titulo)) {
      setErr('O título é obrigatório.');
      return;
    }
    const payload = {
      Titulo: titulo.trim(),
      Descricao: descricao.trim(),
      ID_Categoria: idCategoria ? Number(idCategoria) : null,
    };
    if (editId) {
      await trilhaService.atualizar(editId, payload);
      showToast('Trilha atualizada.');
    } else {
      await trilhaService.criar(payload);
      showToast('Trilha cadastrada.');
    }
    setShowModal(false);
    load();
  }

  function excluir(t: Trilha) {
    confirm('Excluir esta trilha e suas associações de cursos?', async () => {
      const assoc = trilhasCursos.filter((tc) => tc.ID_Trilha === t.id);
      await Promise.all(assoc.map((a) => trilhaCursoService.remover(a.id)));
      await trilhaService.remover(t.id);
      showToast('Trilha excluída.');
      load();
    });
  }

  function abrirAssoc(t: Trilha) {
    setTrilhaAssoc(t);
    setCursoAssoc('');
    setShowAssoc(true);
  }

  async function adicionarCurso() {
    if (!cursoAssoc || !trilhaAssoc) return;
    const jaExiste = trilhasCursos.some(
      (tc) => tc.ID_Trilha === trilhaAssoc.id && tc.ID_Curso === Number(cursoAssoc)
    );
    if (jaExiste) {
      showToast('Este curso já está na trilha.', 'warning');
      return;
    }
    const ordem = cursosDaTrilha(trilhaAssoc.id).length + 1;
    await trilhaCursoService.criar({ ID_Trilha: trilhaAssoc.id, ID_Curso: Number(cursoAssoc), Ordem: ordem });
    showToast('Curso adicionado à trilha.');
    setCursoAssoc('');
    await load();
  }

  async function removerCurso(tc: TrilhaCurso) {
    await trilhaCursoService.remover(tc.id);
    showToast('Curso removido da trilha.');
    load();
  }

  return (
    <>
      <PageHeader
        icon="bi-signpost-split"
        title="Trilhas de Conhecimento"
        subtitle="Organize cursos em trilhas de aprendizado"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Nova Trilha
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : trilhas.length === 0 ? (
        <EmptyState icon="bi-signpost-split" message="Nenhuma trilha cadastrada." />
      ) : (
        <div className="row g-3">
          {trilhas.map((t) => (
            <div className="col-md-6" key={t.id}>
              <div className="card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-signpost-split me-2 text-primary" />
                      {t.Titulo}
                    </h5>
                    <span className="badge bg-info text-dark mb-2">{catNome(t.ID_Categoria)}</span>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(t)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(t)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
                <p className="text-muted small">{t.Descricao}</p>
                <h6 className="mt-2">Cursos da trilha:</h6>
                {cursosDaTrilha(t.id).length === 0 ? (
                  <p className="text-muted small mb-2">Nenhum curso associado.</p>
                ) : (
                  <ol className="list-group list-group-numbered mb-2">
                    {cursosDaTrilha(t.id).map((tc) => (
                      <li
                        key={tc.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        {cursoNome(tc.ID_Curso)}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removerCurso(tc)}>
                          <i className="bi bi-x" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <button className="btn btn-sm btn-primary mt-auto" onClick={() => abrirAssoc(t)}>
                  <i className="bi bi-plus-lg me-1" />
                  Associar Curso
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        title={editId ? 'Editar Trilha' : 'Nova Trilha'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvar}>
              Salvar
            </button>
          </>
        }
      >
        <FormField label="Título" required error={err}>
          <input
            className={`form-control ${err ? 'is-invalid' : ''}`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </FormField>
        <FormField label="Descrição">
          <textarea
            className="form-control"
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </FormField>
        <FormField label="Categoria">
          <select className="form-select" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.Nome}
              </option>
            ))}
          </select>
        </FormField>
      </Modal>

      <Modal
        show={showAssoc}
        title={`Associar Curso — ${trilhaAssoc?.Titulo ?? ''}`}
        onClose={() => setShowAssoc(false)}
        footer={
          <button className="btn btn-secondary" onClick={() => setShowAssoc(false)}>
            Fechar
          </button>
        }
      >
        <div className="d-flex gap-2">
          <select className="form-select" value={cursoAssoc} onChange={(e) => setCursoAssoc(e.target.value)}>
            <option value="">Selecione um curso...</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.Titulo}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={adicionarCurso} disabled={!cursoAssoc}>
            Adicionar
          </button>
        </div>
        {trilhaAssoc && (
          <ol className="list-group list-group-numbered mt-3">
            {cursosDaTrilha(trilhaAssoc.id).map((tc) => (
              <li key={tc.id} className="list-group-item d-flex justify-content-between align-items-center">
                {cursoNome(tc.ID_Curso)}
                <button className="btn btn-sm btn-outline-danger" onClick={() => removerCurso(tc)}>
                  <i className="bi bi-x" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </Modal>

      {ConfirmElement}
    </>
  );
}
