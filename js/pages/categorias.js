import { dataStore } from '../services/DataStore.js';
import { Categoria } from '../models/Categoria.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaCategorias tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formCategoria');
const modalEl = document.getElementById('modalCategoria');
const modal = new bootstrap.Modal(modalEl);
const modalTitulo = document.getElementById('modalTitulo');
const inputId = document.getElementById('categoriaId');
const inputNome = document.getElementById('nome');
const inputDescricao = document.getElementById('descricao');

function render() {
  const categorias = dataStore.getAll('categorias');
  tbody.innerHTML = '';

  if (categorias.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  categorias.forEach(cat => {
    const cursosCount = dataStore.getWhere('cursos', c => c.ID_Categoria === cat.ID_Categoria).length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.ID_Categoria}</td>
      <td><strong>${cat.Nome}</strong></td>
      <td>${cat.Descricao || '<span class="text-muted">—</span>'}</td>
      <td><span class="badge bg-primary rounded-pill">${cursosCount}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${cat.ID_Categoria}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${cat.ID_Categoria}">
          <i class="bi bi-trash"></i>
        </button>
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
  modalTitulo.textContent = 'Nova Categoria';
}

function editar(id) {
  const cat = dataStore.getById('categorias', id);
  if (!cat) return;
  resetForm();
  modalTitulo.textContent = 'Editar Categoria';
  inputId.value = cat.ID_Categoria;
  inputNome.value = cat.Nome;
  inputDescricao.value = cat.Descricao;
  modal.show();
}

function excluir(id) {
  if (!confirm('Deseja realmente excluir esta categoria?')) return;
  const cursosVinculados = dataStore.getWhere('cursos', c => c.ID_Categoria === id);
  if (cursosVinculados.length > 0) {
    showToast('Não é possível excluir: existem cursos vinculados a esta categoria.', 'danger');
    return;
  }
  dataStore.delete('categorias', id);
  showToast('Categoria excluída com sucesso.');
  render();
}

function salvar() {
  clearValidation(form);
  let valid = true;

  valid = validateField(inputNome, [
    { test: v => isRequired(v), message: 'O nome é obrigatório.' }
  ]) && valid;

  const editId = inputId.value ? Number(inputId.value) : null;
  const nomeExiste = dataStore.getWhere('categorias', c =>
    c.Nome.toLowerCase() === inputNome.value.trim().toLowerCase() && c.ID_Categoria !== editId
  );
  if (nomeExiste.length > 0) {
    valid = false;
    const nomeInput = document.getElementById('nome');
    nomeInput.classList.add('is-invalid');
    nomeInput.parentElement.querySelector('.invalid-feedback').textContent = 'Já existe uma categoria com este nome.';
  }

  if (!valid) return;

  if (editId) {
    dataStore.update('categorias', editId, {
      Nome: inputNome.value.trim(),
      Descricao: inputDescricao.value.trim()
    });
    showToast('Categoria atualizada com sucesso.');
  } else {
    const nova = new Categoria({
      Nome: inputNome.value.trim(),
      Descricao: inputDescricao.value.trim()
    });
    dataStore.add('categorias', nova);
    showToast('Categoria cadastrada com sucesso.');
  }

  modal.hide();
  render();
}

document.getElementById('btnNova').addEventListener('click', resetForm);
document.getElementById('btnSalvar').addEventListener('click', salvar);
modalEl.addEventListener('hidden.bs.modal', resetForm);

render();
