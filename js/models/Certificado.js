export class Certificado {
  constructor({ ID_Certificado = null, ID_Usuario, ID_Curso, ID_Trilha = null, CodigoVerificacao = '', DataEmissao = new Date().toISOString().split('T')[0] }) {
    this.ID_Certificado = ID_Certificado;
    this.ID_Usuario = ID_Usuario;
    this.ID_Curso = ID_Curso;
    this.ID_Trilha = ID_Trilha;
    this.CodigoVerificacao = CodigoVerificacao || Certificado.gerarCodigo();
    this.DataEmissao = DataEmissao;
  }

  static gerarCodigo() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CERT-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
