'use client';

import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTrigger,
   SheetTitle,
   SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { IconCategory2, IconDatabase, IconFileDescription, IconLayoutSidebarLeftExpandFilled, IconPencilPlus } from "@tabler/icons-react";
import Image from "next/image";

export function AppSidebar() {
   return (
      <Sheet>
         <SheetTrigger asChild>
            <Button
               size="icon"
               variant="ghost"
               className="rounded-2xl"
               aria-label="Buka navigasi"   // a11y: tombol ikon diberi label
            >
               <IconLayoutSidebarLeftExpandFilled className="size-5" />
               <span className="sr-only">
                  Open Navigation
               </span>
            </Button>
         </SheetTrigger>

         <SheetContent side="left" aria-label="main-nav" className="p-0">
            <SheetHeader className="px-4 py-3 text-left">
               <Image
                  src={'/images/logo_kemtan.svg'}
                  height={50}
                  width={50}
                  alt="logo-kemtan"
               />
               <SheetTitle className="text-lg font-semibold">
                  E-email KEMENTAN
               </SheetTitle>
               {/* <SheetDescription>Menu dan profil</SheetDescription> */}
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-2 pb-4" aria-label="Navigasi utama">
               <SheetClose asChild>
                  <Link 
                     href="/dashboard/overview" 
                     className="px-3 py-2 rounded-xl hover:bg-accent flex items-center gap-2"
                  >
                     <IconCategory2 className="size-4" />
                     Overview
                  </Link>
               </SheetClose>

               <SheetClose asChild>
                  <Link
                  href="/dashboard/masters"
                  className="px-3 py-2 rounded-xl hover:bg-accent flex items-center gap-2"
                  >
                     <IconDatabase className="size-4" />
                     Master Data
                  </Link>
               </SheetClose>

               <SheetClose asChild>
                  <Link
                  href="/dashboard/generate"
                  className="px-3 py-2 rounded-xl hover:bg-accent flex items-center gap-2"
                  >
                     <IconPencilPlus className="size-4" />
                     Generate
                  </Link>
               </SheetClose>

               <SignedIn>
                  <SheetClose asChild>
                     <Link
                        href="/dashboard/letters"
                        className="px-3 py-2 rounded-xl hover:bg-accent flex items-center gap-2"
                     >
                        <IconFileDescription className="size-4" />
                        Letters
                     </Link>
                  </SheetClose>
               </SignedIn>

               <SignedOut>
                  <SignInButton mode="modal">
                  <Button className="mx-2 rounded-xl">Sign In</Button>
                  </SignInButton>
               </SignedOut>
            </nav>
         </SheetContent>
      </Sheet>
   );
}
