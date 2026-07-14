export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  image_url: string | null
  created_at: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stock: number
  category: string
  image_url?: string
}

export interface ProductUpdate {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: string
  image_url?: string
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  status: string
  total_price: number
  created_at: string
  items: OrderItem[]
}

export interface OrderItemCreate {
  product_id: number
  quantity: number
}

export interface OrderCreate {
  items: OrderItemCreate[]
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  confirmed: '已确认',
  shipped: '已发货',
  delivered: '已送达',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-orange-100 text-orange-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
}

export const NEXT_STATUS: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
  delivered: null,
}

export const NEXT_STATUS_LABEL: Record<string, string | null> = {
  pending: '确认',
  confirmed: '发货',
  shipped: '送达',
  delivered: null,
}
