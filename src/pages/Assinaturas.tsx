import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { assinaturaService, usuarioService, planoService } from '../services';
import type { Assinatura, Usuario, Plano } from '../models';
import { hoje } from '../utils/validation';

function addMeses(dataISO: string, meses: number): string {
  const d = new Date(dataISO);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().split('T')[0];
}

function estaAtiva(a: Assinatura): boolean {
  return new Date(a.DataFim) >= new Date(hoje());
}

export function Assinaturas() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [idUsuario, setIdUsuario] = useState('');
  const [idPlano, setIdPlano] = useState('');
  const [dataInicio, setDataInicio] = useState(hoje());
  const [errors, setErrors] = useState<{ usuario?: string; plano?: string }>({});

  async function load() {
    setLoading(true);
    try {
      const [ass, usr, pl] = await Promise.all([
        assinaturaService.listar(),
        usuarioService.listar(),
        planoService.listar(),
      ]);
      setAssinaturas(ass);
      setUsuarios(usr);
      setPlanos(pl);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const userNome = (id: number) => usuarios.find((u) => u.id === id)?.NomeCompleto ?? '—';
  const planoNome = (id: number) => planos.find((p) => p.id === id)?.Nome ?? '—';

  function abrirNovo() {
    if (usuarios.length === 0 || planos.length === 0) {
      showToast('Cadastre usuários e planos antes de criar assinaturas.', 'warning');
      return;
    }
    setIdUsuario('');
    setIdPlano('');
    setDataInicio(hoje());
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    const errs: { usuario?: string; plano?: string } = {};
    if (!idUsuario) errs.usuario = 'Selecione um usuário.';
    if (!idPlano) errs.plano = 'Selecione um plano.';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const plano = planos.find((p) => p.id === Number(idPlano))!;
    await assinaturaService.criar({
      ID_Usuario: Number(idUsuario),
      ID_Plano: Number(idPlano),
      DataInicio: dataInicio,
      DataFim: addMeses(dataInicio, plano.DuracaoMeses),
    });
    showToast('Assinatura criada com sucesso.');
    setShowModal(false);
    load();
  }

  function excluir(a: Assinatura) {
    confirm('Deseja realmente excluir esta assinatura?', async () => {
      await assinaturaService.remover(a.id);
      showToast('Assinatura excluída.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-pen"
        title="Assinaturas"
        subtitle="Assinaturas de planos pelos usuários"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Nova Assinatura
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : assinaturas.length === 0 ? (
        <EmptyState icon="bi-pen" message="Nenhuma assinatura registrada." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuário</th>
                <th>Plano</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{userNome(a.ID_Usuario)}</td>
                  <td>{planoNome(a.ID_Plano)}</td>
                  <td>{a.DataInicio}</td>
                  <td>{a.DataFim}</td>
                  <td>
                    {estaAtiva(a) ? (
                      <span className="badge bg-success">Ativa</span>
                    ) : (
                      <span className="badge bg-secondary">Expirada</span>
                    )}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(a)}>
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
        title="Nova Assinatura"
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
        <FormField label="Plano" required error={errors.plano}>
          <select
            className={`form-select ${errors.plano ? 'is-invalid' : ''}`}
            value={idPlano}
            onChange={(e) => setIdPlano(e.target.value)}
          >
            <option value="">Selecione...</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.Nome} — R$ {p.Preco.toFixed(2)} ({p.DuracaoMeses} meses)
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Data de Início">
          <input
            type="date"
            className="form-control"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </FormField>
        {idPlano && (
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-1" />
            Data de término calculada: <strong>{addMeses(dataInicio, planos.find((p) => p.id === Number(idPlano))!.DuracaoMeses)}</strong>
          </div>
        )}
      </Modal>

      {ConfirmElement}
    </>
  );
}
