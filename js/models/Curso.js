export class Curso {
  constructor({ ID_Curso = null, Titulo, Descricao = '', ID_Instrutor, ID_Categoria, Nivel = 'Iniciante', DataPublicacao = new Date().toISOString().split('T')[0], TotalAulas = 0, TotalHoras = 0 }) {
    this.ID_Curso = ID_Curso;
    this.Titulo = Titulo;
    this.Descricao = Descricao;
    this.ID_Instrutor = ID_Instrutor;
    this.ID_Categoria = ID_Categoria;
    this.Nivel = Nivel;
    this.DataPublicacao = DataPublicacao;
    this.TotalAulas = TotalAulas;
    this.TotalHoras = TotalHoras;
  }
}
