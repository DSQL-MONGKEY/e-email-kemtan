import Header from '@/components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | E-numail KEMTAN',
  description: 'Dashboard e-numail Kementrian Pertanian'
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