export class Matricula {
  constructor({ ID_Matricula = null, ID_Usuario, ID_Curso, DataMatricula = new Date().toISOString().split('T')[0], DataConclusao = null }) {
    this.ID_Matricula = ID_Matricula;
    this.ID_Usuario = ID_Usuario;
    this.ID_Curso = ID_Curso;
    this.DataMatricula = DataMatricula;
    this.DataConclusao = DataConclusao;
  }
}
