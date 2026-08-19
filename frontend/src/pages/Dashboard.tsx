import { useState, useEffect } from 'react';
import { Users, Box, Briefcase, Sparkles, Network, ArrowRight } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { DashboardStats } from '../types';
import PageContainer from '../components/layout/PageContainer';
import StatCard from '../components/dashboard/StatCard';
import AtRiskTable from '../components/dashboard/AtRiskTable';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

interface DashboardProps {
  onOpenGraphModal?: () => void;
}

export default function Dashboard({ onOpenGraphModal }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchDashboardData = () => {
    setIsLoading(true);
    setError(null);
    api
      .getDashboard()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsRetrying(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchDashboardData();
  };

  return (
    <PageContainer className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            Organization Risk & Bus-Factor Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time organizational graph analytics modeling blast radius, single points of failure, and immediate skill-backfill intelligence.
          </p>
        </div>

        {onOpenGraphModal && (
          <button
            onClick={onOpenGraphModal}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Network className="w-4 h-4" />
            <span>Explore Dependency Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          title="Could Not Load Dashboard Data"
          message={error.message}
          hint={error.data?.hint}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <LoadingSkeleton type="card" count={4} />
          <LoadingSkeleton type="table" count={5} />
        </div>
      )}

      {/* Loaded Stats & Content */}
      {!isLoading && stats && (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Engineering Staff"
              value={stats.total_people}
              subtitle="Mapped across 6 teams"
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="System Modules"
              value={stats.total_modules}
              subtitle="Microservices & libraries"
              icon={Box}
              color="purple"
            />
            <StatCard
              title="Active Initiatives"
              value={stats.total_projects}
              subtitle="Cross-team projects"
              icon={Briefcase}
              color="emerald"
            />
            <StatCard
              title="Skill Matrix"
              value={stats.total_skills}
              subtitle="Distinct technical capabilities"
              icon={Sparkles}
              color="amber"
            />
          </div>

          {/* At-Risk Modules Table */}
          <AtRiskTable modules={stats.at_risk_modules} />

          {/* Visual Graph Callout Card */}
          {onOpenGraphModal && (
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30 flex-shrink-0">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Interactive Org-Wide Architecture Topology
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                    Inspect all upstream and downstream service dependencies in real-time force-directed 2D canvas with node criticality and ownership highlights.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenGraphModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Graph Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
