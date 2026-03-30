export class Categoria {
  constructor({ ID_Categoria = null, Nome, Descricao = '' }) {
    this.ID_Categoria = ID_Categoria;
    this.Nome = Nome;
    this.Descricao = Descricao;
  }
}
