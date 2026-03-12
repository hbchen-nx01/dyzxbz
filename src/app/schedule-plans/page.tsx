'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { SchedulePlan } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function SchedulePlans() {
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SchedulePlan | null>(null);
  const [formData, setFormData] = useState({
    scheduleNumber: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    shiftType: 'day' as 'day' | 'night' | 'morning' | 'evening',
    assignees: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/schedule-plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch schedule plans:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const filteredPlans = plans.filter(
    (plan) =>
      (dateFilter ? plan.date === dateFilter : true) &&
      (plan.scheduleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.assignees.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (plan?: SchedulePlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        scheduleNumber: plan.scheduleNumber,
        title: plan.title,
        description: plan.description,
        date: plan.date,
        startTime: plan.startTime,
        endTime: plan.endTime,
        shiftType: plan.shiftType,
        assignees: plan.assignees,
        status: plan.status,
        notes: plan.notes || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        scheduleNumber: `SP-${Date.now()}`,
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'day',
        assignees: '',
        status: 'scheduled',
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
      if (editingPlan) {
        await fetch(`/api/schedule-plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/schedule-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      handleCloseModal();
      fetchPlans();
    } catch (error) {
      console.error('Failed to save schedule plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该排班计划吗？')) return;
    try {
      await fetch(`/api/schedule-plans/${id}`, { method: 'DELETE' });
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete schedule plan:', error);
    }
  };

  const getStatusColor = (status: SchedulePlan['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: SchedulePlan['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'scheduled':
        return '已计划';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const getShiftTypeText = (shiftType: SchedulePlan['shiftType']) => {
    switch (shiftType) {
      case 'day':
        return '白班';
      case 'night':
        return '夜班';
      case 'morning':
        return '早班';
      case 'evening':
        return '晚班';
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="排班计划管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">排班计划管理</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建排班计划
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索计划编号、标题或人员..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={handleDateFilter}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{plan.scheduleNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-indigo-600">{getShiftTypeText(plan.shiftType)}</span>
                    <span className="text-sm text-gray-500">{formatDate(plan.date)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="text-indigo-600 hover:text-indigo-900"
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">开始时间</h4>
                    <p className="text-gray-700">{plan.startTime}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">结束时间</h4>
                    <p className="text-gray-700">{plan.endTime}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">值班人员</h4>
                  <p className="text-gray-700">{plan.assignees}</p>
                </div>

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
          <div className="text-center py-12 text-gray-500">暂无排班计划</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? '编辑排班计划' : '创建排班计划'}
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
                      value={formData.scheduleNumber}
                      onChange={(e) => setFormData({ ...formData, scheduleNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="scheduled">已计划</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">班次类型 *</label>
                    <select
                      required
                      value={formData.shiftType}
                      onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="day">白班</option>
                      <option value="night">夜班</option>
                      <option value="morning">早班</option>
                      <option value="evening">晚班</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 *</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束时间 *</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请描述排班计划的详细内容..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">值班人员 *</label>
                  <input
                    type="text"
                    required
                    value={formData.assignees}
                    onChange={(e) => setFormData({ ...formData, assignees: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="输入值班人员姓名，用逗号分隔"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
