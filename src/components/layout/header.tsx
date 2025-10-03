"use client";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./app-sidebar";
import { ModeToggle } from "./theme-toggle";


export default function Header() {
   const { user } = useUser();

   return (
      <div className="sticky flex justify-center top-0 z-40 border-b">
         <div className="container h-14 flex items-center justify-between px-4 ">
            <AppSidebar />
            <div className="flex items-center gap-5">
               <ModeToggle />

               {user && (
                  <div className="flex items-center gap-2 border rounded-full p-0.5">
                     <SignedIn>
                        <UserButton />
                     </SignedIn>
                  </div>
               )}
               
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