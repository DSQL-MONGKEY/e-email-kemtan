import Silk from '@/components/Silk';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
   return (
      <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
         <Link
            href='/examples/authentication'
            className={cn(
               buttonVariants({ variant: 'ghost' }),
               'absolute top-4 right-4 hidden md:top-8 md:right-8'
            )}
         >
            Login
         </Link>
         <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
            <div className='absolute inset-0 bg-zinc-900' />
            <Silk
               speed={5}
               scale={1}
               color="#7B7481"
               noiseIntensity={1.5}
               rotation={0}
               
            />
               <div className='relative z-20 flex items-center text-lg font-medium'>
                  <svg  
                     xmlns="http://www.w3.org/2000/svg"
                     width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="icon icon-tabler icons-tabler-outline icon-tabler-wheat">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12.014 21.514v-3.75" />
                        <path d="M5.93 9.504l-.43 1.604c-.712 2.659 .866 5.391 3.524 6.105c.997 .268 1.993 .535 2.99 .801v-3.44c-.164 -2.105 -1.637 -3.879 -3.676 -4.426l-2.408 -.644z" />
                        <path d="M13.744 11.164c.454 -.454 .815 -.994 1.061 -1.587c.246 -.594 .372 -1.23 .372 -1.873c0 -.643 -.126 -1.279 -.372 -1.872c-.246 -.594 -.606 -1.133 -1.061 -1.588l-1.73 -1.73l-1.73 1.73c-.454 .454 -.815 .994 -1.06 1.588c-.246 .594 -.372 1.23 -.373 1.872c0 .643 .127 1.279 .373 1.873c.246 .594 .606 1.133 1.06 1.587" />
                        <path d="M18.099 9.504l.43 1.604c.712 2.659 -.866 5.391 -3.525 6.105c-.997 .268 -1.994 .535 -2.99 .801v-3.44c.164 -2.105 1.637 -3.879 3.677 -4.426l2.408 -.644z" />
                     </svg>
                  E-email Kementerian Pertanian Republik Indonesia
               </div>
               <div className='relative z-20 mt-auto'>
                  <blockquote className='space-y-2'>
                     <p className='text-lg'>
                        &ldquo;Fortis Fortuna Adiuvat&rdquo;
                     </p>
                     <footer className='text-sm'>Random Dude</footer>
                  </blockquote>
               </div>
            </div>
            <div className='flex h-full items-center justify-center p-4 lg:p-8'>
            <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
               <ClerkSignInForm
                  initialValues={{
                  emailAddress: ''
                  }}
               />

               <p className='text-muted-foreground px-8 text-center text-sm'>
                  By clicking continue, you agree to our{' '}
                  <Link
                     href='/terms'
                     className='hover:text-primary underline underline-offset-4'
                  >
                     Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                     href='/privacy'
                     className='hover:text-primary underline underline-offset-4'
                  >
                  Privacy Policy
                  </Link>
                  .
               </p>
            </div>
         </div>
      </div>
   );
}