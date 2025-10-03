'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconSearch } from '@tabler/icons-react';

type Props = {
   placeholder: string;
   total: number;
   value: string;
   onChange: (v: string) => void;
};

export default function MasterListToolbar({ placeholder, total, value, onChange }: Props) {
   return (
      <div className="space-y-2">
         <div className="flex items-center gap-2">
         <div className="relative w-full">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={placeholder} className="pl-8" value={value} onChange={(e) => onChange(e.target.value)} />
         </div>
         <Badge variant="outline">{total}</Badge>
         </div>
      </div>
   );
}
