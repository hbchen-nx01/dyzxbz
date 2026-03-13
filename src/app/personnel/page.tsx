'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Upload, Download, Search, X, Image as ImageIcon } from 'lucide-react';
import { Personnel } from '@/types';
import { exportToExcel, importFromExcel, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function PersonnelManagement() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: '',
    team: '',
    skillLevel: '',
    phone: '',
    email: '',
    hireDate: '',
    status: 'active' as 'active' | 'inactive',
    skills: [] as string[],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPersonnel = personnel.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (personnel?: Personnel) => {
    if (personnel) {
      setEditingPersonnel(personnel);
      setFormData({
        name: personnel.name,
        employeeId: personnel.employeeId,
        department: personnel.department,
        team: personnel.team,
        skillLevel: personnel.skillLevel,
        phone: personnel.phone,
        email: personnel.email,
        hireDate: personnel.hireDate,
        status: personnel.status,
        skills: personnel.skills || [],
      });
      setPhotoPreview(personnel.photo || '');
    } else {
      setEditingPersonnel(null);
      setFormData({
        name: '',
        employeeId: '',
        department: '',
        team: '',
        skillLevel: '',
        phone: '',
        email: '',
        hireDate: '',
        status: 'active',
        skills: [],
      });
      setPhotoPreview('');
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPersonnel(null);
  };

  const handleOpenDetailModal = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPersonnel(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        photo: photoPreview || undefined,
      };

      if (editingPersonnel) {
        await fetch(`/api/personnel/${editingPersonnel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchPersonnel();
    } catch (error) {
      console.error('Failed to save personnel:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该人员信息吗？')) return;
    try {
      await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
      fetchPersonnel();
    } catch (error) {
      console.error('Failed to delete personnel:', error);
    }
  };

  const handleExport = () => {
    const exportData = personnel.map(p => ({
      姓名: p.name,
      工号: p.employeeId,
      部门: p.department,
      技能等级: p.skillLevel,
      电话: p.phone,
      邮箱: p.email,
      入职日期: p.hireDate,
      状态: p.status === 'active' ? '在职' : '离职',
      技能: p.skills?.join(', ') || '',
    }));
    exportToExcel(exportData, '人员信息');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      for (const row of data as any[]) {
        await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row['姓名'] || '',
            employeeId: row['工号'] || '',
            department: row['部门'] || '',
            position: row['职位'] || '',
            phone: row['电话'] || '',
            email: row['邮箱'] || '',
            hireDate: row['入职日期'] || new Date().toISOString().split('T')[0],
            status: row['状态'] === '在职' ? 'active' : 'inactive',
            skills: row['技能'] ? row['技能'].split(',').map((s: string) => s.trim()) : [],
          }),
        });
      }
      fetchPersonnel();
      alert('导入成功！');
    } catch (error) {
      console.error('Failed to import personnel:', error);
      alert('导入失败，请检查文件格式。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="人员信息管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加人员
          </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名、工号或部门..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">照片</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">班组</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">技能等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersonnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {person.photo ? (
                        <div
                          className="cursor-pointer"
                          onClick={() => handleOpenDetailModal(person)}
                        >
                          <img
                            src={person.photo}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                          onClick={() => handleOpenDetailModal(person)}
                        >
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.skillLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          person.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {person.status === 'active' ? '在职' : '离职'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(person)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(person.id)}
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
          {filteredPersonnel.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无人员信息</div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPersonnel ? '编辑人员信息' : '添加人员'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      上传照片
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">工号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">部门 *</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">班组 *</label>
                    <input
                      type="text"
                      required
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">技能等级 *</label>
                    <select
                      required
                      value={formData.skillLevel}
                      onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">请选择技能等级</option>
                      <option value="首席技师">首席技师</option>
                      <option value="资深技师">资深技师</option>
                      <option value="主任技师">主任技师</option>
                      <option value="主管技师">主管技师</option>
                      <option value="主操">主操</option>
                      <option value="副操">副操</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">电话 *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">入职日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">在职</option>
                      <option value="inactive">离职</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">技能（用逗号分隔）</label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：仪表维护, 故障诊断, 系统调试"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
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
                    {editingPersonnel ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 详细信息模态框 */}
      {isDetailModalOpen && selectedPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">人员详细信息</h3>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center mb-8">
              {selectedPersonnel.photo ? (
                <img
                  src={selectedPersonnel.photo}
                  alt={selectedPersonnel.name}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <h4 className="text-2xl font-bold text-gray-900">{selectedPersonnel.name}</h4>
              <p className="text-gray-500">{selectedPersonnel.employeeId}</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">部门</p>
                  <p className="text-gray-900">{selectedPersonnel.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">班组</p>
                  <p className="text-gray-900">{selectedPersonnel.team}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">技能等级</p>
                  <p className="text-gray-900">{selectedPersonnel.skillLevel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">状态</p>
                  <p className={`text-sm font-medium px-2 py-1 rounded-full ${selectedPersonnel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedPersonnel.status === 'active' ? '在职' : '离职'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">电话</p>
                  <p className="text-gray-900">{selectedPersonnel.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">邮箱</p>
                  <p className="text-gray-900">{selectedPersonnel.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">入职日期</p>
                  <p className="text-gray-900">{formatDate(selectedPersonnel.hireDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">创建时间</p>
                  <p className="text-gray-900">{formatDate(selectedPersonnel.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">技能</p>
                <p className="text-gray-900">
                  {selectedPersonnel.skills && selectedPersonnel.skills.length > 0
                    ? selectedPersonnel.skills.join(', ')
                    : '无'}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
