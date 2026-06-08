import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { usuarioService } from '../services';
import type { Usuario } from '../models';
import { isRequired, isValidEmail, hoje } from '../utils/validation';

interface FormErrors {
  nome?: string;
  email?: string;
  senha?: string;
}

export function Usuarios() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  async function load() {
    setLoading(true);
    try {
      setUsuarios(await usuarioService.listar());
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
    setEmail('');
    setSenha('');
    setErrors({});
    setShowModal(true);
  }

  function abrirEditar(u: Usuario) {
    setEditId(u.id);
    setNome(u.NomeCompleto);
    setEmail(u.Email);
    setSenha('');
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    const errs: FormErrors = {};
    if (!isRequired(nome)) errs.nome = 'O nome é obrigatório.';
    if (!isRequired(email)) errs.email = 'O e-mail é obrigatório.';
    else if (!isValidEmail(email)) errs.email = 'Formato de e-mail inválido.';
    if (!editId && !isRequired(senha)) errs.senha = 'A senha é obrigatória.';

    const emailDuplicado = usuarios.some(
      (u) => u.Email.toLowerCase() === email.trim().toLowerCase() && u.id !== editId
    );
    if (emailDuplicado) errs.email = 'Este e-mail já está cadastrado.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editId) {
      await usuarioService.atualizar(editId, { NomeCompleto: nome.trim(), Email: email.trim() });
      showToast('Usuário atualizado com sucesso.');
    } else {
      await usuarioService.criar({
        NomeCompleto: nome.trim(),
        Email: email.trim(),
        SenhaHash: '***',
        DataCadastro: hoje(),
      });
      showToast('Usuário cadastrado com sucesso.');
    }
    setShowModal(false);
    load();
  }

  function excluir(u: Usuario) {
    confirm('Deseja realmente excluir este usuário?', async () => {
      await usuarioService.remover(u.id);
      showToast('Usuário excluído com sucesso.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-person-plus"
        title="Usuários"
        subtitle="Cadastro e gerenciamento de usuários"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Novo Usuário
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : usuarios.length === 0 ? (
        <EmptyState message="Nenhum usuário cadastrado." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>Data Cadastro</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <strong>{u.NomeCompleto}</strong>
                  </td>
                  <td>{u.Email}</td>
                  <td>{u.DataCadastro}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(u)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(u)}>
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
        title={editId ? 'Editar Usuário' : 'Novo Usuário'}
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
        <FormField label="Nome Completo" required error={errors.nome}>
          <input
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </FormField>
        <FormField label="E-mail" required error={errors.email}>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Senha" required={!editId} error={errors.senha}>
          <input
            type="password"
            className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
            value={senha}
            placeholder={editId ? 'Deixe vazio para manter a atual' : ''}
            onChange={(e) => setSenha(e.target.value)}
          />
        </FormField>
      </Modal>

      {ConfirmElement}
    </>
  );
}
