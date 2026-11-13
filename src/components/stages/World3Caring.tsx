import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Home,
  Printer,
  Save,
  Sparkles,
} from 'lucide-react';
import { CHARITY_NEEDS, REFLECTIVE_QUESTIONS_WORLD3 } from '../../data/curriculum';
import {
  buildSimulationReportPdfBytes,
  CHARITY_BUDGET_IDR,
  evaluateCharityAllocation,
  formatRupiah,
  type CharityAllocationInput,
} from '../../game/zakatLogic';
import { soundEngine } from '../../audio/soundEngine';
import { BadgeEmblemSvg, CharacterAvatarSvg } from '../GameIcons';

interface World3CaringProps {
  studentName: string;
  allocations: CharityAllocationInput;
  onChangeAllocations: (next: CharityAllocationInput) => void;
  onComplete: () => void;
  onRewardCoins: (amount: number, reason: string) => void;
  onEarnBadge: (badgeId: 'charity_hero') => void;
}

type World3Tab = 'materi' | 'simulasi' | 'refleksi-laporan';

export function World3Caring({
  studentName,
  allocations,
  onChangeAllocations,
  onComplete,
  onRewardCoins,
  onEarnBadge,
}: World3CaringProps) {
  const [tab, setTab] = useState<World3Tab>('materi');
  const [savedNotice, setSavedNotice] = useState(false);
  const [showVisualResult, setShowVisualResult] = useState(false);

  // Reflective answers & report fields
  const [reflectAnswers, setReflectAnswers] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
    3: '',
  });
  const [allocationReason, setAllocationReason] = useState(
    'Dana sosial Rp1.000.000 dibagi untuk memenuhi kebutuhan pokok pangan keluarga miskin, mendukung biaya buku sekolah anak, pengobatan lansia, serta perbaikan darurat rumah bocor.',
  );
  const [expectedBenefit, setExpectedBenefit] = useState(
    'Keluarga prasejahtera terbantu kebutuhannya, anak tetap bersekolah, warga sakit dapat berobat, dan rumah aman dari banjir.',
  );
  const [conclusion, setConclusion] = useState(
    'Pengelolaan dana sosial kelas harus dilakukan secara adil, transparan, dan penuh amanah agar benar-benar bermanfaat bagi sesama.',
  );

  // Toad Guide Deep Thinking Review
  const [toadReview, setToadReview] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const evalRes = evaluateCharityAllocation(allocations, CHARITY_BUDGET_IDR);

  const handleAmountChange = (key: keyof CharityAllocationInput, raw: string) => {
    const cleaned = Math.max(0, Math.round(Number(raw) || 0));
    setSavedNotice(false);
    onChangeAllocations({ ...allocations, [key]: cleaned });
  };

  const handleSaveDistribution = () => {
    if (evalRes.isOverBudget) {
      soundEngine.playWrong();
      return;
    }
    soundEngine.playCorrect();
    setSavedNotice(true);
    setShowVisualResult(true);
    onRewardCoins(30, '+30 Koin Amanah!');
    onEarnBadge('charity_hero');
  };

  const handleRequestToadReview = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch('/api/toad-think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Simulasi Distribusi Dana Sosial Kelas Rp1.000.000 (TP 3)',
          context: `Alokasi murid: Kebutuhan Pokok ${formatRupiah(allocations.pokok)}, Pendidikan ${formatRupiah(allocations.pendidikan)}, Kesehatan ${formatRupiah(allocations.kesehatan)}, Darurat ${formatRupiah(allocations.darurat)}. Sisa: ${formatRupiah(evalRes.remaining)}.`,
          question: `Evaluasi alasan pembagian saya: "${allocationReason}". Apakah pembagian ini sudah adil dan amanah?`,
        }),
      });
      const data = await res.json();
      setToadReview(data.answer || evalRes.fairnessNote);
    } catch {
      setToadReview(evalRes.fairnessNote);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const bytes = buildSimulationReportPdfBytes({
      studentName: studentName || 'Zakat Hero',
      collectedAmount: CHARITY_BUDGET_IDR,
      allocations,
      allocationReason,
      expectedBenefit,
      conclusion,
      dateLabel: new Date().toLocaleDateString('id-ID'),
    });
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    const blob = new Blob([copy.buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Laporan-Simulasi-Dana-Sosial-Zakat-Hero.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-2.5 sm:p-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-5xl bg-amber-50/95 text-slate-900 rounded-3xl border-[4px] border-slate-900 shadow-[0_8px_0_#0f172a] p-3.5 sm:p-4 max-h-[60vh] flex flex-col print-only-report">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-2 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <CharacterAvatarSvg character="toad" className="w-9 h-9" />
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg leading-tight">
                World 3: Kingdom of Caring (TP 3)
              </h2>
              <p className="text-[11px] text-slate-600">Dampak Sosial ZIS, Simulasi Dana Rp1.000.000 &amp; Laporan Amanah</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['materi', '1. Cerita & Materi'],
                ['simulasi', '2. Simulasi Distribusi'],
                ['refleksi-laporan', '3. Refleksi & Laporan'],
              ] as Array<[World3Tab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-2.5 py-1 rounded-xl font-bold text-xs border-2 cursor-pointer whitespace-nowrap ${
                  tab === key
                    ? 'bg-sky-500 text-white border-slate-900 shadow-[0_2px_0_#0f172a]'
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
          {tab === 'materi' && (
            <div className="space-y-2.5">
              <div className="bg-white rounded-2xl p-3 border-2 border-slate-900">
                <h3 className="font-display font-extrabold text-sm sm:text-base text-sky-900">
                  Kisah Kerajaan Kepedulian
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-snug">
                  Di seberang jembatan Kerajaan Kepedulian terdapat empat rumah warga yang sedang mengalami ujian: keluarga kekurangan bahan pokok, anak yang butuh perlengkapan sekolah, nenek yang membutuhkan biaya obat, serta keluarga yang atap rumahnya rusak karena hujan deras. Kelas kita mengumpulkan dana sosial simulasi sebesar <strong>Rp1.000.000</strong> untuk membantu mereka dengan amanah!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-500">
                  <h4 className="font-display font-bold text-sm sm:text-base text-emerald-950">Tujuan &amp; Manfaat ZIS</h4>
                  <ul className="mt-1 text-xs sm:text-sm text-slate-800 space-y-0.5 leading-snug">
                    <li>• <strong>Mengentaskan kemiskinan:</strong> Membantu kebutuhan pokok agar warga hidup layak.</li>
                    <li>• <strong>Manfaat Infaq &amp; Sedekah:</strong> Mendukung pendidikan, kesehatan, dan fasilitas umum yang menumbuhkan kasih sayang.</li>
                  </ul>
                </div>
                <div className="bg-amber-100 rounded-2xl p-3 border-2 border-amber-500">
                  <h4 className="font-display font-bold text-sm sm:text-base text-amber-950">Nilai Luhur Pengelolaan Dana</h4>
                  <ul className="mt-1 text-xs sm:text-sm text-slate-800 space-y-0.5 leading-snug">
                    <li>• <strong>Keadilan &amp; Kepedulian:</strong> Membagi sesuai prioritas kebutuhan nyata, bukan pilih kasih.</li>
                    <li>• <strong>Tanggung Jawab Sosial &amp; Amanah:</strong> Jujur mencatat pemasukan, penyaluran, dan laporan.</li>
                  </ul>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-100 border-2 border-sky-500 text-xs text-sky-950 font-semibold leading-snug">
                Penting Menurut Syariat: Kegiatan berikutnya adalah <strong>simulasi pengelolaan dana sosial kelas</strong>, bukan penetapan mustahik zakat secara sembarangan. Distribusi zakat sesungguhnya wajib mengikuti ketentuan syariat (8 golongan asnaf).
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTab('simulasi')}
                  className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                >
                  Mulai Charity Distribution Mission
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {tab === 'simulasi' && (
            <div className="space-y-2.5">
              {/* Budget Summary Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl p-2 border-2 border-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">Dana Simulasi Kelas</div>
                  <div className="font-mono-num font-extrabold text-sm sm:text-base text-slate-900 tabular-nums">
                    {formatRupiah(CHARITY_BUDGET_IDR)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-2 border-2 border-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">Total Dialokasikan</div>
                  <div
                    className={`font-mono-num font-extrabold text-sm sm:text-base tabular-nums ${
                      evalRes.isOverBudget ? 'text-rose-700' : 'text-sky-700'
                    }`}
                  >
                    {formatRupiah(evalRes.totalAllocated)}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-2 border-2 border-slate-900">
                  <div className="text-[11px] font-bold text-slate-500">Sisa Dana</div>
                  <div
                    className={`font-mono-num font-extrabold text-sm sm:text-base tabular-nums ${
                      evalRes.remaining < 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {formatRupiah(evalRes.remaining)}
                  </div>
                </div>
              </div>

              {evalRes.isOverBudget && (
                <div
                  role="alert"
                  className="p-2.5 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-950 font-bold text-xs flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
                  <span>
                    Peringatan Anggaran: Total dana melebihi Rp1.000.000! Kurangi sebesar {formatRupiah(Math.abs(evalRes.remaining))} agar dapat disimpan.
                  </span>
                </div>
              )}

              {/* 4 Need Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {CHARITY_NEEDS.map((need) => {
                  const val = allocations[need.id];
                  const level = evalRes.houseLevels[need.id];
                  return (
                    <div key={need.id} className="bg-white rounded-2xl p-3 border-2 border-slate-900 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                            {need.title}
                          </div>
                          <div className="text-[11px] font-bold text-sky-700">{need.houseName}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-400 shrink-0">
                          <Home className="w-3 h-3" />
                          Tahap {level}/3
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug">{need.story}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <label htmlFor={`alloc-${need.id}`} className="text-[11px] font-bold text-slate-700 shrink-0">
                          Nominal (Rp):
                        </label>
                        <input
                          id={`alloc-${need.id}`}
                          type="number"
                          min={0}
                          step={25000}
                          value={val}
                          onChange={(e) => handleAmountChange(need.id, e.target.value)}
                          className="w-28 px-2.5 py-1 rounded-lg border-2 border-slate-300 font-mono-num font-bold text-xs"
                        />
                        <div className="flex flex-wrap gap-1">
                          {[150000, 250000, 350000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleAmountChange(need.id, String(preset))}
                              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-200 text-[11px] font-mono-num font-bold cursor-pointer"
                            >
                              {formatRupiah(preset)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={evalRes.isOverBudget || evalRes.totalAllocated <= 0}
                    onClick={handleSaveDistribution}
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan Distribusi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVisualResult((v) => !v)}
                    className="btn-3d inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-slate-900 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    {showVisualResult ? 'Sembunyikan Ringkasan Rumah' : 'Lihat Hasil'}
                  </button>
                </div>

                {savedNotice && (
                  <button
                    type="button"
                    onClick={() => setTab('refleksi-laporan')}
                    className="btn-3d inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer"
                  >
                    Lanjut: Refleksi &amp; Laporan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showVisualResult && (
                <div className="bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-600 space-y-1.5 animate-dialogue-pop">
                  <div className="font-display font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Perkembangan Visual 4 Rumah Kerajaan Kepedulian (Live di Dunia 3D!)
                  </div>
                  <p className="text-xs text-slate-800">{evalRes.fairnessNote}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    {CHARITY_NEEDS.map((n) => {
                      const lv = evalRes.houseLevels[n.id];
                      return (
                        <div key={n.id} className="bg-white rounded-xl p-2 border border-emerald-300 text-xs">
                          <div className="font-bold text-slate-900 truncate">{n.houseName}</div>
                          <div className="font-mono-num font-bold text-sky-700">{formatRupiah(allocations[n.id])}</div>
                          <div className="text-emerald-700 font-semibold text-[11px]">
                            {lv === 0
                              ? 'Belum tersinari'
                              : lv === 1
                                ? 'Lampu & Taman Tumbuh'
                                : lv === 2
                                  ? 'Bantuan Logistik Tiba'
                                  : 'Rumah Sejahtera Penuh!'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'refleksi-laporan' && (
            <div className="space-y-3">
              {/* 4 Reflective Questions */}
              <div className="bg-white rounded-2xl p-3 border-2 border-slate-900 space-y-2 no-print">
                <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                  Pertanyaan Reflektif Pengelolaan Dana Sosial
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {REFLECTIVE_QUESTIONS_WORLD3.map((rq, idx) => (
                    <div key={rq}>
                      <label htmlFor={`rq-${idx}`} className="block text-xs font-bold text-slate-800 mb-0.5 leading-snug">
                        {idx + 1}. {rq}
                      </label>
                      <input
                        id={`rq-${idx}`}
                        type="text"
                        value={reflectAnswers[idx] || ''}
                        onChange={(e) => setReflectAnswers((p) => ({ ...p, [idx]: e.target.value }))}
                        placeholder="Tulis jawaban reflektifmu..."
                        className="w-full px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-slate-300 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Simulation Report Card (Printable & PDF Exportable!) */}
              <div className="bg-white rounded-2xl p-5 border-2 border-slate-900 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-700" />
                    <h3 className="font-display font-extrabold text-lg">
                      Laporan Simulasi Pengelolaan Dana Sosial Kelas
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 no-print">
                    <button
                      type="button"
                      onClick={handleRequestToadReview}
                      disabled={reviewLoading}
                      className="btn-3d inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs border-2 border-slate-900 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {reviewLoading ? 'Toad Menganalisis...' : 'Evaluasi Amanah Toad Guide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-3d inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs border-2 border-slate-900 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Laporan
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="btn-3d inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs border-2 border-slate-900 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh PDF
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-600">Dana Terkumpul</div>
                    <div className="font-mono-num font-extrabold text-lg text-slate-900">
                      {formatRupiah(CHARITY_BUDGET_IDR)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-600">Rencana Alokasi</div>
                    <div className="text-xs text-slate-800 mt-0.5 space-y-0.5 font-mono-num">
                      <div>Pokok: {formatRupiah(allocations.pokok)} · Pendidikan: {formatRupiah(allocations.pendidikan)}</div>
                      <div>Kesehatan: {formatRupiah(allocations.kesehatan)} · Darurat: {formatRupiah(allocations.darurat)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div>
                    <label htmlFor="rep-reason" className="font-bold text-slate-700 block mb-1">Alasan Pembagian:</label>
                    <textarea
                      id="rep-reason"
                      rows={2}
                      value={allocationReason}
                      onChange={(e) => setAllocationReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-slate-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="rep-benefit" className="font-bold text-slate-700 block mb-1">Manfaat yang Diharapkan:</label>
                    <textarea
                      id="rep-benefit"
                      rows={2}
                      value={expectedBenefit}
                      onChange={(e) => setExpectedBenefit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-slate-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="rep-conclusion" className="font-bold text-slate-700 block mb-1">Kesimpulan:</label>
                    <textarea
                      id="rep-conclusion"
                      rows={2}
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-slate-300"
                    />
                  </div>
                </div>

                {toadReview && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-xs sm:text-sm text-emerald-950">
                    <strong>Analisis Amanah Toad Guide:</strong> {toadReview}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-sky-100 border-2 border-sky-600 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                  <BadgeEmblemSvg color="#0284C7" unlocked className="w-12 h-12 shrink-0" />
                  <div>
                    <div className="font-display font-extrabold text-base text-sky-950">
                      Siap Menuju Tantangan Terakhir?
                    </div>
                    <p className="text-xs sm:text-sm text-sky-900">
                      Naga Penjaga Gerbang menantimu di Dark Castle dengan 15 soal kasus &amp; numerasi ZIS!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onEarnBadge('charity_hero');
                    onComplete();
                  }}
                  className="btn-3d inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-display font-extrabold text-sm sm:text-base border-2 border-slate-900 shadow-[0_4px_0_#0f172a] cursor-pointer"
                >
                  Masuk ke Final World: Dark Castle
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
