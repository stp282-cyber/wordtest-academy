import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronRight, X } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`
      flex items-center px-4 py-3 mb-3 border-2 transition-all duration-200 group font-bold
      ${active
                ? 'bg-primary border-black text-white shadow-neo translate-x-1 -translate-y-1'
                : 'bg-white border-transparent hover:border-black hover:shadow-neo hover:-translate-y-1 text-slate-600 hover:text-black'}
    `}
    >
        <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-black'}`} />
        <span className="uppercase tracking-tight">{label}</span>
        {active && <ChevronRight className="w-5 h-5 ml-auto" />}
    </Link>
);

const MainLayout = ({ menuItems }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-bg flex font-sans">
            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 bg-warning border-r-4 border-black w-72 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl border-2 border-white shadow-sm mr-3">
                                W
                            </div>
                            <span className="text-2xl font-display font-black text-black tracking-tighter">WORDTEST</span>
                        </div>
                        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto space-y-2">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                                active={location.pathname === item.to}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t-4 border-black">
                        <button className="flex items-center w-full px-4 py-3 bg-white border-2 border-black shadow-neo hover:bg-accent hover:text-white transition-all font-bold">
                            <LogOut className="w-5 h-5 mr-3" />
                            <span>SIGN OUT</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b-4 border-black sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                    <button
                        className="lg:hidden p-2 border-2 border-black shadow-neo-sm active:shadow-none active:translate-y-1 transition-all"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        <button className="p-2 bg-white border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-y-1 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent border-2 border-black" />
                        </button>
                        <div className="flex items-center pl-4 border-l-4 border-black">
                            <div className="text-right mr-3 hidden sm:block">
                                <p className="text-sm font-black text-black uppercase">John Doe</p>
                                <p className="text-xs font-bold text-slate-500 font-mono">STUDENT</p>
                            </div>
                            <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center text-white shadow-neo-sm">
                                <User className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-bg">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
