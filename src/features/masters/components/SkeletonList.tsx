'use client';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonList({ rows = 5 }: { rows?: number }) {
   return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>;
}
