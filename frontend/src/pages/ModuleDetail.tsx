import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  ExternalLink,
  ArrowLeft,
  Flame,
  FolderGit2,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { ModuleDetail as ModuleDetailType } from '../types';
import PageContainer from '../components/layout/PageContainer';
import CriticalityBadge from '../components/common/CriticalityBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import DependencyFlow from '../components/module/DependencyFlow';
import ContributorList from '../components/module/ContributorList';

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<ModuleDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    api
      .getModule(id)
      .then((data) => {
        setModuleData(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="table" count={2} />
      </PageContainer>
    );
  }

  if (error || !moduleData) {
    return (
      <PageContainer className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
        <ErrorBanner
          title="Could Not Load Module"
          message={error?.message || 'The requested module could not be found.'}
          hint={error?.data?.hint}
        />
      </PageContainer>
    );
  }

  const isSinglePointOfFailure =
    moduleData.owner && moduleData.contributors.length === 0;

  return (
    <PageContainer className="space-y-8 animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Overview</span>
      </Link>

      {/* Main Module Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-purple-400 flex items-center justify-center ring-1 ring-purple-500/30 flex-shrink-0">
              <Box className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {moduleData.name}
                </h1>
                <CriticalityBadge level={moduleData.criticality} size="md" />
                {isSinglePointOfFailure && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Single Point of Failure
                  </span>
                )}
              </div>

              {moduleData.description && (
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {moduleData.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                {moduleData.project && (
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project: <strong className="text-slate-300">{moduleData.project}</strong></span>
                  </div>
                )}
                {moduleData.repo_url && (
                  <a
                    href={moduleData.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Repository Source</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Primary Owner Widget */}
          {moduleData.owner && (
            <div className="w-full lg:w-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between lg:flex-col lg:items-start gap-4">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Primary Owner / Architect
                </div>
                <Link
                  to={`/people/${moduleData.owner.id}`}
                  className="text-base font-bold text-slate-100 hover:text-indigo-300 transition-colors block"
                >
                  {moduleData.owner.name}
                </Link>
                {moduleData.owner.role && (
                  <div className="text-xs text-slate-400">{moduleData.owner.role}</div>
                )}
              </div>

              <button
                onClick={() => navigate(`/people/${moduleData.owner!.id}`)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all shadow-md"
              >
                <Flame className="w-3.5 h-3.5 text-amber-200" />
                <span>Simulate Owner Departure</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Bidirectional Dependency Flow */}
      <DependencyFlow
        upstream={moduleData.depends_on}
        downstream={moduleData.depended_on_by}
      />

      {/* Contributor Activity Breakdown */}
      <ContributorList contributors={moduleData.contributors} />
    </PageContainer>
  );
}
