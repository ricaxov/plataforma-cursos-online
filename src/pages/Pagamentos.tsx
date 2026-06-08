import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { pagamentoService, assinaturaService, usuarioService, planoService } from '../services';
import type { Pagamento, Assinatura, Usuario, Plano, MetodoPagamento } from '../models';
import { hoje, gerarTransacaoId } from '../utils/validation';

const METODOS: MetodoPagamento[] = ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto'];

export function Pagamentos() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [idAssinatura, setIdAssinatura] = useState('');
  const [metodo, setMetodo] = useState<MetodoPagamento>('PIX');
  const [errors, setErrors] = useState<{ assinatura?: string }>({});

  async function load() {
    setLoading(true);
    try {
      const [pag, ass, usr, pl] = await Promise.all([
        pagamentoService.listar(),
        assinaturaService.listar(),
        usuarioService.listar(),
        planoService.listar(),
      ]);
      setPagamentos(pag);
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
  const planoPorAssinatura = (idAss: number) => {
    const ass = assinaturas.find((a) => a.id === idAss);
    return ass ? planos.find((p) => p.id === ass.ID_Plano) : undefined;
  };
  const descricaoAssinatura = (idAss: number) => {
    const ass = assinaturas.find((a) => a.id === idAss);
    if (!ass) return `Assinatura #${idAss}`;
    const plano = planos.find((p) => p.id === ass.ID_Plano);
    return `#${ass.id} — ${userNome(ass.ID_Usuario)} (${plano?.Nome ?? '—'})`;
  };

  function abrirNovo() {
    if (assinaturas.length === 0) {
      showToast('Crie uma assinatura antes de registrar um pagamento.', 'warning');
      return;
    }
    setIdAssinatura('');
    setMetodo('PIX');
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    if (!idAssinatura) {
      setErrors({ assinatura: 'Selecione uma assinatura.' });
      return;
    }
    const ass = assinaturas.find((a) => a.id === Number(idAssinatura))!;
    const plano = planos.find((p) => p.id === ass.ID_Plano);
    await pagamentoService.criar({
      ID_Assinatura: ass.id,
      ValorPago: plano?.Preco ?? 0,
      DataPagamento: hoje(),
      MetodoPagamento: metodo,
      Id_Transacao_Gateway: gerarTransacaoId(),
      DataFim: ass.DataFim,
    });
    showToast('Pagamento processado com sucesso!');
    setShowModal(false);
    load();
  }

  function excluir(p: Pagamento) {
    confirm('Deseja realmente excluir este pagamento?', async () => {
      await pagamentoService.remover(p.id);
      showToast('Pagamento excluído.');
      load();
    });
  }

  const planoSelecionado = idAssinatura ? planoPorAssinatura(Number(idAssinatura)) : undefined;

  return (
    <>
      <PageHeader
        icon="bi-credit-card"
        title="Pagamentos"
        subtitle="Checkout e histórico de pagamentos"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Novo Pagamento
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : pagamentos.length === 0 ? (
        <EmptyState icon="bi-credit-card" message="Nenhum pagamento registrado." />
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Assinatura</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Método</th>
                <th>ID Transação</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{descricaoAssinatura(p.ID_Assinatura)}</td>
                  <td>R$ {p.ValorPago.toFixed(2)}</td>
                  <td>{p.DataPagamento}</td>
                  <td>
                    <span className="badge bg-info text-dark">{p.MetodoPagamento}</span>
                  </td>
                  <td>
                    <code className="small">{p.Id_Transacao_Gateway}</code>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(p)}>
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
        title="Checkout — Novo Pagamento"
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvar}>
              <i className="bi bi-lock me-1" />
              Confirmar Pagamento
            </button>
          </>
        }
      >
        <FormField label="Assinatura" required error={errors.assinatura}>
          <select
            className={`form-select ${errors.assinatura ? 'is-invalid' : ''}`}
            value={idAssinatura}
            onChange={(e) => setIdAssinatura(e.target.value)}
          >
            <option value="">Selecione...</option>
            {assinaturas.map((a) => (
              <option key={a.id} value={a.id}>
                {descricaoAssinatura(a.id)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Método de Pagamento">
          <select className="form-select" value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPagamento)}>
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FormField>
        {planoSelecionado && (
          <div className="alert alert-success d-flex justify-content-between mb-0">
            <span>Valor a pagar:</span>
            <strong>R$ {planoSelecionado.Preco.toFixed(2)}</strong>
          </div>
        )}
        <p className="text-muted small mt-2 mb-0">
          <i className="bi bi-info-circle me-1" />
          O ID da Transação será gerado automaticamente ao confirmar o pagamento.
        </p>
      </Modal>

      {ConfirmElement}
    </>
  );
}
