import { dataStore } from '../services/DataStore.js';
import { Trilha } from '../models/Trilha.js';
import { TrilhaCurso } from '../models/TrilhaCurso.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const container = document.getElementById('trilhasContainer');
const modalTrilhaEl = document.getElementById('modalTrilha');
const modalTrilha = new bootstrap.Modal(modalTrilhaEl);
const formTrilha = document.getElementById('formTrilha');

const modalAddCursoEl = document.getElementById('modalAddCurso');
const modalAddCurso = new bootstrap.Modal(modalAddCursoEl);

function render() {
  const trilhas = dataStore.getAll('trilhas');

  if (trilhas.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox d-block"></i><p>Nenhuma trilha cadastrada.</p></div>`;
    return;
  }

  let html = '';
  trilhas.forEach(t => {
    const cat = t.ID_Categoria ? dataStore.getById('categorias', t.ID_Categoria) : null;
    const cursosTrilha = dataStore.getWhere('trilhas_cursos', tc => tc.ID_Trilha === t.ID_Trilha).sort((a, b) => a.Ordem - b.Ordem);

    html += `
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title"><i class="bi bi-signpost-split me-2 text-primary"></i>${t.Titulo}</h5>
            <p class="card-text text-muted">${t.Descricao || 'Sem descrição'}</p>
            ${cat ? `<span class="badge bg-info">${cat.Nome}</span>` : ''}
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary me-1 btn-editar-trilha" data-id="${t.ID_Trilha}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger me-1 btn-excluir-trilha" data-id="${t.ID_Trilha}"><i class="bi bi-trash"></i></button>
            <button class="btn btn-sm btn-primary btn-add-curso" data-id="${t.ID_Trilha}"><i class="bi bi-plus-lg me-1"></i>Curso</button>
          </div>
        </div>
        ${cursosTrilha.length > 0 ? `
        <hr>
        <h6>Cursos na Trilha:</h6>
        <ol class="list-group list-group-numbered">
          ${cursosTrilha.map(tc => {
            const curso = dataStore.getById('cursos', tc.ID_Curso);
            return `<li class="list-group-item d-flex justify-content-between align-items-center">
              ${curso ? curso.Titulo : 'Curso removido'}
              <button class="btn btn-sm btn-outline-danger btn-remove-curso" data-trilha="${tc.ID_Trilha}" data-curso="${tc.ID_Curso}"><i class="bi bi-x-lg"></i></button>
            </li>`;
          }).join('')}
        </ol>` : '<hr><p class="text-muted mb-0"><small>Nenhum curso associado.</small></p>'}
      </div>
    </div>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.btn-editar-trilha').forEach(btn =>
    btn.addEventListener('click', () => editarTrilha(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-excluir-trilha').forEach(btn =>
    btn.addEventListener('click', () => excluirTrilha(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-add-curso').forEach(btn =>
    btn.addEventListener('click', () => abrirAddCurso(Number(btn.dataset.id)))
  );
  container.querySelectorAll('.btn-remove-curso').forEach(btn =>
    btn.addEventListener('click', () => removerCurso(Number(btn.dataset.trilha), Number(btn.dataset.curso)))
  );
}

function populateCategorias() {
  const select = document.getElementById('trilhaCategoria');
  select.innerHTML = '<option value="">Nenhuma</option>';
  dataStore.getAll('categorias').forEach(c => {
    select.innerHTML += `<option value="${c.ID_Categoria}">${c.Nome}</option>`;
  });
}

function resetFormTrilha() {
  formTrilha.reset();
  document.getElementById('trilhaId').value = '';
  clearValidation(formTrilha);
  document.getElementById('modalTrilhaTitulo').textContent = 'Nova Trilha';
  populateCategorias();
}

function editarTrilha(id) {
  const t = dataStore.getById('trilhas', id);
  if (!t) return;
  resetFormTrilha();
  document.getElementById('modalTrilhaTitulo').textContent = 'Editar Trilha';
  document.getElementById('trilhaId').value = t.ID_Trilha;
  document.getElementById('trilhaTitulo').value = t.Titulo;
  document.getElementById('trilhaDescricao').value = t.Descricao;
  document.getElementById('trilhaCategoria').value = t.ID_Categoria || '';
  modalTrilha.show();
}

function excluirTrilha(id) {
  if (!confirm('Excluir esta trilha?')) return;
  dataStore.deleteWhere('trilhas_cursos', tc => tc.ID_Trilha === id);
  dataStore.delete('trilhas', id);
  showToast('Trilha excluída.');
  render();
}

function salvarTrilha() {
  clearValidation(formTrilha);
  const inputTitulo = document.getElementById('trilhaTitulo');
  if (!validateField(inputTitulo, [{ test: v => isRequired(v), message: 'Título obrigatório.' }])) return;

  const editId = document.getElementById('trilhaId').value ? Number(document.getElementById('trilhaId').value) : null;
  const data = {
    Titulo: inputTitulo.value.trim(),
    Descricao: document.getElementById('trilhaDescricao').value.trim(),
    ID_Categoria: document.getElementById('trilhaCategoria').value ? Number(document.getElementById('trilhaCategoria').value) : null
  };

  if (editId) {
    dataStore.update('trilhas', editId, data);
    showToast('Trilha atualizada.');
  } else {
    dataStore.add('trilhas', new Trilha(data));
    showToast('Trilha criada.');
  }
  modalTrilha.hide();
  render();
}

function abrirAddCurso(trilhaId) {
  document.getElementById('addCursoTrilhaId').value = trilhaId;
  const select = document.getElementById('addCursoSelect');
  const existentes = dataStore.getWhere('trilhas_cursos', tc => tc.ID_Trilha === trilhaId).map(tc => tc.ID_Curso);
  const cursos = dataStore.getAll('cursos').filter(c => !existentes.includes(c.ID_Curso));

  select.innerHTML = '<option value="">Selecione...</option>';
  cursos.forEach(c => { select.innerHTML += `<option value="${c.ID_Curso}">${c.Titulo}</option>`; });

  const count = dataStore.getWhere('trilhas_cursos', tc => tc.ID_Trilha === trilhaId).length;
  document.getElementById('addCursoOrdem').value = count + 1;
  clearValidation(document.getElementById('formAddCurso'));
  modalAddCurso.show();
}

function salvarAddCurso() {
  const select = document.getElementById('addCursoSelect');
  if (!validateField(select, [{ test: v => isRequired(v), message: 'Selecione um curso.' }])) return;

  const trilhaId = Number(document.getElementById('addCursoTrilhaId').value);
  dataStore.add('trilhas_cursos', new TrilhaCurso({
    ID_Trilha: trilhaId,
    ID_Curso: Number(select.value),
    Ordem: parseInt(document.getElementById('addCursoOrdem').value) || 1
  }));
  showToast('Curso adicionado à trilha.');
  modalAddCurso.hide();
  render();
}

function removerCurso(trilhaId, cursoId) {
  dataStore.deleteWhere('trilhas_cursos', tc => tc.ID_Trilha === trilhaId && tc.ID_Curso === cursoId);
  showToast('Curso removido da trilha.');
  render();
}

document.getElementById('btnNovaTrilha').addEventListener('click', () => { resetFormTrilha(); modalTrilha.show(); });
document.getElementById('btnSalvarTrilha').addEventListener('click', salvarTrilha);
document.getElementById('btnSalvarAddCurso').addEventListener('click', salvarAddCurso);
modalTrilhaEl.addEventListener('hidden.bs.modal', resetFormTrilha);

render();
