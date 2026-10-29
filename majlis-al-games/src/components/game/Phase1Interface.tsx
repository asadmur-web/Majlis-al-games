'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface QuestionPair {
  citizenQuestion: string;
  traitorQuestion: string;
  category: string;
}

export default function Phase1Interface({
  currentQuestionIndex,
  questions,
  timeRemaining,
  hasSubmitted,
  playerRole,
}: {
  currentQuestionIndex: number;
  questions: QuestionPair[];
  timeRemaining: number;
  hasSubmitted: boolean;
  playerRole: 'citizen' | 'traitor';
}) {
  const [answer, setAnswer] = useState('');
  const currentQuestion = questions[currentQuestionIndex];

  const formattedTime = `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] via-[#16161f] to-[#0D0D12] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1a24] border border-gold/30 rounded-3xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gold flex items-center gap-3">
            <Users className="w-7 h7" />
            فخ الأسئلة الثلاثة
          </h1>
          <p className="text-white/60 mt-1">
            السؤال {currentQuestionIndex + 1} من {questions.length} • {currentQuestion?.category}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Clock className="w-5 h-5 text-gold" />
            <span className="text-2xl font-mono font-bold">{formattedTime}</span>
          </div>
        </div>

        <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-8 mb-6">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-3 py-1 rounded-full text-xs font-bold mb-4">
            {playerRole === 'citizen' ? 'مواطن' : 'خائن'}
          </div>
          <h2 className="text-2xl font-bold text-white leading-relaxed text-right mb-6">
            {playerRole === 'citizen' ? currentQuestion?.citizenQuestion : currentQuestion?.traitorQuestion}
          </h2>

          {!hasSubmitted ? (
            <div className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                className="w-full min-h-[140px] p-4 bg-[#0D0D12] border-2 border-white/20 rounded-2xl text-white"
                maxLength={500}
              />
              <button className="flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl font-bold">
                <Send className="w-5 h-5" />
                إرسال الإجابة
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">تم إرسال إجابتك</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
