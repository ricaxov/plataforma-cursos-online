import { api } from './api';
import type { NovoRegistro } from '../models';

/**
 * Serviço genérico de CRUD para qualquer recurso do JSON Server.
 * Cada entidade exporta uma instância configurada com seu endpoint.
 */
export class CrudService<T extends { id: number }> {
  constructor(private readonly resource: string) {}

  async listar(params?: Record<string, string | number>): Promise<T[]> {
    const { data } = await api.get<T[]>(`/${this.resource}`, { params });
    return data;
  }

  async buscarPorId(id: number): Promise<T> {
    const { data } = await api.get<T>(`/${this.resource}/${id}`);
    return data;
  }

  async criar(payload: NovoRegistro<T>): Promise<T> {
    const { data } = await api.post<T>(`/${this.resource}`, payload);
    return data;
  }

  async atualizar(id: number, payload: Partial<NovoRegistro<T>>): Promise<T> {
    const { data } = await api.patch<T>(`/${this.resource}/${id}`, payload);
    return data;
  }

  async remover(id: number): Promise<void> {
    await api.delete(`/${this.resource}/${id}`);
  }
}
