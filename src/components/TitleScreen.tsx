import React from 'react';
import { BookOpen, Play, User } from 'lucide-react';
import { TitleLockupSvg } from './GameIcons';

interface TitleScreenProps {
  onStartAdventure: () => void;
  onOpenGuide: () => void;
  onOpenProfile: () => void;
}

export function TitleScreen({ onStartAdventure, onOpenGuide, onOpenProfile }: TitleScreenProps) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-5 sm:p-8 lg:p-12">
      {/* Left/Top Negative-Space Sky Zone — frames Castle & Running Hero cleanly */}
      <div className="max-w-xl pointer-events-auto">
        <TitleLockupSvg className="w-full max-w-[460px] h-auto drop-shadow-xl" />

        <p className="mt-3 text-base sm:text-lg font-bold text-slate-900 bg-amber-100/95 border-2 border-slate-900 rounded-2xl px-4 py-2.5 shadow-[0_4px_0_#0f172a] inline-block">
          Kumpulkan Ilmu, Tunaikan Zakat, Selamatkan Sesama!
        </p>

        {/* <= 3 Menu Actions with clear primary/secondary hierarchy */}
        <div className="mt-6 flex flex-col items-stretch sm:items-start gap-3">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartAdventure();
            }}
            className="btn-3d inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-lg border-[3px] border-slate-900 shadow-[0_6px_0_#0f172a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-5 h-5 fill-current" />
            MULAI PETUALANGAN
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenGuide}
              className="btn-3d flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-900 font-bold text-base border-[3px] border-slate-900 shadow-[0_5px_0_#0f172a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-5 h-5 text-sky-600" />
              PETUNJUK
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="btn-3d flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-900 font-bold text-base border-[3px] border-slate-900 shadow-[0_5px_0_#0f172a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 cursor-pointer whitespace-nowrap"
            >
              <User className="w-5 h-5 text-slate-900" />
              PROFIL
            </button>
          </div>
        </div>
      </div>

      {/* Single Flat Control-Hint Line in bottom safe margin */}
      <div className="flex justify-center">
        <p className="text-xs sm:text-sm font-semibold text-white bg-slate-900/80 px-4 py-1.5 rounded-full tracking-wide">
          WASD / Panah Bergerak · Spasi Lompat · E Interaksi · Enter Mulai · Esc Jeda
        </p>
      </div>
    </div>
  );
}
