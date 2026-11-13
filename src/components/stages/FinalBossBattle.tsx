import React, { useState } from 'react';
import { ArrowRight, BookOpenCheck, ShieldAlert, Swords, Trophy } from 'lucide-react';
import { BOSS_QUIZ_QUESTIONS } from '../../data/curriculum';
import { evaluateBossQuizResults } from '../../game/zakatLogic';
import { soundEngine } from '../../audio/soundEngine';
import { BadgeEmblemSvg, CharacterAvatarSvg } from '../GameIcons';

interface FinalBossBattleProps {
  onBossHit: () => void;
  onBossDefeated: () => void;
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: 'zakat_master') => void;
}

export function FinalBossBattle({
  onBossHit,
  onBossDefeated,
  onComplete,
  onRewardCoins,
  onEarnBadge,
}: FinalBossBattleProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = BOSS_QUIZ_QUESTIONS[currentIdx];
  const chosenForCurrent = selectedAnswers[q.id];
  const letters = ['A', 'B', 'C'] as const;

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctSoFar = BOSS_QUIZ_QUESTIONS.filter(
    (item) => selectedAnswers[item.id] === item.correctIndex,
  ).length;
  // Monster energy starts at 100% and reduces on every correct answer (and drops to 0 on victory)
  const dragonEnergyPercent = finished
    ? 0
    : Math.max(8, Math.round(((15 - correctSoFar) / 15) * 100));

  const handleAnswer = (optIdx: number) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
    setShowExplanation(true);

    if (optIdx === q.correctIndex) {
      soundEngine.playBossHit();
      onBossHit();
      onRewardCoins(15, '+15 Koin Serangan Cahaya!');
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < BOSS_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowExplanation(false);
    } else {
      soundEngine.playVictory();
      setFinished(true);
      onBossDefeated();
      onEarnBadge('zakat_master');
    }
  };

  const summary = evaluateBossQuizResults(selectedAnswers, BOSS_QUIZ_QUESTIONS);

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex flex-col items-center justify-end gap-2">
      {/* Slim Boss Energy Bar above card */}
      {!finished && (
        <div className="pointer-events-auto w-full max-w-xl bg-slate-900/95 text-white rounded-xl border-2 border-rose-400 px-3.5 py-2 shadow-[0_4px_0_#0f172a]">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="flex items-center gap-1.5 text-rose-300">
              <Swords className="w-3.5 h-3.5" />
              Energi Naga Penjaga Gerbang
            </span>
            <span className="font-mono-num tabular-nums">
              {dragonEnergyPercent}% ({answeredCount}/15 Tantangan)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${dragonEnergyPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Question / Results Card */}
      <div
        data-testid="quiz-card"
        className="pointer-events-auto w-full max-w-4xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 max-h-[58vh] overflow-y-auto panel-scroll animate-dialogue-pop"
      >
        {!finished ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <CharacterAvatarSvg character="dragon" className="w-9 h-9 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-violet-800">
                    Soal {q.number} dari 15 · {q.tp} · Tingkat {q.difficulty}
                  </div>
                  <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                    Pertarungan Evaluasi Akhir Dark Castle
                  </h2>
                </div>
              </div>
              <span className="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-100 border border-violet-300 text-violet-950">
                Benar Sementara: {correctSoFar}
              </span>
            </div>

            <p className="mt-2 font-display font-bold text-sm sm:text-[15px] text-slate-900 leading-snug">
              {q.prompt}
            </p>

            <div
              data-testid="quiz-options"
              role="group"
              aria-label="Pilihan jawaban"
              className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              {q.options.map((opt, optIdx) => {
                const isChosen = chosenForCurrent === optIdx;
                const isRight = optIdx === q.correctIndex;
                let cls = 'bg-white hover:bg-amber-100 border-slate-900 text-slate-900';
                if (showExplanation) {
                  if (isRight) cls = 'bg-emerald-100 border-emerald-700 text-emerald-950';
                  else if (isChosen) cls = 'bg-rose-100 border-rose-700 text-rose-950';
                  else cls = 'bg-slate-100 border-slate-300 text-slate-500';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={showExplanation}
                    onClick={() => handleAnswer(optIdx)}
                    className={`w-full h-full text-left px-3 py-2 rounded-xl border-2 font-semibold text-xs sm:text-[13px] leading-snug flex items-start gap-2 transition-colors cursor-pointer disabled:cursor-default ${cls}`}
                  >
                    <span className="w-5 h-5 mt-0.5 rounded-md bg-slate-900 text-white font-mono-num font-bold text-[11px] flex items-center justify-center shrink-0">
                      {letters[optIdx]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-sky-50 border-2 border-sky-400 animate-dialogue-pop flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-xs text-slate-800 leading-snug min-w-0">
                  <div className="font-bold text-sky-900 mb-0.5 flex items-center gap-1">
                    {chosenForCurrent === q.correctIndex ? (
                      <>
                        <Swords className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        Serangan Tepat! Energi naga berkurang. Pembahasan:
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        Kesempatan Belajar! Mari pahami pembahasannya:
                      </>
                    )}
                  </div>
                  {q.explanation}
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-3d inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer shrink-0"
                >
                  {currentIdx < BOSS_QUIZ_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Tuntaskan & Lihat Hasil'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <BadgeEmblemSvg color="#7C3AED" unlocked className="w-12 h-12 shrink-0" />
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-violet-700">
                    <Trophy className="w-3.5 h-3.5" /> Gerbang Dark Castle Terbuka! Badge: Zakat Master
                  </div>
                  <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">
                    {summary.feedbackTitle}
                  </h2>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white border-2 border-slate-900 text-center">
                <div className="text-[10px] font-bold uppercase">Nilai Akhir</div>
                <div className="font-mono-num font-extrabold text-2xl tabular-nums leading-tight">{summary.finalScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-emerald-100 rounded-xl p-2.5 border-2 border-emerald-500">
                <div className="text-[11px] font-bold text-emerald-900">Jawaban Benar</div>
                <div className="font-mono-num font-extrabold text-xl text-emerald-950 tabular-nums">
                  {summary.correctCount}
                </div>
              </div>
              <div className="bg-rose-100 rounded-xl p-2.5 border-2 border-rose-400">
                <div className="text-[11px] font-bold text-rose-900">Jawaban Salah</div>
                <div className="font-mono-num font-extrabold text-xl text-rose-950 tabular-nums">
                  {summary.wrongCount}
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border-2 border-slate-900">
                <div className="text-[11px] font-bold text-slate-600">Ketercapaian TP 1</div>
                <div className="font-mono-num font-extrabold text-xl text-sky-700 tabular-nums">
                  {summary.tp1Percent}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border-2 border-slate-900">
                <div className="text-[11px] font-bold text-slate-600">Ketercapaian TP 2</div>
                <div className="font-mono-num font-extrabold text-xl text-amber-700 tabular-nums">
                  {summary.tp2Percent}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 border-2 border-slate-900">
                <div className="text-[11px] font-bold text-slate-600">Ketercapaian TP 3</div>
                <div className="font-mono-num font-extrabold text-xl text-emerald-700 tabular-nums">
                  {summary.tp3Percent}%
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border-2 border-slate-200 space-y-1.5 text-xs sm:text-sm">
              <div className="font-bold text-slate-900">Umpan Balik:</div>
              <p className="text-slate-700 leading-snug">{summary.feedbackMessage}</p>
              <div className="font-bold text-slate-900 pt-0.5 flex items-center gap-1.5">
                <BookOpenCheck className="w-4 h-4 text-violet-700" />
                Rekomendasi {summary.needsRemedial ? 'Remedial' : 'Pengayaan'}:
              </div>
              <ul className="list-disc pl-5 text-slate-700 space-y-0.5 text-xs">
                {summary.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onComplete}
                className="btn-3d inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-sm sm:text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
              >
                Menuju Level Akhir: Tree of Kindness
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
