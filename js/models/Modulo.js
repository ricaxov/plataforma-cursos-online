export class Modulo {
  constructor({ ID_Modulo = null, ID_Curso, Titulo, Ordem = 1 }) {
    this.ID_Modulo = ID_Modulo;
    this.ID_Curso = ID_Curso;
    this.Titulo = Titulo;
    this.Ordem = Ordem;
  }
}
