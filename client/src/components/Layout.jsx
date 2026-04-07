import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Building2, Wrench, Boxes } from 'lucide-react';

export default function Layout({ children }) {
  const navItemClassName = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Building2 className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">UniBook Admin</span>
        </div>
        <nav className="p-4 space-y-1 mt-2">
          <NavLink to="/resources" className={navItemClassName}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Resources
          </NavLink>
          <NavLink to="/resources/new" className={navItemClassName}>
            <PlusCircle className="w-5 h-5 mr-3" />
            Add Resource
          </NavLink>
          <NavLink to="/utilities" className={navItemClassName}>
            <Boxes className="w-5 h-5 mr-3" />
            Utilities
          </NavLink>
          <NavLink to="/utilities/new" className={navItemClassName}>
            <Wrench className="w-5 h-5 mr-3" />
            Add Utilities
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm justify-between sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800">Facilities Catalogue</h1>
          <div className="flex items-center space-x-4">
             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">A</div>
             <span className="text-sm font-medium text-slate-600">Admin User</span>
          </div>
        </header>

        <div className="w-full py-8 px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
