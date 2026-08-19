import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Box, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { SearchResult } from '../../types';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      api
        .search(query.trim())
        .then((data) => {
          setResults(data);
          setIsOpen(true);
        })
        .catch(() => {
          setResults(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type: 'person' | 'module', id: string) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'person') {
      navigate(`/people/${id}`);
    } else {
      navigate(`/modules/${id}`);
    }
  };

  const hasResults =
    results && (results.people.length > 0 || results.modules.length > 0);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
          placeholder="Search people, roles, modules..."
          className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-sm rounded-xl pl-10 pr-10 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {isOpen && hasResults && (
        <div className="absolute left-0 right-0 mt-2 bg-[#121927] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* People Results */}
          {results.people.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                People ({results.people.length})
              </div>
              <div className="space-y-0.5">
                {results.people.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('person', item.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-lg text-sm hover:bg-indigo-500/10 hover:text-indigo-200 group transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200 group-hover:text-indigo-300">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400">{item.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Module Results */}
          {results.modules.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-purple-400" />
                Modules ({results.modules.length})
              </div>
              <div className="space-y-0.5">
                {results.modules.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('module', item.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-lg text-sm hover:bg-purple-500/10 hover:text-purple-200 group transition-colors"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400">{item.subtitle}</div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
