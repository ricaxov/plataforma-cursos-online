export class Plano {
  constructor({ ID_Plano = null, Nome, Descricao = '', Preco, DuracaoMeses }) {
    this.ID_Plano = ID_Plano;
    this.Nome = Nome;
    this.Descricao = Descricao;
    this.Preco = Preco;
    this.DuracaoMeses = DuracaoMeses;
  }
}
