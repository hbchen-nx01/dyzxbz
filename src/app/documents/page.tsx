'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Search, X, Eye } from 'lucide-react';
import { Document } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    documentNumber: '',
    title: '',
    description: '',
    category: 'manual' as 'manual' | 'report' | 'standard' | 'other',
    fileType: '',
    fileSize: 0,
    fileUrl: '',
    uploadedBy: '',
    tags: '',
  });
  const [fileInput, setFileInput] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      (categoryFilter === 'all' || doc.category === categoryFilter) &&
      (doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = () => {
    setFormData({
      documentNumber: `DOC-${Date.now()}`,
      title: '',
      description: '',
      category: 'manual',
      fileType: '',
      fileSize: 0,
      fileUrl: '',
      uploadedBy: '',
      tags: '',
    });
    setFileInput(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInput(file);
      setFormData({
        ...formData,
        fileType: file.type,
        fileSize: file.size,
        title: formData.title || file.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!fileInput) {
        alert('请选择文件');
        return;
      }

      // 模拟文件上传，实际项目中应该上传到服务器
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const payload = {
          ...formData,
          fileUrl: base64String,
        };

        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        handleCloseModal();
        fetchDocuments();
      };
      reader.readAsDataURL(fileInput);
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该文档吗？')) return;
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewDocument(null);
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.title;
      link.click();
    }
  };

  const getCategoryText = (category: Document['category']) => {
    switch (category) {
      case 'manual':
        return '手册';
      case 'report':
        return '报告';
      case 'standard':
        return '标准';
      case 'other':
        return '其他';
      default:
        return '未知';
    }
  };

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="文档管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">文档管理</h2>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            上传文档
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文档编号、标题或上传者..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">全部分类</option>
                <option value="manual">手册</option>
                <option value="report">报告</option>
                <option value="standard">标准</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{doc.documentNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(doc.category)}`}>
                      {getCategoryText(doc.category)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="text-blue-600 hover:text-blue-900"
                    title="预览"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-green-600 hover:text-green-900"
                    title="下载"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">文档标题</h4>
                  <p className="text-gray-700">{doc.title}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">描述</h4>
                  <p className="text-gray-700">{doc.description || '无'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">上传者</h4>
                    <p className="text-gray-700">{doc.uploadedBy}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">上传日期</h4>
                    <p className="text-gray-700">{formatDate(doc.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">文件类型:</span> {doc.fileType || '未知'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">文件大小:</span> {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>

                {doc.tags && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">标签:</span> {doc.tags}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无文档</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">上传文档</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">文档编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="manual">手册</option>
                      <option value="report">报告</option>
                      <option value="standard">标准</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">文档标题 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">选择文件 *</label>
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    {fileInput && (
                      <div className="mt-2 text-sm text-gray-600">
                        已选择: {fileInput.name} ({formatFileSize(fileInput.size)})
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="请描述文档内容..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">上传者 *</label>
                    <input
                      type="text"
                      required
                      value={formData.uploadedBy}
                      onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="输入标签，用逗号分隔"
                    />
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
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    上传
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isPreviewOpen && previewDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">文档预览</h2>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{previewDocument.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">文档编号:</span> {previewDocument.documentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">分类:</span> {getCategoryText(previewDocument.category)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">上传者:</span> {previewDocument.uploadedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">上传日期:</span> {formatDate(previewDocument.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">文件类型:</span> {previewDocument.fileType || '未知'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">文件大小:</span> {formatFileSize(previewDocument.fileSize)}
                      </p>
                    </div>
                  </div>
                  {previewDocument.description && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">描述</h4>
                      <p className="text-gray-700">{previewDocument.description}</p>
                    </div>
                  )}
                  {previewDocument.tags && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">标签</h4>
                      <p className="text-gray-700">{previewDocument.tags}</p>
                    </div>
                  )}
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">文件内容</h4>
                  {previewDocument.fileUrl && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      {previewDocument.fileType?.includes('image/') ? (
                        <img
                          src={previewDocument.fileUrl}
                          alt={previewDocument.title}
                          className="max-w-full h-auto mx-auto"
                        />
                      ) : previewDocument.fileType?.includes('text/') || previewDocument.fileType?.includes('application/pdf') ? (
                        <iframe
                          src={previewDocument.fileUrl}
                          title={previewDocument.title}
                          className="w-full h-96 border border-gray-300 rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4" />
                          <p>无法在线预览此文件类型</p>
                          <button
                            onClick={() => handleDownload(previewDocument)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            下载文件
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
