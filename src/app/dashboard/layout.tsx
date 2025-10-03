import Header from '@/components/layout/header';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
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