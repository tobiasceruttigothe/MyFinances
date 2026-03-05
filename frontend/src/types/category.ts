import type { TransactionType } from './transaction'

export interface Category {
  id: number
  name: string
  type: TransactionType
  parentId?: number
  description?: string
  transactionCount: number
  totalAmount: number
}

export interface CreateCategoryRequest {
  name: string
  type: TransactionType
  parentId?: number
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  type?: TransactionType
  parentId?: number
  description?: string
}
