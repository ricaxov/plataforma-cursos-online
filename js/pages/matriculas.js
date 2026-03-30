import { dataStore } from '../services/DataStore.js';
import { Matricula } from '../models/Matricula.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaMatriculas tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formMatricula');
const modalEl = document.getElementById('modalMatricula');
const modal = new bootstrap.Modal(modalEl);
const selectUsuario = document.getElementById('selectUsuario');
const selectCurso = document.getElementById('selectCurso');

function populateSelects() {
  selectUsuario.innerHTML = '<option value="">Selecione...</option>';
  dataStore.getAll('usuarios').forEach(u => {
    selectUsuario.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`;
  });

  selectCurso.innerHTML = '<option value="">Selecione...</option>';
  dataStore.getAll('cursos').forEach(c => {
    selectCurso.innerHTML += `<option value="${c.ID_Curso}">${c.Titulo}</option>`;
  });
}

function render() {
  const matriculas = dataStore.getAll('matriculas');
  tbody.innerHTML = '';

  if (matriculas.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  matriculas.forEach(m => {
    const usuario = dataStore.getById('usuarios', m.ID_Usuario);
    const curso = dataStore.getById('cursos', m.ID_Curso);
    const status = m.DataConclusao
      ? '<span class="badge bg-success">Concluído</span>'
      : '<span class="badge bg-warning text-dark">Em Andamento</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.ID_Matricula}</td>
      <td>${usuario ? usuario.NomeCompleto : '—'}</td>
      <td>${curso ? curso.Titulo : '—'}</td>
      <td>${m.DataMatricula}</td>
      <td>${m.DataConclusao || '—'}</td>
      <td>${status}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${m.ID_Matricula}"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn =>
    btn.addEventListener('click', () => excluir(Number(btn.dataset.id)))
  );
}

function excluir(id) {
  if (!confirm('Deseja cancelar esta matrícula?')) return;
  dataStore.delete('matriculas', id);
  showToast('Matrícula cancelada.');
  render();
}

function salvar() {
  clearValidation(form);
  let valid = true;

  valid = validateField(selectUsuario, [{ test: v => isRequired(v), message: 'Selecione um aluno.' }]) && valid;
  valid = validateField(selectCurso, [{ test: v => isRequired(v), message: 'Selecione um curso.' }]) && valid;

  if (!valid) return;

  const userId = Number(selectUsuario.value);
  const cursoId = Number(selectCurso.value);

  const jaMatriculado = dataStore.getWhere('matriculas', m => m.ID_Usuario === userId && m.ID_Curso === cursoId);
  if (jaMatriculado.length > 0) {
    showToast('Este aluno já está matriculado neste curso.', 'danger');
    return;
  }

  dataStore.add('matriculas', new Matricula({ ID_Usuario: userId, ID_Curso: cursoId }));
  showToast('Matrícula realizada com sucesso!');
  modal.hide();
  render();
}

document.getElementById('btnNova').addEventListener('click', () => {
  form.reset();
  document.getElementById('matriculaId').value = '';
  clearValidation(form);
  populateSelects();
  if (dataStore.getAll('usuarios').length === 0 || dataStore.getAll('cursos').length === 0) {
    showToast('Cadastre usuários e cursos antes de criar matrículas.', 'warning');
    return;
  }
  modal.show();
});
document.getElementById('btnSalvar').addEventListener('click', salvar);

populateSelects();
render();
