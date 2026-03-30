import { dataStore } from '../services/DataStore.js';
import { Modulo } from '../models/Modulo.js';
import { Aula } from '../models/Aula.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const selectCurso = document.getElementById('selectCurso');
const btnNovoModulo = document.getElementById('btnNovoModulo');
const container = document.getElementById('modulosContainer');

const modalModuloEl = document.getElementById('modalModulo');
const modalModulo = new bootstrap.Modal(modalModuloEl);
const formModulo = document.getElementById('formModulo');

const modalAulaEl = document.getElementById('modalAula');
const modalAula = new bootstrap.Modal(modalAulaEl);
const formAula = document.getElementById('formAula');

let cursoAtual = null;

function populateCursos() {
  const cursos = dataStore.getAll('cursos');
  selectCurso.innerHTML = '<option value="">Escolha um curso...</option>';
  cursos.forEach(c => {
    selectCurso.innerHTML += `<option value="${c.ID_Curso}">${c.Titulo}</option>`;
  });
}

function render() {
  if (!cursoAtual) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-collection-play d-block"></i><p>Selecione um curso para gerenciar seus módulos e aulas.</p></div>`;
    btnNovoModulo.disabled = true;
    return;
  }

  btnNovoModulo.disabled = false;
  const modulos = dataStore.getWhere('modulos', m => m.ID_Curso === cursoAtual).sort((a, b) => a.Ordem - b.Ordem);

  if (modulos.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox d-block"></i><p>Nenhum módulo cadastrado para este curso.</p></div>`;
    return;
  }

  let html = '<div class="accordion" id="accordionModulos">';
  modulos.forEach((mod, idx) => {
    const aulas = dataStore.getWhere('aulas', a => a.ID_Modulo === mod.ID_Modulo).sort((a, b) => a.Ordem - b.Ordem);
    const tipoIcon = { 'Vídeo': 'bi-play-circle', 'Texto': 'bi-file-text', 'Quiz': 'bi-question-circle' };

    html += `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button ${idx > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#mod${mod.ID_Modulo}">
          <span class="badge bg-secondary me-2">${mod.Ordem}</span>
          <strong>${mod.Titulo}</strong>
          <span class="badge bg-primary ms-2">${aulas.length} aula(s)</span>
        </button>
      </h2>
      <div id="mod${mod.ID_Modulo}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#accordionModulos">
        <div class="accordion-body">
          <div class="d-flex justify-content-end mb-2">
            <button class="btn btn-sm btn-outline-primary me-1 btn-editar-modulo" data-id="${mod.ID_Modulo}"><i class="bi bi-pencil me-1"></i>Editar Módulo</button>
            <button class="btn btn-sm btn-outline-danger me-2 btn-excluir-modulo" data-id="${mod.ID_Modulo}"><i class="bi bi-trash me-1"></i>Excluir</button>
            <button class="btn btn-sm btn-primary btn-nova-aula" data-modulo="${mod.ID_Modulo}"><i class="bi bi-plus-lg me-1"></i>Nova Aula</button>
          </div>
          ${aulas.length === 0 ? '<p class="text-muted text-center">Nenhuma aula neste módulo.</p>' : `
          <table class="table table-sm table-hover">
            <thead><tr><th>Ordem</th><th>Título</th><th>Tipo</th><th>Duração</th><th class="text-end">Ações</th></tr></thead>
            <tbody>
              ${aulas.map(a => `
                <tr>
                  <td>${a.Ordem}</td>
                  <td><i class="bi ${tipoIcon[a.TipoConteudo] || 'bi-file'} me-1"></i>${a.Titulo}</td>
                  <td><span class="badge bg-info">${a.TipoConteudo}</span></td>
                  <td>${a.DuracaoMinutos} min</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-editar-aula" data-id="${a.ID_Aula}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir-aula" data-id="${a.ID_Aula}"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`}
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.btn-editar-modulo').forEach(btn =>
    btn.addEventListener('click', () => editarModulo(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-excluir-modulo').forEach(btn =>
    btn.addEventListener('click', () => excluirModulo(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-nova-aula').forEach(btn =>
    btn.addEventListener('click', () => novaAula(Number(btn.dataset.modulo)))
  );
  container.querySelectorAll('.btn-editar-aula').forEach(btn =>
    btn.addEventListener('click', () => editarAula(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-excluir-aula').forEach(btn =>
    btn.addEventListener('click', () => excluirAula(Number(btn.dataset.id)))
  );
}

// --- Módulo ---
function resetFormModulo() {
  formModulo.reset();
  document.getElementById('moduloId').value = '';
  clearValidation(formModulo);
  document.getElementById('modalModuloTitulo').textContent = 'Novo Módulo';
  const modulos = dataStore.getWhere('modulos', m => m.ID_Curso === cursoAtual);
  document.getElementById('moduloOrdem').value = modulos.length + 1;
}

function editarModulo(id) {
  const mod = dataStore.getById('modulos', id);
  if (!mod) return;
  resetFormModulo();
  document.getElementById('modalModuloTitulo').textContent = 'Editar Módulo';
  document.getElementById('moduloId').value = mod.ID_Modulo;
  document.getElementById('moduloTitulo').value = mod.Titulo;
  document.getElementById('moduloOrdem').value = mod.Ordem;
  modalModulo.show();
}

function excluirModulo(id) {
  if (!confirm('Excluir módulo e todas as suas aulas?')) return;
  dataStore.deleteWhere('aulas', a => a.ID_Modulo === id);
  dataStore.delete('modulos', id);
  showToast('Módulo excluído.');
  render();
}

function salvarModulo() {
  clearValidation(formModulo);
  let valid = true;
  const inputTitulo = document.getElementById('moduloTitulo');
  const inputOrdem = document.getElementById('moduloOrdem');

  valid = validateField(inputTitulo, [{ test: v => isRequired(v), message: 'Título obrigatório.' }]) && valid;
  valid = validateField(inputOrdem, [{ test: v => parseInt(v) > 0, message: 'Ordem deve ser positiva.' }]) && valid;
  if (!valid) return;

  const editId = document.getElementById('moduloId').value ? Number(document.getElementById('moduloId').value) : null;

  if (editId) {
    dataStore.update('modulos', editId, { Titulo: inputTitulo.value.trim(), Ordem: parseInt(inputOrdem.value) });
    showToast('Módulo atualizado.');
  } else {
    dataStore.add('modulos', new Modulo({ ID_Curso: cursoAtual, Titulo: inputTitulo.value.trim(), Ordem: parseInt(inputOrdem.value) }));
    showToast('Módulo criado.');
  }
  modalModulo.hide();
  render();
}

// --- Aula ---
function novaAula(moduloId) {
  formAula.reset();
  document.getElementById('aulaId').value = '';
  document.getElementById('aulaModuloId').value = moduloId;
  clearValidation(formAula);
  document.getElementById('modalAulaTitulo').textContent = 'Nova Aula';
  const aulas = dataStore.getWhere('aulas', a => a.ID_Modulo === moduloId);
  document.getElementById('aulaOrdem').value = aulas.length + 1;
  modalAula.show();
}

function editarAula(id) {
  const a = dataStore.getById('aulas', id);
  if (!a) return;
  formAula.reset();
  clearValidation(formAula);
  document.getElementById('modalAulaTitulo').textContent = 'Editar Aula';
  document.getElementById('aulaId').value = a.ID_Aula;
  document.getElementById('aulaModuloId').value = a.ID_Modulo;
  document.getElementById('aulaTitulo').value = a.Titulo;
  document.getElementById('aulaTipo').value = a.TipoConteudo;
  document.getElementById('aulaDuracao').value = a.DuracaoMinutos;
  document.getElementById('aulaUrl').value = a.URL_Conteudo;
  document.getElementById('aulaOrdem').value = a.Ordem;
  modalAula.show();
}

function excluirAula(id) {
  if (!confirm('Excluir esta aula?')) return;
  dataStore.delete('aulas', id);
  showToast('Aula excluída.');
  render();
}

function salvarAula() {
  clearValidation(formAula);
  let valid = true;
  const inputTitulo = document.getElementById('aulaTitulo');
  const inputOrdem = document.getElementById('aulaOrdem');

  valid = validateField(inputTitulo, [{ test: v => isRequired(v), message: 'Título obrigatório.' }]) && valid;
  valid = validateField(inputOrdem, [{ test: v => parseInt(v) > 0, message: 'Ordem deve ser positiva.' }]) && valid;
  if (!valid) return;

  const editId = document.getElementById('aulaId').value ? Number(document.getElementById('aulaId').value) : null;
  const moduloId = Number(document.getElementById('aulaModuloId').value);
  const data = {
    ID_Modulo: moduloId,
    Titulo: inputTitulo.value.trim(),
    TipoConteudo: document.getElementById('aulaTipo').value,
    DuracaoMinutos: parseInt(document.getElementById('aulaDuracao').value) || 0,
    URL_Conteudo: document.getElementById('aulaUrl').value.trim(),
    Ordem: parseInt(inputOrdem.value)
  };

  if (editId) {
    dataStore.update('aulas', editId, data);
    showToast('Aula atualizada.');
  } else {
    dataStore.add('aulas', new Aula(data));
    showToast('Aula criada.');
  }
  modalAula.hide();
  render();
}

// --- Events ---
selectCurso.addEventListener('change', () => {
  cursoAtual = selectCurso.value ? Number(selectCurso.value) : null;
  render();
});

btnNovoModulo.addEventListener('click', () => { resetFormModulo(); modalModulo.show(); });
document.getElementById('btnSalvarModulo').addEventListener('click', salvarModulo);
document.getElementById('btnSalvarAula').addEventListener('click', salvarAula);

populateCursos();
render();
