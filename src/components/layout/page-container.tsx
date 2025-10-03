import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
   children,
   scrollable = true,
   useContainer = true,
}: {
   children: React.ReactNode;
   scrollable?: boolean;
   useContainer?: boolean;
}) {

   const Inner = (
      <div id='inner-container' className="flex w-full justify-center">
         <div className={useContainer ? "container px-4 md:px-6 py-4 w-full" : "w-full py-4"}>
            {children}
         </div>
      </div>
   )

   return (
      <>
         {scrollable ? (
         <ScrollArea className='h-[calc(100dvh-52px)]'>
            <div className='flex flex-1 p-4 md:px-6'>
               {Inner}
            </div>
         </ScrollArea>
         ) : (
            Inner
         )}
      </>
   );
}