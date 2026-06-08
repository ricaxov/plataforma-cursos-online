import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

interface DropItem {
  to: string;
  label: string;
  icon: string;
}

interface DropMenu {
  label: string;
  icon: string;
  items: DropItem[];
}

const menus: DropMenu[] = [
  {
    label: 'Acadêmico',
    icon: 'bi-book',
    items: [
      { to: '/categorias', label: 'Categorias', icon: 'bi-tags' },
      { to: '/cursos', label: 'Cursos', icon: 'bi-journal-richtext' },
      { to: '/modulos-aulas', label: 'Módulos e Aulas', icon: 'bi-collection-play' },
      { to: '/trilhas', label: 'Trilhas', icon: 'bi-signpost-split' },
    ],
  },
  {
    label: 'Usuários',
    icon: 'bi-people',
    items: [
      { to: '/usuarios', label: 'Cadastro', icon: 'bi-person-plus' },
      { to: '/matriculas', label: 'Matrículas', icon: 'bi-card-checklist' },
      { to: '/progresso', label: 'Progresso', icon: 'bi-graph-up' },
      { to: '/certificados', label: 'Certificados', icon: 'bi-award' },
    ],
  },
  {
    label: 'Financeiro',
    icon: 'bi-cash-stack',
    items: [
      { to: '/planos', label: 'Planos', icon: 'bi-box' },
      { to: '/assinaturas', label: 'Assinaturas', icon: 'bi-pen' },
      { to: '/pagamentos', label: 'Pagamentos', icon: 'bi-credit-card' },
    ],
  },
];

export function Navbar() {
  const [collapsed, setCollapsed] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const closeAll = () => {
    setCollapsed(true);
    setOpenMenu(null);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark rp-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeAll}>
          <i className="bi bi-mortarboard-fill me-2" />
          Ricardo Plataforma
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={closeAll}>
                <i className="bi bi-speedometer2 me-1" />
                Dashboard
              </NavLink>
            </li>
            {menus.map((menu) => (
              <li className="nav-item dropdown" key={menu.label}>
                <button
                  className={`nav-link dropdown-toggle btn btn-link ${openMenu === menu.label ? 'show' : ''}`}
                  onClick={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
                >
                  <i className={`bi ${menu.icon} me-1`} />
                  {menu.label}
                </button>
                <ul className={`dropdown-menu ${openMenu === menu.label ? 'show' : ''}`}>
                  {menu.items.map((item) => (
                    <li key={item.to}>
                      <NavLink className="dropdown-item" to={item.to} onClick={closeAll}>
                        <i className={`bi ${item.icon} me-2`} />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
