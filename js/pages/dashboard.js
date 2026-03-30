import { dataStore } from '../services/DataStore.js';

function updateDashboard() {
  document.getElementById('statCursos').textContent = dataStore.count('cursos');
  document.getElementById('statUsuarios').textContent = dataStore.count('usuarios');
  document.getElementById('statMatriculas').textContent = dataStore.count('matriculas');
  document.getElementById('statCategorias').textContent = dataStore.count('categorias');
  document.getElementById('statCertificados').textContent = dataStore.count('certificados');
  document.getElementById('statTrilhas').textContent = dataStore.count('trilhas');

  const cursos = dataStore.getAll('cursos').slice(-5).reverse();
  const ulCursos = document.getElementById('ultimosCursos');
  if (cursos.length > 0) {
    ulCursos.innerHTML = '<ul class="list-group list-group-flush">' +
      cursos.map(c => {
        const cat = dataStore.getById('categorias', c.ID_Categoria);
        return `<li class="list-group-item d-flex justify-content-between align-items-center px-0">
          <div><strong>${c.Titulo}</strong><br><small class="text-muted">${cat ? cat.Nome : ''} — ${c.Nivel}</small></div>
          <span class="badge bg-primary rounded-pill">${c.TotalHoras}h</span>
        </li>`;
      }).join('') + '</ul>';
  }

  const usuarios = dataStore.getAll('usuarios').slice(-5).reverse();
  const ulUsuarios = document.getElementById('ultimosUsuarios');
  if (usuarios.length > 0) {
    ulUsuarios.innerHTML = '<ul class="list-group list-group-flush">' +
      usuarios.map(u => `<li class="list-group-item d-flex justify-content-between align-items-center px-0">
          <div><strong>${u.NomeCompleto}</strong><br><small class="text-muted">${u.Email}</small></div>
          <small class="text-muted">${u.DataCadastro}</small>
        </li>`).join('') + '</ul>';
  }
}

updateDashboard();
