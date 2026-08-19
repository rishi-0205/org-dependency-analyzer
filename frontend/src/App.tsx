import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FloatingNavRail from './components/navigation/FloatingNavRail';
import Dashboard from './pages/Dashboard';
import EmployeesList from './pages/nodes/EmployeesList';
import SkillsList from './pages/nodes/SkillsList';
import TeamsList from './pages/nodes/TeamsList';
import ModulesList from './pages/nodes/ModulesList';
import ProjectsList from './pages/nodes/ProjectsList';
import GraphAnalyzer from './pages/GraphAnalyzer';
import PersonDetail from './pages/PersonDetail';
import ModuleDetail from './pages/ModuleDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FDF5E7] text-[#1C1912] flex flex-col font-sans selection:bg-[#F4A62C]/30 selection:text-[#1C1912]">
        {/* Persistent Floating Side Navigation */}
        <FloatingNavRail />

        {/* Main Content Area */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes/employees" element={<EmployeesList />} />
            <Route path="/nodes/skills" element={<SkillsList />} />
            <Route path="/nodes/teams" element={<TeamsList />} />
            <Route path="/nodes/modules" element={<ModulesList />} />
            <Route path="/nodes/projects" element={<ProjectsList />} />
            <Route path="/graph" element={<GraphAnalyzer />} />
            <Route path="/people/:id" element={<PersonDetail />} />
            <Route path="/modules/:id" element={<ModuleDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
