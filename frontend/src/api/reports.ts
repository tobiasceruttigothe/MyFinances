import { apiClient } from './client'
import type { AllByCategoryReport, CategorySummary, MonthlySummary } from '@/types/report'

export const reportsApi = {
  getMonthlySummary: (year: number, month: number) =>
    apiClient.get<MonthlySummary>('/api/v1/reports/monthly', { params: { year, month } }).then((r) => r.data),

  getExpensesByCategory: (year: number, month: number) =>
    apiClient.get<CategorySummary[]>('/api/v1/reports/expenses/by-category', { params: { year, month } }).then((r) => r.data),

  getIncomesByCategory: (year: number, month: number) =>
    apiClient.get<CategorySummary[]>('/api/v1/reports/incomes/by-category', { params: { year, month } }).then((r) => r.data),

  getAllExpensesByCategory: () =>
    apiClient.get<AllByCategoryReport>('/api/v1/reports/expenses/all-by-category').then((r) => r.data),

  getAllIncomesByCategory: () =>
    apiClient.get<AllByCategoryReport>('/api/v1/reports/incomes/all-by-category').then((r) => r.data),

  getMonthlyComparison: (months = 6) =>
    apiClient.get<MonthlySummary[]>('/api/v1/reports/monthly-comparison', { params: { months } }).then((r) => r.data),
}
