import React from 'react';
import { useWaitingListStatus } from '../../hooks/useWaitingListStatus';
import WaitingListModal from '../WaitingListModal';
import SideNav from './SideNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isWaitingList, loading } = useWaitingListStatus();

  return (
    <div className="flex min-h-screen bg-[#FFF8F8]">
      {!loading && isWaitingList && <WaitingListModal />}
      <div className="fixed top-0 left-0 h-screen">
        <SideNav />
      </div>
      <div className="flex-1 ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}