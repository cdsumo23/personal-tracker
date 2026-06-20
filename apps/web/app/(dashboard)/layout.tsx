import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar (shown on desktop, hidden/drawer on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Header (sticky at top) */}
        <Header />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 pb-24 xl:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <BottomNav />
      </div>
    </div>
  );
}
