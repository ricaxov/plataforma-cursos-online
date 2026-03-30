export class Usuario {
  constructor({ ID_Usuario = null, NomeCompleto, Email, SenhaHash, DataCadastro = new Date().toISOString().split('T')[0] }) {
    this.ID_Usuario = ID_Usuario;
    this.NomeCompleto = NomeCompleto;
    this.Email = Email;
    this.SenhaHash = SenhaHash;
    this.DataCadastro = DataCadastro;
  }
}
