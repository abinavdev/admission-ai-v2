import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, Check, Clock, Trash2, RefreshCw,
  Database, Zap, AlertCircle,
} from 'lucide-react';
import { documents as mockDocuments } from '../data/mockData';
import { Document } from '../types';
import { DocStatusBadge } from '../components/ui/Badge';
import { useDocuments } from '../hooks/useDocuments';

export function KnowledgeBasePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { documents: apiDocs, fetchDocuments, deleteDocument } = useDocuments();
  const [localDocs, setLocalDocs] = useState<Document[]>(mockDocuments);

  useEffect(() => { fetchDocuments().catch(() => {}); }, [fetchDocuments]);

  const docs = apiDocs.length > 0 ? apiDocs : localDocs;

  const processedCount = docs.filter((d) => d.status === 'Processed').length;

  const simulateUpload = (name: string) => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          const newDoc: Document = {
            id: `D${Date.now()}`,
            name,
            size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
            status: 'Processing',
            uploadDate: new Date().toISOString().split('T')[0],
            type: 'pdf',
          };
          setLocalDocs((prev) => [newDoc, ...prev]);
          setTimeout(() => {
            setLocalDocs((prev) => prev.map((d) => d.id === newDoc.id ? { ...d, status: 'Processed' as const } : d));
          }, 3000);
          return 0;
        }
        return p + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) simulateUpload(files[0].name);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) simulateUpload(files[0].name);
  };

  const removeDoc = (id: string) => {
    deleteDocument(id).catch(() => {});
    setLocalDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: docs.length, icon: <FileText className="w-5 h-5 text-[#003B7A]" />, bg: 'bg-blue-50' },
          { label: 'Processed', value: processedCount, icon: <Check className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Processing', value: docs.filter((d) => d.status === 'Processing').length, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'AI Ready', value: `${Math.round((processedCount / docs.length) * 100)}%`, icon: <Zap className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
            <div>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${isDragging ? 'border-[#003B7A] bg-blue-50' : 'border-slate-200 hover:border-[#003B7A] hover:bg-slate-50'}`}
          >
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-[#003B7A]" />
            </div>
            <p className="font-semibold text-slate-900 text-sm mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-slate-400 mb-4">Supports PDF, DOC, DOCX, TXT</p>
            <span className="btn-primary text-xs px-4 py-2">Browse Files</span>
          </div>

          {uploading && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#003B7A] animate-spin" />
                <span className="text-xs font-medium text-slate-700">Uploading document...</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#003B7A] rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Knowledge Base Status */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-[#003B7A]" />
              <h3 className="font-semibold text-slate-900 text-sm">Knowledge Base Status</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Total Pages Indexed', value: '2,847' },
                { label: 'Last Updated', value: 'Jan 20, 2024' },
                { label: 'AI Model', value: 'GPT-4 + RAG' },
                { label: 'Languages', value: 'English, Hindi' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Knowledge base is active and serving queries
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Uploaded Documents</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {docs.map((doc) => (
              <div key={doc.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{doc.size}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{doc.uploadDate}</span>
                    {doc.status === 'Processing' && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                        <span className="text-xs text-amber-600">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <DocStatusBadge status={doc.status} />
                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {processedCount > 0 && (
            <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">{processedCount} documents processed and ready. AI is trained on your college information.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
