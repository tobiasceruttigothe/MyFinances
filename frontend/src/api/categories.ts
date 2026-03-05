import { apiClient } from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/api/v1/categories').then((r) => r.data),

  getRoot: () => apiClient.get<Category[]>('/api/v1/categories/root').then((r) => r.data),

  getById: (id: number) => apiClient.get<Category>(`/api/v1/categories/${id}`).then((r) => r.data),

  getSubcategories: (parentId: number) =>
    apiClient.get<Category[]>(`/api/v1/categories/${parentId}/subcategories`).then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<Category>('/api/v1/categories', data).then((r) => r.data),

  update: (id: number, data: UpdateCategoryRequest) =>
    apiClient.put<Category>(`/api/v1/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/api/v1/categories/${id}`),
}
