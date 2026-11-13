export type ZakatMode = 'beras' | 'uang';

export interface ZakatCalculationInput {
  familyCount: number;
  mode: ZakatMode;
  moneyPerPerson?: number;
}

export interface ZakatCalculationResult {
  familyCount: number;
  mode: ZakatMode;
  riceKg: number;
  riceLitersApprox: number;
  riceSacksCount: number;
  moneyTotal: number;
  moneyPerPerson: number;
}

export const RICE_KG_PER_PERSON = 2.5;
export const RICE_LITER_PER_PERSON = 3.5;
export const DEFAULT_MONEY_PER_PERSON = 45000;
export const CHARITY_BUDGET_IDR = 1000000;

export function calculateZakatFitrah(input: ZakatCalculationInput): ZakatCalculationResult {
  const safeFamily = Math.max(1, Math.min(30, Math.floor(Number.isFinite(input.familyCount) ? input.familyCount : 1)));
  const safeMoneyPerPerson = Math.max(
    1000,
    Math.round(Number.isFinite(input.moneyPerPerson) ? (input.moneyPerPerson ?? DEFAULT_MONEY_PER_PERSON) : DEFAULT_MONEY_PER_PERSON),
  );
  const riceKg = Number((safeFamily * RICE_KG_PER_PERSON).toFixed(1));
  const riceLitersApprox = Number((safeFamily * RICE_LITER_PER_PERSON).toFixed(1));
  const moneyTotal = safeFamily * safeMoneyPerPerson;

  return {
    familyCount: safeFamily,
    mode: input.mode,
    riceKg,
    riceLitersApprox,
    riceSacksCount: safeFamily,
    moneyTotal,
    moneyPerPerson: safeMoneyPerPerson,
  };
}

export interface CharityAllocationInput {
  pokok: number;
  pendidikan: number;
  kesehatan: number;
  darurat: number;
}

export interface CharityEvaluation {
  totalAllocated: number;
  remaining: number;
  isOverBudget: boolean;
  isCompleteValid: boolean;
  houseLevels: {
    pokok: number;
    pendidikan: number;
    kesehatan: number;
    darurat: number;
  };
  fairnessNote: string;
}

function getHouseUpgradeLevel(amount: number): number {
  if (amount <= 0) return 0;
  if (amount < 150000) return 1;
  if (amount < 300000) return 2;
  return 3;
}

export function evaluateCharityAllocation(
  alloc: CharityAllocationInput,
  budget: number = CHARITY_BUDGET_IDR,
): CharityEvaluation {
  const pokok = Math.max(0, Math.round(Number.isFinite(alloc.pokok) ? alloc.pokok : 0));
  const pendidikan = Math.max(0, Math.round(Number.isFinite(alloc.pendidikan) ? alloc.pendidikan : 0));
  const kesehatan = Math.max(0, Math.round(Number.isFinite(alloc.kesehatan) ? alloc.kesehatan : 0));
  const darurat = Math.max(0, Math.round(Number.isFinite(alloc.darurat) ? alloc.darurat : 0));

  const totalAllocated = pokok + pendidikan + kesehatan + darurat;
  const remaining = budget - totalAllocated;
  const isOverBudget = totalAllocated > budget;
  const allPositives = pokok > 0 && pendidikan > 0 && kesehatan > 0 && darurat > 0;
  const isCompleteValid = !isOverBudget && totalAllocated > 0;

  let fairnessNote = 'Pastikan dana dibagi dengan adil sesuai kebutuhan penduduk yang paling mendesak.';
  if (isOverBudget) {
    fairnessNote = `Total alokasi melebihi dana simulasi sebesar Rp${Math.abs(remaining).toLocaleString('id-ID')}. Kurangi sebagian pos agar sesuai amanah anggaran.`;
  } else if (totalAllocated === budget && allPositives) {
    fairnessNote = 'Alokasi dana 100% tersalurkan ke seluruh pos kebutuhan pokok, pendidikan, kesehatan, dan darurat secara seimbang dan amanah!';
  } else if (totalAllocated === 0) {
    fairnessNote = 'Belum ada dana yang dialokasikan. Masukkan nominal bantuan pada pos kebutuhan penduduk.';
  } else if (!allPositives) {
    fairnessNote = 'Sebagian rumah belum menerima alokasi bantuan. Pertimbangkan pemerataan agar tidak ada warga yang terlewat.';
  }

  return {
    totalAllocated,
    remaining,
    isOverBudget,
    isCompleteValid,
    houseLevels: {
      pokok: getHouseUpgradeLevel(pokok),
      pendidikan: getHouseUpgradeLevel(pendidikan),
      kesehatan: getHouseUpgradeLevel(kesehatan),
      darurat: getHouseUpgradeLevel(darurat),
    },
    fairnessNote,
  };
}

export const EXPECTED_ZAKAT_TIME_ORDER = [
  'awal-ramadan',
  'menjelang-idulfitri',
  'sebelum-salat-id',
  'setelah-salat-id',
] as const;

export function checkTimeOrderSequence(orderedIds: string[]): {
  isCorrect: boolean;
  correctPositions: number;
} {
  let correctPositions = 0;
  for (let i = 0; i < EXPECTED_ZAKAT_TIME_ORDER.length; i++) {
    if (orderedIds[i] === EXPECTED_ZAKAT_TIME_ORDER[i]) {
      correctPositions++;
    }
  }
  return {
    isCorrect: orderedIds.length === EXPECTED_ZAKAT_TIME_ORDER.length && correctPositions === EXPECTED_ZAKAT_TIME_ORDER.length,
    correctPositions,
  };
}

export type LearningObjectiveId = 'TP1' | 'TP2' | 'TP3';

export interface BossQuestionMeta {
  id: string;
  tp: LearningObjectiveId;
  correctIndex: number;
}

export interface BossEvaluationSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  finalScore: number;
  tp1Percent: number;
  tp2Percent: number;
  tp3Percent: number;
  feedbackTitle: string;
  feedbackMessage: string;
  recommendations: string[];
  needsRemedial: boolean;
}

export function evaluateBossQuizResults(
  selectedAnswers: Record<string, number>,
  questions: BossQuestionMeta[],
): BossEvaluationSummary {
  const totalQuestions = questions.length;
  let correctCount = 0;

  const tpTotals: Record<LearningObjectiveId, { correct: number; total: number }> = {
    TP1: { correct: 0, total: 0 },
    TP2: { correct: 0, total: 0 },
    TP3: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    tpTotals[q.tp].total += 1;
    const chosen = selectedAnswers[q.id];
    if (chosen === q.correctIndex) {
      correctCount += 1;
      tpTotals[q.tp].correct += 1;
    }
  }

  const wrongCount = totalQuestions - correctCount;
  const finalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const tp1Percent = tpTotals.TP1.total > 0 ? Math.round((tpTotals.TP1.correct / tpTotals.TP1.total) * 100) : 0;
  const tp2Percent = tpTotals.TP2.total > 0 ? Math.round((tpTotals.TP2.correct / tpTotals.TP2.total) * 100) : 0;
  const tp3Percent = tpTotals.TP3.total > 0 ? Math.round((tpTotals.TP3.correct / tpTotals.TP3.total) * 100) : 0;

  const recommendations: string[] = [];
  if (tp1Percent < 80) {
    recommendations.push(
      'Remedial TP 1: Kunjungi kembali Village of Kindness untuk membedakan Zakat, Infaq, Sedekah serta menghafal 8 golongan penerima zakat (Asnaf).',
    );
  }
  if (tp2Percent < 80) {
    recommendations.push(
      'Remedial TP 2: Berlatih kembali di Magic Rice Field menggunakan Kalkulator Zakat Fitrah (2,5 kg/jiwa) dan mengurutkan waktu afzal zakat fitrah.',
    );
  }
  if (tp3Percent < 80) {
    recommendations.push(
      'Remedial TP 3: Tinjau ulang simulasi Kingdom of Caring tentang keadilan, amanah, dan dampak sosial penyaluran dana ZIS.',
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Pengayaan: Ajak teman sekelas membuat proyek celengan sedekah Jumat dan pelajari jenis zakat harta (zakat mal) seperti zakat emas dan hasil pertanian.',
    );
  }

  let feedbackTitle = 'Luar Biasa, Zakat Hero Sejati!';
  let feedbackMessage =
    'Kamu telah menguasai ketentuan ZIS, perhitungan zakat fitrah, serta amanah distribusi sosial dengan sangat baik!';
  const needsRemedial = finalScore < 75;

  if (finalScore < 60) {
    feedbackTitle = 'Terus Semangat Belajar, Petualang!';
    feedbackMessage =
      'Kamu berhasil menyelesaikan tantangan naga, namun masih perlu mengulang beberapa materi ZIS. Ayo pelajari kembali rekomendasi materi di bawah ini!';
  } else if (finalScore < 85) {
    feedbackTitle = 'Hebat, Zakat Hero Tangguh!';
    feedbackMessage =
      'Pemahamanmu tentang Zakat, Infaq, dan Sedekah sudah baik. Perkuat kembali bagian tujuan pembelajaran yang belum mencapai 80%.';
  }

  return {
    totalQuestions,
    correctCount,
    wrongCount,
    finalScore,
    tp1Percent,
    tp2Percent,
    tp3Percent,
    feedbackTitle,
    feedbackMessage,
    recommendations,
    needsRemedial,
  };
}

export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

function escapePdfText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextLines(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ` ${w}`;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface SimulationReportData {
  studentName: string;
  collectedAmount: number;
  allocations: CharityAllocationInput;
  allocationReason: string;
  expectedBenefit: string;
  conclusion: string;
  dateLabel: string;
}

export function buildSimulationReportPdfBytes(report: SimulationReportData): Uint8Array {
  const lines: Array<{ text: string; bold?: boolean; size?: number; gapAfter?: number }> = [
    { text: 'LAPORAN SIMULASI PENGELOLAAN DANA SOSIAL KELAS', bold: true, size: 14, gapAfter: 6 },
    { text: 'MARIO: MISSION ZAKAT HERO! - PAIBP Fase C Kelas VI SD', size: 10, gapAfter: 12 },
    { text: `Nama Petualang: ${report.studentName || 'Zakat Hero'} | Tanggal: ${report.dateLabel}`, size: 10, gapAfter: 10 },
    { text: `Dana Simulasi Terkumpul: ${formatRupiah(report.collectedAmount)}`, bold: true, size: 11, gapAfter: 8 },
    { text: 'Rencana Alokasi Bantuan:', bold: true, size: 11, gapAfter: 4 },
    { text: `- Kebutuhan Pokok Keluarga Miskin: ${formatRupiah(report.allocations.pokok)}`, size: 10, gapAfter: 2 },
    { text: `- Bantuan Pendidikan: ${formatRupiah(report.allocations.pendidikan)}`, size: 10, gapAfter: 2 },
    { text: `- Bantuan Kesehatan: ${formatRupiah(report.allocations.kesehatan)}`, size: 10, gapAfter: 2 },
    { text: `- Bantuan Kebutuhan Darurat: ${formatRupiah(report.allocations.darurat)}`, size: 10, gapAfter: 10 },
  ];

  const appendSection = (heading: string, content: string) => {
    lines.push({ text: heading, bold: true, size: 11, gapAfter: 4 });
    const wrapped = wrapTextLines(content || '-', 78);
    wrapped.forEach((line, idx) => {
      lines.push({ text: line, size: 10, gapAfter: idx === wrapped.length - 1 ? 8 : 2 });
    });
  };

  appendSection('Alasan Pembagian Dana:', report.allocationReason);
  appendSection('Manfaat yang Diharapkan:', report.expectedBenefit);
  appendSection('Kesimpulan Nilai Amanah & Keadilan:', report.conclusion);
  appendSection(
    'Catatan Syariat:',
    'Ini adalah simulasi pengelolaan dana sosial kelas, bukan penetapan mustahik zakat secara sembarangan. Distribusi zakat sesungguhnya mengikuti ketentuan 8 asnaf.',
  );

  let stream = 'BT\n';
  let y = 780;
  for (const line of lines) {
    if (y < 52) break;
    const size = line.size ?? 10;
    const fontRef = line.bold ? '/F2' : '/F1';
    stream += `${fontRef} ${size} Tf\n1 0 0 1 48 ${y} Tm\n(${escapePdfText(line.text)}) Tj\n`;
    y -= size + 4 + (line.gapAfter ?? 2);
  }
  stream += 'ET\n';

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
  objects.push(`6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
}
