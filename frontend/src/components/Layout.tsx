import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Calendar, Activity, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Very basic role determination for sample purposes
  const isDoctor = location.pathname.includes('/doctor');
  const isReceptionist = location.pathname.includes('/receptionist');
  const role = isDoctor ? 'Doctor' : isReceptionist ? 'Receptionist' : 'Patient';

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: `/${role.toLowerCase()}/dashboard`, icon: Activity },
    { name: 'Appointments', path: '#', icon: Calendar },
    { name: 'Profile', path: '#', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
          <Stethoscope className="h-8 w-8 text-blue-400" />
          <span className="ml-3 text-lg font-bold tracking-wide">SIH Health</span>
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
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
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
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Sample {role} User</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {role[0]}
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
