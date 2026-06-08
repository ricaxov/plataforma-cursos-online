import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import {
  usuarioService,
  matriculaService,
  cursoService,
  moduloService,
  aulaService,
  progressoService,
  avaliacaoService,
  certificadoService,
} from '../services';
import type { Usuario, Matricula, Curso, Modulo, Aula, ProgressoAula, Avaliacao, Certificado } from '../models';
import { hoje, gerarCodigoCertificado } from '../utils/validation';

export function Progresso() {
  const { showToast } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [progresso, setProgresso] = useState<ProgressoAula[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);

  const [usuarioSel, setUsuarioSel] = useState('');

  const [showAval, setShowAval] = useState(false);
  const [avalCurso, setAvalCurso] = useState<Curso | null>(null);
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [usr, mat, cur, mod, aul, prog, aval, cert] = await Promise.all([
        usuarioService.listar(),
        matriculaService.listar(),
        cursoService.listar(),
        moduloService.listar(),
        aulaService.listar(),
        progressoService.listar(),
        avaliacaoService.listar(),
        certificadoService.listar(),
      ]);
      setUsuarios(usr);
      setMatriculas(mat);
      setCursos(cur);
      setModulos(mod);
      setAulas(aul);
      setProgresso(prog);
      setAvaliacoes(aval);
      setCertificados(cert);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const matriculasUsuario = useMemo(
    () => matriculas.filter((m) => m.ID_Usuario === Number(usuarioSel)),
    [matriculas, usuarioSel]
  );

  function aulasDoCurso(cursoId: number): Aula[] {
    const mods = modulos.filter((m) => m.ID_Curso === cursoId).map((m) => m.id);
    return aulas.filter((a) => mods.includes(a.ID_Modulo));
  }

  function progressoDaAula(aulaId: number): ProgressoAula | undefined {
    return progresso.find((p) => p.ID_Aula === aulaId && p.ID_Usuario === Number(usuarioSel));
  }

  function percentualCurso(cursoId: number): number {
    const total = aulasDoCurso(cursoId);
    if (total.length === 0) return 0;
    const concluidas = total.filter((a) => progressoDaAula(a.id)).length;
    return Math.round((concluidas / total.length) * 100);
  }

  async function alternarAula(aula: Aula) {
    const existente = progressoDaAula(aula.id);
    if (existente) {
      await progressoService.remover(existente.id);
      showToast('Aula desmarcada.', 'info');
    } else {
      await progressoService.criar({
        ID_Usuario: Number(usuarioSel),
        ID_Aula: aula.id,
        DataConclusao: hoje(),
        Status: 'Concluído',
      });
      showToast('Aula concluída!');
    }
    await load();
  }

  function jaTemCertificado(cursoId: number): boolean {
    return certificados.some((c) => c.ID_Curso === cursoId && c.ID_Usuario === Number(usuarioSel));
  }

  async function emitirCertificado(curso: Curso) {
    if (percentualCurso(curso.id) < 100) {
      showToast('Conclua 100% das aulas para emitir o certificado.', 'warning');
      return;
    }
    if (jaTemCertificado(curso.id)) {
      showToast('Certificado já emitido para este curso.', 'warning');
      return;
    }
    const matricula = matriculasUsuario.find((m) => m.ID_Curso === curso.id);
    if (matricula && !matricula.DataConclusao) {
      await matriculaService.atualizar(matricula.id, { DataConclusao: hoje() });
    }
    await certificadoService.criar({
      ID_Usuario: Number(usuarioSel),
      ID_Curso: curso.id,
      ID_Trilha: null,
      CodigoVerificacao: gerarCodigoCertificado(),
      DataEmissao: hoje(),
    });
    showToast('Certificado emitido com sucesso!');
    await load();
  }

  function abrirAvaliacao(curso: Curso) {
    setAvalCurso(curso);
    const existente = avaliacoes.find(
      (a) => a.ID_Curso === curso.id && a.ID_Usuario === Number(usuarioSel)
    );
    setNota(existente ? String(existente.Nota) : '5');
    setComentario(existente?.Comentario ?? '');
    setShowAval(true);
  }

  async function salvarAvaliacao() {
    if (!avalCurso) return;
    const existente = avaliacoes.find(
      (a) => a.ID_Curso === avalCurso.id && a.ID_Usuario === Number(usuarioSel)
    );
    const payload = {
      ID_Usuario: Number(usuarioSel),
      ID_Curso: avalCurso.id,
      Nota: Number(nota),
      Comentario: comentario.trim(),
      DataAvaliacao: hoje(),
    };
    if (existente) {
      await avaliacaoService.atualizar(existente.id, payload);
      showToast('Avaliação atualizada.');
    } else {
      await avaliacaoService.criar(payload);
      showToast('Avaliação enviada. Obrigado!');
    }
    setShowAval(false);
    await load();
  }

  const cursoById = (id: number) => cursos.find((c) => c.id === id);

  return (
    <>
      <PageHeader icon="bi-graph-up" title="Progresso" subtitle="Acompanhe a conclusão das aulas e avalie os cursos" />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Selecione um usuário</label>
              <select className="form-select" value={usuarioSel} onChange={(e) => setUsuarioSel(e.target.value)}>
                <option value="">Selecione...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.NomeCompleto}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!usuarioSel ? (
            <EmptyState icon="bi-graph-up" message="Selecione um usuário para ver seu progresso." />
          ) : matriculasUsuario.length === 0 ? (
            <EmptyState message="Este usuário não possui matrículas." />
          ) : (
            <div className="row g-3">
              {matriculasUsuario.map((mat) => {
                const curso = cursoById(mat.ID_Curso);
                if (!curso) return null;
                const pct = percentualCurso(curso.id);
                const lista = aulasDoCurso(curso.id);
                return (
                  <div className="col-12" key={mat.id}>
                    <div className="card p-4">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                        <h5 className="mb-0">
                          <i className="bi bi-journal-richtext me-2 text-primary" />
                          {curso.Titulo}
                        </h5>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => abrirAvaliacao(curso)}>
                            <i className="bi bi-star me-1" />
                            Avaliar
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            disabled={pct < 100 || jaTemCertificado(curso.id)}
                            onClick={() => emitirCertificado(curso)}
                          >
                            <i className="bi bi-award me-1" />
                            {jaTemCertificado(curso.id) ? 'Certificado emitido' : 'Emitir Certificado'}
                          </button>
                        </div>
                      </div>
                      <div className="progress progress-custom mb-3">
                        <div
                          className={`progress-bar ${pct === 100 ? 'bg-success' : ''}`}
                          style={{ width: `${pct}%` }}
                        >
                          {pct}%
                        </div>
                      </div>
                      {lista.length === 0 ? (
                        <p className="text-muted mb-0">Este curso não possui aulas cadastradas.</p>
                      ) : (
                        <div className="row">
                          {lista.map((a) => {
                            const concluida = !!progressoDaAula(a.id);
                            return (
                              <div className="col-md-6" key={a.id}>
                                <div className="form-check py-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`aula-${a.id}`}
                                    checked={concluida}
                                    onChange={() => alternarAula(a)}
                                  />
                                  <label
                                    className={`form-check-label ${concluida ? 'text-decoration-line-through text-muted' : ''}`}
                                    htmlFor={`aula-${a.id}`}
                                  >
                                    {a.Titulo}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        show={showAval}
        title={`Avaliar — ${avalCurso?.Titulo ?? ''}`}
        onClose={() => setShowAval(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAval(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvarAvaliacao}>
              Enviar Avaliação
            </button>
          </>
        }
      >
        <FormField label="Nota (1 a 5)">
          <select className="form-select" value={nota} onChange={(e) => setNota(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Comentário">
          <textarea
            className="form-control"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </FormField>
      </Modal>
    </>
  );
}
