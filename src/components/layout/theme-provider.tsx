'use client';

import { 
   ThemeProviderProps,
   ThemeProvider as NextThemeProvider
} from "next-themes";


export default function ThemeProvider({
   children,
   ...props
}: ThemeProviderProps)  {
   return < NextThemeProvider {...props}>{children}</NextThemeProvider>
}
