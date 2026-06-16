import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload, FileText, Check, Clock, Trash2, RefreshCw,
  Database, Zap, AlertTriangle, Layers,
} from 'lucide-react';
import { Document } from '../types';
import { DocStatusBadge } from '../components/ui/Badge';
import { useDocuments } from '../hooks/useDocuments';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

function normalizeDoc(d: Record<string, unknown>): Document {
  const status = String(d.status ?? '');
  const normalStatus = status === 'PROCESSED' ? 'Processed' : status === 'PROCESSING' ? 'Processing' : status === 'FAILED' ? 'Queued' : 'Queued';
  const sizeBytes = Number(d.size ?? 0);
  const sizeMB = sizeBytes > 0 ? `${(sizeBytes / 1048576).toFixed(1)} MB` : String(d.size ?? '—');
  return {
    id: String(d.id),
    name: String(d.name ?? ''),
    size: sizeMB,
    status: normalStatus as Document['status'],
    uploadDate: d.uploadedAt ? new Date(String(d.uploadedAt)).toLocaleDateString() : String(d.uploadDate ?? ''),
    type: String(d.mimeType ?? d.type ?? 'pdf').includes('pdf') ? 'pdf' : 'doc',
  };
}

export function KnowledgeBasePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [docStats, setDocStats] = useState<{
    totalChunks: number;
    failedCount: number;
    processedCount: number;
    totalDocuments: number;
    processingCount: number;
  } | null>(null);
  const { documents: rawDocs, loading, error, pagination, fetchDocuments, uploadDocument, deleteDocument } = useDocuments();
  const toast = useToast();

  const fetchDocStats = useCallback(async () => {
    try {
      const res = await apiClient.get<{
        data: {
          totalChunks: number;
          failedCount: number;
          processedCount: number;
          totalDocuments: number;
          processingCount: number;
        };
      }>(API_ENDPOINTS.documents.stats);
      if (res.data?.data) setDocStats(res.data.data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchDocuments(currentPage, 10);
    fetchDocStats();
  }, [currentPage, fetchDocuments, fetchDocStats]);

  useEffect(() => {
    if (error) toast(error, 'error');
  }, [error]);

  const docs = (rawDocs as unknown as Record<string, unknown>[]).map(normalizeDoc);
  const totalDocs = docStats?.totalDocuments ?? 0;
  const processedCount = docStats?.processedCount ?? 0;
  const processingCount = docStats?.processingCount ?? 0;
  const failedCount = docStats?.failedCount ?? 0;
  const totalChunks = docStats?.totalChunks ?? 0;
  const aiReadyPercent = totalDocs > 0 ? Math.round((processedCount / totalDocs) * 100) : 0;

  const totalCount = pagination?.total || 0;
  const startRange = totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endRange = Math.min(currentPage * 10, totalCount);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 15;
      });
    }, 150);
    try {
      await uploadDocument(file);
      clearInterval(interval);
      setUploadProgress(100);
      toast(`${file.name} uploaded successfully`, 'success');
      setCurrentPage(1);
      await fetchDocuments(1, 10);
      fetchDocStats();
    } catch {
      clearInterval(interval);
      toast('Failed to upload file', 'error');
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileUpload(files[0]);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDocument(id);
      toast(`${name} deleted`, 'success');
      
      const isLastItemOnPage = docs.length === 1;
      const targetPage = (isLastItemOnPage && currentPage > 1) ? currentPage - 1 : currentPage;
      
      setCurrentPage(targetPage);
      await fetchDocuments(targetPage, 10);
      fetchDocStats();
    } catch {
      toast('Failed to delete document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading && docs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          [
            { label: 'Total Documents', value: totalDocs, icon: <FileText className="w-5 h-5 text-[#003B7A]" />, bg: 'bg-blue-50' },
            { label: 'Processed', value: processedCount, icon: <Check className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Processing', value: processingCount, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
            { label: 'Failed', value: failedCount, icon: <AlertTriangle className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
            { label: 'Total Chunks', value: totalChunks, icon: <Layers className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50' },
            { label: 'AI Ready', value: `${aiReadyPercent}%`, icon: <Zap className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>{stat.icon}</div>
              <div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))
        )}
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
                { label: 'Total Docs Indexed', value: processedCount },
                { label: 'Total Chunks', value: totalChunks },
                { label: 'Failed Documents', value: failedCount },
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
        <div className="lg:col-span-2 card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Uploaded Documents</h3>
              {totalCount > 0 && (
                <span className="text-xs text-slate-400">
                  Showing {startRange}–{endRange} of {totalCount} documents
                </span>
              )}
            </div>
            {loading && docs.length === 0 ? (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No documents uploaded yet. Upload your first document above.</p>
              </div>
            ) : (
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
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {pagination && pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-center gap-4 bg-slate-50/50">
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  &lt; Previous
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <span className="text-xs text-slate-600 font-medium">
                  Page {currentPage} of {pagination.pages}
                </span>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  type="button"
                  disabled={currentPage === pagination.pages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer"
                >
                  Next &gt;
                </button>
              </div>
            )}

            {processedCount > 0 && (
              <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-emerald-700 font-medium">{processedCount} documents processed and ready. AI is trained on your college information.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
