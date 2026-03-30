import { dataStore } from '../services/DataStore.js';
import { Curso } from '../models/Curso.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaCursos tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formCurso');
const modalEl = document.getElementById('modalCurso');
const modal = new bootstrap.Modal(modalEl);
const modalTitulo = document.getElementById('modalTitulo');
const filtroCategoria = document.getElementById('filtroCategoria');

const inputId = document.getElementById('cursoId');
const inputTitulo = document.getElementById('titulo');
const inputDescricao = document.getElementById('descricao');
const selectCategoria = document.getElementById('categoria');
const selectInstrutor = document.getElementById('instrutor');
const selectNivel = document.getElementById('nivel');
const inputData = document.getElementById('dataPublicacao');
const inputAulas = document.getElementById('totalAulas');
const inputHoras = document.getElementById('totalHoras');

function nivelBadge(nivel) {
  const map = { 'Iniciante': 'bg-success', 'Intermediário': 'bg-warning text-dark', 'Avançado': 'bg-danger' };
  return `<span class="badge badge-nivel ${map[nivel] || 'bg-secondary'}">${nivel}</span>`;
}

function populateSelects() {
  const categorias = dataStore.getAll('categorias');
  const usuarios = dataStore.getAll('usuarios');

  selectCategoria.innerHTML = '<option value="">Selecione...</option>';
  categorias.forEach(c => {
    selectCategoria.innerHTML += `<option value="${c.ID_Categoria}">${c.Nome}</option>`;
  });

  selectInstrutor.innerHTML = '<option value="">Selecione...</option>';
  usuarios.forEach(u => {
    selectInstrutor.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`;
  });

  filtroCategoria.innerHTML = '<option value="">Todas as categorias</option>';
  categorias.forEach(c => {
    filtroCategoria.innerHTML += `<option value="${c.ID_Categoria}">${c.Nome}</option>`;
  });
}

function render() {
  const filtro = filtroCategoria.value ? Number(filtroCategoria.value) : null;
  let cursos = dataStore.getAll('cursos');
  if (filtro) cursos = cursos.filter(c => c.ID_Categoria === filtro);

  tbody.innerHTML = '';
  if (cursos.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  cursos.forEach(c => {
    const cat = dataStore.getById('categorias', c.ID_Categoria);
    const inst = dataStore.getById('usuarios', c.ID_Instrutor);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.ID_Curso}</td>
      <td><strong>${c.Titulo}</strong></td>
      <td>${cat ? cat.Nome : '—'}</td>
      <td>${inst ? inst.NomeCompleto : '—'}</td>
      <td>${nivelBadge(c.Nivel)}</td>
      <td>${c.TotalAulas}</td>
      <td>${c.TotalHoras}h</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${c.ID_Curso}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${c.ID_Curso}"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-editar').forEach(btn =>
    btn.addEventListener('click', () => editar(Number(btn.dataset.id)))
  );
  tbody.querySelectorAll('.btn-excluir').forEach(btn =>
    btn.addEventListener('click', () => excluir(Number(btn.dataset.id)))
  );
}

function resetForm() {
  form.reset();
  inputId.value = '';
  clearValidation(form);
  modalTitulo.textContent = 'Novo Curso';
  inputData.value = new Date().toISOString().split('T')[0];
  populateSelects();
}

function editar(id) {
  const c = dataStore.getById('cursos', id);
  if (!c) return;
  resetForm();
  modalTitulo.textContent = 'Editar Curso';
  inputId.value = c.ID_Curso;
  inputTitulo.value = c.Titulo;
  inputDescricao.value = c.Descricao;
  selectCategoria.value = c.ID_Categoria;
  selectInstrutor.value = c.ID_Instrutor;
  selectNivel.value = c.Nivel;
  inputData.value = c.DataPublicacao;
  inputAulas.value = c.TotalAulas;
  inputHoras.value = c.TotalHoras;
  modal.show();
}

function excluir(id) {
  if (!confirm('Deseja realmente excluir este curso?')) return;
  dataStore.delete('cursos', id);
  showToast('Curso excluído com sucesso.');
  render();
}

function salvar() {
  clearValidation(form);
  let valid = true;

  valid = validateField(inputTitulo, [
    { test: v => isRequired(v), message: 'O título é obrigatório.' }
  ]) && valid;

  valid = validateField(selectCategoria, [
    { test: v => isRequired(v), message: 'Selecione uma categoria.' }
  ]) && valid;

  valid = validateField(selectInstrutor, [
    { test: v => isRequired(v), message: 'Selecione um instrutor.' }
  ]) && valid;

  if (!valid) return;

  const editId = inputId.value ? Number(inputId.value) : null;
  const data = {
    Titulo: inputTitulo.value.trim(),
    Descricao: inputDescricao.value.trim(),
    ID_Categoria: Number(selectCategoria.value),
    ID_Instrutor: Number(selectInstrutor.value),
    Nivel: selectNivel.value,
    DataPublicacao: inputData.value || new Date().toISOString().split('T')[0],
    TotalAulas: parseInt(inputAulas.value) || 0,
    TotalHoras: parseFloat(inputHoras.value) || 0
  };

  if (editId) {
    dataStore.update('cursos', editId, data);
    showToast('Curso atualizado com sucesso.');
  } else {
    const novo = new Curso(data);
    dataStore.add('cursos', novo);
    showToast('Curso cadastrado com sucesso.');
  }

  modal.hide();
  render();
}

document.getElementById('btnNovo').addEventListener('click', resetForm);
document.getElementById('btnSalvar').addEventListener('click', salvar);
filtroCategoria.addEventListener('change', render);
modalEl.addEventListener('hidden.bs.modal', resetForm);

populateSelects();
render();
