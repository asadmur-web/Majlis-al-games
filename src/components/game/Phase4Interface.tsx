'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Users, Mic, Gavel, Clock as ClockIcon } from 'lucide-react';
import { phase4Manager } from '@/lib/game/phase4';

interface DefenseSubmission {
  playerId: string;
  answer: string;
}

export interface VoteResult {
  playerId: string;
  vote: 'traitor' | 'citizen';
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface Phase4InterfaceProps {
  playerId: string;
  playerName: string;
  playerRole: 'citizen' | 'traitor';
  roomCode: string;
  traitorId: string;
}

export default function Phase4Interface({
  playerId,
  playerName,
  playerRole,
  roomCode,
  traitorId,
}: Phase4InterfaceProps) {
  const [session, setSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [defenseSubmitted, setDefenseSubmitted] = useState<boolean>(false);
  const [defenseAnswer, setDefenseAnswer] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  useEffect(() => {
    const s = phase4Manager.initSession(roomCode, traitorId, 8);
    setSession(s);
  }, [roomCode, traitorId]);

  // Timer interval
  useEffect(() => {
    if (!session) return;

    const updateTimer = setInterval(() => {
      const remaining = phase4Manager.getRemainingTime(session);
      setTimeRemaining(remaining);

      if (remaining <= 0 || phase4Manager.isTimeUp(session)) {
        clearInterval(updateTimer);
        setShowResults(true);
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [session]);

  // Submit defense
  const handleSubmitDefense = useCallback(async () => {
    if (!defenseAnswer.trim()) return;

    const result = phase4Manager.submitDefense(session!, playerId, defenseAnswer);
    setSession(result.updatedSession);
    setDefenseSubmitted(true);

    if (result.timeUp) {
      setShowResults(true);
    }
  }, [playerId, session]);

  // Determine final result
  const determineResult = useCallback(() => {
    const resolved = phase4Manager.determineFinalResult(session!);
    setSession(resolved);
    setShowResults(true);
  }, [session]);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Defense Timer */}
        <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 text-center">
          <h1 className="text-2xl font-bold text-gold mb-4">
            الدفاع الأخير
          </h1>
          <div className="flex items-center justify-center gap-2">
            <ClockIcon className="w-10 h-10 text-gold" />
            <span className="text-4xl font-bold text-white">{timeRemaining}</span>
            <span className="text-white/60">ثواني متبقية</span>
          </div>
          <p className="text-white/60 mt-2">
            فترة دفاع 30 ثانية • خائن المجلس
          </p>
        </div>

        {/* Defense Form */}
        {!defenseSubmitted && !phase4Manager.isTimeUp(session!) && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-4">
              أدلي بدفاعك
            </h1>
            <p className="text-white/60 mb-4">
              خاطب المجلس لدعم منصبك وأدفع التهم
            </p>
            <textarea
              value={defenseAnswer}
              onChange={(e) => setDefenseAnswer(e.target.value)}
              placeholder="اكتب دفاعك هنا..."
              className="w-full min-h-[140px] p-4 bg-[#0D0D12] border-2 border-white/20 rounded-2xl text-white max-w-xs mb-4"
              maxLength={500}
            />
            <button
              onClick={handleSubmitDefense}
              className="w-full flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold"
            >
              <CheckCircle className="w-5 h-5" />
              إرسال الدفاع
            </button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gold mb-4">
              نتائج التصويت النهائي
            </h1>
            <p className="text-white/60 mb-4">
              تم تحديد نتيجة اللعبة
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">✓</p>
                <p className="text-white/60 text-sm">خائن eliminado</p>
              </div>
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">✓</p>
                <p className="text-white/60 text-sm">المواطن survives</p>
              </div>
            </div>
            <button
              className="w-full mt-4 bg-gold text-black px-6 py-3 rounded-xl font-bold"
              onClick={() => {/* proceed to phase 5 */}}
            >
              <Gavel className="w-5 h-5 mr-2" /> proceeding_to_reveal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}