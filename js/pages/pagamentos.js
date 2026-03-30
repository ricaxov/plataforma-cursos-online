import { dataStore } from '../services/DataStore.js';
import { Pagamento } from '../models/Pagamento.js';
import { isRequired, isPositiveNumber, clearValidation, validateField, showToast } from '../utils/validation.js';

const tbody = document.querySelector('#tabelaPagamentos tbody');
const emptyState = document.getElementById('emptyState');
const form = document.getElementById('formPagamento');
const modalEl = document.getElementById('modalPagamento');
const modal = new bootstrap.Modal(modalEl);
const selectAssinatura = document.getElementById('selectAssinatura');
const inputValor = document.getElementById('valorPago');
const selectMetodo = document.getElementById('metodo');
const checkoutPreview = document.getElementById('checkoutPreview');
const checkoutDetails = document.getElementById('checkoutDetails');

function populateAssinaturas() {
  selectAssinatura.innerHTML = '<option value="">Selecione...</option>';
  dataStore.getAll('assinaturas').forEach(a => {
    const usuario = dataStore.getById('usuarios', a.ID_Usuario);
    const plano = dataStore.getById('planos', a.ID_Plano);
    selectAssinatura.innerHTML += `<option value="${a.ID_Assinatura}" data-preco="${plano ? plano.Preco : 0}">#${a.ID_Assinatura} - ${usuario ? usuario.NomeCompleto : '?'} (${plano ? plano.Nome : '?'})</option>`;
  });
}

function render() {
  const pagamentos = dataStore.getAll('pagamentos');
  tbody.innerHTML = '';

  if (pagamentos.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  pagamentos.forEach(p => {
    const assinatura = dataStore.getById('assinaturas', p.ID_Assinatura);
    let assinaturaLabel = `#${p.ID_Assinatura}`;
    if (assinatura) {
      const usuario = dataStore.getById('usuarios', assinatura.ID_Usuario);
      const plano = dataStore.getById('planos', assinatura.ID_Plano);
      assinaturaLabel = `${usuario ? usuario.NomeCompleto : '?'} - ${plano ? plano.Nome : '?'}`;
    }

    const metodoBadge = {
      'Cartão de Crédito': 'bg-primary',
      'Cartão de Débito': 'bg-info',
      'PIX': 'bg-success',
      'Boleto': 'bg-warning text-dark'
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.ID_Pagamento}</td>
      <td>${assinaturaLabel}</td>
      <td>R$ ${parseFloat(p.ValorPago).toFixed(2)}</td>
      <td>${p.DataPagamento}</td>
      <td><span class="badge ${metodoBadge[p.MetodoPagamento] || 'bg-secondary'}">${p.MetodoPagamento}</span></td>
      <td><code>${p.Id_Transacao_Gateway}</code></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${p.ID_Pagamento}"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn =>
    btn.addEventListener('click', () => {
      if (!confirm('Estornar este pagamento?')) return;
      dataStore.delete('pagamentos', Number(btn.dataset.id));
      showToast('Pagamento estornado.');
      render();
    })
  );
}

function updatePreview() {
  const assinaturaId = selectAssinatura.value;
  const metodo = selectMetodo.value;
  const valor = inputValor.value;

  if (assinaturaId && metodo && valor) {
    checkoutPreview.classList.remove('d-none');
    const option = selectAssinatura.options[selectAssinatura.selectedIndex];
    checkoutDetails.innerHTML = `
      <p class="mb-1">Assinatura: <strong>${option.text}</strong></p>
      <p class="mb-1">Valor: <strong>R$ ${parseFloat(valor).toFixed(2)}</strong></p>
      <p class="mb-0">Método: <strong>${metodo}</strong></p>`;
  } else {
    checkoutPreview.classList.add('d-none');
  }
}

selectAssinatura.addEventListener('change', () => {
  const option = selectAssinatura.options[selectAssinatura.selectedIndex];
  if (option && option.dataset.preco) {
    inputValor.value = parseFloat(option.dataset.preco).toFixed(2);
  }
  updatePreview();
});
selectMetodo.addEventListener('change', updatePreview);
inputValor.addEventListener('input', updatePreview);

function salvar() {
  clearValidation(form);
  let valid = true;
  valid = validateField(selectAssinatura, [{ test: v => isRequired(v), message: 'Selecione uma assinatura.' }]) && valid;
  valid = validateField(inputValor, [{ test: v => isPositiveNumber(v), message: 'Valor deve ser positivo.' }]) && valid;
  valid = validateField(selectMetodo, [{ test: v => isRequired(v), message: 'Selecione um método.' }]) && valid;
  if (!valid) return;

  const assinatura = dataStore.getById('assinaturas', Number(selectAssinatura.value));
  const pagamento = new Pagamento({
    ID_Assinatura: Number(selectAssinatura.value),
    ValorPago: parseFloat(inputValor.value),
    MetodoPagamento: selectMetodo.value,
    DataFim: assinatura ? assinatura.DataFim : new Date().toISOString().split('T')[0]
  });

  dataStore.add('pagamentos', pagamento);
  showToast(`Pagamento confirmado! Transação: ${pagamento.Id_Transacao_Gateway}`);
  modal.hide();
  render();
}

document.getElementById('btnNovo').addEventListener('click', () => {
  form.reset();
  clearValidation(form);
  checkoutPreview.classList.add('d-none');
  populateAssinaturas();
  if (dataStore.getAll('assinaturas').length === 0) {
    showToast('Nenhuma assinatura encontrada. Crie uma assinatura primeiro na página de Assinaturas.', 'warning');
    return;
  }
  modal.show();
});
document.getElementById('btnConfirmar').addEventListener('click', salvar);

populateAssinaturas();
render();
