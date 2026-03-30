export class Pagamento {
  constructor({ ID_Pagamento = null, ID_Assinatura, ValorPago, DataPagamento = new Date().toISOString().split('T')[0], MetodoPagamento, Id_Transacao_Gateway = '', DataFim }) {
    this.ID_Pagamento = ID_Pagamento;
    this.ID_Assinatura = ID_Assinatura;
    this.ValorPago = ValorPago;
    this.DataPagamento = DataPagamento;
    this.MetodoPagamento = MetodoPagamento;
    this.Id_Transacao_Gateway = Id_Transacao_Gateway || Pagamento.gerarTransacaoId();
    this.DataFim = DataFim;
  }

  static gerarTransacaoId() {
    return 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
}
