import React from 'react';
import { 
  Search, Bell, Settings, HelpCircle, ChevronDown, 
  LayoutDashboard, Phone, MessageSquare, Users, 
  Wand2, Briefcase, UserCheck, BarChart3, 
  Building2, FolderTree, Bot, ChevronRight,
  Megaphone, List, GitBranch, Webhook, Tag, PlayCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
  isCompact?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeModule, 
  onModuleChange,
  isCompact = false
}) => {
  const menuItems = [
    { 
      id: 'campanas', 
      icon: Megaphone, 
      label: 'Campañas', 
      hasSubmenu: true,
      subItems: [
        { id: 'listas', label: 'Listas', icon: List },
        { id: 'flujos', label: 'Flujos', icon: GitBranch },
        { id: 'agentes', label: 'Agentes', icon: Bot, badge: 'Nuevo' },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'tipificaciones', label: 'Tipificaciones', icon: Tag },
        { id: 'simulador', label: 'Simulador de conv.', icon: MessageSquare },
      ]
    },
    { id: 'plataforma', icon: LayoutDashboard, label: 'Plataforma', hasSubmenu: true },
    { id: 'llamadas', icon: Phone, label: 'Llamadas', badge: 'Beta', hasSubmenu: true },
    { id: 'mensajeria', icon: MessageSquare, label: 'Mensajería', hasSubmenu: true },
    { id: 'conversaciones', icon: Users, label: 'Conversaciones', hasSubmenu: true },
    { id: 'magia', icon: Wand2, label: 'Magia de atom', hasSubmenu: true },
    { id: 'negocios', icon: Briefcase, label: 'Negocios', hasSubmenu: true },
    { id: 'usuarios', icon: UserCheck, label: 'Gestión usuarios', hasSubmenu: true },
    { id: 'reportes', icon: BarChart3, label: 'Reportes', hasSubmenu: true },
    { id: 'empresa', icon: Building2, label: 'Mi empresa', hasSubmenu: true },
    { id: 'recursos', icon: FolderTree, label: 'Gestor de recursos', hasSubmenu: true },
  ];

  const campanasItem = menuItems.find(m => m.id === 'campanas');
  const isCampanasActive = activeModule === 'campanas' || campanasItem?.subItems?.some(s => s.id === activeModule);

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 flex flex-col z-30 shrink-0 transition-all duration-300",
        isCompact ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn(
          "p-6 flex items-center gap-3",
          isCompact && "justify-center"
        )}>
          <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center shrink-0">
            <Bot className="text-white w-6 h-6" />
          </div>
          {!isCompact && <span className="text-2xl font-black tracking-tighter text-[#1A1A1A]">ATOM</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.id} className="space-y-1">
              <Button
                type="button"
                variant="Tertiary"
                size="m"
                onClick={() => onModuleChange(item.id)}
                title={isCompact ? item.label : undefined}
                className={cn(
                  "w-full group !min-h-0 px-3 py-2.5 rounded-lg font-normal",
                  isCompact ? "justify-center" : "justify-between",
                  activeModule === item.id || (item.id === 'campanas' && isCampanasActive)
                    ? "bg-secondary-orange text-primary hover:bg-secondary-orange"
                    : "text-fg-secondary hover:bg-bg-secondary hover:text-fg-primary"
                )}
                iconLeft={
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      activeModule === item.id || (item.id === 'campanas' && isCampanasActive)
                        ? "text-primary"
                        : "text-fg-tertiary group-hover:text-fg-secondary"
                    )}
                  />
                }
                iconRight={
                  !isCompact && item.hasSubmenu ? (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-fg-tertiary transition-transform",
                        activeModule === item.id || (item.id === 'campanas' && isCampanasActive)
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  ) : undefined
                }
              >
                {!isCompact && (
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-bg-tertiary text-fg-primary text-[10px] font-bold rounded uppercase">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Button>
            </div>
          ))}
        </nav>

        {/* Bottom Sidebar */}
        <div className={cn(
          "p-4 border-t border-gray-100 space-y-1",
          isCompact && "flex flex-col items-center"
        )}>
          <Button 
            variant="Tertiary" 
            size="m" 
            className={cn(
              "w-full justify-start gap-3 px-3",
              isCompact && "justify-center p-2"
            )}
            title={isCompact ? "Configuración" : undefined}
            iconLeft={<Settings className="w-5 h-5 text-gray-400" />}
          >
            {!isCompact && "Configuración"}
          </Button>
          <Button 
            variant="Tertiary" 
            size="m" 
            className={cn(
              "w-full justify-start gap-3 px-3",
              isCompact && "justify-center p-2"
            )}
            title={isCompact ? "Ayuda" : undefined}
            iconLeft={<HelpCircle className="w-5 h-5 text-gray-400" />}
          >
            {!isCompact && "Ayuda"}
          </Button>
        </div>
      </aside>

      {/* Secondary Sidebar (Panel al costado) */}
      {isCampanasActive && campanasItem && !isCompact && (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 animate-in slide-in-from-left-4 duration-300">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1A1A1A]">{campanasItem.label}</h2>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {campanasItem.subItems?.map((sub) => (
              <Button
                key={sub.id}
                type="button"
                variant="Tertiary"
                size="m"
                onClick={() => onModuleChange(sub.id)}
                className={cn(
                  "w-full !min-h-0 justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  activeModule === sub.id || (sub.id === 'agentes' && activeModule === 'agentes')
                    ? "text-primary bg-secondary-orange hover:bg-secondary-orange"
                    : "text-fg-tertiary hover:text-fg-primary hover:bg-bg-secondary"
                )}
                iconLeft={
                  sub.icon ? (
                    <sub.icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        activeModule === sub.id || (sub.id === 'agentes' && activeModule === 'agentes')
                          ? "text-primary"
                          : "text-fg-tertiary"
                      )}
                    />
                  ) : undefined
                }
              >
                <span className="flex flex-1 items-center justify-between gap-2 text-left">
                  <span>{sub.label}</span>
                  {sub.badge && (
                    <span className="px-1.5 py-0.5 bg-bg-tertiary text-fg-primary text-[8px] font-bold rounded uppercase shrink-0">
                      {sub.badge}
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-[#1A1A1A]">
              {activeModule === 'agentes' || activeModule === 'campanas' ? 'Campañas' : 'Configuraciones'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Buscar por" 
                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button variant="Tertiary" size="s" className="rounded-full p-2">
                <Bell className="w-5 h-5 text-gray-400" />
              </Button>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-bold text-[#1A1A1A]">Omar Hernandez</p>
                <p className="text-[11px] text-gray-500 font-medium">SuperAdmin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#4A4A4A] flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                OH
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
