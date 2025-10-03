import Header from '@/components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | E-numail KEMENTAN',
  description: 'Dashboard e-email Kementrian Pertanian RI'
};

export default async function DashboardLayout({
   children
}: {
   children: React.ReactNode;
}) {
   return (
      <>
         <Header />
         {children}
      </>
   );
}