'use client';

import { create } from "zustand";




type SelectionState = {
   activeProductId: string | null;
   setActiveProductId: (id: string | null) => void;
   drawerOpen: boolean;
   setDrawerOpen: (open: boolean) => void;
}


export const useSelection = create<SelectionState>((set) => ({
   activeProductId: null,
   setActiveProductId: (id) => set({ activeProductId: id }),
   drawerOpen: false,
   setDrawerOpen: (drawerOpen) => set({ drawerOpen })
}));


