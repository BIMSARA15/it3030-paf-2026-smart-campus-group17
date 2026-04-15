import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Clock, Settings } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Simple Sidebar */}
      <div className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-8 flex items-center gap-2">
            <LayoutDashboard /> UniBook
          </h2>
          <nav className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 font-medium">Dashboard</button>
            <button className="w-full text-left p-3 rounded-lg text-slate-600 hover:bg-slate-50">My Bookings</button>
            <button className="w-full text-left p-3 rounded-lg text-slate-600 hover:bg-slate-50">Resources</button>
          </nav>
        </div>
        <button onClick={logout} className="p-3 text-red-600 hover:bg-red-50 rounded-lg text-left">Logout</button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name || 'Student'}!</h1>
          <p className="text-slate-500">Quickly book university assets for your modules.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Clock className="text-blue-500 mb-2" />
            <h3 className="text-slate-500 text-sm">Active Bookings</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <BookOpen className="text-green-500 mb-2" />
            <h3 className="text-slate-500 text-sm">Available Assets</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>

        {/* Assets Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4">Available Resources</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-400">Loading university asset list...</p>
          </div>
        </div>
      </div>
    </div>
  );
}