export class ProgressoAula {
  constructor({ ID_Usuario, ID_Aula, DataConclusao = new Date().toISOString().split('T')[0], Status = 'Concluído' }) {
    this.ID_Usuario = ID_Usuario;
    this.ID_Aula = ID_Aula;
    this.DataConclusao = DataConclusao;
    this.Status = Status;
  }
}
