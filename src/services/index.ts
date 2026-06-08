import { CrudService } from './crudService';
import type {
  Usuario,
  Categoria,
  Curso,
  Modulo,
  Aula,
  Matricula,
  ProgressoAula,
  Avaliacao,
  Trilha,
  TrilhaCurso,
  Certificado,
  Plano,
  Assinatura,
  Pagamento,
} from '../models';

export const usuarioService = new CrudService<Usuario>('usuarios');
export const categoriaService = new CrudService<Categoria>('categorias');
export const cursoService = new CrudService<Curso>('cursos');
export const moduloService = new CrudService<Modulo>('modulos');
export const aulaService = new CrudService<Aula>('aulas');
export const matriculaService = new CrudService<Matricula>('matriculas');
export const progressoService = new CrudService<ProgressoAula>('progresso_aulas');
export const avaliacaoService = new CrudService<Avaliacao>('avaliacoes');
export const trilhaService = new CrudService<Trilha>('trilhas');
export const trilhaCursoService = new CrudService<TrilhaCurso>('trilhas_cursos');
export const certificadoService = new CrudService<Certificado>('certificados');
export const planoService = new CrudService<Plano>('planos');
export const assinaturaService = new CrudService<Assinatura>('assinaturas');
export const pagamentoService = new CrudService<Pagamento>('pagamentos');

export { CrudService } from './crudService';
export { api } from './api';
