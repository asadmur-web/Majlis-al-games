'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Play, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateTraitorCount } from '@/lib/game/roleAssignment';

export default function GameSetupPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>([
    { id: '1', name: 'لاعب 1' },
    { id: '2', name: 'لاعب 2' },
    { id: '3', name: 'لاعب 3' },
    { id: '4', name: 'لاعب 4' },
  ]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const traitorCount = calculateTraitorCount(players.length);

  const addPlayer = () => {
    if (!newName.trim()) return;
    if (players.length >= 12) {
      setError('الحد الأقصى لللاعبين هو 12 لاعباً');
      return;
    }
    setPlayers([...players, { id: Date.now().toString(), name: newName.trim() }]);
    setNewName('');
    setError('');
  };

  const removePlayer = (id: string) => {
    if (players.length <= 4) {
      setError('الحد الأدنى للعب هو 4 لاعبين');
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
    setError('');
  };

  const startGame = () => {
    if (players.length < 4) {
      setError('يجب ألا يقل عدد اللاعبين عن 4 لاعبين للبدء');
      return;
    }
    // Generate room code and navigate to room play
    const roomCode = `MJL-${Math.floor(100 + Math.random() * 900)}`;
    router.push(`/room/${roomCode}/play/phase1`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] via-[#16161f] to-[#0D0D12] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowRight className="w-5 h-5" /> العودة للرئيسية
          </button>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-500">
            إعداد لعبة خائن المجلس
          </h1>
        </div>

        {/* Game Settings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#161622] border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-5">
            <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center text-gold">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/60 text-sm">عدد اللاعبين الحاليين</p>
              <h3 className="text-3xl font-black text-gold mt-1">{players.length} / 12</h3>
            </div>
          </div>

          <div className="bg-[#161622] border border-white/10 rounded-3xl p-6 shadow-xl flex items-center gap-5">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/60 text-sm">عدد الخونة (الدخلاء) في هذا الجيم</p>
              <h3 className="text-3xl font-black text-red-400 mt-1">{traitorCount} خونة</h3>
            </div>
          </div>
        </div>

        {/* Player Management */}
        <div className="bg-[#161622] border border-white/10 rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-gold mb-6">قائمة اللاعبين (من 4 إلى 12 لاعب)</h2>

          {/* Add Player Input */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="أدخل اسم اللاعب..."
              className="flex-1 bg-[#0D0D12] border-2 border-white/20 focus:border-gold rounded-2xl px-5 py-4 text-white outline-none transition-all"
              maxLength={20}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addPlayer}
              className="bg-gold hover:bg-yellow-400 text-black px-8 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-gold/20 transition-all"
            >
              <Plus className="w-6 h-6" /> إضافة
            </motion.button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 text-center font-bold">
              {error}
            </div>
          )}

          {/* Players List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0D0D12] border border-white/10 hover:border-gold/40 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/10 text-gold rounded-xl flex items-center justify-center font-black">
                    {index + 1}
                  </div>
                  <span className="font-bold text-lg">{player.name}</span>
                </div>
                {players.length > 4 && (
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          disabled={players.length < 4}
          className="w-full bg-gradient-to-r from-gold via-yellow-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-black py-5 rounded-3xl font-black text-2xl shadow-xl shadow-gold/20 flex items-center justify-center gap-3 transition-all"
        >
          <Play className="w-8 h-8 fill-black" /> بدء اللعبة الآن
        </motion.button>
      </div>
    </div>
  );
}
