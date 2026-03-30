# Ricardo Plataforma - Plataforma de Cursos Online

Interface funcional de uma plataforma de cursos online desenvolvida com **HTML5**, **Bootstrap 5** e **JavaScript ES6+**.

## Como Executar

Abra o arquivo `index.html` no navegador. Como o projeto usa ES6 modules (`type="module"`), é necessário servir via HTTP:

```bash
# Opção 1: Python
python3 -m http.server 8080

# Opção 2: Node.js (npx)
npx serve .

# Opção 3: VS Code Live Server Extension
```

Acesse `http://localhost:8080` no navegador.

## Estrutura do Projeto

```
├── index.html              # Dashboard principal
├── pages/                  # Páginas HTML da aplicação
│   ├── categorias.html
│   ├── cursos.html
│   ├── modulos-aulas.html
│   ├── trilhas.html
│   ├── usuarios.html
│   ├── matriculas.html
│   ├── progresso.html
│   ├── certificados.html
│   ├── planos.html
│   ├── assinaturas.html
│   └── pagamentos.html
├── css/
│   └── style.css           # Estilos customizados
└── js/
    ├── models/             # 14 classes ES6 (entidades)
    ├── services/
    │   └── DataStore.js    # Persistência em memória (singleton)
    ├── utils/
    │   └── validation.js   # Validação de formulários
    └── pages/              # Lógica JS de cada página
```

## Funcionalidades

- **Módulo Acadêmico**: CRUD de Categorias, Cursos, Módulos, Aulas e Trilhas
- **Módulo de Usuários**: Cadastro, Matrículas, Controle de Progresso e Certificados
- **Módulo Financeiro**: Planos, Assinaturas e Pagamentos (checkout simulado)
- **Avaliações**: Sistema de notas (1-5) com comentários
- **Dashboard**: Visão geral com contadores dinâmicos

## Tecnologias

- HTML5 (estrutura semântica)
- Bootstrap 5.3 (CDN)
- JavaScript ES6+ (Classes, Modules, Arrow Functions, Template Literals)
