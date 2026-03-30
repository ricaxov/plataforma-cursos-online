export class Avaliacao {
  constructor({ ID_Avaliacao = null, ID_Usuario, ID_Curso, Nota, Comentario = '', DataAvaliacao = new Date().toISOString().split('T')[0] }) {
    this.ID_Avaliacao = ID_Avaliacao;
    this.ID_Usuario = ID_Usuario;
    this.ID_Curso = ID_Curso;
    this.Nota = Nota;
    this.Comentario = Comentario;
    this.DataAvaliacao = DataAvaliacao;
  }
}
