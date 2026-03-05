import { apiClient } from './client'
import type { AccountSummary, Balance, CreateTransactionRequest, Transaction, UpdateTransactionRequest } from '@/types/transaction'

export const transactionsApi = {
  getAll: () => apiClient.get<Transaction[]>('/api/v1/transactions').then((r) => r.data),

  getById: (id: number) => apiClient.get<Transaction>(`/api/v1/transactions/${id}`).then((r) => r.data),

  getRecent: () => apiClient.get<Transaction[]>('/api/v1/transactions/recent').then((r) => r.data),

  getByType: (type: 'INCOME' | 'EXPENSE') =>
    apiClient.get<Transaction[]>(`/api/v1/transactions/type/${type}`).then((r) => r.data),

  getByCategory: (categoryId: number) =>
    apiClient.get<Transaction[]>(`/api/v1/transactions/category/${categoryId}`).then((r) => r.data),

  getByMonth: (year: number, month: number) =>
    apiClient.get<Transaction[]>('/api/v1/transactions/month', { params: { year, month } }).then((r) => r.data),

  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<Transaction[]>('/api/v1/transactions/date-range', { params: { startDate, endDate } }).then((r) => r.data),

  search: (keyword: string) =>
    apiClient.get<Transaction[]>('/api/v1/transactions/search', { params: { keyword } }).then((r) => r.data),

  getBalance: () => apiClient.get<Balance>('/api/v1/transactions/balance').then((r) => r.data),

  getBalanceByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<Balance>('/api/v1/transactions/balance/date-range', { params: { startDate, endDate } }).then((r) => r.data),

  create: (data: CreateTransactionRequest) =>
    apiClient.post<Transaction>('/api/v1/transactions', data).then((r) => r.data),

  update: (id: number, data: UpdateTransactionRequest) =>
    apiClient.put<Transaction>(`/api/v1/transactions/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/api/v1/transactions/${id}`),

  getAccountSummary: () => apiClient.get<AccountSummary>('/api/v1/accounts/summary').then((r) => r.data),
}
