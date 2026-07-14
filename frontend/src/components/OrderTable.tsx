import { useState, useEffect, useCallback } from 'react'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '../types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, NEXT_STATUS, NEXT_STATUS_LABEL } from '../types'
import { getOrders, updateOrderStatus, deleteOrder } from '../api/client'
import OrderCreateDialog from './OrderCreateDialog'
import OrderDetailSheet from './OrderDetailSheet'

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOrders(statusFilter || undefined)
      setOrders(data)
    } catch {
      toast.error('加载订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const handleStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    try {
      await updateOrderStatus(order.id, next)
      toast.success(`订单状态已更新为 "${ORDER_STATUS_LABELS[next]}"`)
      load()
    } catch {
      toast.error('状态更新失败')
    }
  }

  const handleDelete = async (order: Order) => {
    if (!confirm(`确定要删除订单 #${order.id} 吗？`)) return
    try {
      await deleteOrder(order.id)
      toast.success('订单已删除')
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || '删除失败')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> 创建订单
        </button>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="confirmed">已确认</option>
          <option value="shipped">已发货</option>
          <option value="delivered">已送达</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">加载中...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">暂无订单数据</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">订单号</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">总价</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => {
                const canDelete = o.status !== 'shipped' && o.status !== 'delivered'
                const nextStatus = NEXT_STATUS[o.status]
                const nextLabel = NEXT_STATUS_LABEL[o.status]
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">¥{o.total_price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDetailId(o.id)} className="text-blue-600 hover:text-blue-800">
                          <Eye size={15} />
                        </button>
                        {nextStatus && (
                          <button onClick={() => handleStatus(o)} className="text-green-600 hover:text-green-800 text-xs font-medium">
                            {nextLabel}
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(o)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <OrderCreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={load}
      />
      <OrderDetailSheet
        orderId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
