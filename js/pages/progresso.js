import { dataStore } from '../services/DataStore.js';
import { ProgressoAula } from '../models/ProgressoAula.js';
import { Certificado } from '../models/Certificado.js';
import { Avaliacao } from '../models/Avaliacao.js';
import { showToast, isRequired, clearValidation, validateField } from '../utils/validation.js';

const selectUsuario = document.getElementById('selectUsuario');
const selectCurso = document.getElementById('selectCurso');
const container = document.getElementById('aulasContainer');
const progressBarDiv = document.getElementById('progressBar');
const barProgress = document.getElementById('barProgress');
const progressPercent = document.getElementById('progressPercent');

let usuarioAtual = null;
let cursoAtual = null;

function populateUsuarios() {
  selectUsuario.innerHTML = '<option value="">Selecione um aluno...</option>';
  dataStore.getAll('usuarios').forEach(u => {
    selectUsuario.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`;
  });
}

function populateCursos() {
  selectCurso.innerHTML = '<option value="">Selecione um curso...</option>';
  if (!usuarioAtual) {
    selectCurso.disabled = true;
    return;
  }
  selectCurso.disabled = false;
  const matriculas = dataStore.getWhere('matriculas', m => m.ID_Usuario === usuarioAtual);
  matriculas.forEach(m => {
    const curso = dataStore.getById('cursos', m.ID_Curso);
    if (curso) selectCurso.innerHTML += `<option value="${curso.ID_Curso}">${curso.Titulo}</option>`;
  });
}

function getAllAulasCurso(cursoId) {
  const modulos = dataStore.getWhere('modulos', m => m.ID_Curso === cursoId).sort((a, b) => a.Ordem - b.Ordem);
  const aulas = [];
  modulos.forEach(mod => {
    const aulasModulo = dataStore.getWhere('aulas', a => a.ID_Modulo === mod.ID_Modulo).sort((a, b) => a.Ordem - b.Ordem);
    aulasModulo.forEach(a => aulas.push({ ...a, moduloTitulo: mod.Titulo, moduloOrdem: mod.Ordem }));
  });
  return aulas;
}

function render() {
  if (!usuarioAtual || !cursoAtual) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-graph-up d-block"></i><p>Selecione um aluno e curso para visualizar o progresso.</p></div>`;
    progressBarDiv.classList.add('d-none');
    progressPercent.innerHTML = '<span class="fs-3 fw-bold text-primary">—</span>';
    return;
  }

  const aulas = getAllAulasCurso(cursoAtual);

  if (aulas.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox d-block"></i><p>Este curso não possui aulas cadastradas.</p></div>`;
    progressBarDiv.classList.add('d-none');
    return;
  }

  const concluidas = aulas.filter(a =>
    dataStore.getWhere('progresso_aulas', p => p.ID_Usuario === usuarioAtual && p.ID_Aula === a.ID_Aula).length > 0
  );
  const percent = Math.round((concluidas.length / aulas.length) * 100);

  progressBarDiv.classList.remove('d-none');
  barProgress.style.width = percent + '%';
  barProgress.textContent = percent + '%';
  progressPercent.innerHTML = `<span class="fs-3 fw-bold text-primary">${percent}%</span>`;

  let currentMod = null;
  let html = '';

  aulas.forEach(a => {
    if (currentMod !== a.ID_Modulo) {
      if (currentMod !== null) html += '</div></div>';
      currentMod = a.ID_Modulo;
      html += `<div class="card mb-3"><div class="card-body">
        <h6 class="fw-bold"><i class="bi bi-folder me-2"></i>Módulo ${a.moduloOrdem}: ${a.moduloTitulo}</h6>`;
    }

    const isDone = concluidas.some(c => c.ID_Aula === a.ID_Aula);
    html += `
      <div class="form-check py-2 border-bottom">
        <input class="form-check-input aula-check" type="checkbox" id="aula${a.ID_Aula}" data-aula="${a.ID_Aula}" ${isDone ? 'checked' : ''}>
        <label class="form-check-label ${isDone ? 'text-decoration-line-through text-muted' : ''}" for="aula${a.ID_Aula}">
          ${a.Titulo} <small class="text-muted">(${a.DuracaoMinutos} min - ${a.TipoConteudo})</small>
        </label>
      </div>`;
  });
  if (currentMod !== null) html += '</div></div>';

  if (percent === 100) {
    const certExiste = dataStore.getWhere('certificados', c => c.ID_Usuario === usuarioAtual && c.ID_Curso === cursoAtual);
    if (certExiste.length === 0) {
      html += `<div class="text-center my-3">
        <button class="btn btn-success btn-lg" id="btnGerarCert"><i class="bi bi-award me-2"></i>Gerar Certificado</button>
      </div>`;
    } else {
      html += `<div class="alert alert-success text-center"><i class="bi bi-award me-2"></i>Certificado já emitido! Código: <strong>${certExiste[0].CodigoVerificacao}</strong></div>`;
    }
  }

  container.innerHTML = html;

  container.querySelectorAll('.aula-check').forEach(cb => {
    cb.addEventListener('change', (e) => toggleAula(Number(e.target.dataset.aula), e.target.checked));
  });

  const btnCert = document.getElementById('btnGerarCert');
  if (btnCert) btnCert.addEventListener('click', gerarCertificado);
}

function toggleAula(aulaId, checked) {
  if (checked) {
    const existing = dataStore.getWhere('progresso_aulas', p => p.ID_Usuario === usuarioAtual && p.ID_Aula === aulaId);
    if (existing.length === 0) {
      dataStore.add('progresso_aulas', new ProgressoAula({ ID_Usuario: usuarioAtual, ID_Aula: aulaId }));
    }
  } else {
    dataStore.deleteWhere('progresso_aulas', p => p.ID_Usuario === usuarioAtual && p.ID_Aula === aulaId);
  }
  render();
}

function gerarCertificado() {
  const cert = new Certificado({ ID_Usuario: usuarioAtual, ID_Curso: cursoAtual });
  dataStore.add('certificados', cert);

  const matricula = dataStore.getWhere('matriculas', m => m.ID_Usuario === usuarioAtual && m.ID_Curso === cursoAtual);
  if (matricula.length > 0) {
    dataStore.update('matriculas', matricula[0].ID_Matricula, { DataConclusao: new Date().toISOString().split('T')[0] });
  }

  showToast(`Certificado gerado! Código: ${cert.CodigoVerificacao}`);
  render();
}

function renderAvaliacao() {
  const section = document.getElementById('avaliacaoSection');
  const existente = document.getElementById('avaliacaoExistente');
  const formAval = document.getElementById('formAvaliacao');

  if (!usuarioAtual || !cursoAtual) {
    section.classList.add('d-none');
    return;
  }
  section.classList.remove('d-none');

  const aval = dataStore.getWhere('avaliacoes', a => a.ID_Usuario === usuarioAtual && a.ID_Curso === cursoAtual);
  if (aval.length > 0) {
    formAval.classList.add('d-none');
    existente.classList.remove('d-none');
    const stars = '★'.repeat(aval[0].Nota) + '☆'.repeat(5 - aval[0].Nota);
    existente.innerHTML = `<div class="alert alert-info mb-0">
      <strong>Sua avaliação:</strong> <span class="text-warning fs-5">${stars}</span> (${aval[0].Nota}/5)
      ${aval[0].Comentario ? `<br><em>"${aval[0].Comentario}"</em>` : ''}
    </div>`;
  } else {
    formAval.classList.remove('d-none');
    existente.classList.add('d-none');
  }
}

function enviarAvaliacao() {
  const selectNota = document.getElementById('avalNota');
  const inputComentario = document.getElementById('avalComentario');

  clearValidation(document.getElementById('formAvaliacao'));
  if (!validateField(selectNota, [{ test: v => isRequired(v), message: 'Selecione uma nota.' }])) return;

  dataStore.add('avaliacoes', new Avaliacao({
    ID_Usuario: usuarioAtual,
    ID_Curso: cursoAtual,
    Nota: parseInt(selectNota.value),
    Comentario: inputComentario.value.trim()
  }));

  showToast('Avaliação enviada!');
  selectNota.value = '';
  inputComentario.value = '';
  renderAvaliacao();
}

selectCurso.addEventListener('change', () => {
  cursoAtual = selectCurso.value ? Number(selectCurso.value) : null;
  render();
  renderAvaliacao();
});

selectUsuario.addEventListener('change', () => {
  usuarioAtual = selectUsuario.value ? Number(selectUsuario.value) : null;
  cursoAtual = null;
  populateCursos();
  render();
  renderAvaliacao();
});

document.getElementById('btnAvaliar').addEventListener('click', enviarAvaliacao);

populateUsuarios();
render();
