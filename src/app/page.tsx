'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Gamepad2, BookOpen, Shield, Sparkles, Trophy, Users, X } from 'lucide-react';
import Image from 'next/image';
import SocialBar from '@/components/landing/SocialBar';
import logo from '../../public/logo.jpg';

export default function LandingPage() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] via-[#16161f] to-[#0D0D12] text-white">
      <header className="relative overflow-hidden pt-12 pb-8 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <Image src={logo} alt="مجلس الجيمز" width={200} height={200} className="mb-4" />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-500">
            مجلس الجيمز
            </h1>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-gold" />
            الألعاب المتاحة
          </h2>
          <button onClick={() => setShowRules(true)} className="flex items-center gap-2 bg-[#1a1a24] border border-gold/40 text-gold px-5 py-2.5 rounded-xl">
            <BookOpen className="w-4 h-4" /> قوانين لعبة خائن المجلس
          </button>
        </div>

        <Link href="/game/traitor/setup">
          <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-[#1a1a24] to-[#0D0D12] border-2 border-gold/40 rounded-3xl p-8">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 bg-gradient-to-br from-gold to-amber-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-14 h-14 text-black" />
              </div>
              <div>
                <h3 className="text-4xl font-extrabold text-gold">خائن المجلس</h3>
                <p className="text-white/80 text-lg mt-2">لعبة اكتشاف الخائن من خلال الأسئلة والتحديات</p>
                <div className="flex gap-4 mt-4 text-sm text-white/60">
                  <span>4 - 12 لاعب</span>
                  <span>15 - 20 دقيقة</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </main>

      <section className="border-t border-white/10 bg-[#0A0A0F] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm font-semibold text-gold mb-4">تابعونا على وسائل التواصل الاجتماعي</p>
          <SocialBar />
        </div>
      </section>
    </div>
  );
}
