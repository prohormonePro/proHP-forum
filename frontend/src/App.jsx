import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './stores/auth';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import RoomPage from './pages/RoomPage';
import ThreadPage from './pages/ThreadPage';
import CompoundsPage from './pages/CompoundsPage';
import CompoundDetail from './pages/CompoundDetail';
import CyclesPage from './pages/CyclesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GrepGate from "./components/GrepGate";
import CreateThread from "./pages/CreateThread";
import UserProfile from './pages/UserProfile';

import ClaimAccountPage from "./pages/ClaimAccountPage";
export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => { fetchMe(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-prohp-500 font-bold tracking-wider animate-pulse">PROHP</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
          <Routes>
            <Route path="/create-thread" element={<CreateThread />} />
            <Route path="/grep" element={<GrepGate />} />
            <Route path="/" element={<Home />} />
            <Route path="/r/:slug" element={<RoomPage />} />
            <Route path="/t/:id" element={<ThreadPage />} />
            <Route path="/compounds" element={<CompoundsPage />} />
            <Route path="/compounds/:slug" element={<CompoundDetail />} />
            <Route path="/cycles" element={<CyclesPage />} />
          <Route path="/claim-account" element={<ClaimAccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/u/:username" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}