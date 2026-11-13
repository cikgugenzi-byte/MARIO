import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, GripVertical, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  EIGHT_ASNAF,
  ZIS_COMPARISON_MATRIX,
  ZIS_DEFINITIONS,
  ZIS_SORT_ITEMS,
  type ZisCategory,
} from '../../data/curriculum';
import { soundEngine } from '../../audio/soundEngine';
import { BadgeEmblemSvg, CharacterAvatarSvg } from '../GameIcons';

interface World1VillageProps {
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: 'zis_explorer') => void;
}

type World1Tab = 'materi-zis' | 'drag-zis' | 'materi-asnaf' | 'save-villagers';

export function World1Village({ onComplete, onRewardCoins, onEarnBadge }: World1VillageProps) {
  const [tab, setTab] = useState<World1Tab>('materi-zis');

  // Mini Game 1A: Drag & Drop ZIS Sorting
  const [placements, setPlacements] = useState<Record<string, ZisCategory>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(ZIS_SORT_ITEMS[0].id);
  const [sortFeedback, setSortFeedback] = useState<string | null>(null);
  const [sortCompleted, setSortCompleted] = useState(false);

  // Mini Game 1B: Save the 8 Villagers
  const [selectedAsnafId, setSelectedAsnafId] = useState<string | null>(EIGHT_ASNAF[0].id);
  const [matchedAsnafIds, setMatchedAsnafIds] = useState<string[]>([]);
  const [villagerFeedback, setVillagerFeedback] = useState<string | null>(null);

  const sortedCorrectCount = ZIS_SORT_ITEMS.filter((item) => placements[item.id] === item.category).length;

  const handleAssignCategory = (itemId: string, cat: ZisCategory) => {
    const item = ZIS_SORT_ITEMS.find((x) => x.id === itemId);
    if (!item) return;

    if (item.category === cat) {
      soundEngine.playCorrect();
      const next = { ...placements, [itemId]: cat };
      setPlacements(next);
      setSortFeedback(`Tepat! ${item.reason}`);
      onRewardCoins(10, '+10 Koin ZIS!');
      const remaining = ZIS_SORT_ITEMS.find((x) => !next[x.id]);
      setSelectedItemId(remaining ? remaining.id : null);

      if (Object.keys(next).length === ZIS_SORT_ITEMS.length) {
        setSortCompleted(true);
        soundEngine.playVictory();
      }
    } else {
      soundEngine.playWrong();
      setSortFeedback(`Kurang tepat untuk "${item.text}". Petunjuk: periksa hukum (wajib/sunah) dan apakah berupa harta atau perbuatan nonmateri!`);
    }
  };

  // Shuffled-order definitions for Save the 8 Villagers
  const definitionCards = [
    EIGHT_ASNAF[3], // Mualaf
    EIGHT_ASNAF[0], // Fakir
    EIGHT_ASNAF[6], // Fisabilillah
    EIGHT_ASNAF[1], // Miskin
    EIGHT_ASNAF[7], // Ibnu Sabil
    EIGHT_ASNAF[2], // Amil
    EIGHT_ASNAF[5], // Gharim
    EIGHT_ASNAF[4], // Riqab
  ];

  const handleMatchDefinition = (targetId: string) => {
    if (!selectedAsnafId || matchedAsnafIds.includes(targetId)) return;
    if (selectedAsnafId === targetId) {
      soundEngine.playCorrect();
      const next = [...matchedAsnafIds, targetId];
      setMatchedAsnafIds(next);
      const info = EIGHT_ASNAF.find((a) => a.id === targetId);
      setVillagerFeedback(`Warga terselamatkan! ${info?.name}: ${info?.villagerStory}`);
      onRewardCoins(15, '+15 Koin Asnaf!');

      const nextUnmatched = EIGHT_ASNAF.find((a) => !next.includes(a.id));
      setSelectedAsnafId(nextUnmatched ? nextUnmatched.id : null);

      if (next.length === EIGHT_ASNAF.length) {
        soundEngine.playVictory();
        onEarnBadge('zis_explorer');
      }
    } else {
      soundEngine.playWrong();
      setVillagerFeedback('Belum cocok! Baca kembali arti golongan asnaf yang kamu pilih.');
    }
  };

  const allVillagersSaved = matchedAsnafIds.length === EIGHT_ASNAF.length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-5xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 max-h-[60vh] flex flex-col">
        {/* Header + Sub-stage tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <CharacterAvatarSvg character="toad" className="w-9 h-9" />
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                World 1: Village of Kindness (TP 1)
              </h2>
              <p className="text-[11px] text-slate-600">Pelajari Zakat, Infaq, Sedekah &amp; 8 Golongan Penerima Zakat (Asnaf)</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['materi-zis', '1. Materi ZIS'],
                ['drag-zis', '2. Game Sortir ZIS'],
                ['materi-asnaf', '3. Mengenal 8 Asnaf'],
                ['save-villagers', '4. Selamatkan 8 Warga'],
              ] as Array<[World1Tab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs border-2 cursor-pointer whitespace-nowrap ${
                  tab === key
                    ? 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[0_2px_0_#0f172a]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="mt-2.5 overflow-y-auto panel-scroll pr-1 flex-1 space-y-3">
          {tab === 'materi-zis' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {ZIS_DEFINITIONS.map((item) => (
                  <div
                    key={item.type}
                    className="rounded-2xl p-3 border-2 border-slate-900"
                    style={{ backgroundColor: item.bg }}
                  >
                    <div className="font-display font-extrabold text-base" style={{ color: item.color }}>
                      {item.title}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-800 leading-snug">{item.summary}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border-2 border-slate-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-2 font-display">Aspek Pembeda</th>
                      <th className="p-2 font-display text-amber-300">Zakat</th>
                      <th className="p-2 font-display text-sky-300">Infaq</th>
                      <th className="p-2 font-display text-emerald-300">Sedekah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ZIS_COMPARISON_MATRIX.map((row) => (
                      <tr key={row.aspek} className="border-t border-slate-200">
                        <td className="p-2 font-bold text-slate-900">{row.aspek}</td>
                        <td className="p-2 text-slate-700">{row.zakat}</td>
                        <td className="p-2 text-slate-700">{row.infaq}</td>
                        <td className="p-2 text-slate-700">{row.sedekah}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab('drag-zis')}
                  className="btn-3d inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  Lanjut: Mini Game Drag & Drop ZIS
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === 'drag-zis' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl p-2 border-2 border-slate-200">
                <p className="text-xs font-semibold text-slate-700">
                  Seret kartu kegiatan ke keranjang <strong>Zakat</strong>, <strong>Infaq</strong>, atau <strong>Sedekah</strong> (atau klik kartu lalu klik keranjang tujuan).
                </p>
                <span className="font-mono-num font-bold text-xs sm:text-sm text-emerald-700 tabular-nums">
                  Tersusun: {sortedCorrectCount}/{ZIS_SORT_ITEMS.length}
                </span>
              </div>

              {/* Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'zakat', label: 'Keranjang ZAKAT', tone: 'bg-amber-100 border-amber-600 text-amber-950' },
                    { id: 'infaq', label: 'Keranjang INFAQ', tone: 'bg-sky-100 border-sky-600 text-sky-950' },
                    { id: 'sedekah', label: 'Keranjang SEDEKAH', tone: 'bg-emerald-100 border-emerald-600 text-emerald-950' },
                  ] as Array<{ id: ZisCategory; label: string; tone: string }>
                ).map((zone) => {
                  const zoneItems = ZIS_SORT_ITEMS.filter((it) => placements[it.id] === zone.id);
                  return (
                    <div
                      key={zone.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId) handleAssignCategory(draggedId, zone.id);
                      }}
                      className={`rounded-2xl border-2 border-dashed p-2.5 min-h-[96px] flex flex-col justify-between ${zone.tone}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className="font-display font-extrabold text-xs sm:text-sm">{zone.label}</span>
                          {selectedItemId && (
                            <button
                              type="button"
                              onClick={() => handleAssignCategory(selectedItemId, zone.id)}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700 cursor-pointer"
                            >
                              Masukkan ke sini
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {zoneItems.map((zi) => (
                            <div
                              key={zi.id}
                              className="bg-white/90 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-900 border border-slate-300 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="leading-tight">{zi.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Remaining draggable cards */}
              {!sortCompleted && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ZIS_SORT_ITEMS.filter((it) => !placements[it.id]).map((item) => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          setSelectedItemId(item.id);
                        }}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`text-left p-2 rounded-xl border-2 text-xs leading-snug font-semibold flex items-start gap-1.5 cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'bg-amber-200 border-slate-900 shadow-[0_2px_0_#0f172a]'
                            : 'bg-white border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                {sortFeedback ? (
                  <div className="flex-1 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-xs font-semibold text-slate-800">
                    {sortFeedback}
                  </div>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setTab('materi-asnaf')}
                  className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer shrink-0"
                >
                  {sortCompleted ? 'Mantap! Lanjut Mengenal 8 Asnaf' : 'Lanjut: Mengenal 8 Asnaf'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === 'materi-asnaf' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 bg-white rounded-xl p-2.5 border-2 border-slate-200">
                Allah SWT menetapkan <strong>8 golongan penerima zakat (Asnaf / Mustahik)</strong> dalam QS. At-Taubah ayat 60 agar zakat terbagi adil dan tepat sasaran.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {EIGHT_ASNAF.map((asnaf) => (
                  <div key={asnaf.id} className="bg-white rounded-2xl p-3 border-2 border-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-extrabold text-sm text-slate-900">{asnaf.name}</span>
                        <span
                          className="w-3 h-3 rounded-full border border-slate-900 shrink-0"
                          style={{ backgroundColor: asnaf.badgeColor }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-800 leading-snug">{asnaf.shortDesc}</p>
                      <p className="mt-1 text-[11px] text-slate-600 leading-snug">{asnaf.detail}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] font-medium text-sky-900">
                      Kisah Desa: {asnaf.villagerStory}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab('save-villagers')}
                  className="btn-3d inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  Mainkan: Save the 8 Villagers
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === 'save-villagers' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl p-2 border-2 border-slate-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pilih nama Asnaf di sebelah kiri, lalu klik pengertian yang tepat di sebelah kanan!</span>
                </div>
                <span className="font-mono-num font-bold text-xs sm:text-sm text-emerald-700 tabular-nums">
                  Terselamatkan: {matchedAsnafIds.length}/8
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
                {/* Left: 8 Asnaf Names */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-1.5">
                  {EIGHT_ASNAF.map((asnaf) => {
                    const matched = matchedAsnafIds.includes(asnaf.id);
                    const active = selectedAsnafId === asnaf.id;
                    return (
                      <button
                        key={asnaf.id}
                        type="button"
                        disabled={matched}
                        onClick={() => setSelectedAsnafId(asnaf.id)}
                        className={`px-2.5 py-2 rounded-xl border-2 text-left font-display font-bold text-xs sm:text-[13px] flex items-center justify-between gap-1 cursor-pointer disabled:cursor-default ${
                          matched
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                            : active
                              ? 'bg-amber-300 border-slate-900 text-slate-950 shadow-[0_2px_0_#0f172a]'
                              : 'bg-white border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        <span>{asnaf.name}</span>
                        {matched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Right: 2-Column Compact Definitions */}
                <div data-testid="villager-definitions" className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {definitionCards.map((def) => {
                    const matched = matchedAsnafIds.includes(def.id);
                    return (
                      <button
                        key={def.id}
                        type="button"
                        disabled={matched}
                        onClick={() => handleMatchDefinition(def.id)}
                        className={`w-full text-left p-2 rounded-xl border-2 text-xs leading-snug font-medium transition-colors cursor-pointer disabled:cursor-default ${
                          matched
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : 'bg-white hover:bg-sky-50 border-slate-300'
                        }`}
                      >
                        {def.shortDesc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {villagerFeedback && (
                <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-slate-900 text-xs font-semibold text-slate-800">
                  {villagerFeedback}
                </div>
              )}

              {allVillagersSaved && (
                <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-600 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <BadgeEmblemSvg color="#059669" unlocked className="w-10 h-10 shrink-0" />
                    <div>
                      <div className="font-display font-extrabold text-sm sm:text-base text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Badge Terbuka: ZIS Explorer!
                      </div>
                      <p className="text-xs text-emerald-900">
                        Ke-8 warga telah diselamatkan. Lanjutkan perjalanan ke World 2: Magic Rice Field!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onComplete}
                    className="btn-3d inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
                  >
                    Menuju World 2: Magic Rice Field
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!allVillagersSaved && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onEarnBadge('zis_explorer');
                      onComplete();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Selesaikan World 1 &amp; Lanjut ke World 2
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
