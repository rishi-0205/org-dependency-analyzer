import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mail,
  Shield,
  Sparkles,
  GitCommit,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { api, ApiError } from '../api/client';
import { PersonDetail as PersonDetailType, ImpactResponse, CandidateResponse } from '../types';
import PageContainer from '../components/layout/PageContainer';
import CriticalityBadge from '../components/common/CriticalityBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import ImpactPanel from '../components/person/ImpactPanel';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Departure Simulation State (F2 + F3 triggered on-demand)
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);
  const [candidatesData, setCandidatesData] = useState<CandidateResponse | null>(null);
  const [simulationError, setSimulationError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setIsSimulating(false);
    setImpactData(null);
    setCandidatesData(null);

    api
      .getPerson(id)
      .then((data) => {
        setPerson(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleSimulateDeparture = () => {
    if (!id) return;
    setIsSimulating(true);
    setIsSimulationLoading(true);
    setSimulationError(null);

    // Parallel fetch for Blast Radius (F2) and Backup Candidates (F3)
    Promise.all([api.getPersonImpact(id), api.getBackupCandidates(id)])
      .then(([impactRes, candidatesRes]) => {
        setImpactData(impactRes);
        setCandidatesData(candidatesRes);
      })
      .catch((err) => {
        setSimulationError(err);
      })
      .finally(() => {
        setIsSimulationLoading(false);
      });
  };

  if (isLoading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton type="profile" count={1} />
        <LoadingSkeleton type="table" count={3} />
      </PageContainer>
    );
  }

  if (error || !person) {
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
          title="Could Not Load Person Profile"
          message={error?.message || 'The requested person could not be found.'}
          hint={error?.data?.hint}
        />
      </PageContainer>
    );
  }

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

      {/* Main Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Identifiers */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-500/30 flex-shrink-0">
              {person.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {person.name}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {person.seniority}
                </span>
                {person.team && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {person.team}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-slate-300">{person.role}</div>
              <a
                href={`mailto:${person.email}`}
                className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{person.email}</span>
              </a>
            </div>
          </div>

          {/* Simulate Departure Action Trigger */}
          <div className="w-full lg:w-auto">
            <button
              onClick={handleSimulateDeparture}
              className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame className="w-5 h-5 text-amber-200" />
              <span>Simulate Departure / What If They Leave?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Triggered Blast Radius & Backfill Simulation Panel */}
      {isSimulating && (
        <div id="simulation-panel">
          {simulationError && (
            <ErrorBanner
              title="Simulation Calculation Error"
              message={simulationError.message}
              hint={simulationError.data?.hint}
              onRetry={handleSimulateDeparture}
            />
          )}
          <ImpactPanel
            personName={person.name}
            impactData={impactData}
            candidatesData={candidatesData}
            isLoading={isSimulationLoading}
          />
        </div>
      )}

      {/* Grid: Technical Skills Matrix & Module Ownership */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills Column (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Technical Skill Profile ({person.skills.length})
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {person.skills.map((skill) => (
              <div
                key={skill.name}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs"
              >
                <span className="font-semibold text-slate-200">{skill.name}</span>
                {skill.level && (
                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      skill.level === 'expert'
                        ? 'bg-purple-500/20 text-purple-300'
                        : skill.level === 'intermediate'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {skill.level}
                  </span>
                )}
              </div>
            ))}
          </div>

          {person.skills.length === 0 && (
            <div className="text-xs text-slate-500 py-4 text-center">
              No technical skills currently cataloged.
            </div>
          )}
        </div>

        {/* Owned Modules & Contributions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owned Modules */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Primary Owned Modules ({person.owned_modules.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {person.owned_modules.map((mod) => (
                <Link
                  key={mod.id}
                  to={`/modules/${mod.id}`}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {mod.name}
                    </div>
                    <div className="text-[11px] text-slate-400">Primary Architect</div>
                  </div>
                  <CriticalityBadge level={mod.criticality} size="sm" />
                </Link>
              ))}
            </div>

            {person.owned_modules.length === 0 && (
              <div className="text-xs text-slate-500 py-4 text-center">
                This individual does not own any primary modules.
              </div>
            )}
          </div>

          {/* Contributed Modules */}
          {person.contributed_modules.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Secondary Contributed Modules ({person.contributed_modules.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {person.contributed_modules.map((mod) => (
                  <Link
                    key={mod.id}
                    to={`/modules/${mod.id}`}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-800/40 transition-all group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                        {mod.name}
                      </div>
                      <div className="text-[11px] text-purple-300">
                        {mod.commits} commits {mod.last_active && `· Active ${mod.last_active}`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
