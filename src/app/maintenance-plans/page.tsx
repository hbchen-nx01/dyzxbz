'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, Upload, Download, Search, X } from 'lucide-react';
import { MaintenancePlan, Instrument } from '@/types';
import { exportToExcel, importFromExcel, formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function MaintenancePlans() {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [formData, setFormData] = useState({
    planNumber: '',
    instrumentId: '',
    instrumentTag: '',
    instrumentName: '',
    type: 'preventive' as 'preventive' | 'predictive',
    title: '',
    description: '',
    scheduledDate: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    assignedTo: '',
    assignedToName: '',
    status: 'pending' as 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'overdue',
    notes: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchInstruments();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/maintenance-plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch maintenance plans:', error);
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
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPlans = plans.filter(
    (plan) =>
      (statusFilter === 'all' || plan.status === statusFilter) &&
      (plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (plan?: MaintenancePlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        planNumber: plan.planNumber,
        instrumentId: plan.instrumentId,
        instrumentTag: plan.instrumentTag,
        instrumentName: plan.instrumentName,
        type: plan.type,
        title: plan.title,
        description: plan.description,
        scheduledDate: plan.scheduledDate,
        frequency: plan.frequency,
        assignedTo: plan.assignedTo || '',
        assignedToName: plan.assignedToName || '',
        status: plan.status,
        notes: plan.notes || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        planNumber: `MP-${Date.now()}`,
        instrumentId: '',
        instrumentTag: '',
        instrumentName: '',
        type: 'preventive',
        title: '',
        description: '',
        scheduledDate: '',
        frequency: 'monthly',
        assignedTo: '',
        assignedToName: '',
        status: 'pending',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        completedAt: formData.status === 'completed' ? new Date().toISOString() : undefined,
      };

      if (editingPlan) {
        await fetch(`/api/maintenance-plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/maintenance-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchPlans();
    } catch (error) {
      console.error('Failed to save maintenance plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该维护计划吗？')) return;
    try {
      await fetch(`/api/maintenance-plans/${id}`, { method: 'DELETE' });
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete maintenance plan:', error);
    }
  };

  const handleExport = () => {
    const exportData = plans.map(plan => ({
      计划编号: plan.planNumber,
      仪表位号: plan.instrumentTag,
      仪表名称: plan.instrumentName,
      计划类型: plan.type === 'preventive' ? '预防性' : '预知性',
      计划标题: plan.title,
      计划日期: plan.scheduledDate,
      频率: plan.frequency === 'daily' ? '每日' : plan.frequency === 'weekly' ? '每周' : plan.frequency === 'monthly' ? '每月' : plan.frequency === 'quarterly' ? '每季度' : '每年',
      状态: plan.status === 'completed' ? '已完成' : plan.status === 'in_progress' ? '进行中' : plan.status === 'scheduled' ? '已计划' : plan.status === 'overdue' ? '逾期' : '待处理',
      负责人: plan.assignedToName || '',
      完成时间: plan.completedAt || '',
    }));
    exportToExcel(exportData, '维护计划');
  };

  const getStatusColor = (status: MaintenancePlan['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: MaintenancePlan['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'scheduled':
        return '已计划';
      case 'overdue':
        return '逾期';
      default:
        return '待处理';
    }
  };

  const getTypeText = (type: MaintenancePlan['type']) => {
    return type === 'preventive' ? '预防性' : '预知性';
  };

  const getFrequencyText = (frequency: MaintenancePlan['frequency']) => {
    switch (frequency) {
      case 'daily':
        return '每日';
      case 'weekly':
        return '每周';
      case 'monthly':
        return '每月';
      case 'quarterly':
        return '每季度';
      case 'yearly':
        return '每年';
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="维护计划管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">维护计划管理</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建维护计划
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索计划编号、仪表名称或标题..."
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
                <option value="scheduled">已计划</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="overdue">逾期</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                导出Excel
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{plan.planNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">{getTypeText(plan.type)}</span>
                    <span className="text-sm text-gray-500">{getFrequencyText(plan.frequency)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">计划标题</h4>
                  <p className="text-gray-700">{plan.title}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">仪表信息</h4>
                  <p className="text-gray-700">{plan.instrumentTag} - {plan.instrumentName}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">计划日期</h4>
                  <p className="text-gray-700">{formatDate(plan.scheduledDate)}</p>
                </div>

                {plan.assignedToName && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">负责人:</span> {plan.assignedToName}
                    </p>
                  </div>
                )}

                {plan.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">备注:</span> {plan.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无维护计划</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? '编辑维护计划' : '创建维护计划'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.planNumber}
                      onChange={(e) => setFormData({ ...formData, planNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划类型 *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="preventive">预防性维护</option>
                      <option value="predictive">预知性维护</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">频率 *</label>
                    <select
                      required
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">每日</option>
                      <option value="weekly">每周</option>
                      <option value="monthly">每月</option>
                      <option value="quarterly">每季度</option>
                      <option value="yearly">每年</option>
                    </select>
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
                      <option value="scheduled">已计划</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="overdue">逾期</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请描述维护计划的详细内容..."
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
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="添加备注信息..."
                  />
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
                    {editingPlan ? '更新' : '创建'}
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
