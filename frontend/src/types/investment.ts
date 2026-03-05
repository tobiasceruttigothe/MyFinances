export interface Investment {
  id: number
  type: string
  description: string
  initialCapital: number
  currentCapital: number
  investmentDate: string
  notes?: string
  profit: number
  roi: number
  linkedTransactionCreated: boolean
  transactionId?: number
  createdAt: string
  updatedAt: string
}

export interface CreateInvestmentRequest {
  type: string
  description: string
  initialCapital: number
  currentCapital: number
  investmentDate?: string
  notes?: string
  createLinkedTransaction?: boolean
}

export interface UpdateInvestmentRequest {
  type?: string
  description?: string
  initialCapital?: number
  currentCapital?: number
  investmentDate?: string
  notes?: string
}

export interface InvestmentTypeBreakdown {
  type: string
  count: number
  totalInitialCapital: number
  totalCurrentCapital: number
  totalProfit: number
  averageROI: number
}

export interface PortfolioSummary {
  totalInvested: number
  totalCurrentValue: number
  totalProfit: number
  overallROI: number
  totalInvestments: number
  byType: InvestmentTypeBreakdown[]
  calculatedAt: string
}
