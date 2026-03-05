export interface CategorySummary {
  categoryId: number
  categoryName: string
  totalAmount: number
  transactionCount: number
  percentage: number
}

export interface MonthlySummary {
  year: number
  month: number
  monthName: string
  totalIncome: number
  totalExpense: number
  balance: number
  savingsRate: number
  incomeTransactionCount: number
  expenseTransactionCount: number
  expensesByCategory: CategorySummary[]
  incomesByCategory: CategorySummary[]
  calculatedAt: string
}

export interface AllByCategoryReport {
  categories: CategorySummary[]
  grandTotal: number
}
