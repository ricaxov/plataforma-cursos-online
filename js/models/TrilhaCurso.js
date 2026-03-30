export class TrilhaCurso {
  constructor({ ID_Trilha, ID_Curso, Ordem = 1 }) {
    this.ID_Trilha = ID_Trilha;
    this.ID_Curso = ID_Curso;
    this.Ordem = Ordem;
  }
}
