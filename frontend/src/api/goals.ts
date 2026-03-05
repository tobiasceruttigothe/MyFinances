import { apiClient } from './client'
import type { AddContributionRequest, Contribution, CreateGoalRequest, Goal, GoalStatistics, GoalStatus, UpdateGoalRequest } from '@/types/goal'

export const goalsApi = {
  getAll: () => apiClient.get<Goal[]>('/api/v1/goals').then((r) => r.data),

  getById: (id: number) => apiClient.get<Goal>(`/api/v1/goals/${id}`).then((r) => r.data),

  getByStatus: (status: GoalStatus) =>
    apiClient.get<Goal[]>(`/api/v1/goals/status/${status}`).then((r) => r.data),

  getStatistics: (id: number) =>
    apiClient.get<GoalStatistics>(`/api/v1/goals/${id}/statistics`).then((r) => r.data),

  getContributions: (id: number) =>
    apiClient.get<Contribution[]>(`/api/v1/goals/${id}/contributions`).then((r) => r.data),

  create: (data: CreateGoalRequest) =>
    apiClient.post<Goal>('/api/v1/goals', data).then((r) => r.data),

  update: (id: number, data: UpdateGoalRequest) =>
    apiClient.put<Goal>(`/api/v1/goals/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/api/v1/goals/${id}`),

  addContribution: (id: number, data: AddContributionRequest) =>
    apiClient.post<Contribution>(`/api/v1/goals/${id}/contributions`, data).then((r) => r.data),
}
