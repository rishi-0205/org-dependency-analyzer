import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Layers,
  Network,
  Menu,
  ChevronDown,
  ChevronRight,
  Users,
  Sparkles,
  Shield,
  Box,
  Briefcase,
  X,
} from 'lucide-react';

export default function FloatingNavRail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNodesExpanded, setIsNodesExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const currentPath = location.pathname;
  const isHomeActive = currentPath === '/';
  const isNodesActive =
    currentPath.startsWith('/nodes') ||
    currentPath.startsWith('/people') ||
    currentPath.startsWith('/modules');
  const isGraphActive = currentPath === '/graph';

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* ========================================== */}
      {/* FLOATING TOP-LEFT HAMBURGER BUTTON         */}
      {/* ========================================== */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-5 left-5 z-50 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#EFE5D3] flex items-center justify-center text-[#1C1912] hover:bg-[#FDF5E7] hover:border-[#1C1912] transition-all cursor-pointer"
        title="Main Navigation Menu"
        aria-label="Main Navigation Menu"
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ========================================== */}
      {/* FLOATING DROPDOWN MENU CARD                */}
      {/* ========================================== */}
      {isMenuOpen && (
        <div
          ref={panelRef}
          className="fixed top-18 left-5 z-50 bg-white/98 backdrop-blur-md shadow-2xl border border-[#EFE5D3] rounded-xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-150 text-[#1C1912]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D3] mb-2 px-1">
            <div className="text-xs font-bold text-[#1C1912] uppercase tracking-wider">
              Org Navigation
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-md text-[#A39A8B] hover:text-[#1C1912] hover:bg-[#FDF5E7]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-sm font-medium">
            {/* Home Link */}
            <button
              onClick={() => handleNavClick('/')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isHomeActive
                  ? 'bg-[#1C1912] text-white font-semibold'
                  : 'text-[#1C1912] hover:bg-[#FDF5E7]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Overview</span>
            </button>

            {/* Nodes Accordion (Collapsed by Default) */}
            <div className="space-y-1">
              <button
                onClick={() => setIsNodesExpanded(!isNodesExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isNodesActive && !isHomeActive && !isGraphActive
                    ? 'bg-[#FDF5E7] text-[#1C1912] font-semibold'
                    : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span>Nodes Directory</span>
                </div>
                {isNodesExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#A39A8B]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#A39A8B]" />
                )}
              </button>

              {/* Accordion Child Items */}
              {isNodesExpanded && (
                <div className="pl-4 space-y-1 pt-1 pb-1 border-l-2 border-[#EFE5D3] ml-4 animate-in fade-in duration-100">
                  <Link
                    to="/nodes/employees"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      currentPath === '/nodes/employees'
                        ? 'bg-[#1C1912] text-white font-semibold'
                        : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Employees</span>
                  </Link>

                  <Link
                    to="/nodes/skills"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      currentPath === '/nodes/skills'
                        ? 'bg-[#1C1912] text-white font-semibold'
                        : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F4A62C]" />
                    <span>Skills</span>
                  </Link>

                  <Link
                    to="/nodes/teams"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      currentPath === '/nodes/teams'
                        ? 'bg-[#1C1912] text-white font-semibold'
                        : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#B8A78D]" />
                    <span>Teams</span>
                  </Link>

                  <Link
                    to="/nodes/modules"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      currentPath === '/nodes/modules'
                        ? 'bg-[#1C1912] text-white font-semibold'
                        : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5 text-[#E15B43]" />
                    <span>Modules</span>
                  </Link>

                  <Link
                    to="/nodes/projects"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      currentPath === '/nodes/projects'
                        ? 'bg-[#1C1912] text-white font-semibold'
                        : 'text-[#1C1912] hover:bg-[#FDF5E7]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#D9724A]" />
                    <span>Projects</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Graph Analyzer Link */}
            <button
              onClick={() => handleNavClick('/graph')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isGraphActive
                  ? 'bg-[#1C1912] text-white font-semibold'
                  : 'text-[#1C1912] hover:bg-[#FDF5E7]'
              }`}
            >
              <Network className="w-4 h-4 text-[#F4A62C]" />
              <span>Graph Analyzer</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
