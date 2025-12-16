import React from 'react';
import { Calendar, Users, HeartHandshake, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sevas', label: 'Manage Sevas', icon: HeartHandshake },
    { id: 'people', label: 'Volunteers', icon: Users },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-orange-900 text-orange-50 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-orange-800 flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg">
             <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SevaConnect</span>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-orange-800 text-white shadow-md' : 'text-orange-200 hover:bg-orange-800/50 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 bg-orange-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-orange-300">Temple Manager</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
