'use client';

import { Branch } from "@/types/branch"
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BranchState = {
   selected: Branch | null;
   setSelected: (b: Branch | null) => void;
}

export const useBranch = create<BranchState>()(
   persist(
      (set) => ({
         selected: null,
         setSelected: (b) => {

            set({ selected: b });

            try {
               const maxAge = 60 * 60 * 24 * 30 // 30 days

               if(b) document.cookie = `branchId=${b.id}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
               else document.cookie = `branchId=; Path=/; Max-Age=0; SameSite=Lax`;
            
            } catch {}
         }
      }),
      { name: "dscvry-branch" }
   )
)