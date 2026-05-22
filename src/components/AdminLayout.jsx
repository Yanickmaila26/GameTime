import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, Trophy, Swords, LogOut, Menu, X, ArrowLeft, User
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Equipos', path: '/admin/teams', icon: Users },
    { name: 'Árbitros', path: '/admin/referees', icon: UserCheck },
    { name: 'Campeonatos', path: '/admin/championships', icon: Trophy },
    { name: 'Partidos', path: '/admin/matches', icon: Swords },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d0d] border-r border-[#1a1a1a]">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm">
              GT
            </span>
            <span className="font-black text-lg tracking-tight text-white">GameTime</span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#1a1a1a] bg-orange-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-[#F57C00]" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrador'}</p>
              <p className="text-[10px] text-[#F57C00] font-black uppercase tracking-wider">{user?.role === 'admin' ? 'Administrador' : 'Directiva'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-[0_4px_15px_rgba(245,124,0,0.15)]'
                    : 'text-gray-400 hover:bg-[#121212] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-[#0d0d0d] border-b border-[#1a1a1a] p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <span className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm">
            GT
          </span>
          <span className="font-black text-base tracking-tight text-white">GameTime</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#070707] z-30 flex flex-col border-t border-[#1a1a1a]">
          <div className="p-4 border-b border-[#1a1a1a] bg-orange-500/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <User className="w-5 h-5 text-[#F57C00]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user?.name || 'Administrador'}</p>
                <p className="text-[10px] text-[#F57C00] font-black uppercase tracking-wider">{user?.role === 'admin' ? 'Administrador' : 'Directiva'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                      : 'text-gray-400 hover:bg-[#121212]'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#1a1a1a]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Navigation link back to public view */}
        <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a vista pública</span>
          </Link>
          <div className="text-[10px] font-mono text-gray-500">
            GameTime Panel v2.0
          </div>
        </div>

        {/* Routed admin page */}
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
