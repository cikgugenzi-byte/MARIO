import React, { useState } from 'react';
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { DIAGNOSTIC_QUESTIONS } from '../../data/curriculum';
import { soundEngine } from '../../audio/soundEngine';
import { CharacterAvatarSvg } from '../GameIcons';

interface Level2MysteryBlocksProps {
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
}

export function Level2MysteryBlocks({ onComplete, onRewardCoins }: Level2MysteryBlocksProps) {
  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [completedAll, setCompletedAll] = useState(false);

  const q = DIAGNOSTIC_QUESTIONS[index];
  const letters = ['A', 'B', 'C'] as const;

  const handleSelectOption = (optIdx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(optIdx);
    if (optIdx === q.correctIndex) {
      soundEngine.playCorrect();
      onRewardCoins(15, '+15 Koin Blok Misteri!');
    } else {
      soundEngine.playWrong();
      onRewardCoins(5, '+5 Koin Usaha Belajar!');
    }
  };

  const handleNext = () => {
    if (index < DIAGNOSTIC_QUESTIONS.length - 1) {
      setIndex((i) => i + 1);
      setSelectedIdx(null);
    } else {
      soundEngine.playVictory();
      setCompletedAll(true);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex justify-center">
      <div
        data-testid="quiz-card"
        className="pointer-events-auto w-full max-w-4xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 animate-dialogue-pop max-h-[60vh] overflow-y-auto panel-scroll"
      >
        {!completedAll ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-slate-900 flex items-center justify-center font-display font-extrabold text-base text-slate-900 shrink-0">
                  ?
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-sm sm:text-base leading-tight">
                    Mystery Question Block — Asesmen Awal
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Blok {index + 1} dari {DIAGNOSTIC_QUESTIONS.length} · Tidak dinilai, khusus memetakan pemahaman awalmu!
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {DIAGNOSTIC_QUESTIONS.map((dq, i) => (
                  <span
                    key={dq.id}
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold border ${
                      i < index
                        ? 'bg-emerald-400 border-slate-900 text-slate-950'
                        : i === index
                          ? 'bg-amber-400 border-slate-900 text-slate-950'
                          : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    ?
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-2.5">
              <p className="font-display font-bold text-sm sm:text-[15px] text-slate-900 leading-snug">
                {q.prompt}
              </p>

              <div
                data-testid="quiz-options"
                role="group"
                aria-label="Pilihan jawaban"
                className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                {q.options.map((opt, optIdx) => {
                  const isChosen = selectedIdx === optIdx;
                  const isRight = optIdx === q.correctIndex;
                  let styleClass = 'bg-white hover:bg-amber-100 border-slate-900 text-slate-900';
                  if (selectedIdx !== null) {
                    if (isRight) {
                      styleClass = 'bg-emerald-100 border-emerald-700 text-emerald-950';
                    } else if (isChosen) {
                      styleClass = 'bg-amber-100 border-amber-700 text-amber-950';
                    } else {
                      styleClass = 'bg-slate-100 border-slate-300 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={selectedIdx !== null}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full h-full text-left px-3 py-2 rounded-xl border-2 font-semibold text-xs sm:text-[13px] leading-snug flex items-start gap-2 transition-colors cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <span className="w-5 h-5 mt-0.5 rounded-md bg-slate-900 text-white font-mono-num font-bold text-[11px] flex items-center justify-center shrink-0">
                        {letters[optIdx]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selectedIdx !== null && (
                <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-sky-50 border-2 border-sky-400 animate-dialogue-pop flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CharacterAvatarSvg character="toad" className="w-8 h-8 shrink-0" />
                    <div className="text-xs text-slate-800 leading-snug">
                      <div className="font-bold text-sky-900 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        {selectedIdx === q.correctIndex ? 'Hebat! Pemahamanmu tepat.' : 'Bagus sudah mencoba! Yuk kenali jawabannya:'}
                      </div>
                      {q.feedback}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-3d inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer shrink-0"
                  >
                    {index < DIAGNOSTIC_QUESTIONS.length - 1 ? 'Buka Blok Berikutnya' : 'Lihat Kesimpulan Awal'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="inline-flex p-2.5 rounded-xl bg-emerald-100 border-2 border-slate-900 mb-2">
              <Sparkles className="w-6 h-6 text-emerald-700" />
            </div>
            <h2 className="font-display font-extrabold text-xl text-slate-900">
              5 Blok Misteri Terbuka!
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-700 max-w-xl mx-auto">
              Pemetaan awalmu sudah siap! Sekarang Toad Guide mengundangmu menuju <strong>World 1: Village of Kindness</strong> untuk mempelajari ketentuan ZIS dan menyelamatkan 8 golongan penerima zakat.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="btn-3d mt-3.5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-sm sm:text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
            >
              Masuk ke World 1: Village of Kindness
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
