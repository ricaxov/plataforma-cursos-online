import { dataStore } from '../services/DataStore.js';
import { Plano } from '../models/Plano.js';
import { isRequired, isPositiveNumber, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaPlanos tbody');
const cardsContainer = document.getElementById('planosContainer');
const form = document.getElementById('formPlano');
const modalEl = document.getElementById('modalPlano');
const modal = new bootstrap.Modal(modalEl);
const modalTitulo = document.getElementById('modalTitulo');
const inputId = document.getElementById('planoId');
const inputNome = document.getElementById('nome');
const inputDescricao = document.getElementById('descricao');
const inputPreco = document.getElementById('preco');
const inputDuracao = document.getElementById('duracao');

const cardColors = ['primary', 'success', 'warning'];

function render() {
  const planos = dataStore.getAll('planos');

  let cards = '';
  planos.forEach((p, i) => {
    const color = cardColors[i % cardColors.length];
    cards += `
    <div class="col-md-4">
      <div class="card text-center p-4 h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-${color} fw-bold">${p.Nome}</h5>
          <p class="text-muted small">${p.Descricao || ''}</p>
          <div class="my-3">
            <span class="fs-2 fw-bold text-${color}">R$ ${parseFloat(p.Preco).toFixed(2)}</span>
            <small class="text-muted d-block">/ ${p.DuracaoMeses} ${p.DuracaoMeses === 1 ? 'mês' : 'meses'}</small>
          </div>
          <a href="assinaturas.html" class="btn btn-${color} mt-auto">Assinar</a>
        </div>
      </div>
    </div>`;
  });
  cardsContainer.innerHTML = cards || '<div class="col-12"><div class="empty-state"><i class="bi bi-inbox d-block"></i><p>Nenhum plano cadastrado.</p></div></div>';

  tbody.innerHTML = '';
  planos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.ID_Plano}</td>
      <td><strong>${p.Nome}</strong></td>
      <td>${p.Descricao || '—'}</td>
      <td>R$ ${parseFloat(p.Preco).toFixed(2)}</td>
      <td>${p.DuracaoMeses} ${p.DuracaoMeses === 1 ? 'mês' : 'meses'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${p.ID_Plano}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${p.ID_Plano}"><i class="bi bi-trash"></i></button>
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
  modalTitulo.textContent = 'Novo Plano';
}

function editar(id) {
  const p = dataStore.getById('planos', id);
  if (!p) return;
  resetForm();
  modalTitulo.textContent = 'Editar Plano';
  inputId.value = p.ID_Plano;
  inputNome.value = p.Nome;
  inputDescricao.value = p.Descricao;
  inputPreco.value = p.Preco;
  inputDuracao.value = p.DuracaoMeses;
  modal.show();
}

function excluir(id) {
  if (!confirm('Excluir este plano?')) return;
  dataStore.delete('planos', id);
  showToast('Plano excluído.');
  render();
}

function salvar() {
  clearValidation(form);
  let valid = true;
  valid = validateField(inputNome, [{ test: v => isRequired(v), message: 'Nome obrigatório.' }]) && valid;
  valid = validateField(inputPreco, [{ test: v => isPositiveNumber(v), message: 'Preço deve ser positivo.' }]) && valid;
  valid = validateField(inputDuracao, [{ test: v => parseInt(v) > 0, message: 'Duração deve ser positiva.' }]) && valid;
  if (!valid) return;

  const editId = inputId.value ? Number(inputId.value) : null;
  const data = {
    Nome: inputNome.value.trim(),
    Descricao: inputDescricao.value.trim(),
    Preco: parseFloat(inputPreco.value),
    DuracaoMeses: parseInt(inputDuracao.value)
  };

  if (editId) {
    dataStore.update('planos', editId, data);
    showToast('Plano atualizado.');
  } else {
    dataStore.add('planos', new Plano(data));
    showToast('Plano criado.');
  }
  modal.hide();
  render();
}

document.getElementById('btnNovo').addEventListener('click', () => { resetForm(); modal.show(); });
document.getElementById('btnSalvar').addEventListener('click', salvar);
modalEl.addEventListener('hidden.bs.modal', resetForm);

render();
