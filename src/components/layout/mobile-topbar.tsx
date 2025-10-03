"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./app-sidebar";


export default function MobileTopbar() {
return (
   <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container h-14 flex items-center justify-between">
         <AppSidebar />
         <div className="font-semibold">DSCVRY</div>
         <div>
            <SignedIn>
               <UserButton />
            </SignedIn>
            
            <SignedOut>
               <SignInButton mode="modal">
                  <Button size="sm" className="rounded-xl">
                     Sign In
                  </Button>
               </SignInButton>
            </SignedOut>
         </div>
      </div>
   </div>
   );
}