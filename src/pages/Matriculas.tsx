import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { matriculaService, usuarioService, cursoService } from '../services';
import type { Matricula, Usuario, Curso } from '../models';
import { hoje } from '../utils/validation';

export function Matriculas() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [idUsuario, setIdUsuario] = useState('');
  const [idCurso, setIdCurso] = useState('');
  const [errors, setErrors] = useState<{ usuario?: string; curso?: string }>({});

  async function load() {
    setLoading(true);
    try {
      const [mat, usr, cur] = await Promise.all([
        matriculaService.listar(),
        usuarioService.listar(),
        cursoService.listar(),
      ]);
      setMatriculas(mat);
      setUsuarios(usr);
      setCursos(cur);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const userNome = (id: number) => usuarios.find((u) => u.id === id)?.NomeCompleto ?? '—';
  const cursoNome = (id: number) => cursos.find((c) => c.id === id)?.Titulo ?? '—';

  function abrirNovo() {
    if (usuarios.length === 0 || cursos.length === 0) {
      showToast('Cadastre usuários e cursos antes de criar matrículas.', 'warning');
      return;
    }
    setIdUsuario('');
    setIdCurso('');
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    const errs: { usuario?: string; curso?: string } = {};
    if (!idUsuario) errs.usuario = 'Selecione um usuário.';
    if (!idCurso) errs.curso = 'Selecione um curso.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const duplicada = matriculas.some(
      (m) => m.ID_Usuario === Number(idUsuario) && m.ID_Curso === Number(idCurso)
    );
    if (duplicada) {
      showToast('Este usuário já está matriculado neste curso.', 'warning');
      return;
    }

    await matriculaService.criar({
      ID_Usuario: Number(idUsuario),
      ID_Curso: Number(idCurso),
      DataMatricula: hoje(),
      DataConclusao: null,
    });
    showToast('Matrícula realizada com sucesso.');
    setShowModal(false);
    load();
  }

  async function concluir(m: Matricula) {
    await matriculaService.atualizar(m.id, { DataConclusao: hoje() });
    showToast('Matrícula marcada como concluída.');
    load();
  }

  function excluir(m: Matricula) {
    confirm('Deseja realmente excluir esta matrícula?', async () => {
      await matriculaService.remover(m.id);
      showToast('Matrícula excluída.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-card-checklist"
        title="Matrículas"
        subtitle="Matricule usuários em cursos"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Nova Matrícula
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : matriculas.length === 0 ? (
        <EmptyState icon="bi-card-checklist" message="Nenhuma matrícula registrada." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuário</th>
                <th>Curso</th>
                <th>Data Matrícula</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{userNome(m.ID_Usuario)}</td>
                  <td>{cursoNome(m.ID_Curso)}</td>
                  <td>{m.DataMatricula}</td>
                  <td>
                    {m.DataConclusao ? (
                      <span className="badge bg-success">Concluído em {m.DataConclusao}</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Em andamento</span>
                    )}
                  </td>
                  <td className="text-end">
                    {!m.DataConclusao && (
                      <button className="btn btn-sm btn-outline-success me-1" onClick={() => concluir(m)}>
                        <i className="bi bi-check2-circle" /> Concluir
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(m)}>
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
        title="Nova Matrícula"
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvar}>
              Matricular
            </button>
          </>
        }
      >
        <FormField label="Usuário" required error={errors.usuario}>
          <select
            className={`form-select ${errors.usuario ? 'is-invalid' : ''}`}
            value={idUsuario}
            onChange={(e) => setIdUsuario(e.target.value)}
          >
            <option value="">Selecione...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.NomeCompleto}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Curso" required error={errors.curso}>
          <select
            className={`form-select ${errors.curso ? 'is-invalid' : ''}`}
            value={idCurso}
            onChange={(e) => setIdCurso(e.target.value)}
          >
            <option value="">Selecione...</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.Titulo}
              </option>
            ))}
          </select>
        </FormField>
      </Modal>

      {ConfirmElement}
    </>
  );
}
