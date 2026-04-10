import React from 'react';
import { LayoutDashboard, MessageSquare, Database, Wrench, Settings, HelpCircle, LogOut, Layers, Bot, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'agents', icon: Bot, label: 'Agentes' },
    { id: 'knowledge', icon: Database, label: 'Conocimiento' },
    { id: 'tools', icon: Wrench, label: 'Herramientas' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
  ];

  return (
    <div className="w-20 bg-bg-primary border-r border-border-tertiary flex flex-col items-center py-8 gap-8 h-full z-20 shadow-sm">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
        <img 
          src="https://storage.googleapis.com/maker-artifacts-public/atom-logo.png" 
          alt="Atom Logo" 
          className="w-8 h-8 object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>');
          }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "p-3 rounded-2xl transition-all group relative",
              activeTab === item.id 
                ? "bg-secondary-orange text-primary" 
                : "text-fg-tertiary hover:bg-bg-tertiary hover:text-fg-primary"
            )}
          >
            <item.icon className="w-6 h-6" />
            <div className="absolute left-full ml-4 px-2 py-1 bg-bg-inverse-primary text-fg-inverse-primary label-small rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button className="p-3 rounded-2xl text-fg-tertiary hover:bg-bg-tertiary hover:text-fg-primary transition-all group relative">
          <Settings className="w-6 h-6" />
          <div className="absolute left-full ml-4 px-2 py-1 bg-bg-inverse-primary text-fg-inverse-primary label rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Ajustes
          </div>
        </button>
        <button className="p-3 rounded-2xl text-fg-tertiary hover:bg-bg-tertiary hover:text-fg-primary transition-all group relative">
          <HelpCircle className="w-6 h-6" />
          <div className="absolute left-full ml-4 px-2 py-1 bg-bg-inverse-primary text-fg-inverse-primary label rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Ayuda
          </div>
        </button>
        <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border-tertiary flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
};
