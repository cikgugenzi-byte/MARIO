import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateZakatFitrah,
  evaluateCharityAllocation,
  checkTimeOrderSequence,
  evaluateBossQuizResults,
  buildSimulationReportPdfBytes,
  type BossQuestionMeta,
} from './zakatLogic';

test('calculateZakatFitrah calculates 2.5 kg rice and 45,000 IDR per family member accurately', () => {
  const riceResult = calculateZakatFitrah({ familyCount: 5, mode: 'beras' });
  assert.equal(riceResult.riceKg, 12.5);
  assert.equal(riceResult.riceSacksCount, 5);

  const moneyResult = calculateZakatFitrah({ familyCount: 5, mode: 'uang', moneyPerPerson: 45000 });
  assert.equal(moneyResult.moneyTotal, 225000);
});

test('evaluateCharityAllocation catches over-budget allocations and tracks house upgrade tiers', () => {
  const valid = evaluateCharityAllocation({
    pokok: 350000,
    pendidikan: 250000,
    kesehatan: 250000,
    darurat: 150000,
  });
  assert.equal(valid.totalAllocated, 1000000);
  assert.equal(valid.remaining, 0);
  assert.equal(valid.isOverBudget, false);
  assert.equal(valid.isCompleteValid, true);
  assert.equal(valid.houseLevels.pokok, 3);
  assert.equal(valid.houseLevels.darurat, 2);

  const over = evaluateCharityAllocation({
    pokok: 500000,
    pendidikan: 300000,
    kesehatan: 200000,
    darurat: 100000,
  });
  assert.equal(over.isOverBudget, true);
  assert.equal(over.remaining, -100000);
  assert.equal(over.isCompleteValid, false);
});

test('checkTimeOrderSequence validates chronological zakat fitrah periods', () => {
  assert.deepEqual(
    checkTimeOrderSequence(['awal-ramadan', 'menjelang-idulfitri', 'sebelum-salat-id', 'setelah-salat-id']),
    { isCorrect: true, correctPositions: 4 },
  );
  assert.deepEqual(
    checkTimeOrderSequence(['setelah-salat-id', 'menjelang-idulfitri', 'sebelum-salat-id', 'awal-ramadan']),
    { isCorrect: false, correctPositions: 2 },
  );
});

test('evaluateBossQuizResults computes final score = (correct/15)*100 and TP1/TP2/TP3 breakdowns', () => {
  const questions: BossQuestionMeta[] = [
    ...Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, tp: 'TP1' as const, correctIndex: 0 })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 6}`, tp: 'TP2' as const, correctIndex: 1 })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 11}`, tp: 'TP3' as const, correctIndex: 2 })),
  ];

  const answers: Record<string, number> = {
    q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, // TP1 = 5/5 (100%)
    q6: 1, q7: 1, q8: 1, q9: 0, q10: 0, // TP2 = 3/5 (60%)
    q11: 2, q12: 2, q13: 2, q14: 2, q15: 0, // TP3 = 4/5 (80%)
  };

  const summary = evaluateBossQuizResults(answers, questions);
  assert.equal(summary.correctCount, 12);
  assert.equal(summary.wrongCount, 3);
  assert.equal(summary.finalScore, 80); // (12/15)*100
  assert.equal(summary.tp1Percent, 100);
  assert.equal(summary.tp2Percent, 60);
  assert.equal(summary.tp3Percent, 80);
  assert.equal(summary.needsRemedial, false);
  assert.equal(summary.recommendations.length, 1); // TP2 < 80
});

test('buildSimulationReportPdfBytes emits valid PDF 1.4 header and EOF markers', () => {
  const bytes = buildSimulationReportPdfBytes({
    studentName: 'Ahmad Zaki',
    collectedAmount: 1000000,
    allocations: { pokok: 400000, pendidikan: 250000, kesehatan: 200000, darurat: 150000 },
    allocationReason: 'Membantu keluarga prasejahtera agar kebutuhan dasar dan sekolah terpenuhi.',
    expectedBenefit: 'Keluarga dapat hidup layak dan anak-anak tetap bersekolah.',
    conclusion: 'Dana sosial harus disalurkan secara adil dan amanah.',
    dateLabel: '10 November 2026',
  });
  const text = new TextDecoder().decode(bytes);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.includes('%%EOF'));
  assert.ok(text.includes('Ahmad Zaki'));
});
