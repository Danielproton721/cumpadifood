export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  badge?: string
  stock?: number
  minQuantity?: number
  includes?: string[]
  accompaniments?: string[]
}

export interface Additional {
  id: string
  name: string
  quantity: string
  price: number
  freeOnFirstOrder?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  additionals: { additional: Additional; quantity: number }[]
  observation: string
  isCombo?: boolean
  comboPrice?: number
  comboItems?: {
    destilados: { product: Product; qty: number }[]
    gelos: { product: Product; qty: number }[]
    energeticos: { product: Product; qty: number }[]
  }
}

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}
