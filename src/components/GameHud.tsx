import React from 'react';
import { Compass, Eye, HelpCircle, Map, Pause, Sparkles } from 'lucide-react';
import type { StageMeta } from '../data/curriculum';
import { CoinSvg, SoundIconSvg, StarSvg } from './GameIcons';

interface GameHudProps {
  currentStage: StageMeta;
  coins: number;
  stars: number;
  progressPercent: number;
  muted: boolean;
  panelOpen: boolean;
  interactPrompt: string | null;
  coinToast: string | null;
  onTogglePanel: () => void;
  onOpenMap: () => void;
  onOpenToadAsk: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  virtualMoveRef: React.MutableRefObject<{ x: number; z: number; jumpRequested: boolean }>;
}

export function GameHud({
  currentStage,
  coins,
  stars,
  progressPercent,
  muted,
  panelOpen,
  interactPrompt,
  coinToast,
  onTogglePanel,
  onOpenMap,
  onOpenToadAsk,
  onToggleMute,
  onPause,
  virtualMoveRef,
}: GameHudProps) {
  const setMove = (x: number, z: number) => {
    virtualMoveRef.current.x = x;
    virtualMoveRef.current.z = z;
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5 no-print">
      {/* Top Perimeter Clusters — keeps >= 85% viewport unobstructed */}
      <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
        {/* Top-Left: World & Quest Progress */}
        <div className="pointer-events-auto max-w-xs sm:max-w-sm bg-slate-900/90 text-white rounded-2xl border-2 border-amber-300/80 px-3.5 py-2.5 shadow-[0_4px_0_rgba(15,23,42,0.8)]">
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <span className="truncate">{currentStage.shortLabel} · {currentStage.tpTag}</span>
            <span className="font-mono-num tabular-nums">{Math.round(progressPercent)}%</span>
          </div>
          <div className="font-display font-bold text-sm sm:text-base leading-tight mt-0.5 truncate">
            {currentStage.worldTitle}
          </div>
          <div className="mt-1.5 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Top-Right: Tabular Rewards + Compact Utility Buttons */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          {/* Coin + Star Cluster */}
          <div className="relative flex items-center gap-3 bg-slate-900/90 text-white rounded-2xl border-2 border-amber-300/80 px-3.5 py-2 shadow-[0_4px_0_rgba(15,23,42,0.8)]">
            <div className="flex items-center gap-1.5" aria-label={`Koin Emas ${coins}`}>
              <CoinSvg className="w-5 h-5 shrink-0" />
              <span className="font-mono-num font-bold text-base sm:text-lg tabular-nums">{Math.round(coins)}</span>
            </div>
            <span className="text-slate-500" aria-hidden="true">|</span>
            <div className="flex items-center gap-1.5" aria-label={`Bintang ${stars}`}>
              <StarSvg className="w-5 h-5 shrink-0" />
              <span className="font-mono-num font-bold text-base sm:text-lg tabular-nums">{Math.round(stars)}</span>
            </div>
            {coinToast && (
              <span className="animate-coin-pop absolute -bottom-7 right-2 font-display font-extrabold text-sm text-amber-300 hud-text-stroke pointer-events-none">
                {coinToast}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenMap();
            }}
            className="btn-3d inline-flex items-center gap-1.5 bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-xl border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer whitespace-nowrap"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Peta Dunia</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenToadAsk();
            }}
            aria-label="Tanya Toad Guide"
            className="btn-3d inline-flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-xl border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Tanya Toad</span>
          </button>

          {panelOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onTogglePanel();
              }}
              aria-label="Lihat Dunia 3D dan Berjalan"
              className="btn-3d inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm border-2 border-slate-900 shadow-[0_3px_0_#0f172a] cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Dunia 3D</span>
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="btn-3d p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border-2 border-slate-600 shadow-[0_3px_0_#0f172a] cursor-pointer"
          >
            <SoundIconSvg muted={muted} className="w-4 h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Jeda Permainan"
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="btn-3d p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border-2 border-slate-600 shadow-[0_3px_0_#0f172a] cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Interaction Bar + Collapsible Mission Dock Trigger */}
      {!panelOpen && (
        <div className="flex items-end justify-between gap-3">
          {/* Compact On-Screen Touch / Mouse Movement Pad for Accessibility & Mobile */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 p-2 rounded-2xl border-2 border-slate-700">
            <button
              type="button"
              aria-label="Gerak Kiri"
              onPointerDown={() => setMove(-1, 0)}
              onPointerUp={() => setMove(0, 0)}
              onPointerLeave={() => setMove(0, 0)}
              className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm cursor-pointer"
            >
              ◀
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                aria-label="Gerak Maju"
                onPointerDown={() => setMove(0, -1)}
                onPointerUp={() => setMove(0, 0)}
                onPointerLeave={() => setMove(0, 0)}
                className="w-9 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="Gerak Mundur"
                onPointerDown={() => setMove(0, 1)}
                onPointerUp={() => setMove(0, 0)}
                onPointerLeave={() => setMove(0, 0)}
                className="w-9 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
              >
                ▼
              </button>
            </div>
            <button
              type="button"
              aria-label="Gerak Kanan"
              onPointerDown={() => setMove(1, 0)}
              onPointerUp={() => setMove(0, 0)}
              onPointerLeave={() => setMove(0, 0)}
              className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm cursor-pointer"
            >
              ▶
            </button>
            <button
              type="button"
              aria-label="Lompat"
              onClick={() => {
                virtualMoveRef.current.jumpRequested = true;
              }}
              className="ml-1 px-3 h-9 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Lompat
            </button>
          </div>

          {/* Center Proximity Prompt + Open Mission CTA */}
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            {interactPrompt && (
              <div className="bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full border-2 border-slate-900 shadow">
                Tekan E: {interactPrompt}
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onTogglePanel();
              }}
              className="btn-3d inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-display font-bold text-sm sm:text-base border-[3px] border-slate-900 shadow-[0_5px_0_#0f172a] cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Buka Misi {currentStage.shortLabel}
            </button>
          </div>

          {/* Right Explorer Badge Hint */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/85 text-slate-100 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700">
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Kumpulkan koin 3D atau klik karakter!</span>
          </div>
        </div>
      )}
    </div>
  );
}
