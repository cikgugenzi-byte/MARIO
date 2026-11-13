import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircleHeart } from 'lucide-react';
import { PRINCESS_CALL_SPEECH, SPARK_QUESTIONS } from '../../data/curriculum';
import { soundEngine } from '../../audio/soundEngine';
import { CharacterAvatarSvg } from '../GameIcons';

interface Level1PrincessProps {
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
}

export function Level1Princess({ onComplete, onRewardCoins }: Level1PrincessProps) {
  const [step, setStep] = useState<'call' | 'sparks'>('call');
  const [activeSparkIdx, setActiveSparkIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [heroMood, setHeroMood] = useState<'ready' | 'excited'>('ready');

  const currentSpark = SPARK_QUESTIONS[activeSparkIdx];
  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  const handleUseStarter = (id: string, text: string) => {
    soundEngine.playCoin();
    setAnswers((prev) => ({ ...prev, [id]: text }));
    setHeroMood('excited');
  };

  const handleAcceptMission = () => {
    soundEngine.playCorrect();
    onRewardCoins(20, '+20 Koin Semangat!');
    setStep('sparks');
  };

  const handleFinishSparks = () => {
    soundEngine.playVictory();
    onRewardCoins(30, '+30 Koin Misi!');
    onComplete();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex justify-center">
      <div
        data-testid="quiz-card"
        className="pointer-events-auto w-full max-w-4xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 animate-dialogue-pop max-h-[60vh] overflow-y-auto panel-scroll"
      >
        {step === 'call' ? (
          <div className="flex flex-col sm:flex-row items-start gap-3.5">
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-2xl bg-rose-100 border-2 border-slate-900">
                <CharacterAvatarSvg character="princess" className="w-14 h-14" />
              </div>
              <div className="sm:hidden">
                <div className="font-display font-extrabold text-base text-rose-800">Princess Kebaikan</div>
                <div className="text-xs font-semibold text-slate-600">Pemberi Misi Kerajaan</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="hidden sm:flex items-center justify-between gap-2 mb-1">
                <span className="font-display font-extrabold text-base text-rose-800">
                  Panggilan Princess Kebaikan
                </span>
                <span className="text-xs font-bold text-slate-600">World 0 · Level 1</span>
              </div>

              <blockquote className="text-sm sm:text-base font-semibold text-slate-900 bg-white rounded-2xl p-3 border-2 border-rose-200 leading-relaxed">
                "{PRINCESS_CALL_SPEECH}"
              </blockquote>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <CharacterAvatarSvg character="hero" className="w-9 h-9" />
                  <span>Hero &amp; Sahabat siap menjawab panggilan Princess!</span>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptMission}
                  className="btn-3d inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-sm sm:text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
                >
                  Ya, Aku Siap Membantu!
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <CharacterAvatarSvg character={heroMood === 'excited' ? 'buddy' : 'princess'} className="w-9 h-9" />
                <div>
                  <h2 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                    Pertanyaan Pemantik Kerajaan ({activeSparkIdx + 1}/{SPARK_QUESTIONS.length})
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Jawablah pertanyaan pemantik ini dengan pemikiranmu sendiri sebelum membuka Blok Misteri!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {SPARK_QUESTIONS.map((sq, idx) => {
                  const done = Boolean(answers[sq.id]?.trim());
                  return (
                    <button
                      key={sq.id}
                      type="button"
                      onClick={() => setActiveSparkIdx(idx)}
                      className={`w-7 h-7 rounded-lg font-mono-num font-bold text-xs border-2 cursor-pointer ${
                        idx === activeSparkIdx
                          ? 'bg-sky-500 text-white border-slate-900'
                          : done
                            ? 'bg-emerald-400 text-slate-950 border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 bg-white rounded-2xl p-3 border-2 border-slate-200">
              <div className="flex items-start gap-2">
                <MessageCircleHeart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="font-display font-bold text-sm sm:text-[15px] text-slate-900 leading-snug">
                  {currentSpark.question}
                </div>
              </div>

              <label htmlFor={`spark-input-${currentSpark.id}`} className="sr-only">
                Jawabanmu untuk pertanyaan pemantik
              </label>
              <textarea
                id={`spark-input-${currentSpark.id}`}
                rows={2}
                value={answers[currentSpark.id] || ''}
                onChange={(e) => {
                  setAnswers((prev) => ({ ...prev, [currentSpark.id]: e.target.value }));
                  setHeroMood('excited');
                }}
                placeholder="Tulis pendapatmu di sini..."
                className="mt-2 w-full px-3 py-2 rounded-xl bg-amber-50/70 border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-xs sm:text-sm font-medium"
              />

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleUseStarter(currentSpark.id, currentSpark.starterAnswer)}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                >
                  Lihat Contoh Ide Jawaban
                </button>
                <span className="text-[11px] text-slate-600 italic">Petunjuk Toad: {currentSpark.toadHint}</span>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Terjawab: <span className="font-mono-num tabular-nums font-bold">{answeredCount}/4</span> pertanyaan
              </div>

              <div className="flex items-center gap-2">
                {activeSparkIdx < SPARK_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveSparkIdx((i) => i + 1)}
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    Pertanyaan Berikutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishSparks}
                    className="btn-3d inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
                  >
                    Menuju Mystery Question Block
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
