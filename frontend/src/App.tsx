import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import PersonDetail from './pages/PersonDetail';
import ModuleDetail from './pages/ModuleDetail';
import GlobalGraphModal from './components/graph/GlobalGraphModal';

export default function App() {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar onOpenGraphModal={() => setIsGraphModalOpen(true)} />

        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onOpenGraphModal={() => setIsGraphModalOpen(true)} />}
            />
            <Route path="/people/:id" element={<PersonDetail />} />
            <Route path="/modules/:id" element={<ModuleDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Dependency Graph Modal */}
        <GlobalGraphModal
          isOpen={isGraphModalOpen}
          onClose={() => setIsGraphModalOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
