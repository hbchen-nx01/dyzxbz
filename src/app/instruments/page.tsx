'use client';

import { useState, useEffect } from 'react';
import { Gauge, Plus, Edit, Trash2, Upload, Download, Search, X } from 'lucide-react';
import { Instrument } from '@/types';
import { exportToExcel, importFromExcel, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function InstrumentManagement() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [personnel, setPersonnel] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    tag: '',
    name: '',
    model: '',
    manufacturer: '',
    location: '',
    installationDate: '',
    status: 'normal' as 'normal' | 'maintenance' | 'fault' | 'retired',
    specifications: {} as Record<string, string>,
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    assignedTo: '',
    assignedToName: '',
  });
  const [specEntries, setSpecEntries] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    fetchInstruments();
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredInstruments = instruments.filter(
    (inst) =>
      (statusFilter === 'all' || inst.status === statusFilter) &&
      (inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (instrument?: Instrument) => {
    if (instrument) {
      setEditingInstrument(instrument);
      setFormData({
        code: instrument.code,
        tag: instrument.tag,
        name: instrument.name,
        model: instrument.model,
        manufacturer: instrument.manufacturer,
        location: instrument.location,
        installationDate: instrument.installationDate,
        status: instrument.status,
        specifications: instrument.specifications,
        lastMaintenanceDate: instrument.lastMaintenanceDate || '',
        nextMaintenanceDate: instrument.nextMaintenanceDate || '',
        assignedTo: instrument.assignedTo || '',
        assignedToName: instrument.assignedToName || '',
      });
      setSpecEntries(
        Object.entries(instrument.specifications).map(([key, value]) => ({ key, value }))
      );
    } else {
      setEditingInstrument(null);
      setFormData({
        code: '',
        tag: '',
        name: '',
        model: '',
        manufacturer: '',
        location: '',
        installationDate: '',
        status: 'normal',
        specifications: {},
        lastMaintenanceDate: '',
        nextMaintenanceDate: '',
        assignedTo: '',
        assignedToName: '',
      });
      setSpecEntries([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInstrument(null);
    setSpecEntries([]);
  };

  const handleAddSpecEntry = () => {
    setSpecEntries([...specEntries, { key: '', value: '' }]);
  };

  const handleUpdateSpecEntry = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specEntries];
    updated[index][field] = value;
    setSpecEntries(updated);
  };

  const handleDeleteSpecEntry = (index: number) => {
    setSpecEntries(specEntries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specifications = specEntries.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const payload = {
        ...formData,
        specifications,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: formData.assignedTo ? personnel.find(p => p.id === formData.assignedTo)?.name : undefined,
      };

      if (editingInstrument) {
        await fetch(`/api/instruments/${editingInstrument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/instruments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchInstruments();
    } catch (error) {
      console.error('Failed to save instrument:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该仪表信息吗？')) return;
    try {
      await fetch(`/api/instruments/${id}`, { method: 'DELETE' });
      fetchInstruments();
    } catch (error) {
      console.error('Failed to delete instrument:', error);
    }
  };

  const handleExport = () => {
    const exportData = instruments.map(inst => ({
      仪表编号: inst.code,
      仪表位号: inst.tag,
      仪表名称: inst.name,
      型号: inst.model,
      制造商: inst.manufacturer,
      位置: inst.location,
      安装日期: inst.installationDate,
      状态: inst.status === 'normal' ? '正常' : inst.status === 'maintenance' ? '维护中' : inst.status === 'fault' ? '故障' : '已报废',
      上次维护日期: inst.lastMaintenanceDate || '',
      下次维护日期: inst.nextMaintenanceDate || '',
    }));
    exportToExcel(exportData, '仪表基础信息');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      for (const row of data as any[]) {
        await fetch('/api/instruments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: row['仪表编号'] || '',
            tag: row['仪表位号'] || '',
            name: row['仪表名称'] || '',
            model: row['型号'] || '',
            manufacturer: row['制造商'] || '',
            location: row['位置'] || '',
            installationDate: row['安装日期'] || new Date().toISOString().split('T')[0],
            status: row['状态'] === '正常' ? 'normal' : row['状态'] === '维护中' ? 'maintenance' : row['状态'] === '故障' ? 'fault' : 'retired',
            specifications: {},
          }),
        });
      }
      fetchInstruments();
      alert('导入成功！');
    } catch (error) {
      console.error('Failed to import instruments:', error);
      alert('导入失败，请检查文件格式。');
    }
  };

  const getStatusColor = (status: Instrument['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'fault':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Instrument['status']) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'maintenance':
        return '维护中';
      case 'fault':
        return '故障';
      default:
        return '已报废';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="仪表基础信息" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gauge className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">仪表基础信息</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加仪表
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索仪表名称、编号或位置..."
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
                <option value="normal">正常</option>
                <option value="maintenance">维护中</option>
                <option value="fault">故障</option>
                <option value="retired">已报废</option>
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
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                导入Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">仪表编号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">仪表位号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">仪表名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">型号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">制造商</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">责任人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次维护</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstruments.map((instrument) => (
                  <tr key={instrument.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenModal(instrument);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {instrument.code}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instrument.tag}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{instrument.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instrument.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instrument.manufacturer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instrument.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(instrument.status)}`}>
                        {getStatusText(instrument.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instrument.assignedToName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {instrument.nextMaintenanceDate ? formatDate(instrument.nextMaintenanceDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(instrument)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(instrument.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInstruments.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无仪表信息</div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingInstrument ? '编辑仪表信息' : '添加仪表'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表位号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">型号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">制造商 *</label>
                    <input
                      type="text"
                      required
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">位置 *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">安装日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.installationDate}
                      onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <option value="normal">正常</option>
                      <option value="maintenance">维护中</option>
                      <option value="fault">故障</option>
                      <option value="retired">已报废</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">上次维护日期</label>
                    <input
                      type="date"
                      value={formData.lastMaintenanceDate}
                      onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">下次维护日期</label>
                    <input
                      type="date"
                      value={formData.nextMaintenanceDate}
                      onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">责任人</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedPerson = personnel.find(p => p.id === selectedId);
                        setFormData({ 
                          ...formData, 
                          assignedTo: selectedId, 
                          assignedToName: selectedPerson?.name || '' 
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">请选择责任人</option>
                      {personnel.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">技术规格</h3>
                    <button
                      type="button"
                      onClick={handleAddSpecEntry}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      添加规格
                    </button>
                  </div>
                  <div className="space-y-2">
                    {specEntries.map((entry, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="规格名称"
                          value={entry.key}
                          onChange={(e) => handleUpdateSpecEntry(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="规格值"
                          value={entry.value}
                          onChange={(e) => handleUpdateSpecEntry(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteSpecEntry(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
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
                    {editingInstrument ? '更新' : '添加'}
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
