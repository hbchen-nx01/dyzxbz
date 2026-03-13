'use client';

import { useState, useEffect } from 'react';
import { Wrench, Plus, Edit, Trash2, Download, Search, X } from 'lucide-react';
import { RecycleRecord } from '@/types';
import { exportToExcel, formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function RepairReuse() {
  const [records, setRecords] = useState<RecycleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecycleRecord | null>(null);
  const [formData, setFormData] = useState({
    recordNumber: '',
    itemName: '',
    itemCode: '',
    originalValue: '',
    repairCost: '',
    savedValue: '',
    repairDate: '',
    repairedBy: '',
    description: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/repair-reuse');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch repair reuse records:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRecords = records.filter(
    (record) =>
      (record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.repairedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (record?: RecycleRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        recordNumber: record.recordNumber,
        itemName: record.itemName,
        itemCode: record.itemCode,
        originalValue: record.originalValue.toString(),
        repairCost: record.repairCost.toString(),
        savedValue: record.savedValue.toString(),
        repairDate: record.repairDate,
        repairedBy: record.repairedBy,
        description: record.description,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        recordNumber: `RR-${Date.now()}`,
        itemName: '',
        itemCode: '',
        originalValue: '',
        repairCost: '',
        savedValue: '',
        repairDate: new Date().toISOString().split('T')[0],
        repairedBy: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        originalValue: parseFloat(formData.originalValue) || 0,
        repairCost: parseFloat(formData.repairCost) || 0,
        savedValue: parseFloat(formData.savedValue) || 0,
      };

      if (editingRecord) {
        await fetch(`/api/repair-reuse/${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/repair-reuse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.error('Failed to save repair reuse record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该修旧利废记录吗？')) return;
    try {
      await fetch(`/api/repair-reuse/${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete repair reuse record:', error);
    }
  };

  const handleExport = () => {
    const exportData = records.map(record => ({
      记录编号: record.recordNumber,
      物品名称: record.itemName,
      物品编码: record.itemCode,
      原值: record.originalValue,
      修复成本: record.repairCost,
      节约价值: record.savedValue,
      修复日期: record.repairDate,
      修复人员: record.repairedBy,
      描述: record.description,
    }));
    exportToExcel(exportData, '修旧利废记录');
  };



  const calculateStats = () => {
    const totalRecords = records.length;
    const totalCost = records.reduce((sum, record) => sum + record.repairCost, 0);
    const totalSavings = records.reduce((sum, record) => sum + record.savedValue, 0);
    const netSavings = totalSavings - totalCost;

    return { totalRecords, totalCost, totalSavings, netSavings };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="修旧利废管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">修旧利废管理</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建修旧利废记录
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">总记录数</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.totalRecords}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">总修复成本</h3>
            <p className="text-3xl font-bold text-blue-600">¥{stats.totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">总预估节省</h3>
            <p className="text-3xl font-bold text-green-600">¥{stats.totalSavings.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">净节省</h3>
            <p className="text-3xl font-bold text-purple-600">¥{stats.netSavings.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索记录编号、物品名称或修复人员..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                导出Excel
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{record.recordNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(record)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">物品信息</h4>
                  <p className="text-gray-700">{record.itemName} ({record.itemCode})</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">描述</h4>
                  <p className="text-gray-700">{record.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">修复日期</h4>
                    <p className="text-gray-700">{formatDate(record.repairDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">修复人员</h4>
                    <p className="text-gray-700">{record.repairedBy}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">原值:</span> ¥{record.originalValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">修复成本:</span> ¥{record.repairCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">节约价值:</span> ¥{record.savedValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无修旧利废记录</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? '编辑修旧利废记录' : '创建修旧利废记录'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">记录编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.recordNumber}
                      onChange={(e) => setFormData({ ...formData, recordNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">物品编码 *</label>
                    <input
                      type="text"
                      required
                      value={formData.itemCode}
                      onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">修复日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.repairDate}
                      onChange={(e) => setFormData({ ...formData, repairDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">修复人员 *</label>
                    <input
                      type="text"
                      required
                      value={formData.repairedBy}
                      onChange={(e) => setFormData({ ...formData, repairedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">原值 *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.originalValue}
                      onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">修复成本 *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.repairCost}
                      onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">节约价值 *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.savedValue}
                      onChange={(e) => setFormData({ ...formData, savedValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述 *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请描述修旧利废情况..."
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {editingRecord ? '更新' : '创建'}
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
