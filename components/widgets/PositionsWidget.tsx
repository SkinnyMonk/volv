'use client';

import { PositionsTable } from '@/components/PositionsTable';

export default function PositionsWidget() {
  return (
    <div className="w-full h-full flex flex-col p-4">
      <PositionsTable />
    </div>
  );
}
