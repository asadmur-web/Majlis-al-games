'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';

const avatars = ['😀', '😎', '🤓', '😊', '😴', '🤔', '😍', '🤩'];

export default function GameSetup() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const router = useRouter();

  const handleCreate = () => {
    if (!name.trim()) return;
    // Create room logic would go here with Socket.io
    router.push(`/room/TEST-123`);
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    router.push(`/room/${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] to-[#1a1a24] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-gold text-center mb-6">
          خائن المجلس
        </h1>

        <div className="mb-6">
          <label className="block text-white/80 mb-2">اسم اللاعب</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#0D0D12] border border-white/20 rounded-xl text-white focus:border-gold outline-none"
            placeholder="أدخل اسمك"
          />
        </div>

        <div className="mb-6">
          <label className="block text-white/80 mb-2">اختر الأفاتار</label>
          <div className="grid grid-cols-4 gap-2">
            {avatars.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`text-2xl p-3 rounded-xl transition-all ${
                  avatar === a 
                    ? 'bg-gold text-black scale-110' 
                    : 'bg-[#0D0D12] hover:bg-white/10'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex mb-6 bg-[#0D0D12] rounded-xl p-1">
          {(['create', 'join'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === m 
                  ? 'bg-gold text-black font-bold' 
                  : 'text-white/60'
              }`}
            >
              {m === 'create' ? 'إنشاء مجلس' : 'الانضمام'}
            </button>
          ))}
        </div>

        {mode === 'join' && (
          <div className="mb-6">
            <label className="block text-white/80 mb-2">كود المجلس</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-[#0D0D12] border border-white/20 rounded-xl text-white focus:border-gold outline-none text-center font-mono"
              placeholder="MJL-XXX"
            />
          </div>
        )}

        <button
          onClick={mode === 'create' ? handleCreate : handleJoin}
          disabled={!name.trim() || (mode === 'join' && !roomCode.trim())}
          className="w-full bg-gold text-black py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>ابدأ اللعب</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-6 text-center text-white/40 text-sm">
          <Users className="w-4 h-4 inline ml-1" />
          ٤ إلى ١٢ لاعب
        </div>
      </motion.div>
    </div>
  );
}
