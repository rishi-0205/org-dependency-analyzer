import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Box,
  Sparkles,
  Users,
  Briefcase,
  ExternalLink,
  Flame,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { GraphNode, ImpactResponse, CandidateResponse } from '../../types';
import { api } from '../../api/client';
import CriticalityBadge from '../common/CriticalityBadge';

interface NodeDetailPanelProps {
  node: GraphNode;
  onClose: () => void;
  onSelectNodeById?: (id: string) => void;
}

export default function NodeDetailPanel({
  node,
  onClose,
  onSelectNodeById,
}: NodeDetailPanelProps) {
  const navigate = useNavigate();

  // Person inline departure simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);
  const [candidatesData, setCandidatesData] = useState<CandidateResponse | null>(null);

  useEffect(() => {
    setIsSimulating(false);
    setImpactData(null);
    setCandidatesData(null);
  }, [node.id]);

  const handleInlineSimulate = () => {
    setIsSimulating(true);
    setIsSimulationLoading(true);
    Promise.all([api.getPersonImpact(node.id), api.getBackupCandidates(node.id)])
      .then(([impactRes, candidatesRes]) => {
        setImpactData(impactRes);
        setCandidatesData(candidatesRes);
      })
      .catch((err) => {
        console.error('Simulation error:', err);
      })
      .finally(() => {
        setIsSimulationLoading(false);
      });
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'person':
        return <User className="w-5 h-5 text-[#1C1912]" />;
      case 'module':
        return <Box className="w-5 h-5 text-[#E15B43]" />;
      case 'skill':
        return <Sparkles className="w-5 h-5 text-[#F4A62C]" />;
      case 'team':
        return <Users className="w-5 h-5 text-[#B8A78D]" />;
      case 'project':
        return <Briefcase className="w-5 h-5 text-[#D9724A]" />;
    }
  };

  return (
    <div className="absolute top-0 right-0 w-full sm:w-96 h-full bg-white border-l border-[#EFE5D3] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden text-[#1C1912]">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#EFE5D3] bg-[#FDF9F2] flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#EFE5D3] flex items-center justify-center flex-shrink-0">
            {getNodeIcon()}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
              {node.type}
            </div>
            <h3 className="text-sm font-bold text-[#1C1912] truncate">{node.name}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#A39A8B] hover:text-[#1C1912] hover:bg-[#FDF5E7] transition-colors"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#1C1912]">
        {/* ========================================== */}
        {/* PERSON NODE DETAIL                         */}
        {/* ========================================== */}
        {node.type === 'person' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-[#1C1912]">{node.role}</div>
              <div className="flex items-center gap-2 text-[#A39A8B]">
                <span className="px-2 py-0.5 rounded-md bg-[#FDF5E7] text-[#1C1912] border border-[#EFE5D3] font-semibold text-[10px]">
                  {node.seniority}
                </span>
                {node.team && (
                  <span className="px-2 py-0.5 rounded-md bg-[#FDF5E7] text-[#1C1912] border border-[#EFE5D3] font-medium text-[10px]">
                    Team: {node.team}
                  </span>
                )}
              </div>
              {node.email && (
                <div className="flex items-center gap-1.5 text-[#A39A8B] pt-1">
                  <Mail className="w-3 h-3 text-[#A39A8B]" />
                  <span>{node.email}</span>
                </div>
              )}
            </div>

            {/* Owned Modules */}
            {node.owned_modules && node.owned_modules.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Owned Modules ({node.owned_modules.length})
                </div>
                <div className="space-y-1.5">
                  {node.owned_modules.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(m.id)}
                      className="p-2 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#1C1912] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="font-mono text-[#1C1912] font-semibold">{m.name}</span>
                      <CriticalityBadge level={m.criticality || 'medium'} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {node.skills && node.skills.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Skills ({node.skills.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {node.skills.map((s) => (
                    <span
                      key={s.name}
                      onClick={() => onSelectNodeById && onSelectNodeById(s.name)}
                      className="px-2 py-0.5 rounded-md bg-[#F4A62C]/15 text-[#995900] border border-[#F4A62C]/30 font-medium cursor-pointer hover:border-[#F4A62C] transition-colors"
                    >
                      {s.name} {s.level && <span className="text-[9px] text-[#995900]/80">({s.level})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Action: Simulate Departure */}
            <div className="pt-2">
              {!isSimulating ? (
                <button
                  onClick={handleInlineSimulate}
                  className="w-full py-2.5 px-4 rounded-full bg-[#E15B43] hover:bg-[#C94A34] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Flame className="w-4 h-4 text-white" />
                  <span>Simulate Departure Impact</span>
                </button>
              ) : isSimulationLoading ? (
                <div className="p-3 rounded-xl bg-[#E15B43]/10 border border-[#E15B43]/30 text-center text-xs text-[#E15B43] animate-pulse font-medium">
                  Calculating graph blast radius & backfills...
                </div>
              ) : impactData && candidatesData ? (
                <div className="p-3.5 rounded-xl bg-[#E15B43]/10 border border-[#E15B43]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E15B43]/20 pb-2">
                    <span className="font-bold text-[#E15B43]">Blast Radius</span>
                    <span className="font-mono font-bold text-[#E15B43]">
                      {impactData.total_downstream_count} services
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-[#A39A8B] uppercase">
                      Top Backfills ({candidatesData.candidates.length}):
                    </div>
                    {candidatesData.candidates.slice(0, 3).map((c) => (
                      <div
                        key={c.candidate_id}
                        onClick={() => onSelectNodeById && onSelectNodeById(c.candidate_id)}
                        className="p-2 rounded-lg bg-white border border-[#EFE5D3] flex items-center justify-between cursor-pointer hover:border-[#1C1912]"
                      >
                        <span className="text-[#1C1912] font-semibold">{c.candidate_name}</span>
                        <span className="font-mono text-[#416124] font-bold text-[10px]">
                          Match: {c.match_score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE NODE DETAIL                         */}
        {/* ========================================== */}
        {node.type === 'module' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CriticalityBadge level={node.criticality || 'medium'} size="sm" />
              {node.contributor_count === 0 && node.owner && (
                <span className="px-2 py-0.5 rounded-full bg-[#E15B43]/12 text-[#E15B43] border border-[#E15B43]/30 font-bold text-[10px] uppercase">
                  Bus Factor = 1
                </span>
              )}
            </div>

            {node.description && (
              <p className="text-xs text-[#1C1912]/80 leading-relaxed">{node.description}</p>
            )}

            {/* Owner */}
            {node.owner && (
              <div className="p-3 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#A39A8B]">Primary Owner</div>
                <div
                  onClick={() => node.owner_id && onSelectNodeById && onSelectNodeById(node.owner_id)}
                  className="font-bold text-[#1C1912] hover:text-[#F4A62C] cursor-pointer flex items-center gap-1"
                >
                  <span>{node.owner}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* Upstream & Downstream Counts */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] text-center">
                <div className="text-[10px] text-[#A39A8B]">Upstream Deps</div>
                <div className="font-mono font-bold text-[#1C1912] text-sm mt-0.5">
                  {node.depends_on?.length || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] text-center">
                <div className="text-[10px] text-[#A39A8B]">Downstream Blast</div>
                <div className="font-mono font-bold text-[#E15B43] text-sm mt-0.5">
                  {node.downstream_count || 0}
                </div>
              </div>
            </div>

            {/* Contributors */}
            {node.contributors && node.contributors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Contributors ({node.contributors.length})
                </div>
                <div className="space-y-1">
                  {node.contributors.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(c.id)}
                      className="p-2 rounded-lg bg-white border border-[#EFE5D3] flex items-center justify-between cursor-pointer hover:border-[#1C1912]"
                    >
                      <span className="text-[#1C1912] font-medium">{c.name}</span>
                      <span className="text-[#416124] font-mono font-bold text-[10px]">
                        {c.commits} commits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* SKILL NODE DETAIL (Backfill Browser)       */}
        {/* ========================================== */}
        {node.type === 'skill' && (
          <div className="space-y-4">
            {node.category && (
              <div className="inline-block px-2.5 py-1 rounded-md bg-[#F4A62C]/15 text-[#995900] border border-[#F4A62C]/30 font-bold text-xs">
                Category: {node.category}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B] flex items-center justify-between">
                <span>Engineers with Skill</span>
                <span className="font-mono font-bold text-[#1C1912]">
                  {node.people_with_skill?.length || 0}
                </span>
              </div>

              {node.people_with_skill && node.people_with_skill.length > 0 ? (
                <div className="space-y-1.5">
                  {node.people_with_skill.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(p.id)}
                      className="p-2 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] hover:border-[#1C1912] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-[#1C1912]">{p.name}</div>
                        {p.role && <div className="text-[10px] text-[#A39A8B]">{p.role}</div>}
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          p.level === 'expert'
                            ? 'bg-[#F4A62C]/20 text-[#995900]'
                            : 'bg-white text-[#A39A8B] border border-[#EFE5D3]'
                        }`}
                      >
                        {p.level || 'intermediate'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#A39A8B] py-2">No engineers mapped to this skill.</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TEAM NODE DETAIL                           */}
        {/* ========================================== */}
        {node.type === 'team' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] text-center">
                <div className="text-[10px] text-[#A39A8B]">Team Size</div>
                <div className="font-mono font-bold text-[#1C1912] text-sm mt-0.5">
                  {node.member_count || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDF5E7] border border-[#EFE5D3] text-center">
                <div className="text-[10px] text-[#A39A8B]">Single Owner SPoFs</div>
                <div
                  className={`font-mono font-bold text-sm mt-0.5 ${
                    (node.spof_count || 0) > 0 ? 'text-[#E15B43]' : 'text-[#416124]'
                  }`}
                >
                  {node.spof_count || 0}
                </div>
              </div>
            </div>

            {/* Members */}
            {node.members && node.members.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Members ({node.members.length})
                </div>
                <div className="space-y-1">
                  {node.members.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(m.id)}
                      className="p-2 rounded-lg bg-white border border-[#EFE5D3] flex items-center justify-between cursor-pointer hover:border-[#1C1912]"
                    >
                      <span className="text-[#1C1912] font-semibold">{m.name}</span>
                      <span className="text-[10px] text-[#A39A8B]">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Owned Modules */}
            {node.team_owned_modules && node.team_owned_modules.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Owned Modules ({node.team_owned_modules.length})
                </div>
                <div className="space-y-1">
                  {node.team_owned_modules.map((mod) => (
                    <div
                      key={mod.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(mod.id)}
                      className="p-2 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] flex items-center justify-between cursor-pointer hover:border-[#1C1912]"
                    >
                      <span className="font-mono text-[#1C1912] font-semibold">{mod.name}</span>
                      <div className="flex items-center gap-1">
                        {mod.is_spof && (
                          <span className="px-1.5 py-0.5 rounded bg-[#E15B43]/15 text-[#E15B43] text-[9px] font-bold uppercase">
                            SPoF
                          </span>
                        )}
                        <CriticalityBadge level={mod.criticality || 'medium'} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* PROJECT NODE DETAIL                        */}
        {/* ========================================== */}
        {node.type === 'project' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#A39A8B] text-xs font-medium">Initiative Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9724A]/15 text-[#D9724A] border border-[#D9724A]/30 font-bold uppercase text-[10px]">
                {node.status || 'Active'}
              </span>
            </div>

            {node.project_modules && node.project_modules.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A39A8B]">
                  Modules in Scope ({node.project_modules.length})
                </div>
                <div className="space-y-1.5">
                  {node.project_modules.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectNodeById && onSelectNodeById(m.id)}
                      className="p-2 rounded-lg bg-[#FDF5E7] border border-[#EFE5D3] flex items-center justify-between cursor-pointer hover:border-[#D9724A]"
                    >
                      <span className="font-mono text-[#1C1912] font-semibold">{m.name}</span>
                      <CriticalityBadge level={m.criticality || 'medium'} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Navigation Actions */}
      <div className="p-4 border-t border-[#EFE5D3] bg-[#FDF9F2] flex items-center justify-between">
        {node.type === 'person' && (
          <button
            onClick={() => navigate(`/people/${node.id}`)}
            className="w-full py-2 px-3 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>View Full Person Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
        {node.type === 'module' && (
          <button
            onClick={() => navigate(`/modules/${node.id}`)}
            className="w-full py-2 px-3 rounded-lg bg-[#1C1912] hover:bg-[#332E22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>View Module Architecture</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
        {node.type !== 'person' && node.type !== 'module' && (
          <div className="w-full text-center text-[11px] text-[#A39A8B]">
            Topology Container Inspection
          </div>
        )}
      </div>
    </div>
  );
}
