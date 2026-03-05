import { apiClient } from './client'
import type { CreateInvestmentRequest, Investment, PortfolioSummary, UpdateInvestmentRequest } from '@/types/investment'

export const investmentsApi = {
  getAll: () => apiClient.get<Investment[]>('/api/v1/investments').then((r) => r.data),

  getById: (id: number) => apiClient.get<Investment>(`/api/v1/investments/${id}`).then((r) => r.data),

  getByType: (type: string) =>
    apiClient.get<Investment[]>(`/api/v1/investments/type/${type}`).then((r) => r.data),

  getPortfolioSummary: () =>
    apiClient.get<PortfolioSummary>('/api/v1/investments/portfolio/summary').then((r) => r.data),

  create: (data: CreateInvestmentRequest) =>
    apiClient.post<Investment>('/api/v1/investments', data).then((r) => r.data),

  update: (id: number, data: UpdateInvestmentRequest) =>
    apiClient.put<Investment>(`/api/v1/investments/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/api/v1/investments/${id}`),
}
