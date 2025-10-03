'use client';

import { apiGet } from "@/lib/api";
import { Branch } from "@/types/branch";
import { BackendList } from "@/types/common";
import { useQuery } from "@tanstack/react-query";


export function useBranches() {
   return useQuery({
      queryKey: ["branches"],
      queryFn: async () => {
         const res = await apiGet<BackendList<Branch> | Branch[]>('/api/branches', { cache: "no-store" });

         const list: Branch[] = Array.isArray(res) ? res : res.data;

         // sort by name
         return list.sort((a, b) => a.name.localeCompare(b.name));
      },
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000
   });
}




