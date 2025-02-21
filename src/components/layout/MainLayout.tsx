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
    <div className="flex min-h-screen w-full bg-[#FFF8F8] flex-col lg:flex-row">
      {!loading && isWaitingList && <WaitingListModal />}
      <div className="lg:min-h-screen">
        <SideNav />
      </div>
      {children}
    </div>
  );
}