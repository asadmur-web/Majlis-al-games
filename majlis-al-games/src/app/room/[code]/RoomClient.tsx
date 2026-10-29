'use client';

import { motion } from 'framer-motion';
import { Users, Play, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
}

export default function RoomClient({ code }: { code: string }) {
  const [players] = useState<Player[]>([
    { id: '1', name: 'أحمد', avatar: '😀', isHost: true },
    { id: '2', name: 'سارة', avatar: '😎' },
    { id: '3', name: 'محمد', avatar: '🤓' },
    { id: '4', name: 'خالد', avatar: '🤠' },
  ]);

  const canStart = players.length >= 4;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] to-[#1a1a24] p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-2">مجلس {code}</h1>
              <p className="text-white/60">انتظار انضمام باقي الأعضاء...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className="p-3 bg-[#0D0D12] border border-white/20 rounded-xl hover:border-gold transition-colors">
                <Copy className="w-5 h-5 text-white/80" />
              </button>
              <button className="p-3 bg-[#0D0D12] border border-white/20 rounded-xl hover:border-gold transition-colors">
                <Share2 className="w-5 h-5 text-white/80" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            الأعضاء المنضمون ({players.length}/12)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.map((player) => (
              <div key={player.id} className="bg-[#0D0D12] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="text-3xl">{player.avatar}</div>
                <div>
                  <div className="text-white font-bold">{player.name}</div>
                  {player.isHost && <div className="text-gold text-xs">المضيف</div>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-6 shadow-xl">
          <button disabled={!canStart} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canStart ? 'bg-gold text-black hover:bg-yellow-400' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}>
            <Play className="w-5 h-5" />
            {canStart ? 'بدء اللعبة الان' : 'في انتظار اكتمال العدد (4 على الأقل)'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
