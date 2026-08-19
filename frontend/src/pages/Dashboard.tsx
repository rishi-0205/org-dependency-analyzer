import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Box,
  Briefcase,
  Sparkles,
  Network,
  ArrowRight,
  Search,
  Activity,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { DashboardStats } from '../types';
import PageContainer from '../components/layout/PageContainer';
import StatCard from '../components/dashboard/StatCard';
import AtRiskTable from '../components/dashboard/AtRiskTable';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/graph?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Compute redundancy coverage %
  const totalMods = stats?.total_modules || 14;
  const atRiskCount = stats?.at_risk_modules?.length || 0;
  const safeCount = Math.max(0, totalMods - atRiskCount);
  const coveragePercent = Math.round((safeCount / totalMods) * 100);

  return (
    <PageContainer className="space-y-8 animate-in fade-in duration-150">
      {/* ========================================== */}
      {/* TOP GREETING HEADER & QUICK CONTROLS       */}
      {/* ========================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#EFE5D3] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1912] tracking-tight">
            Organizational Health & Risk Overview
          </h1>
          <p className="text-sm text-[#A39A8B] max-w-2xl leading-relaxed">
            Real-time graph intelligence modeling team blast radius, single points of failure, and immediate backfill redundancy.
          </p>
        </div>

        {/* Search Pill + Launch Graph CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#A39A8B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture..."
              className="pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#EFE5D3] text-xs text-[#1C1912] placeholder:text-[#A39A8B] focus:outline-none focus:border-[#1C1912] shadow-sm w-48 sm:w-60"
            />
          </form>

          <button
            onClick={() => navigate('/graph')}
            className="px-5 py-2.5 rounded-full bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-bold tracking-wide uppercase shadow-sm flex items-center gap-2 transition-all"
          >
            <Network className="w-4 h-4 text-[#F4A62C]" />
            <span>Graph Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
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

      {/* Loaded Content */}
      {!isLoading && stats && (
        <>
          {/* ========================================== */}
          {/* 4 DIRECTORY TILES (Click to full page)     */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Engineering Staff"
              value={stats.total_people}
              subtitle="6 squads mapped"
              icon={Users}
              color="ink"
              onClick={() => navigate('/nodes/employees')}
            />
            <StatCard
              title="System Modules"
              value={stats.total_modules}
              subtitle="Services & libraries"
              icon={Box}
              color="rose"
              onClick={() => navigate('/nodes/modules')}
            />
            <StatCard
              title="Active Initiatives"
              value={stats.total_projects}
              subtitle="Strategic projects"
              icon={Briefcase}
              color="terracotta"
              onClick={() => navigate('/nodes/projects')}
            />
            <StatCard
              title="Skill Matrix"
              value={stats.total_skills}
              subtitle="Distinct technical capabilities"
              icon={Sparkles}
              color="amber"
              onClick={() => navigate('/nodes/skills')}
            />
          </div>

          {/* ========================================== */}
          {/* VISUAL CARDS: Large Organic Data Card +    */}
          {/* Dark Contrast Card + Circular Progress Ring */}
          {/* ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Large Primary Soft Data Visualization Card (2 Cols) */}
            <div className="lg:col-span-2 warm-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE5D3] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1C1912]">
                    Architecture Risk & Redundancy Composition
                  </h3>
                  <p className="text-xs text-[#A39A8B]">
                    Bus-factor vulnerability distribution across system services.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E15B43]" />
                  <span className="text-xs font-semibold text-[#1C1912]">{atRiskCount} SPoFs</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7FA65A] ml-2" />
                  <span className="text-xs font-semibold text-[#1C1912]">{safeCount} Covered</span>
                </div>
              </div>

              {/* Soft Organic Stat Distribution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#E15B43]/10 border border-[#E15B43]/20 space-y-1">
                  <div className="text-[11px] font-bold text-[#E15B43] uppercase tracking-wider">
                    High Risk SPoFs
                  </div>
                  <div className="text-2xl font-extrabold text-[#E15B43]">
                    {stats.at_risk_modules.filter((m) => m.criticality.toLowerCase() === 'high').length}
                  </div>
                  <div className="text-[11px] text-[#A39A8B]">
                    0 backup contributors
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F4A62C]/15 border border-[#F4A62C]/25 space-y-1">
                  <div className="text-[11px] font-bold text-[#995900] uppercase tracking-wider">
                    Medium Risk
                  </div>
                  <div className="text-2xl font-extrabold text-[#995900]">
                    {stats.at_risk_modules.filter((m) => m.criticality.toLowerCase() === 'medium').length}
                  </div>
                  <div className="text-[11px] text-[#A39A8B]">
                    Secondary impact tier
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#7FA65A]/15 border border-[#7FA65A]/25 space-y-1">
                  <div className="text-[11px] font-bold text-[#416124] uppercase tracking-wider">
                    Healthy Redundancy
                  </div>
                  <div className="text-2xl font-extrabold text-[#416124]">
                    {safeCount}
                  </div>
                  <div className="text-[11px] text-[#A39A8B]">
                    Multi-contributor services
                  </div>
                </div>
              </div>

              {/* Callout bar */}
              <div className="p-4 rounded-lg bg-[#FDF9F2] border border-[#EFE5D3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#F4A62C]" />
                  <span className="text-xs text-[#1C1912] font-medium">
                    Critical departure simulations model up to <strong>5-hop cascading blast radiuses</strong>.
                  </span>
                </div>
                <button
                  onClick={() => navigate('/graph')}
                  className="text-xs font-bold text-[#1C1912] hover:text-[#F4A62C] transition-colors flex items-center gap-1"
                >
                  <span>Explore in Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Dark Ink Contrast Card & Circular Progress Ring (1 Col) */}
            <div className="contrast-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-1 border-b border-white/10 pb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#F4A62C]">
                  Key At-A-Glance Metric
                </div>
                <h3 className="text-lg font-bold text-white">
                  Backup Contributor Coverage
                </h3>
              </div>

              {/* Circular Progress Ring */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress Fill */}
                    <path
                      className="text-[#F4A62C]"
                      strokeDasharray={`${coveragePercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center space-y-0.5">
                    <span className="text-3xl font-extrabold text-white">{coveragePercent}%</span>
                    <span className="block text-[10px] text-[#A39A8B] font-semibold uppercase">
                      Covered
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-white/80">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span>Single-Owner SPoFs</span>
                  <span className="font-mono font-bold text-[#E15B43]">{atRiskCount} modules</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Contributor Modules</span>
                  <span className="font-mono font-bold text-[#7FA65A]">{safeCount} modules</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* AT-RISK MODULES LIST TABLE                 */}
          {/* ========================================== */}
          <AtRiskTable modules={stats.at_risk_modules} />
        </>
      )}
    </PageContainer>
  );
}
