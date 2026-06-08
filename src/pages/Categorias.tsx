import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { categoriaService, cursoService } from '../services';
import type { Categoria, Curso } from '../models';
import { isRequired } from '../utils/validation';

export function Categorias() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [errors, setErrors] = useState<{ nome?: string }>({});

  async function load() {
    setLoading(true);
    try {
      const [cats, curs] = await Promise.all([categoriaService.listar(), cursoService.listar()]);
      setCategorias(cats);
      setCursos(curs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function abrirNovo() {
    setEditId(null);
    setNome('');
    setDescricao('');
    setErrors({});
    setShowModal(true);
  }

  function abrirEditar(cat: Categoria) {
    setEditId(cat.id);
    setNome(cat.Nome);
    setDescricao(cat.Descricao);
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    const novoErros: { nome?: string } = {};
    if (!isRequired(nome)) novoErros.nome = 'O nome é obrigatório.';

    const nomeDuplicado = categorias.some(
      (c) => c.Nome.toLowerCase() === nome.trim().toLowerCase() && c.id !== editId
    );
    if (nomeDuplicado) novoErros.nome = 'Já existe uma categoria com este nome.';

    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      return;
    }

    const payload = { Nome: nome.trim(), Descricao: descricao.trim() };
    if (editId) {
      await categoriaService.atualizar(editId, payload);
      showToast('Categoria atualizada com sucesso.');
    } else {
      await categoriaService.criar(payload);
      showToast('Categoria cadastrada com sucesso.');
    }
    setShowModal(false);
    load();
  }

  function excluir(cat: Categoria) {
    const vinculados = cursos.filter((c) => c.ID_Categoria === cat.id);
    if (vinculados.length > 0) {
      showToast('Não é possível excluir: existem cursos vinculados a esta categoria.', 'danger');
      return;
    }
    confirm('Deseja realmente excluir esta categoria?', async () => {
      await categoriaService.remover(cat.id);
      showToast('Categoria excluída com sucesso.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-tags"
        title="Categorias"
        subtitle="Gerencie as categorias dos cursos"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Nova Categoria
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : categorias.length === 0 ? (
        <EmptyState message="Nenhuma categoria cadastrada." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Cursos</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>
                    <strong>{cat.Nome}</strong>
                  </td>
                  <td>{cat.Descricao || <span className="text-muted">—</span>}</td>
                  <td>
                    <span className="badge bg-primary rounded-pill">
                      {cursos.filter((c) => c.ID_Categoria === cat.id).length}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(cat)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(cat)}>
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
        title={editId ? 'Editar Categoria' : 'Nova Categoria'}
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
        <FormField label="Nome" required error={errors.nome}>
          <input
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </FormField>
        <FormField label="Descrição">
          <textarea className="form-control" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </FormField>
      </Modal>

      {ConfirmElement}
    </>
  );
}
