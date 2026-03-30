export class Trilha {
  constructor({ ID_Trilha = null, Titulo, Descricao = '', ID_Categoria = null }) {
    this.ID_Trilha = ID_Trilha;
    this.Titulo = Titulo;
    this.Descricao = Descricao;
    this.ID_Categoria = ID_Categoria;
  }
}
