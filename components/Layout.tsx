
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  LogOut, 
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  UserCheck,
  CreditCard,
  HeartHandshake,
  Stethoscope,
  LayoutDashboard,
  Circle,
  Users,
  Database
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

// Submenu Item Component
const SubMenuItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pl-11 pr-4 py-2 w-full text-sm transition-all duration-200 ${
      active 
      ? 'text-primary-600 font-bold bg-primary-50 border-r-4 border-primary-600' 
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    <Circle size={8} className={`${active ? 'fill-primary-600' : 'fill-transparent'}`} />
    <span>{label}</span>
  </button>
);

// Main Menu Group Component
const MenuGroup = ({ icon: Icon, label, children, isOpen, onClick }: any) => (
  <div className="mb-1">
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        isOpen ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-left">{label}</span>
      </div>
      {children && (
        isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
      )}
    </button>
    {isOpen && (
      <div className="mt-1 space-y-1 animate-fade-in-down">
        {children}
      </div>
    )}
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Sidebar State for Expanded Groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    registration: currentPath.includes('/admin/registered/'),
    id: currentPath.includes('/admin/id/'),
    benefits: currentPath.includes('/admin/benefits/'),
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCitizen = currentUser?.role === Role.CITIZEN;

  if (isCitizen) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm animate-fade-in-down">
            <div className="max-w-6xl auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {location.pathname !== '/citizen/dashboard' && (
                        <button 
                            onClick={() => navigate('/citizen/dashboard')} 
                            className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors mr-2 animate-scale-up"
                            title="Back to Menu"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => navigate('/citizen/dashboard')}>
                       <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md transform hover:scale-105 transition-transform">SC</div>
                       <div>
                          <h1 className="font-bold text-slate-800 text-lg leading-tight hidden md:block">SeniorConnect</h1>
                       </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 leading-none">{currentUser?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Citizen Portal</p>
                        </div>
                        <img 
                          src={currentUser?.avatarUrl} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full bg-slate-200 object-cover border-2 border-slate-100" 
                        />
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <LogOut size={22} />
                    </button>
                </div>
            </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
           <span className="font-bold text-slate-800 text-lg">SeniorConnect Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-10 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-8 px-2 hidden md:flex animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">SC</div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">SeniorConnect</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {/* 1. Dashboard */}
            <MenuGroup 
              icon={LayoutDashboard} 
              label="Dashboard" 
              onClick={() => handleNavigate('/admin/dashboard')} 
              isOpen={currentPath === '/admin/dashboard'}
            />

            {/* 2. Registration Group */}
            <MenuGroup 
                icon={UserCheck} 
                label="Registration" 
                isOpen={expandedGroups.registration} 
                onClick={() => toggleGroup('registration')}
            >
                <SubMenuItem label="Walk-in" active={currentPath === '/admin/registered/walk-in'} onClick={() => handleNavigate('/admin/registered/walk-in')} />
                <SubMenuItem label="For Approval" active={currentPath === '/admin/registered/approval'} onClick={() => handleNavigate('/admin/registered/approval')} />
                <SubMenuItem label="List of Disapproved" active={currentPath === '/admin/registered/disapproved'} onClick={() => handleNavigate('/admin/registered/disapproved')} />
            </MenuGroup>

            {/* 3. Masterlist / Approved */}
            < MenuGroup 
              icon={Users} 
              label="Masterlist / Approved" 
              onClick={() => handleNavigate('/admin/masterlist')} 
              isOpen={currentPath === '/admin/masterlist'}
            />

            {/* 4. ID Issuance Group */}
            <MenuGroup 
                icon={CreditCard} 
                label="ID Issuance" 
                isOpen={expandedGroups.id} 
                onClick={() => toggleGroup('id')}
            >
                <SubMenuItem label="For Approval" active={currentPath === '/admin/id/approval'} onClick={() => handleNavigate('/admin/id/approval')} />
                <SubMenuItem label="List of Disapproved" active={currentPath === '/admin/id/disapproved'} onClick={() => handleNavigate('/admin/id/disapproved')} />
            </MenuGroup>

            {/* 5. Benefits Group */}
            <MenuGroup 
                icon={HeartHandshake} 
                label="Benefits" 
                isOpen={expandedGroups.benefits} 
                onClick={() => toggleGroup('benefits')}
            >
                <SubMenuItem label="For Approval" active={currentPath === '/admin/benefits/approval'} onClick={() => handleNavigate('/admin/benefits/approval')} />
                <SubMenuItem label="List of Disapproved" active={currentPath === '/admin/benefits/disapproved'} onClick={() => handleNavigate('/admin/benefits/disapproved')} />
            </MenuGroup>

            {/* 6. Philhealth Facilitation */}
            <MenuGroup 
              icon={Stethoscope} 
              label="Philhealth Facilitation" 
              onClick={() => handleNavigate('/admin/philhealth')} 
              isOpen={currentPath === '/admin/philhealth'}
            />

            {/* Bottom Separator */}
            <div className="pt-6 pb-2">
                <div className="h-px bg-slate-100 w-full mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Registry Reference</p>
            </div>

            {/* 7. LCR/PWD Registry */}
            <MenuGroup 
              icon={Database} 
              label="LCR/PWD Registry" 
              onClick={() => handleNavigate('/admin/registry')} 
              isOpen={currentPath === '/admin/registry'}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 mt-4">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-0 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="flex-1 overflow-auto h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
};
