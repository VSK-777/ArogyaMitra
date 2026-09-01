import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Stethoscope, Activity, LogOut, Menu, ClipboardList, Settings, Search, PlusCircle, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, name } = useAuth();
  const { t, i18n } = useTranslation();
  
  const role = location.pathname.includes('/doctor') ? 'Doctor' 
    : location.pathname.includes('/admin') ? 'Admin' 
    : location.pathname.includes('/receptionist') ? 'Receptionist'
    : 'Patient';

  const handleLogout = () => {
    
    
    logout();
  };

  const getNavItems = () => {
    switch (role) {
      case 'Doctor':
        return [
          { name: t('layout.my_queue'), path: '/doctor/dashboard', icon: Users },
          { name: t('layout.upcoming_appointments'), path: '/doctor/upcoming', icon: Calendar },
          { name: t('layout.past_consultations'), path: '/doctor/consultations', icon: ClipboardList },
          { name: t('layout.settings'), path: '/doctor/settings', icon: Settings },
        ];
      case 'Admin':
        return [
          { name: t('layout.hospital_management'), path: '/admin/dashboard', icon: Activity },
          { name: t('layout.staff_management'), path: '#', icon: Users },
          { name: t('layout.doctor_reassignments'), path: '/admin/reassignments', icon: ClipboardList },
          { name: t('layout.system_logs'), path: '#', icon: Search },
        ];
      case 'Receptionist':
        return [
          { name: t('layout.patient_search'), path: '/receptionist/dashboard', icon: Search },
          { name: t('layout.doctor_reassignments'), path: '/admin/reassignments', icon: ClipboardList },
        ];
      default: // Patient
        return [
          { name: t('layout.my_dashboard'), path: '/patient/dashboard', icon: Activity },
          { name: t('layout.book_appointment'), path: '/patient/book', icon: PlusCircle },
          { name: t('layout.medical_documents'), path: '/patient/documents', icon: ClipboardList }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800 cursor-pointer" onClick={() => navigate('/')}>
          <Stethoscope className="h-8 w-8 text-blue-400" />
          <span className="ml-3 text-lg font-bold tracking-wide">ArogyaMitra</span>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <div className="mb-6 px-2">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{role} Portal</p>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={() => i18n.changeLanguage(i18n.language.startsWith('en') ? 'te' : 'en')}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              title="Change Language"
            >
              <span className="text-lg">🌐</span>
              {i18n.language.startsWith('en') ? 'తెలుగు' : 'English'}
            </button>
            <div className="flex flex-col items-end border-l border-slate-200 pl-4">
              <span className="text-sm font-medium text-slate-900">{name || `${role} Account`}</span>
              <span className="text-xs text-slate-500">{role}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase border border-slate-200">
              {name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : role[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


