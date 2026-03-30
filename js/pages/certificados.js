import { dataStore } from '../services/DataStore.js';
import { showToast } from '../utils/validation.js';

const container = document.getElementById('certificadosContainer');
const inputVerificacao = document.getElementById('inputVerificacao');
const resultadoVerificacao = document.getElementById('resultadoVerificacao');
const certificadoVisual = document.getElementById('certificadoVisual');
const modalCertEl = document.getElementById('modalCertificado');
const modalCert = new bootstrap.Modal(modalCertEl);

function render() {
  const certificados = dataStore.getAll('certificados');

  if (certificados.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox d-block"></i><p>Nenhum certificado emitido ainda.</p></div>`;
    return;
  }

  let html = '';
  certificados.forEach(cert => {
    const usuario = dataStore.getById('usuarios', cert.ID_Usuario);
    const curso = dataStore.getById('cursos', cert.ID_Curso);

    html += `
    <div class="col-md-6">
      <div class="card p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="fw-bold"><i class="bi bi-award text-warning me-2"></i>${curso ? curso.Titulo : 'Curso'}</h6>
            <p class="mb-1"><small class="text-muted">Aluno:</small> ${usuario ? usuario.NomeCompleto : '—'}</p>
            <p class="mb-1"><small class="text-muted">Emissão:</small> ${cert.DataEmissao}</p>
            <p class="mb-0"><small class="text-muted">Código:</small> <code>${cert.CodigoVerificacao}</code></p>
          </div>
          <button class="btn btn-sm btn-outline-primary btn-ver" data-id="${cert.ID_Certificado}">
            <i class="bi bi-eye me-1"></i>Visualizar
          </button>
        </div>
      </div>
    </div>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.btn-ver').forEach(btn =>
    btn.addEventListener('click', () => visualizar(Number(btn.dataset.id)))
  );
}

function visualizar(id) {
  const cert = dataStore.getById('certificados', id);
  if (!cert) return;
  const usuario = dataStore.getById('usuarios', cert.ID_Usuario);
  const curso = dataStore.getById('cursos', cert.ID_Curso);

  certificadoVisual.innerHTML = `
    <div class="certificate-card">
      <div class="mb-3">
        <i class="bi bi-mortarboard-fill text-primary" style="font-size: 3rem;"></i>
      </div>
      <h6 class="text-uppercase text-muted">Certificado de Conclusão</h6>
      <h3 class="my-3">Ricardo Plataforma</h3>
      <p class="fs-5">Certificamos que</p>
      <h4 class="fw-bold my-3">${usuario ? usuario.NomeCompleto : '—'}</h4>
      <p class="fs-5">concluiu com êxito o curso</p>
      <h4 class="fw-bold text-primary my-3">${curso ? curso.Titulo : '—'}</h4>
      <p class="text-muted">com carga horária total de <strong>${curso ? curso.TotalHoras : 0} horas</strong></p>
      <hr class="my-4" style="max-width: 200px; margin: 0 auto;">
      <p class="mb-1"><small>Data de emissão: <strong>${cert.DataEmissao}</strong></small></p>
      <p class="mb-0"><small>Código de verificação: <code class="fs-6">${cert.CodigoVerificacao}</code></small></p>
    </div>`;

  modalCert.show();
}

function verificarCertificado() {
  const codigo = inputVerificacao.value.trim().toUpperCase();
  if (!codigo) {
    resultadoVerificacao.innerHTML = '<div class="alert alert-warning py-2">Digite um código.</div>';
    return;
  }

  const cert = dataStore.getWhere('certificados', c => c.CodigoVerificacao.toUpperCase() === codigo);
  if (cert.length > 0) {
    const c = cert[0];
    const usuario = dataStore.getById('usuarios', c.ID_Usuario);
    const curso = dataStore.getById('cursos', c.ID_Curso);
    resultadoVerificacao.innerHTML = `
      <div class="alert alert-success py-2">
        <i class="bi bi-check-circle me-2"></i><strong>Certificado válido!</strong><br>
        Aluno: ${usuario ? usuario.NomeCompleto : '—'} | Curso: ${curso ? curso.Titulo : '—'} | Emissão: ${c.DataEmissao}
      </div>`;
  } else {
    resultadoVerificacao.innerHTML = `<div class="alert alert-danger py-2"><i class="bi bi-x-circle me-2"></i>Certificado não encontrado.</div>`;
  }
}

document.getElementById('btnVerificar').addEventListener('click', verificarCertificado);
inputVerificacao.addEventListener('keyup', e => { if (e.key === 'Enter') verificarCertificado(); });

render();
