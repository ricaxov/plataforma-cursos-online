# Ricardo Plataforma — Cursos Online

Interface funcional de uma **Plataforma de Cursos Online** desenvolvida com **React + TypeScript**, **Bootstrap 5**, **React Router** e consumo de API via **JSON Server**.

Projeto referente ao LAB03, cobrindo os módulos Acadêmico/Conteúdo, Usuário/Progresso e Financeiro a partir das 14 entidades do modelo de dados.

## Tecnologias

- **React 18 + TypeScript** — componentes próprios (criados do zero com classes do Bootstrap)
- **Bootstrap 5** + **Bootstrap Icons** — layout, grid, cards, modais, tabelas, navbar
- **React Router 6** — roteamento entre as páginas
- **Axios** — consumo da API REST
- **JSON Server** — API fake com persistência em `db.json`
- **Vite** — bundler e servidor de desenvolvimento

## Estrutura do projeto

```
src/
├── models/        # Interfaces TypeScript das 14 entidades
├── services/      # Camada de API (axios + CRUD genérico por entidade)
├── components/    # Componentes reutilizáveis (Navbar, Layout, Modal, FormField, Toast, etc.)
├── hooks/         # Hooks customizados (useConfirm)
├── pages/         # Páginas (Dashboard, Cursos, Trilhas, Progresso, Pagamentos, ...)
├── utils/         # Funções de validação e helpers
├── App.tsx        # Definição das rotas
└── main.tsx       # Ponto de entrada
db.json            # Base de dados do JSON Server
```

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode a aplicação **e** a API ao mesmo tempo (recomendado):

```bash
npm start
```

- Front-end (Vite): http://localhost:5173
- API (JSON Server): http://localhost:3001

Ou rode separadamente em dois terminais:

```bash
npm run server   # JSON Server na porta 3001
npm run dev      # Vite na porta 5173
```

## Scripts

| Script          | Descrição                                   |
| --------------- | ------------------------------------------- |
| `npm start`     | Sobe JSON Server + Vite simultaneamente     |
| `npm run dev`   | Apenas o front-end (Vite)                   |
| `npm run server`| Apenas a API (JSON Server)                  |
| `npm run build` | Type-check + build de produção              |
| `npm run preview` | Pré-visualiza o build de produção         |

## Funcionalidades

### Módulo Acadêmico e de Conteúdo
- CRUD de **Categorias**, **Cursos** (com filtro por categoria) e **Trilhas**
- **Módulos e Aulas** em estrutura hierárquica respeitando o campo `Ordem`
- Associação de cursos a trilhas (`Trilhas_Cursos`) com ordenação

### Módulo de Usuário e Progresso
- Cadastro de **Usuários** e **Matrículas** em cursos
- Controle de **Progresso** marcando aulas como concluídas (barra de progresso)
- **Avaliações** de curso (nota 1–5 + comentário)
- Geração visual de **Certificados** com código de verificação ao concluir 100%

### Módulo Financeiro
- CRUD de **Planos**
- **Assinaturas** com cálculo automático da data de término e status (Ativa/Expirada)
- Fluxo de checkout em **Pagamentos**, gerando ID de transação automaticamente

## Observações

> O arquivo `.npmrc` aponta para o registro público do npm (`registry.npmjs.org`) para garantir a instalação das dependências.
