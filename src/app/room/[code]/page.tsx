// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import RoomClient from './RoomClient';

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D12] text-white flex items-center justify-center">جاري التحميل...</div>}>
      <RoomClient code={code} />
    </Suspense>
  );
}
