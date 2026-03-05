export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: TransactionType
  categoryId: number
  categoryName: string
  date: string
  notes?: string
  linkedToInvestment: boolean
  investmentId?: number
}

export interface CreateTransactionRequest {
  description: string
  amount: number
  type: TransactionType
  categoryId: number
  date?: string
  notes?: string
  linkedToInvestment?: boolean
  investmentId?: number
}

export interface UpdateTransactionRequest {
  description?: string
  amount?: number
  type?: TransactionType
  categoryId?: number
  date?: string
  notes?: string
}

export interface Balance {
  totalIncome: number
  totalExpense: number
  balance: number
  incomeTransactionCount: number
  expenseTransactionCount: number
  periodStart?: string
  periodEnd?: string
  calculatedAt: string
}

export interface AccountSummary {
  userId: string
  accountBalance: number
  investments: number
  netWorth: number
  message?: string
}
