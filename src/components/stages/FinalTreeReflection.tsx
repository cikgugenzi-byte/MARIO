import React, { useEffect, useState } from 'react';
import { Award, CheckSquare, HeartHandshake, RotateCcw, Sparkles, Square } from 'lucide-react';
import {
  FINAL_INSPIRATIONAL_MESSAGE,
  FINAL_REFLECTION_CHECKBOXES,
  GAME_BADGES,
} from '../../data/curriculum';
import { soundEngine } from '../../audio/soundEngine';
import { BadgeEmblemSvg, CharacterAvatarSvg, CoinSvg, StarSvg } from '../GameIcons';

interface FinalTreeReflectionProps {
  studentName: string;
  coins: number;
  stars: number;
  earnedBadges: string[];
  onTreeGrowthChange: (stage: number) => void;
  onRewardCoins: (amount: number, reason: string) => void;
  onRestartFullGame: () => void;
}

export function FinalTreeReflection({
  studentName,
  coins,
  stars,
  earnedBadges,
  onTreeGrowthChange,
  onRewardCoins,
  onRestartFullGame,
}: FinalTreeReflectionProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    FINAL_REFLECTION_CHECKBOXES.map(() => false),
  );
  const [openReflection, setOpenReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toadBlessing, setToadBlessing] = useState<string | null>(null);
  const [loadingToad, setLoadingToad] = useState(false);

  const checkedCount = checkedItems.filter(Boolean).length;
  const openBonus = openReflection.trim().length > 4 ? 1 : 0;
  const totalGrowth = Math.min(6, checkedCount + openBonus);

  useEffect(() => {
    onTreeGrowthChange(totalGrowth);
  }, [totalGrowth, onTreeGrowthChange]);

  const toggleCheck = (idx: number) => {
    soundEngine.playCoin();
    setCheckedItems((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleFinishReflection = async () => {
    soundEngine.playVictory();
    onRewardCoins(50, '+50 Koin Pohon Kebaikan!');
    setSubmitted(true);

    if (openReflection.trim()) {
      setLoadingToad(true);
      try {
        const res = await fetch('/api/toad-think', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'Refleksi Akhir Tree of Kindness',
            question: `Niat kebaikan murid bernama ${studentName || 'Zakat Hero'}: "${openReflection.trim()}". Berikan apresiasi singkat dan doa penyemangat untuk siswa kelas 6 SD.`,
          }),
        });
        const data = await res.json();
        setToadBlessing(data.answer || null);
      } catch {
        setToadBlessing(null);
      } finally {
        setLoadingToad(false);
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-20 w-full max-w-xl p-2.5 sm:p-4 pt-20 pointer-events-none flex items-end justify-end">
      <div
        data-testid="reflection-card"
        className="pointer-events-auto w-full bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 max-h-[82vh] overflow-y-auto panel-scroll animate-dialogue-pop"
      >
        <div className="flex items-center justify-between gap-2.5 border-b-2 border-amber-200 pb-2">
          <div className="flex items-center gap-2">
            <CharacterAvatarSvg character="princess" className="w-9 h-9" />
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-emerald-900 leading-tight">
                Level Akhir: Tree of Kindness
              </h2>
              <p className="text-[11px] text-slate-600">
                Setiap refleksi menumbuhkan Pohon Kebaikan Ajaib 3D di sebelah kiri!
              </p>
            </div>
          </div>
          <span className="font-mono-num font-bold text-xs px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-500 text-emerald-900 shrink-0">
            Tumbuh {totalGrowth}/6
          </span>
        </div>

        {!submitted ? (
          <div className="mt-2.5 space-y-2.5">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Centang Refleksi Dirimu:
              </div>
              {FINAL_REFLECTION_CHECKBOXES.map((label, idx) => {
                const checked = checkedItems[idx];
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                      checked
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                        : 'bg-white hover:bg-amber-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="leading-snug">{label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="open-reflection-input" className="block text-xs font-bold text-slate-800 mb-1">
                Setelah mengikuti petualangan ini, satu kebaikan yang akan saya lakukan adalah ...
              </label>
              <textarea
                id="open-reflection-input"
                rows={2}
                value={openReflection}
                onChange={(e) => setOpenReflection(e.target.value)}
                placeholder="Contoh: Saya akan menyisihkan uang jajan setiap hari Jumat untuk kotak infaq..."
                className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-medium"
              />
            </div>

            <button
              type="button"
              onClick={handleFinishReflection}
              className="btn-3d w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#0f172a] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Tumbuhkan Pohon Kebaikan &amp; Selesaikan Misi!
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-600">
              <div className="flex items-center gap-2 font-display font-extrabold text-base text-emerald-950 mb-1">
                <HeartHandshake className="w-5 h-5 text-emerald-700" />
                Pesan Terakhir Kerajaan Kebaikan
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-snug">
                &ldquo;{FINAL_INSPIRATIONAL_MESSAGE}&rdquo;
              </p>
            </div>

            {openReflection.trim() && (
              <div className="p-2.5 rounded-xl bg-white border-2 border-slate-900 text-xs sm:text-sm">
                <div className="text-[11px] font-bold uppercase text-amber-700 mb-0.5">
                  Janji Kebaikan {studentName || 'Zakat Hero'}:
                </div>
                <p className="font-semibold text-slate-800">&ldquo;{openReflection}&rdquo;</p>
              </div>
            )}

            {loadingToad && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-300 text-xs font-semibold text-sky-900">
                Toad Guide sedang menuliskan pesan penyemangat untukmu...
              </div>
            )}
            {toadBlessing && (
              <div className="p-2.5 rounded-xl bg-sky-50 border-2 border-sky-400 text-xs text-sky-950">
                <strong>Pesan Toad Guide:</strong> {toadBlessing}
              </div>
            )}

            {/* Final Rewards Showcase */}
            <div className="bg-white rounded-2xl p-3 border-2 border-slate-900">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  Penghargaan Petualanganmu
                </span>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-mono-num font-bold">
                  <span className="inline-flex items-center gap-1"><CoinSvg className="w-4 h-4" /> {coins}</span>
                  <span className="inline-flex items-center gap-1"><StarSvg className="w-4 h-4" /> {stars}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {GAME_BADGES.map((b) => {
                  const has = earnedBadges.includes(b.id);
                  return (
                    <div key={b.id} className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50 border border-amber-200">
                      <BadgeEmblemSvg color={b.color} unlocked={has} className="w-7 h-7 shrink-0" />
                      <div className="text-xs font-bold text-slate-800 truncate">{b.title}</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-snug">
                Poin dan badge merupakan penghargaan permainan untuk memotivasi belajar, bukan pahala sesungguhnya.
              </p>
            </div>

            <button
              type="button"
              onClick={onRestartFullGame}
              className="btn-3d w-full py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-display font-extrabold text-sm border-2 border-slate-900 shadow-[0_4px_0_#0f172a] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Mainkan Petualangan dari Awal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
