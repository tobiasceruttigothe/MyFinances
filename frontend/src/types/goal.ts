export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'ON_HOLD'

export interface Goal {
  id: number
  name: string
  description?: string
  icon?: string
  targetAmount: number
  currentAmount: number
  monthlyTargetAmount?: number
  progressPercentage: number
  autoContribution: boolean
  status: GoalStatus
  startDate: string
  targetDate?: string
  completedAt?: string
  remainingAmount: number
  remainingMonths?: number
  suggestedMonthlyAmount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateGoalRequest {
  name: string
  description?: string
  targetAmount: number
  monthlyTargetAmount?: number
  autoContribution?: boolean
  startDate: string
  targetDate?: string
  icon?: string
}

export interface UpdateGoalRequest {
  name?: string
  description?: string
  targetAmount?: number
  monthlyTargetAmount?: number
  autoContribution?: boolean
  startDate?: string
  targetDate?: string
  icon?: string
}

export interface Contribution {
  id: number
  goalId: number
  amount: number
  contributionDate: string
  year: number
  month: number
  type: 'MANUAL' | 'AUTO' | 'ADJUSTMENT'
  notes?: string
  createdAt: string
}

export interface AddContributionRequest {
  amount: number
  contributionDate?: string
  notes?: string
}

export interface MonthlyBreakdown {
  year: number
  month: number
  monthLabel: string
  contributed: number
  monthlyTarget: number
  targetMet: boolean
  cumulativeTotal: number
}

export interface GoalStatistics {
  goalId: number
  goalName: string
  icon?: string
  status: GoalStatus
  targetAmount: number
  totalContributed: number
  progressPercentage: number
  startDate: string
  targetDate?: string
  completedAt?: string
  completedOnTime?: boolean
  totalMonths: number
  monthsWithContributions: number
  monthsWithFullTarget: number
  averageMonthlyContribution: number
  monthlyTarget: number
  monthlyBreakdown: MonthlyBreakdown[]
  bestMonthAmount: number
  bestMonthLabel: string
  worstMonthAmount: number
  worstMonthLabel: string
  calculatedAt: string
}
