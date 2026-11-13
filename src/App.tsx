import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAGES_META, type GameStageId } from './data/curriculum';
import { evaluateCharityAllocation, type CharityAllocationInput } from './game/zakatLogic';
import { soundEngine } from './audio/soundEngine';
import { WorldViewport } from './three/WorldViewport';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import {
  AdventureMapModal,
  GuideModal,
  PauseModal,
  ProfileModal,
  ToadAskModal,
} from './components/GameModals';
import { Level1Princess } from './components/stages/Level1Princess';
import { Level2MysteryBlocks } from './components/stages/Level2MysteryBlocks';
import { World1Village } from './components/stages/World1Village';
import { World2RiceField } from './components/stages/World2RiceField';
import { World3Caring } from './components/stages/World3Caring';
import { FinalBossBattle } from './components/stages/FinalBossBattle';
import { FinalTreeReflection } from './components/stages/FinalTreeReflection';

type GameShellState = 'title' | 'playing' | 'paused' | 'gameover';

interface SavedSession {
  studentName: string;
  stageId: GameStageId;
  highestUnlockedIndex: number;
  completedStages: GameStageId[];
  coins: number;
  stars: number;
  earnedBadges: string[];
  calculatorFamilyCount: number;
  allocations: CharityAllocationInput;
}

const STORAGE_KEY = 'zakat_hero_session_v1';

const DEFAULT_ALLOCATIONS: CharityAllocationInput = {
  pokok: 350000,
  pendidikan: 250000,
  kesehatan: 200000,
  darurat: 200000,
};

function loadSavedSession(): Partial<SavedSession> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<SavedSession>;
  } catch {
    return {};
  }
}

export default function App() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const saved = useMemo(() => loadSavedSession(), []);

  const [shellState, setShellState] = useState<GameShellState>(initialAutostart ? 'playing' : 'title');
  const [stageId, setStageId] = useState<GameStageId>(
    saved.stageId && saved.stageId !== 'title' ? saved.stageId : 'level1_princess',
  );
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState<number>(saved.highestUnlockedIndex ?? 0);
  const [completedStages, setCompletedStages] = useState<GameStageId[]>(saved.completedStages ?? []);
  const [studentName, setStudentName] = useState<string>(saved.studentName ?? 'Zakat Hero');
  const [coins, setCoins] = useState<number>(saved.coins ?? 25);
  const [stars, setStars] = useState<number>(saved.stars ?? 1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(saved.earnedBadges ?? []);

  // World-specific synced states
  const [calculatorFamilyCount, setCalculatorFamilyCount] = useState<number>(saved.calculatorFamilyCount ?? 5);
  const [collectedRiceIds, setCollectedRiceIds] = useState<string[]>([]);
  const [collectRiceMode, setCollectRiceMode] = useState<boolean>(false);
  const [allocations, setAllocations] = useState<CharityAllocationInput>(saved.allocations ?? DEFAULT_ALLOCATIONS);
  const [treeGrowthStage, setTreeGrowthStage] = useState<number>(0);
  const [bossHitPulse, setBossHitPulse] = useState<number>(0);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);

  // UI overlays
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showToadAsk, setShowToadAsk] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [coinToast, setCoinToast] = useState<string | null>(null);

  const virtualMoveRef = useRef({ x: 0, z: 0, jumpRequested: false });
  const toastTimerRef = useRef<number | null>(null);

  // Sync document.body.dataset.state for shell state observability
  useEffect(() => {
    document.body.dataset.state = shellState;
  }, [shellState]);

  // Save session state
  useEffect(() => {
    try {
      const payload: SavedSession = {
        studentName,
        stageId,
        highestUnlockedIndex,
        completedStages,
        coins,
        stars,
        earnedBadges,
        calculatorFamilyCount,
        allocations,
      };
      const serialized = JSON.stringify(payload);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // ignore quota errors
    }
  }, [
    studentName,
    stageId,
    highestUnlockedIndex,
    completedStages,
    coins,
    stars,
    earnedBadges,
    calculatorFamilyCount,
    allocations,
  ]);

  const currentStageIndex = useMemo(() => {
    const idx = STAGES_META.findIndex((s) => s.id === stageId);
    return idx >= 0 ? idx : 0;
  }, [stageId]);

  const currentStageMeta = STAGES_META[currentStageIndex];

  const activeWorld = useMemo(() => {
    if (shellState === 'title') return 'world0' as const;
    return currentStageMeta.scene;
  }, [shellState, currentStageMeta]);

  const charityEval = useMemo(() => evaluateCharityAllocation(allocations), [allocations]);

  const triggerToast = useCallback((text: string) => {
    setCoinToast(text);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setCoinToast(null);
    }, 1100);
  }, []);

  const handleRewardCoins = useCallback(
    (amount: number, reason: string) => {
      setCoins((c) => c + amount);
      triggerToast(reason);
    },
    [triggerToast],
  );

  const handleEarnBadge = useCallback((badgeId: string) => {
    setEarnedBadges((prev) => (prev.includes(badgeId) ? prev : [...prev, badgeId]));
    setStars((s) => s + 1);
  }, []);

  const handleStartAdventure = useCallback(() => {
    soundEngine.playCorrect();
    soundEngine.startAdventureMusic();
    setShellState('playing');
    setPanelOpen(true);
    if (stageId === 'title') {
      setStageId('level1_princess');
    }
  }, [stageId]);

  const advanceToNextStage = useCallback(
    (completedId: GameStageId, nextId: GameStageId) => {
      setCompletedStages((prev) => (prev.includes(completedId) ? prev : [...prev, completedId]));
      const nextIndex = STAGES_META.findIndex((s) => s.id === nextId);
      if (nextIndex >= 0) {
        setHighestUnlockedIndex((h) => Math.max(h, nextIndex));
      }
      setStageId(nextId);
      setPanelOpen(true);
      setCollectRiceMode(false);
    },
    [],
  );

  const handleRiceSackPickup = useCallback(
    (sackId: string) => {
      setCollectedRiceIds((prev) => {
        if (prev.includes(sackId)) return prev;
        const next = [...prev, sackId];
        triggerToast(`+2,5 kg (${next.length}/5)`);
        if (next.length >= 5) {
          setCollectRiceMode(false);
          setPanelOpen(true);
        }
        return next;
      });
      setCoins((c) => c + 10);
    },
    [triggerToast],
  );

  // Keyboard shortcuts for Title Start (Enter/Space), Pause (Escape/P), Mute (M)
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (shellState === 'title') {
        if (!showGuide && !showProfile && (e.code === 'Enter' || e.code === 'Space')) {
          e.preventDefault();
          handleStartAdventure();
        }
        return;
      }

      if (e.code === 'Escape' || (!typing && e.code === 'KeyP')) {
        e.preventDefault();
        if (showMap) setShowMap(false);
        else if (showToadAsk) setShowToadAsk(false);
        else if (showGuide) setShowGuide(false);
        else if (showProfile) setShowProfile(false);
        else {
          setShellState((s) => {
            const next = s === 'paused' ? 'playing' : 'paused';
            if (next === 'paused') soundEngine.stopAdventureMusic();
            else soundEngine.startAdventureMusic();
            return next;
          });
        }
        return;
      }

      if (!typing && e.code === 'KeyM') {
        const nextMuted = soundEngine.toggleMute();
        setMuted(nextMuted);
      }
    };

    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [shellState, showGuide, showProfile, showMap, showToadAsk, handleStartAdventure]);

  const handleResetFullGame = () => {
    setStageId('level1_princess');
    setHighestUnlockedIndex(0);
    setCompletedStages([]);
    setCoins(25);
    setStars(1);
    setEarnedBadges([]);
    setCollectedRiceIds([]);
    setCollectRiceMode(false);
    setBossDefeated(false);
    setTreeGrowthStage(0);
    setPanelOpen(true);
    setShellState('playing');
  };

  const progressPercent = (completedStages.length / STAGES_META.length) * 100;

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Isolated 3D WebGL Scene Viewport */}
      <WorldViewport
        gameState={shellState}
        activeWorld={activeWorld}
        calculatorFamilyCount={calculatorFamilyCount}
        houseUpgradeLevels={charityEval.houseLevels}
        treeGrowthStage={treeGrowthStage}
        bossHitPulse={bossHitPulse}
        bossDefeated={bossDefeated}
        collectRiceMode={collectRiceMode}
        collectedRiceIds={collectedRiceIds}
        onCoinPickup={() => handleRewardCoins(5, '+5 Koin Emas!')}
        onRiceSackPickup={handleRiceSackPickup}
        onInteractPromptChange={setInteractPrompt}
        onTriggerWorldInteract={() => {
          soundEngine.playCorrect();
          setPanelOpen(true);
        }}
        virtualMoveRef={virtualMoveRef}
      />

      {/* Level 0: Splash Screen */}
      {shellState === 'title' && (
        <TitleScreen
          onStartAdventure={handleStartAdventure}
          onOpenGuide={() => setShowGuide(true)}
          onOpenProfile={() => setShowProfile(true)}
        />
      )}

      {/* Playing HUD */}
      {shellState !== 'title' && (
        <GameHud
          currentStage={currentStageMeta}
          coins={coins}
          stars={stars}
          progressPercent={progressPercent}
          muted={muted}
          panelOpen={panelOpen}
          interactPrompt={interactPrompt}
          coinToast={coinToast}
          onTogglePanel={() => setPanelOpen((o) => !o)}
          onOpenMap={() => setShowMap(true)}
          onOpenToadAsk={() => setShowToadAsk(true)}
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onPause={() => {
            soundEngine.stopAdventureMusic();
            setShellState('paused');
          }}
          virtualMoveRef={virtualMoveRef}
        />
      )}

      {/* Rice Collection Explore Mode Banner */}
      {shellState === 'playing' && !panelOpen && collectRiceMode && stageId === 'world2_ricefield' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20 bg-amber-300 text-slate-950 font-display font-bold text-sm px-5 py-2 rounded-full border-2 border-slate-900 shadow-[0_4px_0_#0f172a]">
          Berjalanlah di sawah untuk mengumpulkan karung beras! ({collectedRiceIds.length}/5 karung = {(collectedRiceIds.length * 2.5).toLocaleString('id-ID')} kg)
        </div>
      )}

      {/* Active Learning Stage Panels */}
      {shellState === 'playing' && panelOpen && (
        <>
          {stageId === 'level1_princess' && (
            <Level1Princess
              onRewardCoins={handleRewardCoins}
              onComplete={() => advanceToNextStage('level1_princess', 'level2_mystery')}
            />
          )}

          {stageId === 'level2_mystery' && (
            <Level2MysteryBlocks
              onRewardCoins={handleRewardCoins}
              onComplete={() => advanceToNextStage('level2_mystery', 'world1_village')}
            />
          )}

          {stageId === 'world1_village' && (
            <World1Village
              onRewardCoins={handleRewardCoins}
              onEarnBadge={handleEarnBadge}
              onComplete={() => advanceToNextStage('world1_village', 'world2_ricefield')}
            />
          )}

          {stageId === 'world2_ricefield' && (
            <World2RiceField
              calculatorFamilyCount={calculatorFamilyCount}
              onCalculatorFamilyChange={setCalculatorFamilyCount}
              collectedRiceIds={collectedRiceIds}
              onStartRiceExploreMode={() => {
                setCollectRiceMode(true);
                setPanelOpen(false);
              }}
              onResetRiceChallenge={() => {
                setCollectedRiceIds([]);
                setCollectRiceMode(true);
              }}
              onCollectSackManual={handleRiceSackPickup}
              onRewardCoins={handleRewardCoins}
              onEarnBadge={handleEarnBadge}
              onComplete={() => advanceToNextStage('world2_ricefield', 'world3_caring')}
            />
          )}

          {stageId === 'world3_caring' && (
            <World3Caring
              studentName={studentName}
              allocations={allocations}
              onChangeAllocations={setAllocations}
              onRewardCoins={handleRewardCoins}
              onEarnBadge={handleEarnBadge}
              onComplete={() => advanceToNextStage('world3_caring', 'final_boss')}
            />
          )}

          {stageId === 'final_boss' && (
            <FinalBossBattle
              onBossHit={() => setBossHitPulse((p) => p + 1)}
              onBossDefeated={() => setBossDefeated(true)}
              onRewardCoins={handleRewardCoins}
              onEarnBadge={handleEarnBadge}
              onComplete={() => advanceToNextStage('final_boss', 'final_tree')}
            />
          )}

          {stageId === 'final_tree' && (
            <FinalTreeReflection
              studentName={studentName}
              coins={coins}
              stars={stars}
              earnedBadges={earnedBadges}
              onTreeGrowthChange={setTreeGrowthStage}
              onRewardCoins={handleRewardCoins}
              onRestartFullGame={handleResetFullGame}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {showProfile && (
        <ProfileModal
          studentName={studentName}
          onChangeName={setStudentName}
          coins={coins}
          stars={stars}
          earnedBadges={earnedBadges}
          completedStages={completedStages}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showMap && (
        <AdventureMapModal
          currentStageId={stageId}
          highestUnlockedIndex={highestUnlockedIndex}
          completedStages={completedStages}
          onSelectStage={(id) => {
            setStageId(id);
            setPanelOpen(true);
            setCollectRiceMode(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      {showToadAsk && (
        <ToadAskModal
          currentTopic={currentStageMeta.worldTitle}
          onClose={() => setShowToadAsk(false)}
        />
      )}

      {shellState === 'paused' && (
        <PauseModal
          onResume={() => {
            soundEngine.startAdventureMusic();
            setShellState('playing');
          }}
          onRestartWorld={() => {
            setPanelOpen(true);
            soundEngine.startAdventureMusic();
            setShellState('playing');
          }}
          onReturnTitle={() => {
            soundEngine.stopAdventureMusic();
            setShellState('title');
          }}
        />
      )}
    </main>
  );
}
