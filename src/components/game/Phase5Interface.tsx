'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Gavel, Users, Trophy, Clock, Star } from 'lucide-react';
import { phase5Manager } from '@/lib/game/phase5';

interface PlayerFinalScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  phaseScores: {
    phase1: number;
    phase2: number;
    phase3: number;
    phase4: number;
  };
  rank: number;
  traitorRevealed: boolean;
}

export interface Phase5InterfaceProps {
  playerId: string;
  playerName: string;
  roomCode: string;
  allPlayers: Map<string, { id: string; name: string; role: 'citizen' | 'traitor'; phaseScores: { phase1: number; phase2: number; phase3: number; phase4: number } }>;
  traitorId: string;
}

export default function Phase5Interface({
  playerId,
  playerName,
  roomCode,
  allPlayers,
  traitorId,
}: Phase5InterfaceProps) {
  const [session, setSession] = useState<any>(null);
  const [revealProgress, setRevealProgress] = useState<number>(0);
  const [showFinalScores, setShowFinalScores] = useState<boolean>(false);
  const [rank, setRank] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session
  useEffect(() => {
    const s = phase5Manager.initSession(roomCode, allPlayers, traitorId);
    setSession(s);
    // Start reveal timer
    const timer = setInterval(() => {
      setRevealProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setShowFinalScores(true);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
    timerRef.current = timer;

    return () => clearInterval(timer);
  }, [roomCode, traitorId, allPlayers]);

  // Update reveal progress
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setRevealProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowFinalScores(true);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [session]);

  // Get player's score data
  useEffect(() => {
    if (!session) return;
    const playerData = session.players.get(playerId);
    if (playerData) {
      setRank(playerData.rank);
      setTotalScore(playerData.totalScore);
    }
  }, [playerId, session]);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Reveal Progress */}
        {!showFinalScores && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6 text-center">
            <h1 className="text-2xl font-bold text-gold mb-4">
              reveal_cinematic
            </h1>
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl font-bold text-white">{revealProgress}%</span>
              <div className="w-full bg-white/20 rounded-full h-4">
                <div className="bg-gold rounded-full h-4 transition-width" style={{ width: `${revealProgress}%` }}></div>
              </div>
              <p className="text-white/60">جاري عرض النتيجة السينمائية</p>
            </div>
          </div>
        )}

        {/* Final Scores */}
        {showFinalScores && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-4">
              rankings_final
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Traitor Card */}
              <div className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-4">
                <h2 className="text-xl font-bold text-gold mb-2">
                  {traitorId ? `Player ${traitorId.slice(0, 4)}` : 'Unknown'}
                </h2>
                <p className="text-white/60 mb-2">
                  traitor_title
                </p>
                <p className="text-2xl font-bold text-gold">
                  {session?.players?.get(traitorId)?.totalScore || 0}
                </p>
                <p className="text-white/60">مجموع النقاط</p>
              </div>

              {/* Winner Card */}
              <div className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-4">
                <h2 className="text-xl font-bold text-gold mb-2">
                  الفائز
                </h2>
                <p className="text-white/60 mb-2">
                  score_title
                </p>
                <p className="text-2xl font-bold text-gold">
                  {session?.players.values().next().value?.totalScore || 0}
                </p>
                <p className="text-white/60">أعلى درجة</p>
              </div>
            </div>

            {/* Rank Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-white/60">
                <thead>
                  <tr className="text-gold border-b border-white/10">
                    <th className="p-2">المرتبة</th>
                    <th className="p-2">اللاعب</th>
                    <th className="p-2">النقاط</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(session.players.values()).map((player) => (
                    <tr key={player.playerId} className="text-white/60 border-b border-white/10">
                      <td className="p-2">{player.rank}</td>
                      <td className="p-2">{player.playerName}</td>
                      <td className="p-2">{player.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="w-full mt-4 bg-gold text-black px-6 py-3 rounded-xl font-bold"
              onClick={() => {/* play again or exit */}}
            >
              <Trophy className="w-5 h-5 mr-2" /> play_again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}