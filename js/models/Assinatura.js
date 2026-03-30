export class Assinatura {
  constructor({ ID_Assinatura = null, ID_Usuario, ID_Plano, DataInicio = new Date().toISOString().split('T')[0], DataFim }) {
    this.ID_Assinatura = ID_Assinatura;
    this.ID_Usuario = ID_Usuario;
    this.ID_Plano = ID_Plano;
    this.DataInicio = DataInicio;
    this.DataFim = DataFim;
  }
}
