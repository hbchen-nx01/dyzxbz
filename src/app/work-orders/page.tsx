'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit, Trash2, Search, X, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { WorkOrder, Instrument } from '@/types';
import { formatDate, formatDateTime, generateOrderNumber } from '@/lib/utils';

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [formData, setFormData] = useState({
    orderNumber: '',
    instrumentId: '',
    instrumentTag: '',
    instrumentName: '',
    instrumentLocation: '',
    faultDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
    assignedTo: '',
    assignedToName: '',
    report: '',
    reporterId: '1',
    reporterName: '当前用户',
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchInstruments();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/work-orders');
      const data = await response.json();
      setWorkOrders(data);
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
    }
  };

  const fetchInstruments = async () => {
    try {
      const response = await fetch('/api/instruments');
      const data = await response.json();
      setInstruments(data);
    } catch (error) {
      console.error('Failed to fetch instruments:', error);
    }
  };

  const handleInstrumentTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    const selectedInstrument = instruments.find(inst => inst.tag === selectedTag);
    setFormData({
      ...formData,
      instrumentTag: selectedTag,
      instrumentId: selectedInstrument?.id || '',
      instrumentName: selectedInstrument?.name || '',
      instrumentLocation: selectedInstrument?.location || '',
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = workOrders.filter(
    (order) =>
      (statusFilter === 'all' || order.status === statusFilter) &&
      (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.instrumentLocation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (order?: WorkOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        orderNumber: order.orderNumber,
        instrumentId: order.instrumentId,
        instrumentTag: order.instrumentTag,
        instrumentName: order.instrumentName,
        instrumentLocation: order.instrumentLocation,
        faultDescription: order.faultDescription,
        priority: order.priority,
        status: order.status,
        assignedTo: order.assignedTo || '',
        assignedToName: order.assignedToName || '',
        report: order.report,
        reporterId: order.reporterId,
        reporterName: order.reporterName,
      });
    } else {
      setEditingOrder(null);
      setFormData({
        orderNumber: generateOrderNumber('WO'),
        instrumentId: '',
        instrumentTag: '',
        instrumentName: '',
        instrumentLocation: '',
        faultDescription: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
        assignedToName: '',
        report: '',
        reporterId: '1',
        reporterName: '当前用户',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assignedAt: formData.assignedTo ? new Date().toISOString() : undefined,
        startedAt: formData.status === 'in_progress' ? new Date().toISOString() : undefined,
        completedAt: formData.status === 'completed' ? new Date().toISOString() : undefined,
      };

      if (editingOrder) {
        await fetch(`/api/work-orders/${editingOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/work-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchWorkOrders();
    } catch (error) {
      console.error('Failed to save work order:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该工单吗？')) return;
    try {
      await fetch(`/api/work-orders/${id}`, { method: 'DELETE' });
      fetchWorkOrders();
    } catch (error) {
      console.error('Failed to delete work order:', error);
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '处理中';
      case 'assigned':
        return '已分配';
      case 'cancelled':
        return '已取消';
      default:
        return '待处理';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getPriorityText = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return '紧急';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      default:
        return '低';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">仪表维护工单</h1>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              返回上页
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建工单
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索工单号、仪表名称或位置..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="assigned">已分配</option>
                <option value="in_progress">处理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{order.orderNumber}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(order.priority)}`}
                    >
                      {getPriorityText(order.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(order)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">仪表信息</h4>
                  <p className="text-gray-700">{order.instrumentTag} - {order.instrumentName}</p>
                  <p className="text-sm text-gray-500">{order.instrumentLocation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">故障描述</h4>
                  <p className="text-gray-700">{order.faultDescription}</p>
                </div>

                {order.assignedToName && (
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">负责人: {order.assignedToName}</span>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">上报人:</span> {order.reporterName}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {order.assignedAt && (
                    <span>分配: {formatDateTime(order.assignedAt)}</span>
                  )}
                  {order.startedAt && (
                    <span>开始: {formatDateTime(order.startedAt)}</span>
                  )}
                  {order.completedAt && (
                    <span>完成: {formatDateTime(order.completedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无工单</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingOrder ? '编辑工单' : '创建工单'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工单号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">优先级 *</label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表位号 *</label>
                    <select
                      required
                      value={formData.instrumentTag}
                      onChange={handleInstrumentTagChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">请选择仪表位号</option>
                      {instruments.map((instrument) => (
                        <option key={instrument.id} value={instrument.tag}>
                          {instrument.tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.instrumentName}
                      onChange={(e) => setFormData({ ...formData, instrumentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表位置 *</label>
                    <input
                      type="text"
                      required
                      value={formData.instrumentLocation}
                      onChange={(e) => setFormData({ ...formData, instrumentLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">故障描述 *</label>
                  <textarea
                    required
                    value={formData.faultDescription}
                    onChange={(e) => setFormData({ ...formData, faultDescription: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请详细描述故障情况..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                    <input
                      type="text"
                      value={formData.assignedToName}
                      onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入负责人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">待处理</option>
                      <option value="assigned">已分配</option>
                      <option value="in_progress">处理中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">上报信息</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">上报人:</span> {formData.reporterName}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingOrder ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
