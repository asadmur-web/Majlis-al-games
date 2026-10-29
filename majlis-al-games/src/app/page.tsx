'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Gamepad2, BookOpen, Shield, X, Users, Trophy } from 'lucide-react';
import Image from 'next/image';
import SocialBar from '@/components/landing/SocialBar';
import logo from '../../public/logo.jpg';

export default function LandingPage() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D12] via-[#16161f] to-[#0D0D12] text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden pt-16 pb-10 px-4 text-center border-b border-white/10 bg-black/40 backdrop-blur-md"
      >
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-40 h-40 mb-6 rounded-3xl overflow-hidden border-2 border-gold/50 shadow-[0_0_30px_rgba(255,215,0,0.2)]"
          >
            <Image src={logo} alt="مجلس الجيمز" fill className="object-cover" priority />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-amber-500 drop-shadow-lg">
            مجلس الجيمز
          </h1>
          <p className="text-white/60 text-lg mt-3 font-medium">المنصة التفاعلية الأولى لألعاب الحفلات والتحديات</p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-gold">
            <Gamepad2 className="w-8 h-8" />
            الألعاب المتاحة
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRules(true)}
            className="flex items-center gap-2 bg-[#1a1a24] hover:bg-[#252533] border border-gold/40 text-gold px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
          >
            <BookOpen className="w-5 h-5" /> قوانين لعبة خائن المجلس
          </motion.button>
        </div>

        <Link href="/game/traitor/setup" className="block">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-[#1a1a24] via-[#12121a] to-[#0D0D12] border-2 border-gold/40 hover:border-gold rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none group-hover:bg-gold/10 transition-all"></div>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-gold via-amber-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg shadow-gold/20 flex-shrink-0">
                <Shield className="w-16 h-16 text-black" />
              </div>
              <div className="text-center md:text-right flex-1">
                <h3 className="text-4xl font-extrabold text-gold tracking-wide">خائن المجلس</h3>
                <p className="text-white/80 text-lg mt-3 leading-relaxed">لعبة اجتماعية تنافسية تعتمد على الذكاء، الخداع، واكتشاف الخائن من خلال فخ الأسئلة والمحاكمة الحية.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-sm font-semibold text-white/70">
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Users className="w-4 h-4 text-gold" /> من 4 إلى 12 لاعب
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Trophy className="w-4 h-4 text-gold" /> 15 - 20 دقيقة لكل جيم
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </main>

      {/* Social Bar */}
      <section className="border-t border-white/10 bg-[#0A0A0F] py-10 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm font-bold tracking-wider uppercase text-gold mb-6">تابعونا على منصات التواصل الاجتماعي</p>
          <SocialBar />
        </div>
      </section>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#161622] border-2 border-gold/40 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowRules(false)}
                className="absolute top-6 left-6 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black text-gold mb-6 text-center">قوانين لعبة خائن المجلس</h2>

              <div className="space-y-6 text-white/80 leading-relaxed text-right">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-gold mb-2 text-lg">المرحلة الأولى: فخ الأسئلة الثلاثة</h4>
                  <p>يجيب اللاعبون على أسئلة يطرحها النظام. يحصل المواطنون على أسئلة متشابهة بينما يحصل الخائن (أو الخونة) على أسئلة مختلفة قليلاً للإيقاع بهم عند تطابق الإجابات.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-gold mb-2 text-lg">المرحلة الثانية: الاستجواب السري والخاص</h4>
                  <p>استجواب سري لمدة 3 ثوانٍ يظهر للسائل فقط، ثم يتم عرض السؤال والإجابة على الشاشة العامة بدون اسم السائل للحفاظ على السرية وتوليد الشكوك.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-gold mb-2 text-lg">المرحلة الثالثة: النقاش المفتوح والمحاكمة</h4>
                  <p>نقاش حر لمدة دقيقتين مع إمكانية التصويت للتخطي (بنسبة 60% من اللاعبين)، يليه التصويت المباشر لتحديد المشتبه بهم.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-gold mb-2 text-lg">المرحلة الرابعة والخامسة: الدفاع الأخير والنتيجة</h4>
                  <p>فترة دفاع أخيرة للمتهم (30 ثانية)، ثم التصويت الحاسم لتحديد نجاة أو إقصاء الخائن، تليها النتائج السينمائية النهائية وتوزيع النقاط.</p>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full mt-8 bg-gold hover:bg-yellow-400 text-black py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-gold/20"
              >
                فهمت القوانين
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
