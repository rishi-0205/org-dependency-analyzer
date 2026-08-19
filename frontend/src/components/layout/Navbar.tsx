import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Network, Layers } from 'lucide-react';
import { api } from '../../api/client';
import SearchBar from '../common/SearchBar';

interface NavbarProps {
  onOpenGraphModal?: () => void;
}

export default function Navbar({ onOpenGraphModal }: NavbarProps) {
  const location = useLocation();
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getHealth()
      .then((data) => {
        if (isMounted) setDbHealthy(data.database_connected);
      })
      .catch(() => {
        if (isMounted) setDbHealthy(false);
      });

    const interval = setInterval(() => {
      api
        .getHealth()
        .then((data) => {
          if (isMounted) setDbHealthy(data.database_connected);
        })
        .catch(() => {
          if (isMounted) setDbHealthy(false);
        });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30 group-hover:ring-indigo-500/60 transition-all duration-200">
            <Network className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight text-base group-hover:text-indigo-300 transition-colors">
                CognoDB Org Analyzer
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 rounded ring-1 ring-indigo-500/20">
                Graph Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Bus-Factor & Blast-Radius Intelligence
            </p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar />
        </div>

        {/* Action & Nav Links */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/'
                ? 'bg-slate-800 text-indigo-300 ring-1 ring-slate-700'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </Link>

          {onOpenGraphModal && (
            <button
              onClick={onOpenGraphModal}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 border border-slate-800"
            >
              <Network className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Org Graph</span>
            </button>
          )}

          {/* Database Health Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-800 bg-slate-900/60"
            title={
              dbHealthy === true
                ? 'Connected to CognoDB Cloud'
                : dbHealthy === false
                ? 'Cannot connect to CognoDB Cloud'
                : 'Checking database health...'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbHealthy === true
                  ? 'bg-emerald-400 animate-pulse'
                  : dbHealthy === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              {dbHealthy === true ? 'CognoDB Active' : dbHealthy === false ? 'DB Offline' : 'Connecting'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
