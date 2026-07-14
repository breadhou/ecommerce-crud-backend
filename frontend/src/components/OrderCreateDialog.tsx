import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, OrderItemCreate } from '../types'
import { getProducts, createOrder } from '../api/client'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface ItemRow {
  productId: number | null
  quantity: number
}

export default function OrderCreateDialog({ open, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<ItemRow[]>([{ productId: null, quantity: 1 }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      getProducts().then(setProducts).catch(() => toast.error('加载商品列表失败'))
      setItems([{ productId: null, quantity: 1 }])
    }
  }, [open])

  if (!open) return null

  const total = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)
    return sum + (p ? p.price * item.quantity : 0)
  }, 0)

  const addRow = () => setItems([...items, { productId: null, quantity: 1 }])

  const removeRow = (i: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  const updateRow = (i: number, field: keyof ItemRow, value: number) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems: OrderItemCreate[] = items
      .filter(i => i.productId !== null && i.quantity > 0)
      .map(i => ({ product_id: i.productId!, quantity: i.quantity }))
    if (validItems.length === 0) {
      toast.error('请至少选择一件商品')
      return
    }
    setSaving(true)
    try {
      await createOrder({ items: validItems })
      toast.success('订单创建成功')
      onCreated()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || '创建失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">创建订单</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
          {items.map((item, i) => {
            const selected = products.find(p => p.id === item.productId)
            return (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={item.productId ?? ''}
                  onChange={e => updateRow(i, 'productId', Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择商品</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (¥{p.price} / 库存{p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateRow(i, 'quantity', Number(e.target.value))}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => removeRow(i)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
          <button type="button" onClick={addRow}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <Plus size={14} /> 添加商品
          </button>
          <div className="text-right font-medium text-lg pt-2 border-t">
            合计: ¥{total.toFixed(2)}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">取消</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? '创建中...' : '创建订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
