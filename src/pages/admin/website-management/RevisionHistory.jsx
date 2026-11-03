// src/pages/admin/website-management/RevisionHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, RotateCcw, Clock, User, CheckCircle2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

export default function RevisionHistory() {
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState(null);

  const loadRevisions = async () => {
    setIsLoading(true);
    try {
      const res = await cmsAdminApi.getRevisions();
      const list = res?.data || res || [];
      setRevisions(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load revision history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const handleRestore = async (id, version) => {
    if (!window.confirm(`Restore version ${version} as the current draft?`)) return;
    setIsRestoring(true);
    try {
      await cmsAdminApi.restoreRevision(id);
      toast.success(`Version ${version} restored as draft. Review and publish to make live.`);
      navigate('/admin/website-management');
    } catch {
      toast.error('Failed to restore revision');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/website-management')}
              className="p-2 rounded-xl bg-[#0F0F13] border border-white/[0.06] hover:border-[#C5A880]/30 text-[#A1A1AA] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] flex items-center gap-2">
                <History className="w-5 h-5 text-[#C5A880]" />
                Landing Page Revision History
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit trail of all published snapshots with atomic one-click restoration
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#71717A] bg-[#0F0F13] rounded-2xl border border-white/[0.04]">
            Hydrating revision logs...
          </div>
        ) : revisions.length === 0 ? (
          <div className="p-12 text-center bg-[#0F0F13] rounded-2xl border border-white/[0.04] space-y-2">
            <History className="w-8 h-8 text-[#71717A] mx-auto" />
            <p className="text-sm font-semibold text-[#F5F5F7]">No revisions recorded</p>
            <p className="text-xs text-[#71717A]">Publishing changes will generate immutable version snapshots here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {revisions.map((rev, index) => (
              <div
                key={rev.id || index}
                className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#C5A880]">
                      v{rev.versionNumber}
                    </span>
                    {index === 0 && <Badge variant="emerald" dot>Live Version</Badge>}
                    <span className="text-xs text-[#71717A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rev.publishedAt ? new Date(rev.publishedAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F5F5F7]">
                    {rev.changeSummary || 'No change summary provided'}
                  </p>
                  <p className="text-xs text-[#71717A] flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Published by: {rev.publishedBy || 'ADMIN'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewingSnapshot(rev)}
                    leftIcon={FileText}
                  >
                    View Snapshot
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRestore(rev.id, rev.versionNumber)}
                    disabled={isRestoring}
                    leftIcon={RotateCcw}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: View Snapshot */}
        {viewingSnapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#0F0F13] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#F5F5F7]">
                  Snapshot v{viewingSnapshot.versionNumber} Data
                </h3>
                <button onClick={() => setViewingSnapshot(null)} className="text-[#71717A] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-[#14141A] border border-white/[0.04]">
                <pre className="text-xs font-mono text-[#A1A1AA] whitespace-pre-wrap">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(viewingSnapshot.snapshotData), null, 2);
                    } catch {
                      return viewingSnapshot.snapshotData;
                    }
                  })()}
                </pre>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setViewingSnapshot(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

