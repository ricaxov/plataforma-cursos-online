import { dataStore } from '../services/DataStore.js';
import { Assinatura } from '../models/Assinatura.js';
import { isRequired, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaAssinaturas tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formAssinatura');
const modalEl = document.getElementById('modalAssinatura');
const modal = new bootstrap.Modal(modalEl);
const selectUsuario = document.getElementById('selectUsuario');
const selectPlano = document.getElementById('selectPlano');
const planoInfo = document.getElementById('planoInfo');

function populateSelects() {
  selectUsuario.innerHTML = '<option value="">Selecione...</option>';
  dataStore.getAll('usuarios').forEach(u => {
    selectUsuario.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`;
  });

  selectPlano.innerHTML = '<option value="">Selecione...</option>';
  dataStore.getAll('planos').forEach(p => {
    selectPlano.innerHTML += `<option value="${p.ID_Plano}">${p.Nome} - R$ ${parseFloat(p.Preco).toFixed(2)}/${p.DuracaoMeses}m</option>`;
  });
}

function render() {
  const assinaturas = dataStore.getAll('assinaturas');
  tbody.innerHTML = '';

  if (assinaturas.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  assinaturas.forEach(a => {
    const usuario = dataStore.getById('usuarios', a.ID_Usuario);
    const plano = dataStore.getById('planos', a.ID_Plano);
    const hoje = new Date().toISOString().split('T')[0];
    const ativa = a.DataFim >= hoje;
    const status = ativa
      ? '<span class="badge bg-success">Ativa</span>'
      : '<span class="badge bg-danger">Expirada</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.ID_Assinatura}</td>
      <td>${usuario ? usuario.NomeCompleto : '—'}</td>
      <td>${plano ? plano.Nome : '—'}</td>
      <td>${a.DataInicio}</td>
      <td>${a.DataFim}</td>
      <td>${status}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${a.ID_Assinatura}"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn =>
    btn.addEventListener('click', () => {
      if (!confirm('Cancelar esta assinatura?')) return;
      dataStore.delete('assinaturas', Number(btn.dataset.id));
      showToast('Assinatura cancelada.');
      render();
    })
  );
}

selectPlano.addEventListener('change', () => {
  const plano = dataStore.getById('planos', Number(selectPlano.value));
  if (plano) {
    const inicio = new Date();
    const fim = new Date();
    fim.setMonth(fim.getMonth() + plano.DuracaoMeses);
    planoInfo.classList.remove('d-none');
    planoInfo.innerHTML = `<strong>${plano.Nome}</strong>: R$ ${parseFloat(plano.Preco).toFixed(2)} por ${plano.DuracaoMeses} mês(es)<br>Vigência: ${inicio.toISOString().split('T')[0]} a ${fim.toISOString().split('T')[0]}`;
  } else {
    planoInfo.classList.add('d-none');
  }
});

function salvar() {
  clearValidation(form);
  let valid = true;
  valid = validateField(selectUsuario, [{ test: v => isRequired(v), message: 'Selecione um usuário.' }]) && valid;
  valid = validateField(selectPlano, [{ test: v => isRequired(v), message: 'Selecione um plano.' }]) && valid;
  if (!valid) return;

  const plano = dataStore.getById('planos', Number(selectPlano.value));
  const inicio = new Date();
  const fim = new Date();
  fim.setMonth(fim.getMonth() + plano.DuracaoMeses);

  const assinatura = new Assinatura({
    ID_Usuario: Number(selectUsuario.value),
    ID_Plano: Number(selectPlano.value),
    DataInicio: inicio.toISOString().split('T')[0],
    DataFim: fim.toISOString().split('T')[0]
  });

  dataStore.add('assinaturas', assinatura);
  showToast('Assinatura realizada com sucesso!');
  modal.hide();
  render();
}

document.getElementById('btnNova').addEventListener('click', () => {
  form.reset();
  clearValidation(form);
  planoInfo.classList.add('d-none');
  populateSelects();
  if (dataStore.getAll('usuarios').length === 0 || dataStore.getAll('planos').length === 0) {
    showToast('Cadastre usuários e planos antes de criar assinaturas.', 'warning');
    return;
  }
  modal.show();
});
document.getElementById('btnSalvar').addEventListener('click', salvar);

populateSelects();
render();
