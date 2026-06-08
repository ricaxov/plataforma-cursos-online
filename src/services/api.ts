import axios from 'axios';

/**
 * Instância base do axios apontando para o JSON Server.
 * Inicie o servidor com: npm run server (porta 3001)
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});
