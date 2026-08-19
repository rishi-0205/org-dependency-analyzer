import {
  DashboardStats,
  PersonSummary,
  PersonDetail,
  ImpactResponse,
  CandidateResponse,
  ModuleSummary,
  ModuleDetail,
  SearchResult,
  GraphData,
} from '../types';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }
      throw new ApiError(
        errorData.message || `Request failed with status ${res.status}`,
        res.status,
        errorData
      );
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Cannot reach the backend server. Please verify backend is running.',
      0
    );
  }
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database_connected: boolean }>('/api/health'),

  // Dashboard (F4)
  getDashboard: () => request<DashboardStats>('/api/dashboard'),

  // People (F5, F2, F3)
  getPeople: (q?: string) =>
    request<PersonSummary[]>(`/api/people${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPerson: (id: string) => request<PersonDetail>(`/api/people/${encodeURIComponent(id)}`),
  getPersonImpact: (id: string) =>
    request<ImpactResponse>(`/api/people/${encodeURIComponent(id)}/impact`),
  getBackupCandidates: (id: string) =>
    request<CandidateResponse>(`/api/people/${encodeURIComponent(id)}/backup-candidates`),

  // Modules (F6)
  getModules: (q?: string) =>
    request<ModuleSummary[]>(`/api/modules${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getModule: (id: string) => request<ModuleDetail>(`/api/modules/${encodeURIComponent(id)}`),

  // Search (F7)
  search: (q: string) =>
    request<SearchResult>(`/api/search?q=${encodeURIComponent(q)}`),

  // Graph Visualization (O2)
  getGraph: () => request<GraphData>('/api/graph'),
};
