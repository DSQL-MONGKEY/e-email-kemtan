'use client';

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "@/components/layout/theme-provider";



export default function Providers({ children }: { children: ReactNode }) {
   
   const [qc] = useState(() => new QueryClient({
      defaultOptions: {
         queries: {
            staleTime: 30_000,
            gcTime: 300_000,
            refetchOnWindowFocus: false
         }
      }
   }));

   return (
      <ThemeProvider
         attribute="class"
         defaultTheme="system"
         enableSystem
         disableTransitionOnChange
      >
         <QueryClientProvider client={qc}>
            {children}
         </QueryClientProvider>
      </ThemeProvider>
   )
}