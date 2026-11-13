import React, { useState } from 'react';
import { Award, CheckCircle2, Lock, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { GAME_BADGES, STAGES_META, type GameStageId } from '../data/curriculum';
import { BadgeEmblemSvg, CharacterAvatarSvg, CoinSvg, StarSvg } from './GameIcons';

export function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="w-full max-w-2xl bg-amber-50 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_10px_0_#0f172a] p-6 max-h-[88vh] overflow-y-auto panel-scroll">
        <div className="flex items-center justify-between gap-4 border-b-2 border-amber-200 pb-3">
          <h2 className="font-display font-extrabold text-2xl text-slate-900">
            Petunjuk Petualangan Zakat Hero
          </h2>
          <button
            type="button"
            aria-label="Tutup Petunjuk"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            Selamat datang di <strong>MARIO: MISSION ZAKAT HERO!</strong> Kamu akan berpetualang melintasi 5 dunia 3D untuk mempelajari materi Fikih Kelas VI SD (Fase C) tentang <strong>Zakat, Infaq, dan Sedekah (ZIS)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200">
              <div className="font-display font-bold text-slate-900 mb-1">Kontrol Eksplorasi 3D</div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li><strong>WASD / Panah:</strong> Menggerakkan Hero</li>
                <li><strong>Spasi:</strong> Melompat</li>
                <li><strong>E / Klik Karakter:</strong> Berinteraksi</li>
                <li><strong>Esc / P:</strong> Menjeda permainan</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200">
              <div className="font-display font-bold text-slate-900 mb-1">Alur Misi Belajar</div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li><strong>World 0:</strong> Panggilan Princess & Blok Misteri</li>
                <li><strong>World 1:</strong> Ketentuan ZIS & 8 Golongan Asnaf</li>
                <li><strong>World 2:</strong> Kalkulator & Waktu Zakat Fitrah</li>
                <li><strong>World 3 & Final:</strong> Simulasi Dana Sosial & Tantangan Naga</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-3.5 text-sm text-emerald-950">
            <strong>Catatan Penting:</strong> Koin Emas, Bintang, dan Badge adalah penghargaan permainan untuk memotivasi belajarmu, bukan ukuran pahala sesungguhnya.
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
          >
            Siap Berpetualang!
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileModal({
  studentName,
  onChangeName,
  coins,
  stars,
  earnedBadges,
  completedStages,
  onClose,
}: {
  studentName: string;
  onChangeName: (name: string) => void;
  coins: number;
  stars: number;
  earnedBadges: string[];
  completedStages: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="w-full max-w-2xl bg-amber-50 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_10px_0_#0f172a] p-6 max-h-[88vh] overflow-y-auto panel-scroll">
        <div className="flex items-center justify-between gap-4 border-b-2 border-amber-200 pb-3">
          <div className="flex items-center gap-3">
            <CharacterAvatarSvg character="hero" className="w-12 h-12" />
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl">Profil Zakat Hero</h2>
              <p className="text-xs text-slate-600">Pendidikan Agama Islam & Budi Pekerti · Kelas VI SD (Fase C)</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup Profil"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="hero-name-input" className="block text-sm font-bold text-slate-800 mb-1">
            Nama Petualang:
          </label>
          <input
            id="hero-name-input"
            type="text"
            value={studentName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Masukkan namamu..."
            className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-500 focus:outline-none font-semibold"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 flex items-center gap-2.5">
            <CoinSvg className="w-8 h-8 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500">Koin Emas</div>
              <div className="font-mono-num font-extrabold text-xl tabular-nums">{coins}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 flex items-center gap-2.5">
            <StarSvg className="w-8 h-8 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500">Bintang</div>
              <div className="font-mono-num font-extrabold text-xl tabular-nums">{stars}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 flex items-center gap-2.5">
            <Award className="w-8 h-8 text-violet-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500">Misi Selesai</div>
              <div className="font-mono-num font-extrabold text-xl tabular-nums">{completedStages.length}/7</div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="font-display font-bold text-lg mb-2.5">Koleksi Achievement Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GAME_BADGES.map((badge) => {
              const unlocked = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl border-2 ${
                    unlocked ? 'bg-white border-amber-400' : 'bg-slate-100 border-slate-200 opacity-75'
                  }`}
                >
                  <BadgeEmblemSvg color={badge.color} unlocked={unlocked} className="w-11 h-11 shrink-0" />
                  <div>
                    <div className="font-display font-bold text-sm flex items-center gap-1.5">
                      {badge.title}
                      {unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 bg-white/80 rounded-xl p-2.5 border border-slate-200">
          Poin, bintang, dan badge merupakan penghargaan permainan untuk menyemangati belajar, bukan pahala sesungguhnya.
        </p>
      </div>
    </div>
  );
}

export function AdventureMapModal({
  currentStageId,
  highestUnlockedIndex,
  completedStages,
  onSelectStage,
  onClose,
}: {
  currentStageId: GameStageId;
  highestUnlockedIndex: number;
  completedStages: string[];
  onSelectStage: (stageId: GameStageId) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75">
      <div className="w-full max-w-3xl bg-amber-50 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_10px_0_#0f172a] p-6 max-h-[88vh] overflow-y-auto panel-scroll">
        <div className="flex items-center justify-between gap-4 border-b-2 border-amber-200 pb-3">
          <div>
            <h2 className="font-display font-extrabold text-2xl">Peta Petualangan Zakat Hero</h2>
            <p className="text-xs sm:text-sm text-slate-600">Pilih dunia yang telah terbuka untuk menjelajah atau mengulang misi.</p>
          </div>
          <button
            type="button"
            aria-label="Tutup Peta Dunia"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STAGES_META.map((stage, idx) => {
            const isCurrent = stage.id === currentStageId;
            const isUnlocked = idx <= highestUnlockedIndex;
            const isCompleted = completedStages.includes(stage.id);
            return (
              <button
                key={stage.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectStage(stage.id);
                  onClose();
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-transform ${
                  isCurrent
                    ? 'bg-amber-200 border-slate-900 shadow-[0_4px_0_#0f172a]'
                    : isUnlocked
                      ? 'bg-white hover:bg-sky-50 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer'
                      : 'bg-slate-200/80 border-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide">
                  <span className="text-sky-700">{stage.shortLabel} · {stage.tpTag}</span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Selesai
                    </span>
                  ) : !isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Lock className="w-3.5 h-3.5" /> Terkunci
                    </span>
                  ) : (
                    <span className="text-amber-700">Aktif</span>
                  )}
                </div>
                <div className="font-display font-extrabold text-base mt-1">{stage.worldTitle}</div>
                <div className="text-xs text-slate-600 mt-0.5">{stage.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PauseModal({
  onResume,
  onRestartWorld,
  onReturnTitle,
}: {
  onResume: () => void;
  onRestartWorld: () => void;
  onReturnTitle: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
      <div className="w-full max-w-md bg-amber-50 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_10px_0_#0f172a] p-6 text-center">
        <h2 className="font-display font-extrabold text-2xl">Permainan Dijeda</h2>
        <p className="text-sm text-slate-600 mt-1">Ambil napas sejenak sebelum melanjutkan petualangan Zakat Hero.</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="btn-3d w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-lg border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
          >
            Lanjutkan Bermain
          </button>
          <button
            type="button"
            onClick={onRestartWorld}
            className="btn-3d w-full py-3 rounded-2xl bg-white hover:bg-amber-100 text-slate-900 font-bold text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Ulangi Posisi Dunia Ini
          </button>
          <button
            type="button"
            onClick={onReturnTitle}
            className="btn-3d w-full py-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-950 font-bold text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
          >
            Kembali ke Layar Judul
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToadAskModal({
  currentTopic,
  onClose,
}: {
  currentTopic: string;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presetQuestions = [
    'Apa perbedaan utama antara zakat fitrah dan sedekah biasa?',
    'Mengapa golongan fakir dan miskin dibedakan dalam 8 asnaf?',
    'Bagaimana cara membagi dana sosial kelas Rp1.000.000 agar adil dan amanah?',
  ];

  const askToad = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/toad-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          question: trimmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Toad Guide sedang istirahat sebentar.');
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setErrorMsg('Gagal menghubungi Toad Guide. Periksa koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
      <div className="w-full max-w-xl bg-amber-50 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_10px_0_#0f172a] p-6 max-h-[88vh] overflow-y-auto panel-scroll">
        <div className="flex items-center justify-between gap-3 border-b-2 border-amber-200 pb-3">
          <div className="flex items-center gap-3">
            <CharacterAvatarSvg character="toad" className="w-12 h-12" />
            <div>
              <h2 className="font-display font-extrabold text-xl">Tanya Toad Guide</h2>
              <p className="text-xs text-slate-600">Pemandu Materi Fikih ZIS · Topik: {currentTopic}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup Tanya Toad"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold text-slate-600 mb-2">Contoh pertanyaan pemantik:</div>
          <div className="flex flex-col gap-2">
            {presetQuestions.map((pq) => (
              <button
                key={pq}
                type="button"
                onClick={() => {
                  setQuestion(pq);
                  askToad(pq);
                }}
                className="text-left text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border-2 border-slate-200 font-medium cursor-pointer"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            askToad(question);
          }}
          className="mt-4 flex gap-2"
        >
          <label htmlFor="toad-question-input" className="sr-only">
            Tulis pertanyaanmu tentang ZIS
          </label>
          <input
            id="toad-question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tanyakan hal yang membuatmu penasaran tentang ZIS..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-emerald-500 focus:outline-none text-sm font-medium"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-3d inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Tanya
          </button>
        </form>

        {loading && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Toad Guide sedang berpikir mendalam untuk menjawab pertanyaanmu...
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-sm font-semibold text-rose-900">
            {errorMsg}
          </div>
        )}
        {answer && !loading && (
          <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-emerald-500 text-sm sm:text-base text-slate-800 leading-relaxed animate-dialogue-pop">
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-1">
              Jawaban Toad Guide:
            </div>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
