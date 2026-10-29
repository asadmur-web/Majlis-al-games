'use client';

import { useState, useEffect } from 'react';
import Phase1Interface from '@/components/game/Phase1Interface';
import { questionGenerator } from '@/lib/ai/questionGenerator';

export default function Phase1Page() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const q = await questionGenerator.generateQuestions(3);
        setQuestions(q);
      } catch (error) {
        console.error('Failed to load questions', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p>جاري تحميل الأسئلة...</p>
        </div>
      </div>
    );
  }

  return (
    <Phase1Interface
      currentQuestionIndex={currentIndex}
      questions={questions}
      timeRemaining={timeRemaining}
      hasSubmitted={hasSubmitted}
      playerRole="citizen"
    />
  );
}
