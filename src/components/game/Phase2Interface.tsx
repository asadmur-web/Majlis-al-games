'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, Shield, Award, ArrowLeft, CheckCircle } from 'lucide-react';

interface InterrogationTarget {
  targetId: string;
  question: string;
}

export interface Phase2InterfaceProps {
  playerId: string;
  playerName: string;
  playerRole: 'citizen' | 'traitor';
  roomCode: string;
}

export default function Phase2Interface({
  playerId,
  playerName,
  playerRole,
  roomCode,
}: Phase2InterfaceProps) {
  const [targets, setTargets] = useState<Map<string, InterrogationTarget>>(new Map());
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedTargetQuestion, setSelectedTargetQuestion] = useState<string>('');
  const [privateTimer, setPrivateTimer] = useState<number>(3);
  const [publicQuestion, setPublicQuestion] = useState<string>('');
  const [publicAnswer, setPublicAnswer] = useState<string>('');
  const [publicAnswererName, setPublicAnswererName] = useState<string>('');
  const [phase, setPhase] = useState<'selecting' | 'private' | 'public' | 'scoring'>('selecting');
  const [score, setScore] = useState<number>(0);
  const [showScore, setShowScore] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase !== 'private') {
      setPrivateTimer(3);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const timer = setInterval(() => {
      setPrivateTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('public');
          setPublicQuestion('');
          setPublicAnswer('');
          setPublicAnswererName('');
          if (timerRef.current) clearTimeout(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;

    return () => {
      clearInterval(timer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  const submitPrivateAnswer = useCallback(async (answer: string) => {
    if (!selectedTargetId || !selectedTargetQuestion) return;

    // Transition through revealing phase then to public after 3s
    setPhase('public');

    setTimeout(() => {
      setPublicQuestion(selectedTargetQuestion);
      setPublicAnswer(answer);
      setPublicAnswererName(playerName);
      setShowScore(true);
    }, 3000);
  }, [selectedTargetId, selectedTargetQuestion, playerName]);

  const submitPublicBroadcast = useCallback(() => {
    setPhase('scoring');
    setShowScore(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white p-4">
      <div className="max-w-5xl mx-auto">
        {phase === 'selecting' && targets.size > 0 && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-6">
              interrogation_sélective
            </h1>
            <p className="text-white/60 mb-4">target the interrogated player</p>
            <div className="space-y-3">
              {Array.from(targets.entries()).map(([targetId, target], index) => {
                const targetName = `Player ${targetId.slice(0, 6)}`;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl border"
                    onClick={() => setSelectedTargetId(targetId)}
                  >
                    <Eye className="w-5 h-5 text-gold cursor-pointer" />
                    <span className="flex-1 text-white cursor-pointer">{targetName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === 'selecting' && targets.size === 0 && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 text-center">
            <p className="text-white/60">no_active_interrogation</p>
          </div>
        )}

        {phase === 'private' && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-6">
              reveal_privé_3_secondes
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-lg text-white">
                {selectedTargetQuestion || 'question_sélective'}
              </p>
              <div className="text-gold font-bold text-3xl">{privateTimer}</div>
            </div>
            <textarea
              value=""
              onChange={(e) => {}}
              placeholder="write_your_answer..."
              className="w-full min-h-[140px] p-4 bg-[#0D0D12] border-2 border-white/20 rounded-2xl text-white max-w-xs mt-4"
              disabled
            />
            <button
              className="mt-4 w-full flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={privateTimer > 0}
            >
              <CheckCircle className="w-5 h-5" />
              submitting_answer
            </button>
          </div>
        )}

        {phase === 'public' && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-6">
              broadcast_public_sans_nom
            </h1>
            <div className="bg-[#1a1a24] border border-gold/30 rounded-2xl p-6 mb-4">
              <p className="text-white/60 mb-2">
                question + answerer_name displayed (asker hidden)
              </p>
              <p className="text-xl font-bold text-gold">
                {selectedTargetQuestion || 'Question revealed...'}
              </p>
              <p className="text-lg text-white">
                Answer: {selectedTargetQuestion ? 'See above' : 'Waiting for answer...'}
              </p>
              <p className="text-lg text-white">by: {playerName}</p>
            </div>
            <button
              className="w-full mt-4 flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold"
              onClick={submitPublicBroadcast}
            >
              <Award className="w-5 h-5" />
              proceeding_to_scoring
            </button>
          </div>
        )}

        {phase === 'scoring' && showScore && (
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gold mb-6">
              scoring_system
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">+5</p>
                <p className="text-white/60 text-sm">valid_question</p>
              </div>
              <div className="bg-[#1a1a24] border border-gold/30 rounded-xl p-4">
                <p className="text-gold font-bold text-lg">+30</p>
                <p className="text-white/60 text-sm">correct_traitor</p>
              </div>
            </div>
            <p className="text-white/60 text-center mb-6">
              your_score: {score}
            </p>
            <button
              className="w-full mt-4 flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold"
              onClick={() => setPhase('selecting')}
            >
              <ArrowLeft className="w-5 h-5" />
              new_interrogation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}