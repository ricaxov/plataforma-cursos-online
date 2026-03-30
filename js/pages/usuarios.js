import { dataStore } from '../services/DataStore.js';
import { Usuario } from '../models/Usuario.js';
import { isRequired, isValidEmail, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaUsuarios tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formUsuario');
const modalEl = document.getElementById('modalUsuario');
const modal = new bootstrap.Modal(modalEl);
const modalTitulo = document.getElementById('modalTitulo');
const inputId = document.getElementById('usuarioId');
const inputNome = document.getElementById('nomeCompleto');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');

function render() {
  const usuarios = dataStore.getAll('usuarios');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  usuarios.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.ID_Usuario}</td>
      <td><strong>${u.NomeCompleto}</strong></td>
      <td>${u.Email}</td>
      <td>${u.DataCadastro}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${u.ID_Usuario}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${u.ID_Usuario}">
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
  modalTitulo.textContent = 'Novo Usuário';
  inputSenha.required = true;
}

function editar(id) {
  const u = dataStore.getById('usuarios', id);
  if (!u) return;
  resetForm();
  modalTitulo.textContent = 'Editar Usuário';
  inputId.value = u.ID_Usuario;
  inputNome.value = u.NomeCompleto;
  inputEmail.value = u.Email;
  inputSenha.required = false;
  inputSenha.placeholder = 'Deixe vazio para manter a atual';
  modal.show();
}

function excluir(id) {
  if (!confirm('Deseja realmente excluir este usuário?')) return;
  dataStore.delete('usuarios', id);
  showToast('Usuário excluído com sucesso.');
  render();
}

function salvar() {
  clearValidation(form);
  let valid = true;
  const editId = inputId.value ? Number(inputId.value) : null;

  valid = validateField(inputNome, [
    { test: v => isRequired(v), message: 'O nome é obrigatório.' }
  ]) && valid;

  valid = validateField(inputEmail, [
    { test: v => isRequired(v), message: 'O e-mail é obrigatório.' },
    { test: v => isValidEmail(v), message: 'Formato de e-mail inválido.' }
  ]) && valid;

  if (!editId) {
    valid = validateField(inputSenha, [
      { test: v => isRequired(v), message: 'A senha é obrigatória.' },
      { test: v => v.length >= 4, message: 'A senha deve ter ao menos 4 caracteres.' }
    ]) && valid;
  }

  const emailExiste = dataStore.getWhere('usuarios', u =>
    u.Email.toLowerCase() === inputEmail.value.trim().toLowerCase() && u.ID_Usuario !== editId
  );
  if (emailExiste.length > 0) {
    valid = false;
    inputEmail.classList.add('is-invalid');
    inputEmail.parentElement.querySelector('.invalid-feedback').textContent = 'Este e-mail já está cadastrado.';
  }

  if (!valid) return;

  if (editId) {
    const updates = {
      NomeCompleto: inputNome.value.trim(),
      Email: inputEmail.value.trim()
    };
    if (inputSenha.value) updates.SenhaHash = '***';
    dataStore.update('usuarios', editId, updates);
    showToast('Usuário atualizado com sucesso.');
  } else {
    const novo = new Usuario({
      NomeCompleto: inputNome.value.trim(),
      Email: inputEmail.value.trim(),
      SenhaHash: '***'
    });
    dataStore.add('usuarios', novo);
    showToast('Usuário cadastrado com sucesso.');
  }

  modal.hide();
  render();
}

document.getElementById('btnNovo').addEventListener('click', resetForm);
document.getElementById('btnSalvar').addEventListener('click', salvar);
modalEl.addEventListener('hidden.bs.modal', () => {
  resetForm();
  inputSenha.placeholder = '';
});

render();
