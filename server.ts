import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface ToadThinkBody {
  topic?: string;
  question?: string;
  context?: string;
}

function buildDeterministicToadGuidance(topic: string, question: string): string {
  const lower = `${topic} ${question}`.toLowerCase();
  if (lower.includes('fitrah') || lower.includes('beras') || lower.includes('uang') || lower.includes('waktu')) {
    return (
      'Toad Guide menjelaskan: Zakat fitrah wajib ditunaikan oleh setiap muslim yang memiliki kelebihan makanan pokok pada malam hingga pagi Idulfitri. ' +
      'Ukurannya 1 sha\' (di Indonesia didekatkan menjadi 2,5 kg atau sekitar 3,5 liter beras per jiwa), atau uang senilai harga beras sesuai ketetapan lembaga zakat setempat. ' +
      'Waktu paling utama (afzal) adalah setelah salat Subuh sebelum salat Idulfitri dimulai.'
    );
  }
  if (lower.includes('asnaf') || lower.includes('fakir') || lower.includes('miskin') || lower.includes('mustahik')) {
    return (
      'Toad Guide menjelaskan: Penerima zakat (mustahik) sudah ditetapkan dalam Al-Qur\'an Surah At-Taubah ayat 60 menjadi 8 golongan (asnaf): ' +
      'Fakir, Miskin, Amil, Mualaf, Riqab, Gharim, Fisabilillah, dan Ibnu Sabil. Pembagian zakat harus tepat sasaran agar adil dan amanah.'
    );
  }
  if (lower.includes('distribusi') || lower.includes('amanah') || lower.includes('simulasi') || lower.includes('dana')) {
    return (
      'Toad Guide berpesan: Mengelola dana sosial harus mengutamakan keadilan, transparansi, dan kebutuhan paling mendesak (kebutuhan pokok, kesehatan, pendidikan, dan darurat). ' +
      'Ingat ya, zakat memiliki aturan 8 asnaf berdasarkan syariat, sedangkan infaq dan sedekah dapat disalurkan secara luas untuk kemaslahatan bersama.'
    );
  }
  return (
    'Toad Guide menjelaskan: Zakat adalah kewajiban yang memiliki ketentuan khusus (kadar, syarat, dan 8 golongan penerima). ' +
    'Infaq adalah mengeluarkan sebagian harta di jalan kebaikan, sedangkan sedekah mencakup pemberian harta maupun kebaikan nonmateri seperti senyuman, tenaga, dan ilmu yang bermanfaat.'
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'zakat-hero-server' });
  });

  app.post('/api/toad-think', async (req: Request, res: Response) => {
    const body = (req.body || {}) as ToadThinkBody;
    const topic = String(body.topic || 'Zakat, Infaq, dan Sedekah').slice(0, 200);
    const question = String(body.question || '').trim().slice(0, 1200);
    const context = String(body.context || '').trim().slice(0, 1200);

    if (!question) {
      res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        answer: buildDeterministicToadGuidance(topic, question),
        mode: 'offline-guide',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          timeout: 6000,
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        `Topik Pembelajaran: ${topic}`,
        context ? `Konteks Aktivitas Murid: ${context}` : '',
        `Pertanyaan/Refleksi Murid Kelas 6 SD: ${question}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), 6000);
      let text = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            abortSignal: controller.signal,
            systemInstruction:
              'Kamu adalah Toad Guide, pemandu bijak dan ramah dalam game petualangan Fikih Islam Kelas 6 SD (Fase C Kurikulum Merdeka) tentang Zakat, Infaq, dan Sedekah (ZIS). ' +
              'Jawablah dengan bahasa Indonesia yang hangat, jelas, mudah dipahami anak usia 11-12 tahun, akurat secara fikih Islam (membedakan zakat wajib dengan 8 asnaf vs infaq & sedekah, serta besaran zakat fitrah 1 sha\' / 2,5 kg beras di Indonesia), dalam 2 hingga 4 kalimat yang memotivasi dan amanah.',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
        text = response.text?.trim() || '';
      } finally {
        clearTimeout(timeoutHandle);
      }

      if (!text) {
        res.json({
          answer: buildDeterministicToadGuidance(topic, question),
          mode: 'offline-guide',
        });
        return;
      }

      res.json({
        answer: text,
        mode: 'thinking-low',
      });
    } catch (error) {
      console.warn('Toad Guide fallback triggered:', error instanceof Error ? error.message : 'Unknown error');
      res.json({
        answer: buildDeterministicToadGuidance(topic, question),
        mode: 'offline-guide',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MARIO: MISSION ZAKAT HERO! server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
