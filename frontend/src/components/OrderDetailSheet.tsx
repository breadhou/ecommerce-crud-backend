import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '../types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types'
import { getOrder } from '../api/client'

interface Props {
  orderId: number | null
  onClose: () => void
}

export default function OrderDetailSheet({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId) {
      setLoading(true)
      getOrder(orderId)
        .then(setOrder)
        .catch(() => toast.error('加载订单详情失败'))
        .finally(() => setLoading(false))
    } else {
      setOrder(null)
    }
  }, [orderId])

  if (orderId === null) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">订单 #{orderId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <p className="text-gray-500">加载中...</p>
          ) : !order ? (
            <p className="text-gray-500">加载失败</p>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">状态:</span>{' '}
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
              <div><span className="text-sm text-gray-500">创建时间:</span> {order.created_at.slice(0, 19).replace('T', ' ')}</div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">商品明细</h4>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 font-medium text-gray-600">商品</th>
                      <th className="text-right py-2 font-medium text-gray-600">单价</th>
                      <th className="text-center py-2 font-medium text-gray-600">数量</th>
                      <th className="text-right py-2 font-medium text-gray-600">小计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-2">商品 #{item.product_id}</td>
                        <td className="py-2 text-right">¥{item.unit_price.toFixed(2)}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">¥{(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right font-bold text-lg pt-2 border-t">
                合计: ¥{order.total_price.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
