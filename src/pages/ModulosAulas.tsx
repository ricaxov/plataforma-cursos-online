import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { cursoService, moduloService, aulaService } from '../services';
import type { Curso, Modulo, Aula, TipoConteudo } from '../models';
import { isRequired } from '../utils/validation';

const TIPOS: TipoConteudo[] = ['Vídeo', 'Texto', 'Quiz'];

export function ModulosAulas() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursoSel, setCursoSel] = useState('');
  const [aberto, setAberto] = useState<number | null>(null);

  const [showModulo, setShowModulo] = useState(false);
  const [moduloEditId, setModuloEditId] = useState<number | null>(null);
  const [moduloTitulo, setModuloTitulo] = useState('');
  const [moduloOrdem, setModuloOrdem] = useState('1');
  const [moduloErr, setModuloErr] = useState('');

  const [showAula, setShowAula] = useState(false);
  const [aulaEditId, setAulaEditId] = useState<number | null>(null);
  const [aulaModuloId, setAulaModuloId] = useState<number | null>(null);
  const [aulaForm, setAulaForm] = useState({
    Titulo: '',
    TipoConteudo: 'Vídeo' as TipoConteudo,
    URL_Conteudo: '',
    DuracaoMinutos: '0',
    Ordem: '1',
  });
  const [aulaErr, setAulaErr] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [cur, mod, aul] = await Promise.all([
        cursoService.listar(),
        moduloService.listar(),
        aulaService.listar(),
      ]);
      setCursos(cur);
      setModulos(mod);
      setAulas(aul);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const modulosCurso = modulos
    .filter((m) => m.ID_Curso === Number(cursoSel))
    .sort((a, b) => a.Ordem - b.Ordem);

  const aulasDoModulo = (moduloId: number) =>
    aulas.filter((a) => a.ID_Modulo === moduloId).sort((a, b) => a.Ordem - b.Ordem);

  // ---- Módulos ----
  function novoModulo() {
    setModuloEditId(null);
    setModuloTitulo('');
    setModuloOrdem(String(modulosCurso.length + 1));
    setModuloErr('');
    setShowModulo(true);
  }

  function editarModulo(m: Modulo) {
    setModuloEditId(m.id);
    setModuloTitulo(m.Titulo);
    setModuloOrdem(String(m.Ordem));
    setModuloErr('');
    setShowModulo(true);
  }

  async function salvarModulo() {
    if (!isRequired(moduloTitulo)) {
      setModuloErr('O título é obrigatório.');
      return;
    }
    const payload = {
      ID_Curso: Number(cursoSel),
      Titulo: moduloTitulo.trim(),
      Ordem: parseInt(moduloOrdem) || 1,
    };
    if (moduloEditId) {
      await moduloService.atualizar(moduloEditId, payload);
      showToast('Módulo atualizado.');
    } else {
      await moduloService.criar(payload);
      showToast('Módulo adicionado.');
    }
    setShowModulo(false);
    load();
  }

  function excluirModulo(m: Modulo) {
    confirm('Excluir este módulo e todas as suas aulas?', async () => {
      const filhas = aulas.filter((a) => a.ID_Modulo === m.id);
      await Promise.all(filhas.map((a) => aulaService.remover(a.id)));
      await moduloService.remover(m.id);
      showToast('Módulo excluído.');
      load();
    });
  }

  // ---- Aulas ----
  function novaAula(moduloId: number) {
    setAulaEditId(null);
    setAulaModuloId(moduloId);
    setAulaForm({
      Titulo: '',
      TipoConteudo: 'Vídeo',
      URL_Conteudo: '',
      DuracaoMinutos: '0',
      Ordem: String(aulasDoModulo(moduloId).length + 1),
    });
    setAulaErr('');
    setShowAula(true);
  }

  function editarAula(a: Aula) {
    setAulaEditId(a.id);
    setAulaModuloId(a.ID_Modulo);
    setAulaForm({
      Titulo: a.Titulo,
      TipoConteudo: a.TipoConteudo,
      URL_Conteudo: a.URL_Conteudo,
      DuracaoMinutos: String(a.DuracaoMinutos),
      Ordem: String(a.Ordem),
    });
    setAulaErr('');
    setShowAula(true);
  }

  async function salvarAula() {
    if (!isRequired(aulaForm.Titulo)) {
      setAulaErr('O título é obrigatório.');
      return;
    }
    const payload = {
      ID_Modulo: aulaModuloId!,
      Titulo: aulaForm.Titulo.trim(),
      TipoConteudo: aulaForm.TipoConteudo,
      URL_Conteudo: aulaForm.URL_Conteudo.trim() || '#',
      DuracaoMinutos: parseInt(aulaForm.DuracaoMinutos) || 0,
      Ordem: parseInt(aulaForm.Ordem) || 1,
    };
    if (aulaEditId) {
      await aulaService.atualizar(aulaEditId, payload);
      showToast('Aula atualizada.');
    } else {
      await aulaService.criar(payload);
      showToast('Aula adicionada.');
    }
    setShowAula(false);
    load();
  }

  function excluirAula(a: Aula) {
    confirm('Excluir esta aula?', async () => {
      await aulaService.remover(a.id);
      showToast('Aula excluída.');
      load();
    });
  }

  return (
    <>
      <PageHeader icon="bi-collection-play" title="Módulos e Aulas" subtitle="Estruture o conteúdo de cada curso" />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="row mb-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Selecione um curso</label>
              <select
                className="form-select"
                value={cursoSel}
                onChange={(e) => {
                  setCursoSel(e.target.value);
                  setAberto(null);
                }}
              >
                <option value="">Selecione...</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.Titulo}
                  </option>
                ))}
              </select>
            </div>
            {cursoSel && (
              <div className="col-md-6 text-end">
                <button className="btn btn-primary" onClick={novoModulo}>
                  <i className="bi bi-plus-lg me-1" />
                  Novo Módulo
                </button>
              </div>
            )}
          </div>

          {!cursoSel ? (
            <EmptyState icon="bi-collection-play" message="Selecione um curso para ver seus módulos e aulas." />
          ) : modulosCurso.length === 0 ? (
            <EmptyState message="Este curso ainda não possui módulos." />
          ) : (
            <div className="accordion">
              {modulosCurso.map((m) => (
                <div className="accordion-item mb-2 border rounded" key={m.id}>
                  <div className="accordion-header d-flex justify-content-between align-items-center p-3">
                    <button
                      className="btn btn-link text-decoration-none text-start flex-grow-1 p-0"
                      onClick={() => setAberto((a) => (a === m.id ? null : m.id))}
                    >
                      <i className={`bi ${aberto === m.id ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`} />
                      <span className="badge bg-secondary me-2">#{m.Ordem}</span>
                      <strong>{m.Titulo}</strong>
                      <span className="badge bg-primary rounded-pill ms-2">{aulasDoModulo(m.id).length} aulas</span>
                    </button>
                    <div className="ms-2">
                      <button className="btn btn-sm btn-outline-success me-1" onClick={() => novaAula(m.id)}>
                        <i className="bi bi-plus-lg" /> Aula
                      </button>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editarModulo(m)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluirModulo(m)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                  {aberto === m.id && (
                    <div className="p-3 pt-0">
                      {aulasDoModulo(m.id).length === 0 ? (
                        <p className="text-muted mb-0">Nenhuma aula neste módulo.</p>
                      ) : (
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Ordem</th>
                              <th>Título</th>
                              <th>Tipo</th>
                              <th>Duração</th>
                              <th className="text-end">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aulasDoModulo(m.id).map((a) => (
                              <tr key={a.id}>
                                <td>{a.Ordem}</td>
                                <td>{a.Titulo}</td>
                                <td>
                                  <span className="badge bg-info text-dark">{a.TipoConteudo}</span>
                                </td>
                                <td>{a.DuracaoMinutos} min</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => editarAula(a)}
                                  >
                                    <i className="bi bi-pencil" />
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => excluirAula(a)}>
                                    <i className="bi bi-trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        show={showModulo}
        title={moduloEditId ? 'Editar Módulo' : 'Novo Módulo'}
        onClose={() => setShowModulo(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModulo(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvarModulo}>
              Salvar
            </button>
          </>
        }
      >
        <FormField label="Título" required error={moduloErr}>
          <input
            className={`form-control ${moduloErr ? 'is-invalid' : ''}`}
            value={moduloTitulo}
            onChange={(e) => setModuloTitulo(e.target.value)}
          />
        </FormField>
        <FormField label="Ordem">
          <input
            type="number"
            min={1}
            className="form-control"
            value={moduloOrdem}
            onChange={(e) => setModuloOrdem(e.target.value)}
          />
        </FormField>
      </Modal>

      <Modal
        show={showAula}
        title={aulaEditId ? 'Editar Aula' : 'Nova Aula'}
        onClose={() => setShowAula(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAula(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvarAula}>
              Salvar
            </button>
          </>
        }
      >
        <FormField label="Título" required error={aulaErr}>
          <input
            className={`form-control ${aulaErr ? 'is-invalid' : ''}`}
            value={aulaForm.Titulo}
            onChange={(e) => setAulaForm((f) => ({ ...f, Titulo: e.target.value }))}
          />
        </FormField>
        <div className="row">
          <FormField label="Tipo de Conteúdo" className="col-md-6">
            <select
              className="form-select"
              value={aulaForm.TipoConteudo}
              onChange={(e) => setAulaForm((f) => ({ ...f, TipoConteudo: e.target.value as TipoConteudo }))}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Duração (min)" className="col-md-3">
            <input
              type="number"
              min={0}
              className="form-control"
              value={aulaForm.DuracaoMinutos}
              onChange={(e) => setAulaForm((f) => ({ ...f, DuracaoMinutos: e.target.value }))}
            />
          </FormField>
          <FormField label="Ordem" className="col-md-3">
            <input
              type="number"
              min={1}
              className="form-control"
              value={aulaForm.Ordem}
              onChange={(e) => setAulaForm((f) => ({ ...f, Ordem: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label="URL do Conteúdo">
          <input
            className="form-control"
            value={aulaForm.URL_Conteudo}
            onChange={(e) => setAulaForm((f) => ({ ...f, URL_Conteudo: e.target.value }))}
          />
        </FormField>
      </Modal>

      {ConfirmElement}
    </>
  );
}
