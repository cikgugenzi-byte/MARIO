import React, { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Calculator, CheckCircle2, Clock, PackageCheck, Play } from 'lucide-react';
import { ZAKAT_TIME_STAGES } from '../../data/curriculum';
import {
  calculateZakatFitrah,
  checkTimeOrderSequence,
  DEFAULT_MONEY_PER_PERSON,
  formatRupiah,
  type ZakatMode,
} from '../../game/zakatLogic';
import { soundEngine } from '../../audio/soundEngine';
import { BadgeEmblemSvg, CharacterAvatarSvg } from '../GameIcons';

interface World2RiceFieldProps {
  calculatorFamilyCount: number;
  onCalculatorFamilyChange: (count: number) => void;
  collectedRiceIds: string[];
  onStartRiceExploreMode: () => void;
  onResetRiceChallenge: () => void;
  onCollectSackManual: (id: string) => void;
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: 'zakat_calculator') => void;
}

type World2Tab = 'materi-fitrah' | 'kalkulator' | 'rice-challenge' | 'time-adventure';

export function World2RiceField({
  calculatorFamilyCount,
  onCalculatorFamilyChange,
  collectedRiceIds,
  onStartRiceExploreMode,
  onResetRiceChallenge,
  onCollectSackManual,
  onComplete,
  onRewardCoins,
  onEarnBadge,
}: World2RiceFieldProps) {
  const [tab, setTab] = useState<World2Tab>('materi-fitrah');
  const [mode, setMode] = useState<ZakatMode>('beras');
  const [moneyPerPerson, setMoneyPerPerson] = useState<number>(DEFAULT_MONEY_PER_PERSON);

  // Rice Collection Challenge Target (e.g. 5 family members = 12.5 kg = 5 sacks)
  const targetSacks = 5;
  const challengeSuccess = collectedRiceIds.length >= targetSacks;

  // Zakat Time Adventure ordering state (starts scrambled!)
  const [orderedIds, setOrderedIds] = useState<string[]>([
    'menjelang-idulfitri',
    'setelah-salat-id',
    'awal-ramadan',
    'sebelum-salat-id',
  ]);
  const [timeChecked, setTimeChecked] = useState<{ isCorrect: boolean; correctPositions: number } | null>(null);

  const calcResult = calculateZakatFitrah({
    familyCount: calculatorFamilyCount,
    mode,
    moneyPerPerson,
  });

  const moveStage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= orderedIds.length) return;
    const copy = [...orderedIds];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setOrderedIds(copy);
    setTimeChecked(null);
  };

  const handleCheckTimeOrder = () => {
    const res = checkTimeOrderSequence(orderedIds);
    setTimeChecked(res);
    if (res.isCorrect) {
      soundEngine.playVictory();
      onRewardCoins(35, '+35 Koin Waktu Zakat!');
      onEarnBadge('zakat_calculator');
    } else {
      soundEngine.playWrong();
    }
  };

  const sackPoolIds = ['sack-0', 'sack-1', 'sack-2', 'sack-3', 'sack-4', 'sack-5', 'sack-6', 'sack-7'];

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-5xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 max-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <CharacterAvatarSvg character="toad" className="w-9 h-9" />
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                World 2: Magic Rice Field (TP 2)
              </h2>
              <p className="text-[11px] text-slate-600">Zakat Fitrah, Kalkulator Beras/Uang, Tantangan Beras &amp; Waktu Zakat</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['materi-fitrah', '1. Materi Fitrah'],
                ['kalkulator', '2. Kalkulator Zakat'],
                ['rice-challenge', '3. Tantangan Beras'],
                ['time-adventure', '4. Waktu Zakat'],
              ] as Array<[World2Tab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs border-2 cursor-pointer whitespace-nowrap ${
                  tab === key
                    ? 'bg-amber-400 text-slate-950 border-slate-900 shadow-[0_2px_0_#0f172a]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-2.5 overflow-y-auto panel-scroll pr-1 flex-1 space-y-3">
          {tab === 'materi-fitrah' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-900">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-amber-800">Pengertian &amp; Hukum Zakat Fitrah</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-snug">
                    <strong>Zakat Fitrah</strong> adalah zakat diri yang wajib ditunaikan oleh setiap muslim (baik laki-laki maupun perempuan, anak kecil hingga dewasa) pada bulan Ramadan hingga sebelum salat Idulfitri. Hukumnya <strong>Wajib (Fardu &apos;Ain)</strong>.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 border-2 border-slate-900">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-emerald-800">Orang yang Wajib Mengeluarkan</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-snug">
                    Setiap muslim yang masih hidup pada sebagian akhir Ramadan dan awal Syawal serta memiliki kelebihan makanan pokok untuk dirinya dan keluarga yang menjadi tanggungannya pada malam dan hari Idulfitri.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-amber-100 rounded-2xl p-3 border-2 border-amber-500">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-amber-950">Besaran Zakat Fitrah</h3>
                  <ul className="mt-1 text-xs sm:text-sm text-slate-800 space-y-0.5 leading-snug">
                    <li>• Besaran syariat adalah <strong>1 sha&apos;</strong> makanan pokok.</li>
                    <li>• Untuk pembelajaran di Indonesia digunakan pendekatan <strong>2,5 kg</strong> atau sekitar <strong>3,5 liter beras per jiwa</strong>.</li>
                    <li>• Jika dibayar dengan uang, nominalnya mengikuti <strong>ketetapan resmi lembaga zakat setempat</strong> pada tahun berjalan.</li>
                  </ul>
                </div>
                <div className="bg-sky-100 rounded-2xl p-3 border-2 border-sky-500">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-sky-950">Waktu Pembayaran</h3>
                  <ul className="mt-1 text-xs sm:text-sm text-slate-800 space-y-0.5 leading-snug">
                    <li>• <strong>Diperbolehkan:</strong> Sejak awal Ramadan hingga menjelang Idulfitri.</li>
                    <li>• <strong>Paling Utama (Afzal):</strong> Setelah salat Subuh sebelum salat Idulfitri dimulai.</li>
                    <li>• <strong>Setelah Salat Idulfitri:</strong> Dihitung sebagai sedekah biasa.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab('kalkulator')}
                  className="btn-3d inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  Coba Interactive Zakat Calculator
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === 'kalkulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Input Controls */}
              <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-900 space-y-3">
                <div className="flex items-center gap-2 font-display font-extrabold text-base text-slate-900">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  <span>Interactive Zakat Calculator</span>
                </div>

                <div>
                  <label htmlFor="family-count-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                    Jumlah Anggota Keluarga (Jiwa): <span className="font-mono-num text-amber-700">{calculatorFamilyCount} orang</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      id="family-count-range"
                      type="range"
                      min={1}
                      max={15}
                      value={calculatorFamilyCount}
                      onChange={(e) => onCalculatorFamilyChange(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <input
                      id="family-count-input"
                      type="number"
                      min={1}
                      max={15}
                      value={calculatorFamilyCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          onCalculatorFamilyChange(Math.max(1, Math.min(15, val)));
                        }
                      }}
                      className="w-16 px-2.5 py-1 rounded-xl border-2 border-slate-300 font-mono-num font-bold text-center text-sm"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">Pilihan Bentuk Zakat:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('beras')}
                      className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm cursor-pointer ${
                        mode === 'beras'
                          ? 'bg-emerald-500 text-slate-950 border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      Beras (2,5 kg/jiwa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('uang')}
                      className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm cursor-pointer ${
                        mode === 'uang'
                          ? 'bg-sky-500 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      Uang (Simulasi)
                    </button>
                  </div>
                </div>

                {mode === 'uang' && (
                  <div>
                    <label htmlFor="money-per-person-input" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                      Nominal Zakat per Jiwa (Rp):
                    </label>
                    <input
                      id="money-per-person-input"
                      type="number"
                      step={1000}
                      min={1000}
                      value={moneyPerPerson}
                      onChange={(e) => setMoneyPerPerson(Math.max(1000, Number(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-300 font-mono-num font-bold text-sm"
                    />
                    <p className="mt-1 text-[11px] text-amber-900 bg-amber-100 rounded-lg p-1.5 border border-amber-300 leading-snug">
                      Catatan: Nominal uang seperti Rp45.000 hanyalah <strong>contoh simulasi</strong>. Nominal resmi mengikuti ketetapan BAZNAS/lembaga zakat setempat pada tahun berjalan.
                    </p>
                  </div>
                )}
              </div>

              {/* Live Calculation + Visual Rice Sacks */}
              <div className="bg-emerald-50 rounded-2xl p-3.5 border-2 border-slate-900 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Hasil Perhitungan Akurat
                  </div>
                  {mode === 'beras' ? (
                    <div className="mt-1.5">
                      <div className="font-mono-num font-extrabold text-2xl sm:text-3xl text-slate-900 tabular-nums">
                        {calcResult.riceKg.toLocaleString('id-ID')} kg Beras
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-semibold">
                        Rumus: {calcResult.familyCount} jiwa × 2,5 kg = {calcResult.riceKg.toLocaleString('id-ID')} kg (sekitar {calcResult.riceLitersApprox.toLocaleString('id-ID')} liter)
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1.5">
                      <div className="font-mono-num font-extrabold text-2xl sm:text-3xl text-slate-900 tabular-nums">
                        {formatRupiah(calcResult.moneyTotal)}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-semibold">
                        Rumus: {calcResult.familyCount} jiwa × {formatRupiah(calcResult.moneyPerPerson)} = {formatRupiah(calcResult.moneyTotal)}
                      </p>
                    </div>
                  )}

                  {/* Animated Rice Sack Grid (mirrors the 3D sacks near granary!) */}
                  <div className="mt-3">
                    <div className="text-xs font-bold text-slate-700 mb-1.5">
                      Visualisasi Karung Beras (juga bertambah di Lumbung 3D!):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: calcResult.riceSacksCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className="animate-dialogue-pop px-2 py-1 rounded-lg bg-amber-200 border-2 border-slate-900 text-center"
                        >
                          <div className="text-sm leading-none" aria-hidden="true">🌾</div>
                          <div className="font-mono-num font-bold text-[10px] text-slate-900 mt-0.5">2,5 kg</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setTab('rice-challenge')}
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    Lanjut: Rice Collection Challenge
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'rice-challenge' && (
            <div className="space-y-2.5">
              <div className="bg-white rounded-2xl p-3 border-2 border-slate-900 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-sm sm:text-base">
                    Misi Kumpulkan Beras Keluarga Pak Ahmad (5 Jiwa = 12,5 kg)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Kumpulkan <strong>5 karung beras (masing-masing 2,5 kg)</strong> di sawah 3D menggunakan tombol <strong>Jelajahi &amp; Kumpulkan di 3D</strong> atau klik karung di bawah ini!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-500">Terkumpul</div>
                  <div className="font-mono-num font-extrabold text-xl text-emerald-700 tabular-nums">
                    {(collectedRiceIds.length * 2.5).toLocaleString('id-ID')} / 12,5 kg
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onStartRiceExploreMode}
                  className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Jelajahi Sawah 3D &amp; Ambil Karung
                </button>
                <button
                  type="button"
                  onClick={onResetRiceChallenge}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border-2 border-slate-300 cursor-pointer"
                >
                  Ulangi Karung
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {sackPoolIds.slice(0, 6).map((sid, idx) => {
                  const picked = collectedRiceIds.includes(sid);
                  return (
                    <button
                      key={sid}
                      type="button"
                      disabled={picked || challengeSuccess}
                      onClick={() => onCollectSackManual(sid)}
                      className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2 cursor-pointer disabled:cursor-default ${
                        picked
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                          : 'bg-white hover:bg-amber-100 border-slate-900'
                      }`}
                    >
                      <PackageCheck className={`w-4 h-4 shrink-0 ${picked ? 'text-emerald-700' : 'text-amber-600'}`} />
                      <div>
                        <div className="font-display font-bold text-xs sm:text-sm leading-tight">Karung #{idx + 1}</div>
                        <div className="text-[11px] font-mono-num text-slate-600">
                          {picked ? 'Sudah diambil' : 'Ambil 2,5 kg'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {challengeSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-600 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    Tantangan Berhasil! 12,5 kg beras (5 karung × 2,5 kg) siap disalurkan untuk 5 jiwa.
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('time-adventure')}
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    Lanjut: Zakat Time Adventure
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'time-adventure' && (
            <div className="space-y-2.5">
              <div className="bg-white rounded-xl p-2.5 border-2 border-slate-200 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Urutkan 4 waktu berikut dari yang paling awal hingga melewati batas waktu zakat fitrah!
                </span>
              </div>

              <div className="space-y-1.5">
                {orderedIds.map((id, idx) => {
                  const stage = ZAKAT_TIME_STAGES.find((s) => s.id === id)!;
                  const showResult = Boolean(timeChecked?.isCorrect);
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl px-3 py-2 border-2 border-slate-900 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono-num font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs sm:text-sm text-slate-900 leading-tight">{stage.label}</div>
                          {showResult && (
                            <div className="text-[11px] text-slate-700 leading-snug">
                              <strong
                                className={
                                  stage.badgeTone === 'best'
                                    ? 'text-emerald-700'
                                    : stage.badgeTone === 'late'
                                      ? 'text-rose-700'
                                      : 'text-sky-700'
                                }
                              >
                                {stage.statusTitle}:
                              </strong>{' '}
                              {stage.explanation}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label={`Naikkan ${stage.label}`}
                          disabled={idx === 0}
                          onClick={() => moveStage(idx, -1)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-200 disabled:opacity-35 border border-slate-300 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Turunkan ${stage.label}`}
                          disabled={idx === orderedIds.length - 1}
                          onClick={() => moveStage(idx, 1)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-200 disabled:opacity-35 border border-slate-300 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCheckTimeOrder}
                  className="btn-3d px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  Periksa Urutan Waktu
                </button>

                {timeChecked && !timeChecked.isCorrect && (
                  <span className="text-xs font-bold text-rose-700">
                    {timeChecked.correctPositions}/4 posisi sudah benar. Petunjuk: mulai dari Awal Ramadan hingga Setelah Salat Idulfitri!
                  </span>
                )}
              </div>

              {timeChecked?.isCorrect && (
                <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-600 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <BadgeEmblemSvg color="#D97706" unlocked className="w-10 h-10 shrink-0" />
                    <div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-emerald-950">
                        Urutan Sempurna! Badge Terbuka: Zakat Calculator!
                      </div>
                      <p className="text-xs text-emerald-900">
                        Waktu diperbolehkan sejak Awal Ramadan, sedangkan waktu paling utama (afzal) adalah Sebelum Salat Idulfitri!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onComplete}
                    className="btn-3d inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
                  >
                    Menuju World 3: Kingdom of Caring
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
