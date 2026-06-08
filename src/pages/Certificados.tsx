import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';
import { certificadoService, usuarioService, cursoService } from '../services';
import type { Certificado, Usuario, Curso } from '../models';

export function Certificados() {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();

  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  const [showView, setShowView] = useState(false);
  const [certView, setCertView] = useState<Certificado | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [cert, usr, cur] = await Promise.all([
        certificadoService.listar(),
        usuarioService.listar(),
        cursoService.listar(),
      ]);
      setCertificados(cert);
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

  function visualizar(c: Certificado) {
    setCertView(c);
    setShowView(true);
  }

  function excluir(c: Certificado) {
    confirm('Deseja revogar este certificado?', async () => {
      await certificadoService.remover(c.id);
      showToast('Certificado revogado.');
      load();
    });
  }

  return (
    <>
      <PageHeader
        icon="bi-award"
        title="Certificados"
        subtitle="Certificados emitidos aos alunos (gerados na página de Progresso ao concluir 100% do curso)"
      />

      {loading ? (
        <Spinner />
      ) : certificados.length === 0 ? (
        <EmptyState
          icon="bi-award"
          message="Nenhum certificado emitido. Conclua 100% das aulas de um curso na página de Progresso para gerar um certificado."
        />
      ) : (
        <div className="row g-3">
          {certificados.map((c) => (
            <div className="col-md-6 col-lg-4" key={c.id}>
              <div className="card p-4 h-100 text-center">
                <i className="bi bi-award-fill text-warning" style={{ fontSize: '2.5rem' }} />
                <h6 className="mt-2 mb-1">{cursoNome(c.ID_Curso)}</h6>
                <p className="text-muted mb-1 small">{userNome(c.ID_Usuario)}</p>
                <span className="badge bg-light text-dark border mb-2 font-monospace">{c.CodigoVerificacao}</span>
                <p className="text-muted small mb-3">Emitido em {c.DataEmissao}</p>
                <div className="d-flex gap-2 justify-content-center mt-auto">
                  <button className="btn btn-sm btn-primary" onClick={() => visualizar(c)}>
                    <i className="bi bi-eye me-1" />
                    Visualizar
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(c)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showView}
        size="lg"
        title="Certificado de Conclusão"
        onClose={() => setShowView(false)}
        footer={
          <button className="btn btn-secondary" onClick={() => setShowView(false)}>
            Fechar
          </button>
        }
      >
        {certView && (
          <div className="certificate-card">
            <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '3rem' }} />
            <h3 className="mt-2">Certificado de Conclusão</h3>
            <p className="text-muted">Certificamos que</p>
            <h4 className="fw-bold">{userNome(certView.ID_Usuario)}</h4>
            <p className="text-muted">concluiu com êxito o curso</p>
            <h5 className="fw-bold text-primary">{cursoNome(certView.ID_Curso)}</h5>
            <hr className="my-4" />
            <div className="d-flex justify-content-between small text-muted">
              <span>
                Código: <strong className="font-monospace">{certView.CodigoVerificacao}</strong>
              </span>
              <span>Emissão: {certView.DataEmissao}</span>
            </div>
            <p className="text-muted small mt-3 mb-0">Ricardo Plataforma — Plataforma de Cursos Online</p>
          </div>
        )}
      </Modal>

      {ConfirmElement}
    </>
  );
}
