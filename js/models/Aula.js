export class Aula {
  constructor({ ID_Aula = null, ID_Modulo, Titulo, TipoConteudo = 'Vídeo', URL_Conteudo = '', DuracaoMinutos = 0, Ordem = 1 }) {
    this.ID_Aula = ID_Aula;
    this.ID_Modulo = ID_Modulo;
    this.Titulo = Titulo;
    this.TipoConteudo = TipoConteudo;
    this.URL_Conteudo = URL_Conteudo;
    this.DuracaoMinutos = DuracaoMinutos;
    this.Ordem = Ordem;
  }
}
