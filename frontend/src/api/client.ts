import axios from 'axios'
import type { Product, ProductCreate, ProductUpdate, Order, OrderCreate } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Products
export async function getProducts(category?: string): Promise<Product[]> {
  const params = category ? { category } : {}
  const res = await api.get<Product[]>('/products', { params })
  return res.data
}

export async function getProduct(id: number): Promise<Product> {
  const res = await api.get<Product>(`/products/${id}`)
  return res.data
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  const res = await api.post<Product>('/products', data)
  return res.data
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<Product> {
  const res = await api.put<Product>(`/products/${id}`, data)
  return res.data
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}

// Orders
export async function getOrders(status?: string): Promise<Order[]> {
  const params = status ? { status } : {}
  const res = await api.get<Order[]>('/orders', { params })
  return res.data
}

export async function getOrder(id: number): Promise<Order> {
  const res = await api.get<Order>(`/orders/${id}`)
  return res.data
}

export async function createOrder(data: OrderCreate): Promise<Order> {
  const res = await api.post<Order>('/orders', data)
  return res.data
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const res = await api.put<Order>(`/orders/${id}/status`, { status })
  return res.data
}

export async function deleteOrder(id: number): Promise<void> {
  await api.delete(`/orders/${id}`)
}
