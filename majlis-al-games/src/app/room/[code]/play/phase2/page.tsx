'use client';

import { useState, useEffect } from 'react';
import Phase2Interface from '@/components/game/Phase2Interface';

export default function Phase2Page() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerRole, setPlayerRole] = useState<'citizen' | 'traitor'>('citizen');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      // In production, roomCode and player info would come from URL params / socket
      // For now, set defaults
      setRoomCode('MJL-001');
      setPlayerId('p1');
      setPlayerName('player_1');
      setPlayerRole('citizen');
      setIsLoading(false);
    };

    loadPage();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Phase2Interface
      playerId={playerId}
      playerName={playerName}
      playerRole={playerRole}
      roomCode={roomCode}
    />
  );
}