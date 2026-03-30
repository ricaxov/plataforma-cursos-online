import { Usuario } from '../models/Usuario.js';
import { Categoria } from '../models/Categoria.js';
import { Curso } from '../models/Curso.js';
import { Modulo } from '../models/Modulo.js';
import { Aula } from '../models/Aula.js';
import { Matricula } from '../models/Matricula.js';
import { ProgressoAula } from '../models/ProgressoAula.js';
import { Avaliacao } from '../models/Avaliacao.js';
import { Trilha } from '../models/Trilha.js';
import { TrilhaCurso } from '../models/TrilhaCurso.js';
import { Certificado } from '../models/Certificado.js';
import { Plano } from '../models/Plano.js';
import { Assinatura } from '../models/Assinatura.js';
import { Pagamento } from '../models/Pagamento.js';

const STORAGE_KEY = 'ricardo_plataforma_data';
const COUNTERS_KEY = 'ricardo_plataforma_counters';
const VERSION_KEY = 'ricardo_plataforma_version';
const CURRENT_VERSION = 2;

class DataStore {
  constructor() {
    if (DataStore.instance) return DataStore.instance;

    this._idCounters = {};
    this._data = {
      usuarios: [],
      categorias: [],
      cursos: [],
      modulos: [],
      aulas: [],
      matriculas: [],
      progresso_aulas: [],
      avaliacoes: [],
      trilhas: [],
      trilhas_cursos: [],
      certificados: [],
      planos: [],
      assinaturas: [],
      pagamentos: []
    };

    this._idFields = {
      usuarios: 'ID_Usuario',
      categorias: 'ID_Categoria',
      cursos: 'ID_Curso',
      modulos: 'ID_Modulo',
      aulas: 'ID_Aula',
      matriculas: 'ID_Matricula',
      avaliacoes: 'ID_Avaliacao',
      trilhas: 'ID_Trilha',
      certificados: 'ID_Certificado',
      planos: 'ID_Plano',
      assinaturas: 'ID_Assinatura',
      pagamentos: 'ID_Pagamento'
    };

    const savedVersion = parseInt(localStorage.getItem(VERSION_KEY)) || 0;
    if (savedVersion < CURRENT_VERSION || !this._loadFromStorage()) {
      this._seed();
      this._saveToStorage();
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    }

    DataStore.instance = this;
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const counters = localStorage.getItem(COUNTERS_KEY);
      if (!raw || !counters) return false;

      const parsed = JSON.parse(raw);
      const parsedCounters = JSON.parse(counters);

      for (const key of Object.keys(this._data)) {
        if (Array.isArray(parsed[key])) {
          this._data[key] = parsed[key];
        }
      }
      this._idCounters = parsedCounters;
      return true;
    } catch {
      return false;
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      localStorage.setItem(COUNTERS_KEY, JSON.stringify(this._idCounters));
    } catch {
      // localStorage indisponível ou cheio
    }
  }

  _seed() {
    const categorias = [
      new Categoria({ ID_Categoria: 1, Nome: 'Programação', Descricao: 'Cursos de desenvolvimento de software' }),
      new Categoria({ ID_Categoria: 2, Nome: 'Design', Descricao: 'Cursos de design gráfico e UX/UI' }),
      new Categoria({ ID_Categoria: 3, Nome: 'Marketing', Descricao: 'Cursos de marketing digital' }),
    ];
    categorias.forEach(c => this._data.categorias.push(c));
    this._idCounters.categorias = 4;

    const usuarios = [
      new Usuario({ ID_Usuario: 1, NomeCompleto: 'Carlos Silva', Email: 'carlos@email.com', SenhaHash: '***', DataCadastro: '2026-01-15' }),
      new Usuario({ ID_Usuario: 2, NomeCompleto: 'Ana Oliveira', Email: 'ana@email.com', SenhaHash: '***', DataCadastro: '2026-02-10' }),
      new Usuario({ ID_Usuario: 3, NomeCompleto: 'Prof. João Santos', Email: 'joao@email.com', SenhaHash: '***', DataCadastro: '2026-01-01' }),
    ];
    usuarios.forEach(u => this._data.usuarios.push(u));
    this._idCounters.usuarios = 4;

    const cursos = [
      new Curso({ ID_Curso: 1, Titulo: 'JavaScript Avançado', Descricao: 'Domine JS moderno com ES6+', ID_Instrutor: 3, ID_Categoria: 1, Nivel: 'Avançado', DataPublicacao: '2026-01-20', TotalAulas: 5, TotalHoras: 10 }),
      new Curso({ ID_Curso: 2, Titulo: 'UI/UX Fundamentos', Descricao: 'Aprenda os fundamentos de design', ID_Instrutor: 3, ID_Categoria: 2, Nivel: 'Iniciante', DataPublicacao: '2026-02-15', TotalAulas: 3, TotalHoras: 6 }),
    ];
    cursos.forEach(c => this._data.cursos.push(c));
    this._idCounters.cursos = 3;

    const modulos = [
      new Modulo({ ID_Modulo: 1, ID_Curso: 1, Titulo: 'Fundamentos ES6+', Ordem: 1 }),
      new Modulo({ ID_Modulo: 2, ID_Curso: 1, Titulo: 'Programação Assíncrona', Ordem: 2 }),
      new Modulo({ ID_Modulo: 3, ID_Curso: 2, Titulo: 'Princípios de Design', Ordem: 1 }),
    ];
    modulos.forEach(m => this._data.modulos.push(m));
    this._idCounters.modulos = 4;

    const aulas = [
      new Aula({ ID_Aula: 1, ID_Modulo: 1, Titulo: 'Arrow Functions', TipoConteudo: 'Vídeo', URL_Conteudo: '#', DuracaoMinutos: 30, Ordem: 1 }),
      new Aula({ ID_Aula: 2, ID_Modulo: 1, Titulo: 'Destructuring', TipoConteudo: 'Vídeo', URL_Conteudo: '#', DuracaoMinutos: 25, Ordem: 2 }),
      new Aula({ ID_Aula: 3, ID_Modulo: 2, Titulo: 'Promises', TipoConteudo: 'Vídeo', URL_Conteudo: '#', DuracaoMinutos: 40, Ordem: 1 }),
      new Aula({ ID_Aula: 4, ID_Modulo: 2, Titulo: 'Async/Await', TipoConteudo: 'Vídeo', URL_Conteudo: '#', DuracaoMinutos: 35, Ordem: 2 }),
      new Aula({ ID_Aula: 5, ID_Modulo: 3, Titulo: 'Cores e Tipografia', TipoConteudo: 'Texto', URL_Conteudo: '#', DuracaoMinutos: 20, Ordem: 1 }),
    ];
    aulas.forEach(a => this._data.aulas.push(a));
    this._idCounters.aulas = 6;

    const planos = [
      new Plano({ ID_Plano: 1, Nome: 'Básico', Descricao: 'Acesso a cursos básicos', Preco: 29.90, DuracaoMeses: 1 }),
      new Plano({ ID_Plano: 2, Nome: 'Pro', Descricao: 'Acesso a todos os cursos', Preco: 59.90, DuracaoMeses: 6 }),
      new Plano({ ID_Plano: 3, Nome: 'Premium', Descricao: 'Acesso total + certificados', Preco: 99.90, DuracaoMeses: 12 }),
    ];
    planos.forEach(p => this._data.planos.push(p));
    this._idCounters.planos = 4;

    const matriculas = [
      new Matricula({ ID_Matricula: 1, ID_Usuario: 1, ID_Curso: 1, DataMatricula: '2026-02-01', DataConclusao: null }),
      new Matricula({ ID_Matricula: 2, ID_Usuario: 2, ID_Curso: 2, DataMatricula: '2026-02-20', DataConclusao: null }),
      new Matricula({ ID_Matricula: 3, ID_Usuario: 1, ID_Curso: 2, DataMatricula: '2026-03-01', DataConclusao: null }),
    ];
    matriculas.forEach(m => this._data.matriculas.push(m));
    this._idCounters.matriculas = 4;

    const assinaturas = [
      new Assinatura({ ID_Assinatura: 1, ID_Usuario: 1, ID_Plano: 2, DataInicio: '2026-01-15', DataFim: '2026-07-15' }),
      new Assinatura({ ID_Assinatura: 2, ID_Usuario: 2, ID_Plano: 3, DataInicio: '2026-02-10', DataFim: '2027-02-10' }),
    ];
    assinaturas.forEach(a => this._data.assinaturas.push(a));
    this._idCounters.assinaturas = 3;

    const trilhas = [
      new Trilha({ ID_Trilha: 1, Titulo: 'Desenvolvedor Frontend', Descricao: 'Trilha completa para frontend', ID_Categoria: 1 }),
    ];
    trilhas.forEach(t => this._data.trilhas.push(t));
    this._idCounters.trilhas = 2;

    this._data.trilhas_cursos.push(new TrilhaCurso({ ID_Trilha: 1, ID_Curso: 1, Ordem: 1 }));
    this._data.trilhas_cursos.push(new TrilhaCurso({ ID_Trilha: 1, ID_Curso: 2, Ordem: 2 }));

    Object.keys(this._data).forEach(entity => {
      if (!this._idCounters[entity]) {
        this._idCounters[entity] = 1;
      }
    });
  }

  getNextId(entity) {
    if (!this._idCounters[entity]) this._idCounters[entity] = 1;
    return this._idCounters[entity]++;
  }

  add(entity, item) {
    if (!this._data[entity]) throw new Error(`Entidade "${entity}" não existe`);
    const idField = this._idFields[entity];
    if (idField && (item[idField] === null || item[idField] === undefined)) {
      item[idField] = this.getNextId(entity);
    }
    this._data[entity].push(item);
    this._saveToStorage();
    return item;
  }

  getAll(entity) {
    if (!this._data[entity]) throw new Error(`Entidade "${entity}" não existe`);
    return [...this._data[entity]];
  }

  getById(entity, id) {
    const idField = this._idFields[entity];
    if (!idField) return null;
    return this._data[entity].find(item => item[idField] === id) || null;
  }

  getWhere(entity, predicate) {
    if (!this._data[entity]) return [];
    return this._data[entity].filter(predicate);
  }

  update(entity, id, newData) {
    const idField = this._idFields[entity];
    if (!idField) return null;
    const index = this._data[entity].findIndex(item => item[idField] === id);
    if (index === -1) return null;
    Object.assign(this._data[entity][index], newData);
    this._saveToStorage();
    return this._data[entity][index];
  }

  delete(entity, id) {
    const idField = this._idFields[entity];
    if (!idField) return false;
    const index = this._data[entity].findIndex(item => item[idField] === id);
    if (index === -1) return false;
    this._data[entity].splice(index, 1);
    this._saveToStorage();
    return true;
  }

  deleteWhere(entity, predicate) {
    if (!this._data[entity]) return 0;
    const before = this._data[entity].length;
    this._data[entity] = this._data[entity].filter(item => !predicate(item));
    this._saveToStorage();
    return before - this._data[entity].length;
  }

  count(entity) {
    if (!this._data[entity]) return 0;
    return this._data[entity].length;
  }
}

export const dataStore = new DataStore();
