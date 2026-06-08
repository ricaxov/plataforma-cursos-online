import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { planoService, assinaturaService } from '../services';
import type { Plano, Assinatura } from '../models';
import { isRequired, isPositiveNumber, isIntegerPositive } from '../utils/validation';

interface FormErrors {
  nome?: string;
  preco?: string;
  duracao?: string;
}

export function Planos() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  async function load() {
    setLoading(true);
    try {
      const [pl, ass] = await Promise.all([planoService.listar(), assinaturaService.listar()]);
      setPlanos(pl);
      setAssinaturas(ass);
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
    setPreco('');
    setDuracao('');
    setErrors({});
    setShowModal(true);
  }

  function abrirEditar(p: Plano) {
    setEditId(p.id);
    setNome(p.Nome);
    setDescricao(p.Descricao);
    setPreco(String(p.Preco));
    setDuracao(String(p.DuracaoMeses));
    setErrors({});
    setShowModal(true);
  }

  async function salvar() {
    const errs: FormErrors = {};
    if (!isRequired(nome)) errs.nome = 'O nome é obrigatório.';
    if (!isPositiveNumber(preco)) errs.preco = 'Informe um preço válido (> 0).';
    if (!isIntegerPositive(duracao)) errs.duracao = 'Informe a duração em meses (> 0).';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      Nome: nome.trim(),
      Descricao: descricao.trim(),
      Preco: parseFloat(preco),
      DuracaoMeses: parseInt(duracao),
    };
    if (editId) {
      await planoService.atualizar(editId, payload);
      showToast('Plano atualizado.');
    } else {
      await planoService.criar(payload);
      showToast('Plano cadastrado.');
    }
    setShowModal(false);
    load();
  }

  function excluir(p: Plano) {
    const vinculadas = assinaturas.filter((a) => a.ID_Plano === p.id);
    if (vinculadas.length > 0) {
      showToast('Não é possível excluir: existem assinaturas vinculadas a este plano.', 'danger');
      return;
    }
    confirm('Deseja realmente excluir este plano?', async () => {
      await planoService.remover(p.id);
      showToast('Plano excluído.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-box"
        title="Planos"
        subtitle="Gerencie os planos de assinatura"
        action={
          <button className="btn btn-light" onClick={abrirNovo}>
            <i className="bi bi-plus-lg me-1" />
            Novo Plano
          </button>
        }
      />

      {loading ? (
        <Spinner />
      ) : planos.length === 0 ? (
        <EmptyState icon="bi-box" message="Nenhum plano cadastrado." />
      ) : (
        <div className="row g-3">
          {planos.map((p) => (
            <div className="col-md-4" key={p.id}>
              <div className="card p-4 h-100 text-center">
                <h5 className="text-primary">{p.Nome}</h5>
                <div className="my-2">
                  <span className="display-6 fw-bold">R$ {p.Preco.toFixed(2)}</span>
                  <div className="text-muted small">por {p.DuracaoMeses} {p.DuracaoMeses > 1 ? 'meses' : 'mês'}</div>
                </div>
                <p className="text-muted small">{p.Descricao}</p>
                <div className="mt-auto d-flex gap-2 justify-content-center">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => abrirEditar(p)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(p)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        title={editId ? 'Editar Plano' : 'Novo Plano'}
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
        <FormField label="Nome" required error={errors.nome}>
          <input
            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </FormField>
        <FormField label="Descrição">
          <textarea className="form-control" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </FormField>
        <div className="row">
          <FormField label="Preço (R$)" required error={errors.preco} className="col-md-6">
            <input
              type="number"
              min={0}
              step={0.01}
              className={`form-control ${errors.preco ? 'is-invalid' : ''}`}
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </FormField>
          <FormField label="Duração (meses)" required error={errors.duracao} className="col-md-6">
            <input
              type="number"
              min={1}
              className={`form-control ${errors.duracao ? 'is-invalid' : ''}`}
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {ConfirmElement}
    </>
  );
}
