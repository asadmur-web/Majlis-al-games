'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Users, Mic, Gavel, Clock as ClockIcon } from 'lucide-react';
import { phase3Manager } from '@/lib/game/phase3';

interface DebateVote {
  playerId: string;
  vote: 'traitor' | 'citizen';
}

export interface Phase3InterfaceProps {
  playerId: string;
  playerName: string;
  playerRole: 'citizen' | 'traitor';
  roomCode: string;
  traitorId: string;
}

export default function Phase3Interface({
  playerId,
  playerName,
  playerRole,
  roomCode,
  traitorId,
}: Phase3InterfaceProps) {
  const [session, setSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [showSkipVote, setShowSkipVote] = useState<boolean>(false);
  const [skipVoteCount, setSkipVoteCount] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(8);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [vote, setVote] = useState<'traitor' | 'citizen'>('citizen');
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  useEffect(() => {
    const s = phase3Manager.initSession(roomCode, traitorId, totalPlayers);
    setSession(s);
  }, [roomCode, traitorId, totalPlayers]);

  // Timer interval
  useEffect(() => {
    if (!session) return;

    const updateTimer = setInterval(() => {
      const remaining = phase3Manager.getRemainingTime(session);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(updateTimer);
        setShowResults(true);
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [session]);

  // Submit vote
  const handleVote = useCallback(async (selectedVote: 'traitor' | 'citizen') => {
    const result = phase3Manager.submitVote(session!, playerId, selectedVote);
    setSession(result.updatedSession);
    setVote(selectedVote);
    setHasVoted(true);

    if (result.skipInitiated) {
      setShowSkipVote(true);
    }
  }, [playerId, session]);

  // Skip vote confirmation
  const confirmSkip = useCallback(() => {
    setShowSkipVote(false);
    setShowResults(true);
  }, []);

  const cancelSkip = useCallback(() => {
    setShowSkipVote(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Debate Timer */}
        <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 text-center">
          <h1 className="text-2xl font-bold text-gold mb-4">
            النقاش المفتوح
          </h1>
          <div className="flex items-center justify-center gap-2">
            <ClockIcon className="w-10 h-10 text-gold" />
            <span className="text-4xl font-bold text-white">{timeRemaining}</span>
            <span className="text-white/60">ثواني متبقية</span>
          </div>
          <p className="text-white/60 mt-2">
            مناقشة لمدة دقيقتين • التصويت لخائن المجلس
          </p>
        </div>

        {/* Skip Vote Section */}
        {showSkipVote && (
          <div className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-gold mb-4">
              تصويت التخطي
            </h2>
            <p className="text-white/60 mb-4">
              هل تريد التخطي إلى نتائج التصويت؟ (يتطلب {session?.skipVoteThreshold || 6} من الأصوات)
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="flex-1 bg-gold text-black px-6 py-3 rounded-xl font-bold"
                onClick={confirmSkip}
              >
                التخطي
              </button>
              <button
                className="flex-1 bg-white/10 text-white px-6 py-3 rounded-xl font-bold"
                onClick={cancelSkip}
              >
                البقاء
              </button>
            </div>
          </div>
        )}

        {/* Voting Buttons */}
        {!showSkipVote && !hasVoted && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleVote('traitor')}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              <Mic className="w-5 h-5 mr-2" /> تصويت لخائن
            </button>
            <button
              onClick={() => handleVote('citizen')}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              <CheckCircle className="w-5 h-5 mr-2" /> تصويت لمواطن
            </button>
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gold mb-4">
              نتائج التصويت
            </h1>
            <p className="text-white/60 mb-4">
              تم الانتقال إلى نتائج التصويت
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">+30</p>
                <p className="text-white/60 text-sm">إذا تم تحديد الخائن</p>
              </div>
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">+15</p>
                <p className="text-white/60 text-sm">إذا تم التصويت بشكل صحيح</p>
              </div>
            </div>
            <button
              className="w-full mt-4 bg-gold text-black px-6 py-3 rounded-xl font-bold"
              onClick={() => {/* go to next phase */}}
            >
              <Gavel className="w-5 h-5 mr-2" /> انهاء النقاش
            </button>
          </div>
        )}
      </div>
    </div>
  );
}