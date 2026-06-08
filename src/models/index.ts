export type Nivel = 'Iniciante' | 'Intermediário' | 'Avançado';
export type TipoConteudo = 'Vídeo' | 'Texto' | 'Quiz';
export type MetodoPagamento = 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Boleto';

export interface Usuario {
  id: number;
  NomeCompleto: string;
  Email: string;
  SenhaHash: string;
  DataCadastro: string;
}

export interface Categoria {
  id: number;
  Nome: string;
  Descricao: string;
}

export interface Curso {
  id: number;
  Titulo: string;
  Descricao: string;
  ID_Instrutor: number;
  ID_Categoria: number;
  Nivel: Nivel;
  DataPublicacao: string;
  TotalAulas: number;
  TotalHoras: number;
}

export interface Modulo {
  id: number;
  ID_Curso: number;
  Titulo: string;
  Ordem: number;
}

export interface Aula {
  id: number;
  ID_Modulo: number;
  Titulo: string;
  TipoConteudo: TipoConteudo;
  URL_Conteudo: string;
  DuracaoMinutos: number;
  Ordem: number;
}

export interface Matricula {
  id: number;
  ID_Usuario: number;
  ID_Curso: number;
  DataMatricula: string;
  DataConclusao: string | null;
}

export interface ProgressoAula {
  id: number;
  ID_Usuario: number;
  ID_Aula: number;
  DataConclusao: string;
  Status: string;
}

export interface Avaliacao {
  id: number;
  ID_Usuario: number;
  ID_Curso: number;
  Nota: number;
  Comentario: string;
  DataAvaliacao: string;
}

export interface Trilha {
  id: number;
  Titulo: string;
  Descricao: string;
  ID_Categoria: number | null;
}

export interface TrilhaCurso {
  id: number;
  ID_Trilha: number;
  ID_Curso: number;
  Ordem: number;
}

export interface Certificado {
  id: number;
  ID_Usuario: number;
  ID_Curso: number;
  ID_Trilha: number | null;
  CodigoVerificacao: string;
  DataEmissao: string;
}

export interface Plano {
  id: number;
  Nome: string;
  Descricao: string;
  Preco: number;
  DuracaoMeses: number;
}

export interface Assinatura {
  id: number;
  ID_Usuario: number;
  ID_Plano: number;
  DataInicio: string;
  DataFim: string;
}

export interface Pagamento {
  id: number;
  ID_Assinatura: number;
  ValorPago: number;
  DataPagamento: string;
  MetodoPagamento: MetodoPagamento;
  Id_Transacao_Gateway: string;
  DataFim: string;
}

/** Tipo utilitário: dados para criar um registro (sem o id gerado pela API). */
export type NovoRegistro<T> = Omit<T, 'id'>;
