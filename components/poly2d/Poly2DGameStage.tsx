'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  ShieldAlert,
  Award,
  Zap,
  Coins,
  MapPin,
  RefreshCw,
  Box,
  Layers,
  Sun,
  Sunset,
  Moon,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { soundFX } from '@/lib/sound';
import { SimulationOption } from '../LiveSimulationStage';

export interface Poly2DGameStageProps {
  story: 'miso' | 'funfair';
  stage: number;
  totalStages: number;
  levelNumber: number;
  sceneTitle: string;
  sceneSubtitle?: string;
  walletBalance: number;
  promptQuestion: string;
  promptDescription?: string;
  actor: {
    name: string;
    role: string;
    avatar: string;
  };
  options: SimulationOption[];
  onSelectOption: (optionId: string) => void;
  customControls?: React.ReactNode;
  onToggleViewMode?: () => void;
  currentViewMode?: 'poly2d' | '3d';
}

interface FloatingEffect {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  icon?: string;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  size: number;
  shape: 'triangle' | 'quad' | 'star';
  life: number;
}

type LevelTheme =
  | 'highway_tapri'
  | 'vet_clinic'
  | 'cozy_home'
  | 'carnival_day'
  | 'carnival_rush'
  | 'carnival_night';

type TimeOfDay = 'day' | 'dusk' | 'night';

export function Poly2DGameStage({
  story,
  stage,
  totalStages,
  levelNumber,
  sceneTitle,
  sceneSubtitle,
  walletBalance,
  promptQuestion,
  promptDescription,
  actor,
  options,
  onSelectOption,
  customControls,
  onToggleViewMode,
  currentViewMode = 'poly2d',
}: Poly2DGameStageProps) {
  const isMiso = story === 'miso';

  // Determine Level Theme based on Story & Stage
  const levelTheme: LevelTheme = useMemo(() => {
    if (isMiso) {
      if (stage <= 3) return 'highway_tapri';
      if (stage <= 5) return 'vet_clinic';
      return 'cozy_home';
    } else {
      if (stage <= 4) return 'carnival_day';
      if (stage <= 7) return 'carnival_rush';
      return 'carnival_night';
    }
  }, [isMiso, stage]);

  // Interactive Time of Day (Manual or Automatic based on level)
  const defaultTime: TimeOfDay = useMemo(() => {
    if (levelTheme === 'cozy_home' || levelTheme === 'carnival_day') return 'day';
    if (levelTheme === 'carnival_night') return 'night';
    return 'dusk';
  }, [levelTheme]);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(defaultTime);

  // Sync default time when level changes
  useEffect(() => {
    setTimeOfDay(defaultTime);
  }, [defaultTime]);

  // Interactive Game State
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [executingOption, setExecutingOption] = useState<SimulationOption | null>(null);
  const [misoMood, setMisoMood] = useState<'neutral' | 'happy' | 'scared' | 'cured'>('neutral');
  const [misoJumping, setMisoJumping] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [floatingEffects, setFloatingEffects] = useState<FloatingEffect[]>([]);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [tick, setTick] = useState(0);
  const [extraSteamPuff, setExtraSteamPuff] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [yarnKicked, setYarnKicked] = useState(false);
  const [fireworkBurst, setFireworkBurst] = useState(false);
  const [fishFed, setFishFed] = useState(false);
  const [popcornPopped, setPopcornPopped] = useState(false);
  const [samosaSizzle, setSamosaSizzle] = useState(false);
  const [pinwheelFast, setPinwheelFast] = useState(false);
  const [ferrisFast, setFerrisFast] = useState(false);
  const [circusFanfare, setCircusFanfare] = useState(false);
  const [cottonCandySpin, setCottonCandySpin] = useState(false);

  // Cinematic Option Transitions: Cab Pick-up vs Vet Sprint
  const [transitionMode, setTransitionMode] = useState<'none' | 'cab_pickup' | 'vet_sprint'>('none');
  const [transitionTick, setTransitionTick] = useState(0);
  const pendingOptionRef = useRef<SimulationOption | null>(null);

  // Active hover option
  const activeHoverOption = useMemo(
    () => options.find((o) => o.id === hoveredOptionId) || null,
    [options, hoveredOptionId]
  );

  // 60 FPS Animation loop clock
  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTick((t) => (t + 1) % 7200);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Dedicated Cinematic Transition Animation Driver (Cab Pickup & Vet Sprint)
  const onSelectOptionRef = useRef(onSelectOption);
  useEffect(() => {
    onSelectOptionRef.current = onSelectOption;
  }, [onSelectOption]);

  useEffect(() => {
    if (transitionMode === 'none') return;
    let animId: number;
    const startTime = performance.now();
    const totalDuration = transitionMode === 'cab_pickup' ? 2200 : 1900; // ms
    let honkPlayed = false;
    let doorOpenPlayed = false;
    let meowPlayed = false;
    let departPlayed = false;
    let sprintWhoosh1 = false;
    let sprintWhoosh2 = false;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      const currentTick = Math.floor(progress * (transitionMode === 'cab_pickup' ? 125 : 110));
      setTransitionTick(currentTick);

      // Cab Pick-up Sound triggers
      if (transitionMode === 'cab_pickup') {
        if (currentTick >= 38 && !honkPlayed) {
          soundFX.playHonk();
          honkPlayed = true;
        }
        if (currentTick >= 44 && !doorOpenPlayed) {
          soundFX.playClick();
          doorOpenPlayed = true;
        }
        if (currentTick >= 50 && !meowPlayed) {
          soundFX.playMeow();
          soundFX.playPurr();
          meowPlayed = true;
        }
        if (currentTick >= 72 && !departPlayed) {
          soundFX.playClick();
          soundFX.playWhoosh();
          departPlayed = true;
        }
      }

      // Vet Sprint Sound triggers
      if (transitionMode === 'vet_sprint') {
        if (currentTick >= 8 && !meowPlayed) {
          soundFX.playMeow();
          soundFX.playWhoosh();
          meowPlayed = true;
        }
        if (currentTick >= 35 && !sprintWhoosh1) {
          soundFX.playWhoosh();
          sprintWhoosh1 = true;
        }
        if (currentTick >= 65 && !sprintWhoosh2) {
          soundFX.playWhoosh();
          sprintWhoosh2 = true;
        }
      }

      if (progress >= 1) {
        soundFX.playStageAdvance();
        const pending = pendingOptionRef.current;
        if (pending && onSelectOptionRef.current) {
          onSelectOptionRef.current(pending.id);
        }
        setTransitionMode('none');
        setExecutingOption(null);
        return;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [transitionMode]);

  // Update Miso's mood based on hover / execution
  useEffect(() => {
    if (executingOption) {
      setMisoMood('cured');
      return;
    }
    if (hoveredOptionId) {
      if (
        hoveredOptionId.includes('A') ||
        hoveredOptionId.includes('vet') ||
        hoveredOptionId.includes('food') ||
        hoveredOptionId.includes('care')
      ) {
        setMisoMood('happy');
      } else if (
        hoveredOptionId.includes('wait') ||
        hoveredOptionId.includes('leave') ||
        hoveredOptionId.includes('ignore')
      ) {
        setMisoMood('scared');
      } else {
        setMisoMood('neutral');
      }
    } else {
      setMisoMood('neutral');
    }
  }, [hoveredOptionId, executingOption]);

  // Particle update loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.35, // gravity
            rotation: p.rotation + p.vRot,
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  // Keyboard Hotkeys [1], [2], [3], [4]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (executingOption || transitionMode !== 'none') return;
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (e.key in keyMap) {
        const idx = keyMap[e.key];
        if (options[idx]) {
          triggerOptionAction(options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, executingOption, transitionMode]);

  // Spawn floating RPG numbers
  const spawnFloatingText = (text: string, color: string, x: number, y: number, icon?: string) => {
    const newFloat: FloatingEffect = {
      id: Date.now() + Math.random(),
      text,
      color,
      x,
      y,
      icon,
    };
    setFloatingEffects((prev) => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingEffects((prev) => prev.filter((f) => f.id !== newFloat.id));
    }, 1200);
  };

  // Spawn confetti particles
  const spawnConfetti = (centerX: number, centerY: number, count = 25) => {
    const newParticles: ConfettiParticle[] = [];
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f43f5e', '#fbbf24', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 7;
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed * 0.45,
        vy: Math.sin(angle) * speed * 0.45 - 3.5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        shape: i % 3 === 0 ? 'triangle' : i % 3 === 1 ? 'quad' : 'star',
        life: 1.0,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Interactive Click Handlers
  const handleClickMiso = () => {
    setMisoJumping(true);
    setTimeout(() => setMisoJumping(false), 450);
    soundFX.playPurr();
    soundFX.playMeow();
    spawnFloatingText('❤️ Purr! +5 Mood', '#f43f5e', 45, 55, '🐾');
  };

  const handleClickKettle = () => {
    setExtraSteamPuff(true);
    setTimeout(() => setExtraSteamPuff(false), 1200);
    soundFX.playSteamHiss();
    spawnFloatingText('💨 Boiling Fresh Chai!', '#f59e0b', 70, 45, '☕');
  };

  const handleClickVehicle = (type: 'auto' | 'amb') => {
    soundFX.playHonk();
    if (type === 'amb') {
      spawnFloatingText('🚨 Siren Alert!', '#38bdf8', 25, 60, '🚑');
    } else {
      spawnFloatingText('🛺 Peep Peep!', '#facc15', 25, 60, '💨');
    }
  };

  const handleClickSky = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    soundFX.playFirework();
    setFireworkBurst(true);
    setTimeout(() => setFireworkBurst(false), 900);
    spawnConfetti(xPct, yPct, 24);
    spawnFloatingText('✨ Sparkle!', '#fde047', xPct, yPct);
  };

  const handleClickCatTree = () => {
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 800);
    soundFX.playCoin();
    spawnFloatingText('🔔 Bell Jingled!', '#fbbf24', 25, 45, '⭐');
  };

  const handleClickYarn = () => {
    setYarnKicked(true);
    setTimeout(() => setYarnKicked(false), 600);
    soundFX.playClick();
    spawnFloatingText('🧶 Yarn Batted!', '#ec4899', 55, 75);
  };

  const handleClickFish = () => {
    setFishFed(true);
    setTimeout(() => setFishFed(false), 1000);
    soundFX.playCoin();
    spawnFloatingText('🐠 BLUB! Golden Fish Fed ✨', '#38bdf8', 68, 38, '🫧');
  };

  const handleClickPopcorn = () => {
    setPopcornPopped(true);
    setTimeout(() => setPopcornPopped(false), 900);
    soundFX.playClick();
    spawnFloatingText('🍿 POP! Golden Corn Crunch +₹5', '#fde047', 48, 48, '⭐');
  };

  const handleClickKadhai = () => {
    setSamosaSizzle(true);
    setTimeout(() => setSamosaSizzle(false), 1100);
    soundFX.playSteamHiss();
    spawnFloatingText('🔥 SIZZLE! Crispy Masala Samosa', '#f97316', 36, 55, '🥟');
  };

  const handleClickPinwheel = () => {
    setPinwheelFast(true);
    setTimeout(() => setPinwheelFast(false), 1500);
    soundFX.playWhoosh();
    spawnFloatingText('🌀 SWISH! Rainbow Breeze', '#ec4899', 75, 45, '✨');
  };

  const handleClickTruck = () => {
    soundFX.playHonk();
    spawnFloatingText('🎺 POM POM! HORN OK PLEASE', '#facc15', 28, 42, '🚚');
  };

  const handleClickFerrisWheel = () => {
    setFerrisFast(true);
    setTimeout(() => setFerrisFast(false), 2000);
    soundFX.playCoin();
    spawnFloatingText('🎡 WOOOSH! Giant Wheel Full Speed!', '#facc15', 80, 35, '⭐');
  };

  const handleClickCircus = () => {
    setCircusFanfare(true);
    setTimeout(() => setCircusFanfare(false), 1200);
    soundFX.playFirework();
    spawnConfetti(16, 45, 25);
    spawnFloatingText('🎪 FANFARE! Royal Circus Gala Show', '#ef4444', 16, 40, '🎺');
  };

  const handleClickCottonCandy = () => {
    setCottonCandySpin(true);
    setTimeout(() => setCottonCandySpin(false), 1500);
    soundFX.playClick();
    spawnFloatingText('🍬 SWEET! Spun Pink Candy Floss +₹10', '#ec4899', 72, 55, '🍭');
  };

  // Execute an option
  const triggerOptionAction = (option: SimulationOption) => {
    if (executingOption || transitionMode !== 'none') return;

    const optText = `${option.id} ${option.title} ${option.description} ${option.badge} ${option.icon}`.toLowerCase();

    // Check if user selected Cab / Taxi / Auto / Transit vehicle
    const isCabChoice =
      isMiso &&
      (optText.includes('cab') ||
        optText.includes('taxi') ||
        optText.includes('auto') ||
        optText.includes('rickshaw') ||
        optText.includes('car') ||
        optText.includes('transport') ||
        optText.includes('van') ||
        option.id === 'J2_A' ||
        option.id === 'J2_B' ||
        option.id === 'J2_C');

    // Check if user selected Vet / Clinic / Doctor / Emergency run
    const isVetChoice =
      isMiso &&
      !isCabChoice &&
      (optText.includes('vet') ||
        optText.includes('clinic') ||
        optText.includes('hospital') ||
        optText.includes('doctor') ||
        optText.includes('rescuer') ||
        optText.includes('treatment') ||
        option.id === 'J1_C' ||
        option.id === 'J2_D');

    if (isCabChoice) {
      setExecutingOption(option);
      pendingOptionRef.current = option;
      setTransitionMode('cab_pickup');
      setTransitionTick(0);
      soundFX.playHonk();
      spawnConfetti(35, 65, 20);
      spawnFloatingText('🚖 Kaali-Peeli Taxi Dispatched!', '#facc15', 50, 50, '🚕');
      return;
    }

    if (isVetChoice) {
      setExecutingOption(option);
      pendingOptionRef.current = option;
      setTransitionMode('vet_sprint');
      setTransitionTick(0);
      soundFX.playMeow();
      soundFX.playWhoosh();
      spawnConfetti(35, 65, 20);
      spawnFloatingText("🐾 Sprinting to Dr. Kavita's Clinic!", '#38bdf8', 50, 50, '🏥');
      return;
    }

    // Standard Option Execution (Feeding, Financial, Market, Carnival)
    setExecutingOption(option);

    soundFX.playClick();
    if (isMiso) {
      soundFX.playMeow();
    } else {
      soundFX.playCoin();
    }

    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);

    spawnConfetti(50, 65, 30);
    spawnFloatingText(
      option.costAmount ? `-₹${option.costAmount}` : '+ACTION',
      option.costAmount ? '#ef4444' : '#10b981',
      50,
      55,
      isMiso ? '❤️' : '🪙'
    );

    setTimeout(() => {
      soundFX.playStageAdvance();
      onSelectOption(option.id);
      setExecutingOption(null);
    }, 950);
  };

  // Animated continuous values for each scene
  const cloudX1 = ((tick * 0.3) % 110) - 10;
  const cloudX2 = (((tick * 0.2) + 50) % 110) - 10;
  const tailAngle = Math.sin(tick * 0.12) * 18;
  const misoBobY = misoJumping ? -22 : Math.sin(tick * 0.08) * 3;
  const kettleSteam1Y = (tick * 1.5) % 80;
  const kettleSteam2Y = ((tick * 1.5) + 40) % 80;
  const ferrisAngle = (ferrisFast ? tick * 1.6 : tick * 0.45) % 360;

  // Scene 1 specific: Distant highway traffic, Indian truck, birds, neem tree & dog
  const trafficX = ((tick * 2.2) % 1200) - 100;
  const pigeonHop = Math.sin(tick * 0.2) * 3;
  const truckX = ((tick * 2.2) % 1500) - 260;
  const truckWheelAngle = (tick * 16) % 360;
  const truckExhaustSmokeY = (tick * 3) % 40;
  const birdsX = ((tick * 1.4) % 1300) - 150;
  const neemSway = Math.sin(tick * 0.05) * 3.5;
  const flameWave = Math.sin(tick * 0.35) * 5;

  // Scene 2 specific: Vet clinic heart BPM, scanner, healing crosses, IV bubbles & ripples
  const clinicBpm = 132 + Math.floor(Math.sin(tick * 0.05) * 4);
  const heartEkgOffset = (tick * 2) % 160;
  const scannerBeamY = Math.sin(tick * 0.06) * 40 + 65;
  const ivDropY = (tick * 2.2) % 38;
  const ivBubbleY = (tick * 1.5) % 35;
  const floatingHealingCrosses = [0, 1, 2, 3].map((i) => ({
    x: 390 + i * 28,
    y: 390 - ((tick * 1.4 + i * 35) % 100),
    op: Math.max(0, 1 - ((tick * 1.4 + i * 35) % 100) / 100),
  }));
  const ultrasoundRipples = [0, 1, 2].map((i) => ({
    r: 12 + ((tick * 1.6 + i * 20) % 45),
    op: Math.max(0, 1 - ((tick * 1.6 + i * 20) % 45) / 45),
  }));

  // Scene 3 specific: Cozy home pendulum, butterflies, fishbowl, dust & sleepy Zzz
  const clockPendulum = Math.sin(tick * 0.08) * 20;
  const butterflyX1 = Math.sin(tick * 0.04) * 35 + 720;
  const butterflyY1 = Math.cos(tick * 0.06) * 18 + 260;
  const butterflyX2 = Math.sin(tick * 0.05 + 1.5) * 30 + 820;
  const butterflyY2 = Math.cos(tick * 0.07 + 1.2) * 22 + 230;
  const yarnRollX = yarnKicked ? Math.sin(tick * 0.3) * 20 : 0;
  const fishSwim = Math.sin(tick * 0.035) * 24;
  const fishTail = Math.sin(tick * 0.35) * 22;
  const fishBubbles = [0, 1, 2].map((i) => ({
    y: 220 - ((tick * 1.2 + i * 18) % 35),
    op: Math.max(0, 1 - ((tick * 1.2 + i * 18) % 35) / 35),
  }));
  const sleepyZ = [0, 1, 2].map((i) => ({
    x: 440 + i * 14 + Math.sin(tick * 0.05 + i) * 8,
    y: 390 - ((tick * 0.9 + i * 35) % 80),
    scale: 0.8 + i * 0.3,
    opacity: Math.max(0, 1 - ((tick * 0.9 + i * 35) % 80) / 80),
  }));

  // Scene 4 & 5 specific: Mela Fairground attractions, food stalls & crowds
  const pinwheelDeg = (pinwheelFast ? tick * 28 : tick * 10) % 360;
  const balloonBob = Math.sin(tick * 0.06) * 8;
  const lemonSwirl = (tick * 1.8) % 360;
  const coasterTrainX = ((tick * 3.4) % 1300) - 150;
  const hotAirBalloonY = Math.sin(tick * 0.035) * 14 + 110;
  const hotAirBalloonX = 310 + Math.sin(tick * 0.018) * 20;
  const buntingWave = Math.sin(tick * 0.09) * 3.5;
  const circusPennantWave = Math.sin(tick * 0.16) * 7;
  const cottonCandySwirl = (cottonCandySpin ? tick * 24 : tick * 5) % 360;

  // Food carts: Popcorn kernels popping, kadhai sizzle & crowd promenades
  const popcorn1Y = Math.abs(Math.sin(tick * 0.3)) * 14;
  const popcorn2Y = Math.abs(Math.sin(tick * 0.25 + 1)) * 12;
  const kadhaiBubbles = [0, 1, 2, 3, 4].map((i) => ({
    x: 180 + i * 16 + Math.sin(tick * 0.2 + i) * 6,
    y: 440 + Math.cos(tick * 0.15 + i) * 6,
    r: 2 + (i % 3) * 1.5,
  }));
  const samosaBob1 = Math.sin(tick * 0.15) * 4;
  const samosaBob2 = Math.sin(tick * 0.18 + 1) * 4;
  const popcornJump = [0, 1, 2, 3, 4, 5].map(
    (i) => Math.abs(Math.sin(tick * 0.35 + i * 1.2)) * (popcornPopped ? 32 : 18)
  );
  const crowdWalkX1 = ((tick * 0.85) % 1200) - 100;
  const crowdWalkX2 = 1120 - ((tick * 0.75) % 1250);
  const crowdWalkX3 = ((tick * 0.55 + 460) % 1260) - 120;

  // Scene 6 specific: Rainbow neon cycle, sky lanterns, fireworks & marquee chaser
  const neonHues = ['#38bdf8', '#ec4899', '#facc15', '#4ade80', '#a855f7'];
  const neonColor = neonHues[Math.floor(tick / 20) % neonHues.length];
  const skyLanterns = [0, 1, 2, 3, 4].map((i) => ({
    x: 140 + i * 160 + Math.sin(tick * 0.03 + i) * 18,
    y: 460 - ((tick * 0.75 + i * 70) % 420),
    op: Math.min(1, Math.max(0.2, 1 - ((tick * 0.75 + i * 70) % 420) / 420)),
  }));
  const fireworkBursts = [0, 1, 2].map((i) => {
    const progress = ((tick + i * 28) % 85) / 85;
    return {
      x: 260 + i * 240,
      y: 130 + (i % 2) * 50,
      scale: progress * 1.4,
      op: Math.max(0, 1 - progress),
      hue: i === 0 ? '#f43f5e' : i === 1 ? '#38bdf8' : '#facc15',
    };
  });
  const marqueePhase = Math.floor(tick / 8) % 3;

  // Vehicles and Transition Highlights
  const isVetHighlighted =
    hoveredOptionId?.includes('vet') ||
    hoveredOptionId?.includes('clinic') ||
    hoveredOptionId?.includes('J1_C') ||
    hoveredOptionId?.includes('J2_D') ||
    executingOption?.id.includes('vet') ||
    executingOption?.id.includes('clinic') ||
    executingOption?.id.includes('J1_C') ||
    executingOption?.id.includes('J2_D') ||
    transitionMode === 'vet_sprint';

  const isCabHighlighted =
    hoveredOptionId?.includes('cab') ||
    hoveredOptionId?.includes('taxi') ||
    hoveredOptionId?.includes('auto') ||
    hoveredOptionId?.includes('J2_A') ||
    hoveredOptionId?.includes('J2_B') ||
    hoveredOptionId?.includes('J2_C') ||
    executingOption?.id.includes('cab') ||
    executingOption?.id.includes('taxi') ||
    executingOption?.id.includes('auto') ||
    transitionMode === 'cab_pickup';

  const isAutoHighlighted =
    hoveredOptionId?.includes('auto') ||
    hoveredOptionId?.includes('J2_B') ||
    executingOption?.id.includes('auto');

  // Dynamic Cinematic Transition Calculations
  let cabArrivalX = -320;
  let cabDoorOpen = false;
  let cabShowMisoPassenger = false;
  let misoCustomX = levelTheme === 'vet_clinic' ? 440 : levelTheme === 'cozy_home' ? 395 : 408;
  let misoCustomY = levelTheme === 'vet_clinic' ? 350 : levelTheme === 'cozy_home' ? 410 : 365;
  let isMisoVisible = true;
  let isMisoRunning = false;
  let misoRunCycle = 0;

  if (transitionMode === 'cab_pickup') {
    if (transitionTick <= 42) {
      // Phase 1: Cab arrives and decelerates to a stop at kerb (x = 270)
      const prog = transitionTick / 42;
      const easeOut = 1 - Math.pow(1 - prog, 2.8);
      cabArrivalX = -280 + (270 - (-280)) * easeOut;
    } else if (transitionTick <= 72) {
      // Phase 2: Cab parked at kerb, door swings open, Miso leaps in!
      cabArrivalX = 270;
      cabDoorOpen = true;
      const leapProg = (transitionTick - 42) / 30;
      const arc = Math.sin(leapProg * Math.PI) * 45;
      misoCustomX = 408 + (340 - 408) * leapProg;
      misoCustomY = 365 + (445 - 365) * leapProg - arc;
    } else {
      // Phase 3: Cab accelerates away to the right with Miso peeking out window!
      const prog = (transitionTick - 72) / (125 - 72);
      const easeIn = prog * prog * 1.25;
      cabArrivalX = 270 + (1250 - 270) * easeIn;
      cabDoorOpen = false;
      cabShowMisoPassenger = true;
      isMisoVisible = false; // Hidden on sidewalk, sitting safely inside cab!
    }
  } else if (transitionMode === 'vet_sprint') {
    isMisoRunning = true;
    misoRunCycle = transitionTick * 0.6;
    if (transitionTick <= 20) {
      // Phase 1: High spring leap from haven box to highway road
      const leapProg = transitionTick / 20;
      const arc = Math.sin(leapProg * Math.PI) * 40;
      misoCustomX = 408 + (475 - 408) * leapProg;
      misoCustomY = 365 + (460 - 365) * leapProg - arc;
    } else {
      // Phase 2: Galloping sprint across the highway to the right
      const prog = (transitionTick - 20) / (110 - 20);
      const easeRun = prog * prog * 0.4 + prog * 0.6;
      misoCustomX = 475 + (1200 - 475) * easeRun;
      misoCustomY = 460 + Math.abs(Math.sin(transitionTick * 0.6)) * -12;
    }
  } else {
    // Idle Preview Hover: If user hovers a cab/taxi option, tease the cab waiting near kerb
    if (isCabHighlighted) {
      cabArrivalX = 60;
    }
  }

  // Miso condition gauge
  const healthPercent = Math.min(100, 60 + levelNumber * 8);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden bg-slate-950 font-chunky text-slate-100 select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* =====================================================================
          1. TOP PRO-GAME ARCADE HUD (Status, Health, Time-of-Day, Controls)
          ===================================================================== */}
      <header className="relative z-30 flex-none px-3 py-2 bg-slate-900/95 border-b-2 border-slate-800 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg">
        {/* Left: Quest & Level Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-title text-[11px] font-black uppercase tracking-wider shadow-sm shrink-0">
            <Zap className="h-3 w-3 fill-slate-950" />
            <span>LVL {levelNumber}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-amber-400" />
              <span className="truncate">{sceneTitle}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans hidden sm:block truncate">
              {sceneSubtitle || (isMiso ? 'NH-48 Chai Tapri Junction' : 'Shivaji Park Fairgrounds')}
            </div>
          </div>
        </div>

        {/* Center: Vitality Gauge */}
        <div className="hidden md:flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300">
              {isMiso ? 'MISO HEALTH' : 'FAIR REPUTATION'}:
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((h) => (
              <span
                key={h}
                className={`text-xs transition-transform duration-300 ${
                  h <= Math.ceil(healthPercent / 20)
                    ? 'text-rose-500 scale-100'
                    : 'text-slate-700 scale-90'
                }`}
              >
                ❤️
              </span>
            ))}
            <span className="text-[10px] font-mono font-bold text-amber-400 ml-1">
              {healthPercent}%
            </span>
          </div>
        </div>

        {/* Right: Time-of-Day Switcher, Wallet & Utility Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Interactive Time-of-Day Pill */}
          <div className="hidden sm:inline-flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setTimeOfDay('day');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Sunny Day"
            >
              <Sun className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setTimeOfDay('dusk');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                timeOfDay === 'dusk' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Golden Sunset"
            >
              <Sunset className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setTimeOfDay('night');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                timeOfDay === 'night' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Starry Night"
            >
              <Moon className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Wallet Balance with Golden Coin */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-300 font-mono text-xs font-black shadow-inner">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>₹{walletBalance.toLocaleString('en-IN')}</span>
          </div>

          {/* View Mode Switcher: Poly 2D vs 3D */}
          {onToggleViewMode && (
            <button
              type="button"
              onClick={onToggleViewMode}
              title={`Switch to ${currentViewMode === 'poly2d' ? '3D Diorama' : 'Poly 2D'} View`}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              {currentViewMode === 'poly2d' ? (
                <>
                  <Layers className="h-3 w-3 text-cyan-400" />
                  <span className="hidden sm:inline">3D</span>
                </>
              ) : (
                <>
                  <Box className="h-3 w-3 text-amber-400" />
                  <span className="hidden sm:inline">2D</span>
                </>
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundFX.muted = next;
            }}
            title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-slate-500" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN STAGE CONTENT (MULTI-LEVEL POLY 2D DIORAMA + DECISION DECK)
          ===================================================================== */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* ===================================================================
            A. THE POLY 2D ANIMATED WORLD SCENE (58% on Desktop, 42% on Mobile)
            =================================================================== */}
        <div className="relative flex-none h-[42%] md:h-full md:flex-[58] w-full overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-slate-800 bg-slate-950">
          {/* Dynamic Scene Diagnostic Telemetry Chip in Top Left */}
          <div className="absolute top-2 left-3 z-20 pointer-events-none flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/85 border border-amber-400/40 text-[9px] font-mono font-bold text-amber-300 backdrop-blur-sm shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {levelTheme === 'highway_tapri' && 'NH-48 TAPRI · TEA 88°C · TRAFFIC ACTIVE'}
              {levelTheme === 'vet_clinic' && `ANIMAL CLINIC · 💓 ${clinicBpm} BPM · IV DRIP LIVE`}
              {levelTheme === 'cozy_home' && 'COZY HOME · 24°C · BUTTERFLIES IN FLIGHT'}
              {levelTheme === 'carnival_day' && 'MELA GROUNDS · FERRIS WHEEL SPINNING'}
              {levelTheme === 'carnival_rush' && 'PERIOD RUSH · POPCORN POPPING · HIGH TURNOVER'}
              {levelTheme === 'carnival_night' && 'NIGHT FINALE · NEON STROBE · CELEBRATION'}
            </span>
          </div>

          {/* SVG Low-Poly Master Diorama */}
          <svg
            className="w-full h-full object-cover cursor-pointer"
            viewBox="0 0 1000 650"
            preserveAspectRatio="xMidYMid slice"
            onClick={handleClickSky}
          >
            <defs>
              {/* Dynamic Sky Gradients */}
              {timeOfDay === 'day' ? (
                <linearGradient id="polySkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="45%" stopColor="#38bdf8" />
                  <stop offset="85%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
              ) : timeOfDay === 'night' ? (
                <linearGradient id="polySkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#020617" />
                  <stop offset="40%" stopColor="#0f172a" />
                  <stop offset="80%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              ) : (
                <linearGradient id="polySkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="35%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              )}

              {/* Road Gradient */}
              <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Awning Stripes */}
              <pattern id="awningStripes" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="15" height="30" fill="#f59e0b" />
                <rect x="15" width="15" height="30" fill="#fffbeb" />
              </pattern>

              {/* Grand Circus Big Top Stripes */}
              <pattern id="circusStripes" width="28" height="28" patternUnits="userSpaceOnUse">
                <rect width="14" height="28" fill="#dc2626" />
                <rect x="14" width="14" height="28" fill="#fffbeb" />
              </pattern>

              {/* Mela Fairground Stone Promenade Pavers */}
              <pattern id="fairgroundPavers" width="40" height="20" patternUnits="userSpaceOnUse">
                <rect width="40" height="20" fill="#9a3412" />
                <rect x="1" y="1" width="18" height="8" fill="#b45309" opacity="0.9" />
                <rect x="21" y="1" width="18" height="8" fill="#c2410c" opacity="0.85" />
                <rect x="11" y="11" width="18" height="8" fill="#b45309" opacity="0.9" />
                <rect x="31" y="11" width="8" height="8" fill="#c2410c" opacity="0.85" />
                <rect x="0" y="11" width="9" height="8" fill="#c2410c" opacity="0.85" />
              </pattern>

              {/* Siren Radial Glows */}
              <radialGradient id="sirenGlowRed">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sirenGlowBlue">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. SKY BACKGROUND */}
            <rect width="1000" height="650" fill="url(#polySkyGrad)" />

            {/* Celestial Body: Sun or Moon */}
            {timeOfDay === 'night' ? (
              <g transform="translate(820, 110)">
                <circle cx="0" cy="0" r="28" fill="#e2e8f0" opacity="0.9" />
                <circle cx="-10" cy="-6" r="24" fill="#0f172a" />
                {[
                  [120, 50], [240, 80], [350, 40], [480, 100], [600, 60],
                  [720, 90], [180, 160], [890, 80], [60, 110], [940, 140]
                ].map(([sx, sy], i) => (
                  <polygon
                    key={i}
                    points="0,-4 1,-1 4,0 1,1 0,4 -1,1 -4,0 -1,-1"
                    transform={`translate(${sx - 820}, ${sy - 110}) scale(${i % 2 === 0 ? 1.2 : 0.8})`}
                    fill="#fef08a"
                    opacity={((tick + i * 20) % 40) / 40 > 0.5 ? 0.9 : 0.3}
                  />
                ))}
              </g>
            ) : (
              <g transform="translate(820, 120)">
                <polygon
                  points="0,-40 10,-10 40,0 10,10 0,40 -10,10 -40,0 -10,-10"
                  fill="#fef08a"
                  opacity="0.8"
                />
                <circle cx="0" cy="0" r="30" fill="#fde047" opacity="0.95" />
              </g>
            )}

            {/* Drifting Clouds */}
            <g transform={`translate(${cloudX1 * 10}, 60)`} opacity="0.45">
              <polygon points="40,20 70,5 110,10 130,30 110,50 60,45 30,35" fill="#f8fafc" />
              <polygon points="60,15 90,8 120,25 90,40" fill="#e2e8f0" />
            </g>
            <g transform={`translate(${cloudX2 * 10}, 110)`} opacity="0.35">
              <polygon points="20,15 50,5 90,12 110,32 90,45 40,40" fill="#f8fafc" />
              <polygon points="40,10 70,8 95,25 70,35" fill="#cbd5e1" />
            </g>

            {/* ===============================================================
                LEVEL SCENE 1: HIGHWAY CHAI TAPRI (Miso Level 1 & 2)
                =============================================================== */}
            {levelTheme === 'highway_tapri' && (
              <g id="scene-highway-tapri">
                {/* Migrating V-Formation Flying Birds across Sky */}
                <g transform={`translate(${birdsX}, 110)`} opacity="0.8">
                  {[
                    [0, 0],
                    [22, -14],
                    [44, -26],
                    [66, -38],
                    [88, -50],
                  ].map(([bx, by], i) => (
                    <path
                      key={i}
                      d={`M ${bx - 10},${by + Math.sin(tick * 0.25 + i) * 5} Q ${bx - 5},${
                        by - 7 + Math.sin(tick * 0.25 + i) * 5
                      } ${bx},${by} Q ${bx + 5},${by - 7 + Math.sin(tick * 0.25 + i) * 5} ${
                        bx + 10
                      },${by + Math.sin(tick * 0.25 + i) * 5}`}
                      stroke="#0f172a"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  ))}
                </g>

                {/* Low-Poly Mountains */}
                <polygon
                  points="0,380 90,260 160,320 250,210 340,300 440,190 530,290 640,230 730,310 840,240 930,310 1000,280 1000,480 0,480"
                  fill="#1e293b"
                />
                <polygon points="90,260 160,320 120,380 50,380" fill="#334155" opacity="0.5" />
                <polygon points="250,210 340,300 290,380 200,380" fill="#475569" opacity="0.5" />
                <polygon points="440,190 530,290 480,380 390,380" fill="#334155" opacity="0.6" />

                {/* Swaying Indian Neem Tree on Left */}
                <g transform={`translate(70, 260) rotate(${neemSway}, 30, 240)`}>
                  <polygon points="20,240 45,240 40,80 15,80" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                  <polygon points="15,130 -10,70 5,60 25,120" fill="#78350f" />
                  <polygon points="35,110 65,60 50,50 25,100" fill="#78350f" />
                  <circle cx="28" cy="65" r="50" fill="#15803d" stroke="#14532d" strokeWidth="2" opacity="0.9" />
                  <circle cx="-5" cy="55" r="38" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" opacity="0.85" />
                  <circle cx="60" cy="50" r="38" fill="#15803d" stroke="#14532d" strokeWidth="1.5" opacity="0.85" />
                  <circle cx="25" cy="20" r="42" fill="#22c55e" stroke="#14532d" strokeWidth="2" opacity="0.9" />
                </g>

                {/* Animated Distant Highway Traffic (Cars/Trucks in distance) */}
                <g transform={`translate(${trafficX}, 372)`} opacity="0.85">
                  <polygon points="0,10 14,0 35,0 42,10 38,14 0,14" fill="#ef4444" />
                  <circle cx="8" cy="14" r="3" fill="#18181b" />
                  <circle cx="32" cy="14" r="3" fill="#18181b" />
                  {/* Passing Blue Truck */}
                  <g transform="translate(180, -6)">
                    <polygon points="0,16 0,0 28,0 38,8 38,16" fill="#0284c7" />
                    <circle cx="8" cy="16" r="3" fill="#18181b" />
                    <circle cx="28" cy="16" r="3" fill="#18181b" />
                  </g>
                </g>

                {/* Low-Poly Hills */}
                <polygon
                  points="0,420 110,360 210,400 320,350 450,410 590,370 720,415 860,365 1000,410 1000,520 0,520"
                  fill="#164e63"
                />

                {/* Pavement Sidewalk Base */}
                <polygon points="0,370 1000,370 1000,442 0,442" fill="#334155" opacity="0.4" />

                {/* Milestone Stone with Animated Roadside Pigeon */}
                <g transform="translate(180, 375)">
                  <polygon points="0,40 30,40 30,0 0,0" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
                  <polygon points="0,0 15,-18 30,0" fill="#f59e0b" />
                  <text x="15" y="-3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="900">
                    NH-48
                  </text>
                  <text x="15" y="24" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="900">
                    24 KM
                  </text>
                  {/* Roadside Pigeon Pecking at Crumbs */}
                  <g transform={`translate(-28, ${32 + pigeonHop})`}>
                    <polygon points="0,8 8,0 14,2 10,12 2,12" fill="#64748b" />
                    <circle cx="14" cy="2" r="3" fill="#94a3b8" />
                    <polygon points="17,2 20,4 17,5" fill="#f59e0b" />
                  </g>
                </g>

                {/* Drifting Falling Leaves from Roadside Trees */}
                {[
                  [280, 460], [330, 480], [510, 470], [680, 490]
                ].map(([lx, ly], i) => (
                  <g
                    key={i}
                    transform={`translate(${lx + Math.sin(tick * 0.05 + i) * 20}, ${
                      ly + Math.cos(tick * 0.04 + i) * 10
                    }) rotate(${Math.sin(tick * 0.1 + i) * 30})`}
                  >
                    <polygon points="0,0 6,-8 12,0 6,4" fill={i % 2 === 0 ? '#15803d' : '#f59e0b'} opacity="0.8" />
                  </g>
                ))}

                {/* Ramesh Chai Tapri */}
                <g transform="translate(620, 290)">
                  <polygon points="20,160 32,160 32,0 20,0" fill="#78350f" />
                  <polygon points="240,160 252,160 252,0 240,0" fill="#5c260b" />
                  <polygon points="30,30 245,30 245,150 30,150" fill="#92400e" opacity="0.6" />
                  <polygon points="10,110 260,110 270,160 0,160" fill="#b45309" />
                  <polygon points="-10,0 280,0 295,45 -25,45" fill="url(#awningStripes)" />

                  <g transform="translate(75, 48)">
                    <polygon points="0,0 120,0 115,30 5,30" fill="#0f172a" stroke="#facc15" strokeWidth="2" />
                    <text x="60" y="19" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="900" fontFamily="Fredoka, cursive">
                      RAMESH CHAI TAPRI
                    </text>
                  </g>

                  {/* Steel Tea Kettle with Live Chai Stream Pouring into Glass */}
                  <g
                    transform="translate(65, 88)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickKettle();
                    }}
                  >
                    {/* Flickering Gas Stove Flame under Kettle */}
                    <g transform="translate(14, 28)">
                      <rect x="-4" y="0" width="28" height="3" fill="#334155" rx="1" />
                      {/* Blue Core Flame */}
                      <path
                        d={`M 0,0 Q 5,${-8 + flameWave} 10,0 Q 15,${-10 - flameWave} 20,0`}
                        fill="#38bdf8"
                        opacity="0.9"
                      />
                      {/* Yellow Middle Flame */}
                      <path
                        d={`M -2,0 Q 5,${-14 - flameWave} 10,0 Q 15,${-13 + flameWave} 22,0`}
                        fill="#facc15"
                        opacity="0.85"
                      />
                    </g>

                    <polygon points="10,25 35,25 40,0 5,0" fill="#94a3b8" />
                    <polygon points="20,25 35,25 40,0 25,0" fill="#cbd5e1" />
                    <polygon points="40,10 52,4 50,0 38,5" fill="#cbd5e1" />
                    <path d="M 8,0 Q 22,-18 37,0" stroke="#475569" strokeWidth="4" fill="none" />

                    {/* Animated Golden Chai Pouring Stream */}
                    <path
                      d="M 50,2 Q 53,16 54,32"
                      stroke="#d97706"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Splash Droplets */}
                    <circle cx="53" cy="30" r="1.5" fill="#f59e0b" />
                    <circle cx="56" cy="28" r="1" fill="#f59e0b" />

                    {/* Animated Steam */}
                    <g transform={`translate(52, ${-kettleSteam1Y * 0.4})`} opacity={Math.max(0, 1 - kettleSteam1Y / 80)}>
                      <polygon points="0,0 8,-6 14,0 8,8" fill="#f8fafc" />
                    </g>
                    <g transform={`translate(56, ${-kettleSteam2Y * 0.4})`} opacity={Math.max(0, 1 - kettleSteam2Y / 80)}>
                      <polygon points="0,0 10,-8 18,0 10,10" fill="#f8fafc" />
                    </g>
                    {extraSteamPuff && (
                      <g transform="translate(50, -40)" className="animate-ping">
                        <circle cx="10" cy="10" r="20" fill="#f8fafc" opacity="0.8" />
                      </g>
                    )}
                  </g>

                  {/* Ramesh Kaka */}
                  <g transform="translate(180, 25)">
                    <polygon points="10,95 45,95 40,40 15,40" fill="#2563eb" />
                    <circle cx="27" cy="5" r="16" fill="#d97706" />
                    <path d="M 17,9 Q 27,15 37,9 Q 27,2 17,9" fill="#1e293b" />
                    <polygon points="12,-8 42,-8 37,-18 17,-18" fill="#f8fafc" />
                    <g transform={`rotate(${Math.sin(tick * 0.15) * 12}, 15, 45)`}>
                      <line x1="15" y1="45" x2="-8" y2="60" stroke="#d97706" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="-8" cy="60" r="5" fill="#94a3b8" />
                    </g>
                  </g>
                </g>

                {/* Miso in Cardboard Box (Highway Sidewalk Haven) */}
                <g transform="translate(380, 345)">
                  <polygon points="0,40 105,40 115,85 -5,85" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
                  <polygon points="0,40 105,40 98,45 7,45" fill="#d97706" />
                  <text x="50" y="70" textAnchor="middle" fill="#78350f" fontSize="9.5" fontWeight="900" fontFamily="Fredoka, cursive">
                    MISO&#39;S HAVEN
                  </text>
                  <ellipse cx="132" cy="78" rx="16" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                  <ellipse cx="132" cy="77" rx="12" ry="4" fill="#fef08a" />
                </g>

                {/* Roadside Kerb Divider */}
                {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((kx, i) => (
                  <polygon
                    key={kx}
                    points={`${kx},438 ${kx + 100},438 ${kx + 95},448 ${kx - 5},448`}
                    fill={i % 2 === 0 ? '#f8fafc' : '#dc2626'}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                ))}

                {/* Highway Asphalt Road & Dashed Center Divider Line */}
                <polygon points="0,448 1000,448 1000,650 0,650" fill="url(#roadGrad)" />
                <polygon points="40,532 120,532 140,542 30,542" fill="#facc15" />
                <polygon points="220,532 320,532 340,542 210,542" fill="#facc15" />
                <polygon points="430,532 550,532 570,542 420,542" fill="#facc15" />
                <polygon points="660,532 790,532 810,542 650,542" fill="#facc15" />
                <polygon points="900,532 1000,532 1000,542 890,542" fill="#facc15" />
              </g>
            )}

            {/* ===============================================================
                LEVEL SCENE 2: DR. KAVITA'S VET CLINIC (Miso Level 3 & 4)
                =============================================================== */}
            {levelTheme === 'vet_clinic' && (
              <g id="scene-vet-clinic">
                <polygon points="0,0 1000,0 1000,420 0,420" fill="#0f766e" />
                <polygon points="0,420 1000,420 1000,650 0,650" fill="#134e4a" />
                {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((tx) => (
                  <line key={tx} x1={tx} y1="420" x2={tx + 50} y2="650" stroke="#115e59" strokeWidth="2" opacity="0.6" />
                ))}

                <g transform="translate(340, 40)">
                  <polygon points="0,0 320,0 310,40 10,40" fill="#14b8a6" stroke="#ccfbf1" strokeWidth="2" />
                  <text x="160" y="26" textAnchor="middle" fill="#042f2e" fontSize="14" fontWeight="900" fontFamily="Fredoka, cursive">
                    🏥 DR. KAVITA · ANIMAL CARE CLINIC
                  </text>
                </g>

                {/* Paw X-Ray Lightbox with Moving Laser Scanner Beam */}
                <g transform="translate(140, 110)">
                  <rect x="0" y="0" width="160" height="130" fill="#020617" stroke="#14b8a6" strokeWidth="4" rx="6" />
                  <text x="80" y="24" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                    PAW RADIOGRAPH · MISO
                  </text>
                  <circle cx="80" cy="70" r="18" fill="#38bdf8" opacity="0.75" />
                  <circle cx="62" cy="50" r="6" fill="#38bdf8" opacity="0.8" />
                  <circle cx="74" cy="42" r="6" fill="#38bdf8" opacity="0.8" />
                  <circle cx="86" cy="42" r="6" fill="#38bdf8" opacity="0.8" />
                  <circle cx="98" cy="50" r="6" fill="#38bdf8" opacity="0.8" />
                  <rect x="75" y="88" width="10" height="25" fill="#38bdf8" opacity="0.75" rx="3" />

                  {/* Laser Scanning Beam Line */}
                  <line
                    x1="6"
                    y1={scannerBeamY}
                    x2="154"
                    y2={scannerBeamY}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    opacity="0.9"
                  />
                  <polygon
                    points={`6,${scannerBeamY - 4} 154,${scannerBeamY - 4} 154,${scannerBeamY + 4} 6,${scannerBeamY + 4}`}
                    fill="#38bdf8"
                    opacity="0.18"
                  />

                  <text x="80" y="122" textAnchor="middle" fill="#4ade80" fontSize="8" fontWeight="bold">
                    ✓ STATUS: BONE RECOVERY EXCELLENT
                  </text>
                </g>

                {/* Animated Cardiac EKG Monitor with Fluctuating BPM */}
                <g transform="translate(700, 110)">
                  <rect x="0" y="0" width="170" height="120" fill="#020617" stroke="#38bdf8" strokeWidth="3" rx="6" />
                  <text x="85" y="20" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="black">
                    💓 PULSE: {clinicBpm} BPM · OPTIMAL
                  </text>
                  <path
                    d={`M 10,70 L 40,70 L 50,45 L 60,90 L 70,70 L 100,70 L 110,45 L 120,90 L 130,70 L 160,70`}
                    stroke="#4ade80"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="160"
                    strokeDashoffset={heartEkgOffset}
                  />
                  <text x="85" y="105" textAnchor="middle" fill="#38bdf8" fontSize="8">
                    VITAL SIGNS STABILIZED
                  </text>
                </g>

                {/* Stainless Medical Exam Table */}
                <g transform="translate(320, 360)">
                  <rect x="30" y="70" width="14" height="120" fill="#94a3b8" />
                  <rect x="315" y="70" width="14" height="120" fill="#64748b" />
                  <polygon points="10,60 350,60 360,75 0,75" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                  <polygon points="20,45 340,45 345,60 15,60" fill="#c084fc" />

                  {/* Expanding Ultrasonic Diagnostic Wave Ripples */}
                  {ultrasoundRipples.map((r, idx) => (
                    <circle
                      key={idx}
                      cx="120"
                      cy="48"
                      r={r.r}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      opacity={r.op}
                    />
                  ))}

                  {/* Pulsing Green Healing Aura Rings radiating from table */}
                  <circle
                    cx="120"
                    cy="52"
                    r={20 + (tick % 40)}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    opacity={Math.max(0, 1 - (tick % 40) / 40)}
                  />

                  {/* Floating Green Healing Crosses */}
                  {floatingHealingCrosses.map((c, idx) => (
                    <g key={idx} transform={`translate(${c.x - 320}, ${c.y - 360})`} opacity={c.op}>
                      <rect x="-2" y="-7" width="4" height="14" fill="#22c55e" rx="1.5" />
                      <rect x="-7" y="-2" width="14" height="4" fill="#22c55e" rx="1.5" />
                    </g>
                  ))}
                </g>

                {/* IV Drip Stand with Animated Falling Droplets & Rising Bubbles */}
                <g transform="translate(260, 240)">
                  <line x1="20" y1="0" x2="20" y2="280" stroke="#94a3b8" strokeWidth="4" />
                  <rect x="8" y="20" width="24" height="40" fill="#e0f2fe" opacity="0.85" rx="6" stroke="#38bdf8" strokeWidth="2" />
                  {/* Rising Air Bubbles inside IV Bottle */}
                  <circle cx="16" cy={50 - ivBubbleY} r="1.5" fill="#ffffff" opacity="0.8" />
                  <circle cx="23" cy={44 - ((ivBubbleY + 16) % 30)} r="1.2" fill="#ffffff" opacity="0.75" />
                  {/* Droplet in chamber */}
                  <circle cx="20" cy={32 + ivDropY * 0.6} r="2.5" fill="#38bdf8" />
                  <path d="M 20,60 Q 40,140 70,180" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" />
                </g>

                {/* Dr. Kavita Standing by Table */}
                <g transform="translate(640, 260)">
                  <polygon points="15,180 65,180 55,70 25,70" fill="#0d9488" />
                  <circle cx="40" cy="35" r="22" fill="#d97706" />
                  <polygon points="56,25 76,18 72,44" fill="#1e293b" />
                  <rect x="50" y="110" width="28" height="22" fill="#ef4444" rx="3" />
                  <rect x="61" y="115" width="6" height="12" fill="#ffffff" />
                  <rect x="58" y="118" width="12" height="6" fill="#ffffff" />
                  <path d="M 30,55 Q 40,75 50,55" stroke="#38bdf8" strokeWidth="4" fill="none" />
                </g>
              </g>
            )}

            {/* ===============================================================
                LEVEL SCENE 3: COZY FOREVER HOME & SUNNY GARDEN (Miso Level 5, 6 & 7)
                =============================================================== */}
            {levelTheme === 'cozy_home' && (
              <g id="scene-cozy-home">
                <polygon points="0,0 1000,0 1000,420 0,420" fill="#fef3c7" />
                <polygon points="0,420 1000,420 1000,650 0,650" fill="#b45309" />
                {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960].map((wx) => (
                  <line key={wx} x1={wx} y1="420" x2={wx + 30} y2="650" stroke="#78350f" strokeWidth="2" opacity="0.4" />
                ))}

                {/* Grandfather Wall Clock with Moving Brass Pendulum */}
                <g transform="translate(420, 45)">
                  <rect x="0" y="0" width="46" height="90" fill="#78350f" stroke="#451a03" strokeWidth="3" rx="4" />
                  <circle cx="23" cy="28" r="16" fill="#fffbeb" />
                  <line x1="23" y1="28" x2="23" y2="18" stroke="#1e293b" strokeWidth="2" />
                  <line x1="23" y1="28" x2="30" y2="28" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Swinging Pendulum */}
                  <g transform={`translate(23, 46) rotate(${clockPendulum}, 0, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="34" stroke="#facc15" strokeWidth="2" />
                    <circle cx="0" cy="36" r="6" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
                  </g>
                </g>

                {/* Large Panoramic Garden Window */}
                <g transform="translate(560, 60)">
                  <rect x="0" y="0" width="380" height="260" fill="#bae6fd" stroke="#78350f" strokeWidth="8" rx="8" />
                  <polygon points="0,200 380,200 380,260 0,260" fill="#15803d" />
                  {[40, 110, 180, 250, 320].map((fx, i) => (
                    <g key={fx} transform={`translate(${fx}, 180)`}>
                      <line x1="0" y1="0" x2="0" y2="25" stroke="#166534" strokeWidth="3" />
                      <circle cx="0" cy="0" r="10" fill={i % 2 === 0 ? '#facc15' : '#f43f5e'} />
                      <circle cx="0" cy="0" r="4" fill="#78350f" />
                    </g>
                  ))}
                  <line x1="190" y1="0" x2="190" y2="260" stroke="#78350f" strokeWidth="5" />
                  <line x1="0" y1="130" x2="380" y2="130" stroke="#78350f" strokeWidth="5" />

                  {/* Golden Sunbeams with Floating Dust Motes */}
                  <polygon points="0,0 240,260 0,260" fill="#fef08a" opacity="0.22" />
                  {[
                    [30, 40], [60, 100], [45, 160], [90, 80], [120, 180], [150, 220]
                  ].map(([mx, my], i) => (
                    <circle
                      key={i}
                      cx={mx + Math.sin(tick * 0.04 + i) * 8}
                      cy={my + Math.cos(tick * 0.03 + i) * 6}
                      r="2"
                      fill="#ffffff"
                      opacity={0.8}
                    />
                  ))}

                  {/* Glass Fishbowl on Windowsill */}
                  <g
                    transform="translate(240, 150)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickFish();
                    }}
                  >
                    <circle cx="30" cy="30" r="28" fill="#bae6fd" opacity="0.65" stroke="#7dd3fc" strokeWidth="2" />
                    <ellipse cx="30" cy="18" rx="24" ry="6" fill="#38bdf8" opacity="0.4" />
                    <path d="M 18,50 Q 12,35 20,24" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 40,50 Q 46,38 38,26" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
                    {/* Swimming Goldfish */}
                    <g transform={`translate(${30 + fishSwim}, 34)`}>
                      <ellipse cx="0" cy="0" rx="9" ry="5" fill="#f97316" />
                      <g transform={`rotate(${fishTail}, -8, 0)`}>
                        <polygon points="-8,0 -16,-6 -14,0 -16,6" fill="#ea580c" />
                      </g>
                      <circle cx="5" cy="-1.5" r="1.5" fill="#ffffff" />
                      <circle cx="6" cy="-1.5" r="0.8" fill="#18181b" />
                    </g>
                    {/* Bubbles */}
                    {fishBubbles.map((b, i) => (
                      <circle key={i} cx={28 + i * 5} cy={b.y - 170} r="1.6" fill="#ffffff" opacity={b.op} />
                    ))}
                    <rect x="8" y="58" width="44" height="11" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                    <text x="30" y="66" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="bold">
                      FEED FISH 🐟
                    </text>
                  </g>
                </g>

                {/* Sleepy Comic Zzz Letters Floating above Miso */}
                {sleepyZ.map((z, idx) => (
                  <text
                    key={idx}
                    x={z.x}
                    y={z.y}
                    fill="#c084fc"
                    fontSize={14 * z.scale}
                    fontWeight="900"
                    fontFamily="Fredoka, cursive"
                    opacity={z.opacity}
                  >
                    {idx === 0 ? 'Z' : idx === 1 ? 'z' : '·'}
                  </text>
                ))}

                {/* Animated Butterflies in Flight (Monarch & Azure) */}
                <g transform={`translate(${butterflyX1}, ${butterflyY1})`}>
                  <polygon points="0,0 -8,-10 -2,-14 0,0" fill="#f43f5e" />
                  <polygon points="0,0 8,-10 2,-14 0,0" fill="#f43f5e" />
                  <circle cx="0" cy="-4" r="2" fill="#1e293b" />
                </g>
                <g transform={`translate(${butterflyX2}, ${butterflyY2})`}>
                  <polygon points="0,0 -7,-9 -2,-12 0,0" fill="#38bdf8" />
                  <polygon points="0,0 7,-9 2,-12 0,0" fill="#38bdf8" />
                  <circle cx="0" cy="-4" r="1.5" fill="#1e293b" />
                </g>

                {/* Multi-Tier Wooden Cat Tree with Dangling Bell */}
                <g
                  transform="translate(120, 140)"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickCatTree();
                  }}
                >
                  <rect x="40" y="100" width="16" height="230" fill="#d97706" />
                  <polygon points="0,330 100,330 110,350 -10,350" fill="#92400e" />
                  <polygon points="10,210 90,210 95,225 5,225" fill="#f59e0b" />
                  <polygon points="20,90 80,90 85,105 15,105" fill="#f59e0b" />
                  <g transform={`translate(28, 105) rotate(${bellRinging ? Math.sin(tick * 0.5) * 35 : Math.sin(tick * 0.1) * 8}, 0, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="28" stroke="#475569" strokeWidth="2" />
                    <circle cx="0" cy="32" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  </g>
                </g>

                {/* Interactive Red Yarn Ball on Floor */}
                <g
                  transform={`translate(${510 + yarnRollX}, 475)`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickYarn();
                  }}
                >
                  <circle cx="0" cy="0" r="14" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
                  <path d="M -8,0 Q 0,-8 8,0 Q 0,8 -8,0" stroke="#fbcfe8" strokeWidth="2" fill="none" />
                  <path d="M 0,0 Q 20,10 32,-4" stroke="#ec4899" strokeWidth="2" fill="none" />
                </g>

                {/* Shelf with Rescue Champion Trophy */}
                <g transform="translate(100, 60)">
                  <polygon points="0,20 180,20 175,32 5,32" fill="#78350f" />
                  <g transform="translate(80, -10)">
                    <polygon points="0,0 24,0 20,18 4,18" fill="#facc15" stroke="#b45309" strokeWidth="1" />
                    <polygon points="8,18 16,18 18,28 6,28" fill="#ca8a04" />
                    <text x="12" y="12" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="bold">
                      🏆
                    </text>
                  </g>
                </g>

                {/* Plush Royal Cat Bed on Floor */}
                <g transform="translate(360, 420)">
                  <ellipse cx="60" cy="50" rx="85" ry="34" fill="#f43f5e" />
                  <ellipse cx="60" cy="46" rx="72" ry="26" fill="#fecdd3" />
                  <ellipse cx="180" cy="65" rx="22" ry="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <text x="180" y="68" textAnchor="middle" fontSize="11">🐟</text>
                </g>
              </g>
            )}

            {/* ===============================================================
                LEVEL SCENE 4: CARNIVAL GROUNDS (Funfair Founder All Levels)
                =============================================================== */}
            {!isMiso && (
              <g id="scene-carnival">
                {/* 1. DISTANT HORIZON & PARK TREELINE */}
                <g id="carnival-horizon">
                  {/* Rolling deep green treeline behind the fairground */}
                  <polygon
                    points="0,430 45,395 90,420 140,385 200,415 270,380 340,410 420,375 500,405 580,370 660,400 740,370 820,400 900,375 960,410 1000,390 1000,470 0,470"
                    fill={levelTheme === 'carnival_night' ? '#0a192f' : '#14532d'}
                  />
                  <polygon
                    points="20,430 70,405 120,425 180,395 240,420 310,390 390,418 460,385 540,412 620,382 700,410 780,385 860,412 930,390 1000,420 1000,470 0,470"
                    fill={levelTheme === 'carnival_night' ? '#0f2942' : '#166534'}
                    opacity="0.8"
                  />
                  {/* Distant Park Grass Turf */}
                  <polygon points="0,430 1000,430 1000,470 0,470" fill={levelTheme === 'carnival_night' ? '#0f172a' : '#15803d'} />
                </g>

                {/* 2. DISTANT ROLLER COASTER WOODEN TRESTLE & ZOOMING COASTER TRAIN */}
                <g id="roller-coaster-trestle" opacity={levelTheme === 'carnival_night' ? '0.45' : '0.85'}>
                  {/* Wooden Trestle Support Towers */}
                  {[60, 160, 260, 360, 480, 600, 720, 840, 940].map((tx) => (
                    <g key={tx}>
                      <line x1={tx - 18} y1="430" x2={tx} y2="240" stroke="#78350f" strokeWidth="2.5" />
                      <line x1={tx + 18} y1="430" x2={tx} y2="240" stroke="#78350f" strokeWidth="2.5" />
                      <line x1={tx - 14} y1="360" x2={tx + 14} y2="360" stroke="#9a3412" strokeWidth="1.5" />
                      <line x1={tx - 8} y1="300" x2={tx + 8} y2="300" stroke="#9a3412" strokeWidth="1.5" />
                      <line x1={tx - 14} y1="360" x2={tx + 8} y2="300" stroke="#78350f" strokeWidth="1" opacity="0.6" />
                      <line x1={tx + 14} y1="360" x2={tx - 8} y2="300" stroke="#78350f" strokeWidth="1" opacity="0.6" />
                    </g>
                  ))}
                  {/* Swooping Undulating Steel Tracks */}
                  <path
                    d="M -30,280 C 100,190 220,330 360,230 S 560,170 720,280 S 900,195 1030,265"
                    stroke="#dc2626"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M -30,286 C 100,196 220,336 360,236 S 560,176 720,286 S 900,201 1030,271"
                    stroke="#b91c1c"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  {/* Zooming Roller Coaster Train */}
                  <g transform={`translate(${coasterTrainX}, 215)`}>
                    {/* Cart 1: Locomotive */}
                    <rect x="0" y="0" width="28" height="15" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                    <circle cx="6" cy="16" r="3" fill="#1e293b" />
                    <circle cx="22" cy="16" r="3" fill="#1e293b" />
                    <circle cx="10" cy="-3" r="4" fill="#ef4444" />
                    <text x="14" y="10" textAnchor="middle" fontSize="8">🎢</text>
                    {/* Cart 2: Blue passenger cart */}
                    <rect x="32" y="1" width="24" height="14" rx="2" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                    <circle cx="38" cy="16" r="3" fill="#1e293b" />
                    <circle cx="50" cy="16" r="3" fill="#1e293b" />
                    <circle cx="44" cy="-2" r="3.5" fill="#facc15" />
                    {/* Cart 3: Emerald passenger cart */}
                    <rect x="60" y="2" width="24" height="13" rx="2" fill="#10b981" stroke="#047857" strokeWidth="1" />
                    <circle cx="66" cy="16" r="3" fill="#1e293b" />
                    <circle cx="78" cy="16" r="3" fill="#1e293b" />
                    <circle cx="72" cy="-2" r="3.5" fill="#ec4899" />
                  </g>
                </g>

                {/* 3. FLOATING ANAND MELA HOT AIR BALLOON IN SKY */}
                <g
                  transform={`translate(${hotAirBalloonX}, ${hotAirBalloonY})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickSky(e);
                  }}
                >
                  {/* Balloon Teardrop Envelope */}
                  <ellipse cx="0" cy="0" rx="38" ry="46" fill="#dc2626" />
                  {/* Striped colorful segments */}
                  <path d="M 0,-46 C -18,-30 -22,15 0,46 C 22,15 18,-30 0,-46 Z" fill="#f59e0b" />
                  <path d="M 0,-46 C -9,-30 -11,15 0,46 C 11,15 9,-30 0,-46 Z" fill="#fffbeb" />
                  <polygon points="-12,46 12,46 8,56 -8,56" fill="#b45309" />
                  {/* Burner Flame */}
                  <polygon points="-3,56 3,56 0,62" fill="#ef4444" className="animate-pulse" />
                  {/* Suspension Cables */}
                  <line x1="-7" y1="56" x2="-10" y2="68" stroke="#78350f" strokeWidth="1" />
                  <line x1="7" y1="56" x2="10" y2="68" stroke="#78350f" strokeWidth="1" />
                  {/* Wicker Passenger Basket */}
                  <rect x="-12" y="68" width="24" height="15" rx="2" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.2" />
                  <line x1="-12" y1="75" x2="12" y2="75" stroke="#854d0e" strokeWidth="1" />
                  <text x="0" y="79" textAnchor="middle" fontSize="7" fill="#451a03" fontWeight="bold">
                    MELA
                  </text>
                </g>

                {/* 4. OVERHEAD FESTOON BUNTING & TWINKLING FAIRY LIGHTS (CRISS-CROSSING SKY) */}
                <g id="carnival-festoon-bunting">
                  {/* Festoon Cable 1: Circus Mast to Central Stall */}
                  <path
                    d="M 60,220 Q 210,310 380,240"
                    stroke="#1e293b"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.8"
                  />
                  {/* Festoon Cable 2: Central Stall to Ferris Wheel Mast */}
                  <path
                    d="M 380,240 Q 580,315 780,240"
                    stroke="#1e293b"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.8"
                  />
                  {/* Festoon Cable 3: Ferris Wheel to Right Perimeter */}
                  <path
                    d="M 780,240 Q 890,290 990,225"
                    stroke="#1e293b"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Swaying Triangular Bunting Flags along Cable 1 */}
                  {[
                    { x: 90, y: 245, col: '#ef4444' },
                    { x: 130, y: 265, col: '#facc15' },
                    { x: 175, y: 280, col: '#3b82f6' },
                    { x: 220, y: 288, col: '#10b981' },
                    { x: 265, y: 285, col: '#f97316' },
                    { x: 310, y: 275, col: '#ec4899' },
                    { x: 350, y: 255, col: '#a855f7' },
                  ].map((flag, idx) => (
                    <polygon
                      key={`b1-${idx}`}
                      points={`${flag.x},${flag.y} ${flag.x + 13},${flag.y + 1} ${flag.x + 6 + buntingWave},${flag.y + 16}`}
                      fill={flag.col}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* Swaying Triangular Bunting Flags along Cable 2 */}
                  {[
                    { x: 415, y: 255, col: '#10b981' },
                    { x: 460, y: 272, col: '#ef4444' },
                    { x: 505, y: 285, col: '#facc15' },
                    { x: 555, y: 290, col: '#3b82f6' },
                    { x: 610, y: 288, col: '#f97316' },
                    { x: 660, y: 278, col: '#ec4899' },
                    { x: 710, y: 262, col: '#10b981' },
                    { x: 750, y: 248, col: '#facc15' },
                  ].map((flag, idx) => (
                    <polygon
                      key={`b2-${idx}`}
                      points={`${flag.x},${flag.y} ${flag.x + 13},${flag.y + 1} ${flag.x + 6 + buntingWave},${flag.y + 16}`}
                      fill={flag.col}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* Glowing Festoon Fairy Light Bulbs */}
                  {[
                    { x: 110, y: 255, c: '#fef08a' },
                    { x: 155, y: 275, c: '#fde047' },
                    { x: 200, y: 286, c: '#38bdf8' },
                    { x: 245, y: 288, c: '#ec4899' },
                    { x: 290, y: 282, c: '#fef08a' },
                    { x: 330, y: 265, c: '#fde047' },
                    { x: 440, y: 264, c: '#fef08a' },
                    { x: 485, y: 280, c: '#ec4899' },
                    { x: 530, y: 288, c: '#38bdf8' },
                    { x: 585, y: 290, c: '#fde047' },
                    { x: 635, y: 285, c: '#fef08a' },
                    { x: 685, y: 270, c: '#4ade80' },
                    { x: 730, y: 255, c: '#fef08a' },
                    { x: 835, y: 265, c: '#fde047' },
                    { x: 890, y: 275, c: '#ec4899' },
                    { x: 945, y: 260, c: '#38bdf8' },
                  ].map((bulb, idx) => {
                    const isLit = (idx + Math.floor(tick / 10)) % 2 === 0;
                    return (
                      <g key={`bulb-${idx}`}>
                        <line x1={bulb.x} y1={bulb.y} x2={bulb.x} y2={bulb.y + 5} stroke="#0f172a" strokeWidth="1" />
                        <circle
                          cx={bulb.x}
                          cy={bulb.y + 8}
                          r={isLit ? 3.8 : 2.5}
                          fill={isLit ? bulb.c : '#ca8a04'}
                          opacity={isLit ? 1 : 0.65}
                          stroke="#ffffff"
                          strokeWidth="0.5"
                        />
                        {isLit && (
                          <circle cx={bulb.x} cy={bulb.y + 8} r="7" fill={bulb.c} opacity="0.25" />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* 5. GRAND ROYAL BIG TOP CIRCUS ("ROYAL SHIVAJI CIRCUS 🎪") */}
                <g
                  id="grand-circus-tent"
                  transform="translate(40, 210)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickCircus();
                  }}
                >
                  {/* Central Mast Poles */}
                  <line x1="75" y1="-25" x2="75" y2="240" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />
                  <line x1="165" y1="-15" x2="165" y2="240" stroke="#ca8a04" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="75" cy="-25" r="5" fill="#facc15" stroke="#78350f" strokeWidth="1" />
                  <circle cx="165" cy="-15" r="4.5" fill="#facc15" stroke="#78350f" strokeWidth="1" />

                  {/* Grand Swallowtail Crimson Pennants Waving */}
                  <path
                    d={`M 75,-25 L ${115 + circusPennantWave},-20 L 105,-12 L ${118 + circusPennantWave},-4 L 75,-10 Z`}
                    fill="#ef4444"
                    stroke="#b91c1c"
                    strokeWidth="1"
                  />
                  <path
                    d={`M 165,-15 L ${198 + circusPennantWave},-10 L 190,-4 L ${200 + circusPennantWave},3 L 165,-2 Z`}
                    fill="#facc15"
                    stroke="#b45309"
                    strokeWidth="1"
                  />

                  {/* Main Circus Big Top Canopy (Double Peak Stripes) */}
                  <polygon
                    points="0,210 240,210 165,-15 120,40 75,-25"
                    fill="url(#circusStripes)"
                    stroke="#991b1b"
                    strokeWidth="2"
                  />
                  {/* Valance Fringe Scallops */}
                  <path
                    d="M 0,210 Q 15,222 30,210 Q 45,222 60,210 Q 75,222 90,210 Q 105,222 120,210 Q 135,222 150,210 Q 165,222 180,210 Q 195,222 210,210 Q 225,222 240,210"
                    fill="#facc15"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                  />
                  {/* Grand Circus Wall Base */}
                  <polygon points="10,210 230,210 235,245 5,245" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />

                  {/* Arched Grand Entrance with Rich Velvet Curtains */}
                  <path d="M 90,245 L 90,165 Q 120,135 150,165 L 150,245 Z" fill="#0f172a" />
                  {/* Warm interior spotlight glow */}
                  <ellipse cx="120" cy="235" rx="24" ry="12" fill="#fef08a" opacity="0.6" />
                  {/* Tied-back draped crimson curtains */}
                  <path d="M 90,165 Q 105,195 95,245 L 90,245 Z" fill="#b91c1c" stroke="#facc15" strokeWidth="1" />
                  <path d="M 150,165 Q 135,195 145,245 L 150,245 Z" fill="#b91c1c" stroke="#facc15" strokeWidth="1" />
                  <circle cx="97" cy="205" r="3" fill="#facc15" />
                  <circle cx="143" cy="205" r="3" fill="#facc15" />

                  {/* Circus Gold Arch Marquee Sign */}
                  <rect x="50" y="115" width="140" height="24" rx="4" fill="#7f1d1d" stroke="#facc15" strokeWidth="2" />
                  <text
                    x="120"
                    y="131"
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="9.5"
                    fontWeight="900"
                    fontFamily="Fredoka, cursive"
                    letterSpacing="0.8"
                  >
                    ROYAL CIRCUS 🎪
                  </text>
                  {circusFanfare && (
                    <g transform="translate(120, 80)" className="animate-bounce">
                      <rect x="-45" y="-12" width="90" height="20" rx="4" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
                      <text x="0" y="2" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">
                        🎺 GRAND GALA!
                      </text>
                    </g>
                  )}

                  {/* Carnival Game Booth on Right of Circus: Balloon Target Shooting ("GUBBARE SHOOTING") */}
                  <g transform="translate(245, 175)">
                    {/* Booth Wooden Shed Frame */}
                    <rect x="0" y="15" width="65" height="55" fill="#78350f" stroke="#451a03" strokeWidth="1.5" rx="3" />
                    <rect x="3" y="18" width="59" height="36" fill="#1e293b" />
                    {/* Awning for Booth */}
                    <polygon points="-4,15 69,15 64,2 1,2" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                    {/* Target Balloons on Wooden Grid */}
                    <circle cx="14" cy="26" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="26" cy="26" r="4.5" fill="#facc15" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="38" cy="26" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="50" cy="26" r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="20" cy="38" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="32" cy="38" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="0.5" />
                    <circle cx="44" cy="38" r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="0.5" />
                    {/* Cork Gun Rifle on Counter */}
                    <line x1="8" y1="56" x2="35" y2="54" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Hanging Plush Teddy Bear Prize */}
                    <text x="54" y="58" fontSize="11">🧸</text>
                    {/* Booth Signboard */}
                    <rect x="2" y="5" width="61" height="11" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                    <text x="32.5" y="13.5" textAnchor="middle" fill="#854d0e" fontSize="5.5" fontWeight="900">
                      🎯 GUBBARE ₹10
                    </text>
                  </g>
                </g>

                {/* 6. THE GIANT FERRIS WHEEL ("RANI KA JHOOLA 🎡") WITH TICKET COUNTER */}
                <g
                  id="giant-ferris-wheel"
                  transform="translate(830, 290)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickFerrisWheel();
                  }}
                >
                  {/* Heavy-Duty A-Frame Structural Lattice Towers */}
                  <polygon points="0,-120 -65,170 -52,170 0,-108" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  <polygon points="0,-120 65,170 52,170 0,-108" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                  <line x1="-30" y1="50" x2="30" y2="50" stroke="#ca8a04" strokeWidth="3" />
                  <line x1="-48" y1="120" x2="48" y2="120" stroke="#ca8a04" strokeWidth="3" />
                  <line x1="-30" y1="50" x2="48" y2="120" stroke="#b45309" strokeWidth="1.5" opacity="0.7" />
                  <line x1="30" y1="50" x2="-48" y2="120" stroke="#b45309" strokeWidth="1.5" opacity="0.7" />

                  {/* Boarding Platform Deck with Wooden Steps & Safety Railing */}
                  <rect x="-70" y="148" width="140" height="16" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                  <line x1="-68" y1="140" x2="68" y2="140" stroke="#ca8a04" strokeWidth="2" />
                  {[-60, -35, -10, 15, 40, 60].map((px) => (
                    <line key={px} x1={px} y1="140" x2={px} y2="148" stroke="#ca8a04" strokeWidth="1.5" />
                  ))}

                  {/* Rotating Wheel Trusses & Spokes */}
                  <g transform={`rotate(${ferrisAngle}, 0, 0)`}>
                    {/* Outer Neon Steel Rim */}
                    <circle
                      cx="0"
                      cy="0"
                      r="115"
                      stroke={levelTheme === 'carnival_night' ? neonColor : '#facc15'}
                      strokeWidth="7"
                      fill="none"
                      opacity="0.95"
                    />
                    {/* Inner Steel Structural Rim */}
                    <circle
                      cx="0"
                      cy="0"
                      r="75"
                      stroke={levelTheme === 'carnival_night' ? '#38bdf8' : '#f59e0b'}
                      strokeWidth="4"
                      fill="none"
                      opacity="0.9"
                    />
                    {/* Center Spider Hub Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r="35"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.7"
                    />
                    {/* 12 Spoke Trusses */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <g key={`spoke-${deg}`}>
                        <line
                          x1="0"
                          y1="0"
                          x2={Math.cos((deg * Math.PI) / 180) * 115}
                          y2={Math.sin((deg * Math.PI) / 180) * 115}
                          stroke={levelTheme === 'carnival_night' ? '#fde047' : '#fbbf24'}
                          strokeWidth="2.8"
                        />
                        {/* Spoke Bulb */}
                        <circle
                          cx={Math.cos((deg * Math.PI) / 180) * 95}
                          cy={Math.sin((deg * Math.PI) / 180) * 95}
                          r="3"
                          fill={deg % 60 === 0 ? '#ef4444' : '#38bdf8'}
                        />
                      </g>
                    ))}
                    {/* 12 Counter-Rotating Upright Passenger Gondolas */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                      <g
                        key={`gondola-${i}`}
                        transform={`translate(${Math.cos((deg * Math.PI) / 180) * 115}, ${
                          Math.sin((deg * Math.PI) / 180) * 115
                        }) rotate(${-ferrisAngle}, 0, 0)`}
                      >
                        {/* Suspension Hanger */}
                        <line x1="0" y1="-8" x2="0" y2="0" stroke="#475569" strokeWidth="2" />
                        {/* Gondola Cabin Body */}
                        <polygon
                          points="-11,-4 11,-4 14,12 -14,12"
                          fill={i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#3b82f6' : '#10b981'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        {/* Roof Canopy */}
                        <polygon
                          points="-13,-4 13,-4 10,-9 -10,-9"
                          fill="#facc15"
                          stroke="#ca8a04"
                          strokeWidth="1"
                        />
                        {/* Passenger Silhouette Head */}
                        <circle cx="-3" cy="2" r="3" fill="#ffffff" />
                        <circle cx="4" cy="2" r="2.5" fill="#fde047" />
                      </g>
                    ))}
                  </g>
                  {/* Heavy Brass Central Axle Hub */}
                  <circle cx="0" cy="0" r="18" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="10" fill="#fde047" />
                  <text x="0" y="3.5" textAnchor="middle" fontSize="10">⭐</text>

                  {/* Ferris Wheel Ticket Kiosk at Base */}
                  <g transform="translate(-115, 125)">
                    <rect x="0" y="0" width="40" height="42" fill="#b45309" stroke="#78350f" strokeWidth="1.5" rx="2" />
                    <rect x="4" y="6" width="32" height="18" fill="#1e293b" rx="1" />
                    {/* Ticket Master Silhouette */}
                    <circle cx="20" cy="14" r="4" fill="#fde047" />
                    {/* Canopy */}
                    <polygon points="-3,0 43,0 38,-8 2,-8" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                    <rect x="2" y="-14" width="36" height="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" rx="2" />
                    <text x="20" y="-7" textAnchor="middle" fill="#854d0e" fontSize="5.5" fontWeight="bold">
                      🎟️ TICKETS ₹20
                    </text>
                  </g>
                </g>

                {/* 7. FESTIVAL CONCOURSE GROUND (WARM BRICK/STONE PAVERS & KERB) */}
                <g id="carnival-pavement">
                  {/* Main Festive Promenade Pavement */}
                  <polygon
                    points="0,465 1000,465 1000,650 0,650"
                    fill={levelTheme === 'carnival_night' ? '#1e1b4b' : 'url(#fairgroundPavers)'}
                  />
                  {/* Alternating Red and White Festive Promenade Curb Border */}
                  <g id="promenade-curb">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <polygon
                        key={`curb-${i}`}
                        points={`${i * 25},463 ${(i + 1) * 25},463 ${(i + 1) * 25},469 ${i * 25},469`}
                        fill={i % 2 === 0 ? '#dc2626' : '#ffffff'}
                        stroke="#991b1b"
                        strokeWidth="0.5"
                      />
                    ))}
                  </g>
                  {/* Strewn Colorful Festive Confetti & Rose Petals on Ground */}
                  {[
                    [120, 485, '#ef4444'], [180, 510, '#facc15'], [250, 495, '#3b82f6'],
                    [320, 520, '#10b981'], [420, 505, '#ec4899'], [510, 530, '#f97316'],
                    [620, 515, '#facc15'], [730, 535, '#3b82f6'], [840, 500, '#ef4444'],
                    [910, 525, '#10b981'], [960, 490, '#ec4899'], [280, 545, '#fde047'],
                    [670, 550, '#38bdf8'], [810, 560, '#f43f5e']
                  ].map(([cx, cy, col], i) => (
                    <polygon
                      key={`confetti-${i}`}
                      points="0,-2 2,0 0,2 -2,0"
                      transform={`translate(${cx}, ${cy}) rotate(${i * 35})`}
                      fill={col as string}
                    />
                  ))}
                  {/* Ornate Victorian Festival Street Lampposts */}
                  {[170, 750].map((lx) => (
                    <g key={`lamp-${lx}`} transform={`translate(${lx}, 395)`}>
                      <line x1="0" y1="0" x2="0" y2="75" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
                      <polygon points="-6,75 6,75 8,82 -8,82" fill="#1e293b" />
                      <line x1="-12" y1="12" x2="12" y2="12" stroke="#ca8a04" strokeWidth="2" />
                      {/* Glowing Globe Lantern */}
                      <circle cx="0" cy="-4" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                      <circle cx="0" cy="-4" r="18" fill="#fde047" opacity="0.25" />
                      <polygon points="-8,-4 8,-4 5,-12 -5,-12" fill="#0f172a" />
                      <circle cx="0" cy="-14" r="2.5" fill="#facc15" />
                    </g>
                  ))}
                </g>

                {/* 8. CENTRAL PLAYER STALL: AARAV'S WHOLESALE & NIMBU CHAT STALL */}
                <g id="aarav-central-stall" transform="translate(355, 300)">
                  {/* Sturdy Teakwood & Brass Stall Counter Base */}
                  <polygon points="0,150 290,150 305,210 -15,210" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                  {/* Decorative front wooden slats and panels */}
                  <polygon points="15,160 275,160 288,202 5,202" fill="#9a3412" opacity="0.9" />
                  <polygon points="25,165 140,165 145,198 18,198" fill="#b45309" />
                  <polygon points="150,165 265,165 272,198 155,198" fill="#b45309" />

                  {/* Aarav Character Sprite Standing Behind Counter */}
                  <g id="stall-vendor-aarav" transform="translate(130, 85)">
                    {/* Aarav's Vendor Apron & Body */}
                    <polygon points="0,35 30,35 34,70 -4,70" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                    <polygon points="6,35 24,35 28,68 2,68" fill="#fef08a" />
                    {/* Aarav's Head & Face */}
                    <circle cx="15" cy="20" r="11" fill="#fbcfe8" stroke="#ca8a04" strokeWidth="1" />
                    {/* Stylish Hair */}
                    <path d="M 4,16 Q 15,8 26,16 Q 26,10 15,8 Q 4,10 4,16 Z" fill="#1e293b" />
                    {/* Friendly Smile */}
                    <path d="M 12,24 Q 15,27 18,24" stroke="#78350f" strokeWidth="1.2" fill="none" />
                    <circle cx="11" cy="19" r="1.5" fill="#1e293b" />
                    <circle cx="19" cy="19" r="1.5" fill="#1e293b" />
                    {/* Vendor Ladle Spoon in Hand */}
                    <line x1="28" y1="50" x2="42" y2="38" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="43" cy="37" r="3.5" fill="#ca8a04" />
                    {/* Aarav Name Badge */}
                    <rect x="8" y="44" width="14" height="6" rx="1.5" fill="#0f172a" />
                    <text x="15" y="48.5" textAnchor="middle" fill="#facc15" fontSize="4.5" fontWeight="bold">
                      AARAV
                    </text>
                  </g>

                  {/* 3D Angled Striped Canvas Awning */}
                  <polygon points="-25,20 315,20 330,75 -40,75" fill="url(#awningStripes)" stroke="#b45309" strokeWidth="1.8" />
                  {/* Awning Scalloped Fringe Border */}
                  <path
                    d="M -40,75 Q -25,87 -10,75 Q 5,87 20,75 Q 35,87 50,75 Q 65,87 80,75 Q 95,87 110,75 Q 125,87 140,75 Q 155,87 170,75 Q 185,87 200,75 Q 215,87 230,75 Q 245,87 260,75 Q 275,87 290,75 Q 305,87 320,75 L 330,75"
                    fill="#f59e0b"
                    stroke="#b45309"
                    strokeWidth="1.2"
                  />

                  {/* Hanging Nimbu-Mirchi Nazar Battu (Ward off evil eye!) */}
                  <g transform="translate(145, 78)">
                    <line x1="0" y1="0" x2="0" y2="28" stroke="#0f172a" strokeWidth="1.2" />
                    {/* 7 Green Chillies */}
                    <path d="M 0,4 Q -4,9 0,14" stroke="#15803d" strokeWidth="2" fill="none" />
                    <path d="M 0,6 Q 4,11 0,16" stroke="#16a34a" strokeWidth="2" fill="none" />
                    <path d="M 0,9 Q -4,14 0,19" stroke="#15803d" strokeWidth="2" fill="none" />
                    {/* Fresh Bright Yellow Lemon */}
                    <circle cx="0" cy="22" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    <circle cx="0" cy="28" r="1.5" fill="#0f172a" />
                  </g>

                  {/* Front Hanging Chalkboard Slate Banner */}
                  <rect x="25" y="105" width="240" height="34" rx="4" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
                  <text
                    x="145"
                    y="124"
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="11.5"
                    fontWeight="900"
                    fontFamily="Fredoka, cursive"
                    letterSpacing="0.8"
                  >
                    {stage <= 4
                      ? '📦 AARAV WHOLESALE · SHIVAJI PARK'
                      : '🍋 NIMBU SHIKANJI & CHATPATI CHAAT'}
                  </text>
                  <text x="145" y="134" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontWeight="bold">
                    ★ CHILLED MASALA SODA · SIZZLING SAMOSA · CRUNCHY POPCORN ★
                  </text>

                  {/* Counter Top Assets & Merchandising */}
                  {/* Stacked Wholesale Crates */}
                  <g transform="translate(5, 125)">
                    <polygon points="0,15 28,15 22,25 0,25" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
                    <text x="14" y="23" textAnchor="middle" fontSize="6.5" fill="#451a03" fontWeight="bold">
                      ₹CRATE
                    </text>
                  </g>
                  {/* Tiered Glass Masala Candy Jars */}
                  <g transform="translate(42, 128)">
                    <rect x="0" y="0" width="14" height="20" rx="3" fill="#e0f2fe" opacity="0.8" stroke="#0284c7" strokeWidth="1" />
                    <circle cx="7" cy="8" r="2.5" fill="#ef4444" />
                    <circle cx="7" cy="14" r="2.5" fill="#facc15" />
                    <rect x="3" y="-3" width="8" height="4" fill="#ca8a04" rx="1" />
                  </g>
                  <g transform="translate(60, 130)">
                    <rect x="0" y="0" width="14" height="18" rx="3" fill="#e0f2fe" opacity="0.8" stroke="#0284c7" strokeWidth="1" />
                    <circle cx="7" cy="7" r="2.5" fill="#10b981" />
                    <circle cx="7" cy="13" r="2.5" fill="#f97316" />
                    <rect x="3" y="-3" width="8" height="4" fill="#ca8a04" rx="1" />
                  </g>
                  {/* Cutting Board with Fresh Lemon Slices */}
                  <g transform="translate(205, 138)">
                    <rect x="0" y="0" width="28" height="10" rx="1.5" fill="#d97706" />
                    <circle cx="8" cy="5" r="4" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    <circle cx="18" cy="5" r="4" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                  </g>
                  {/* Traditional Clay Kulhad Cups Neatly Stacked */}
                  <g transform="translate(240, 132)">
                    <polygon points="2,0 12,0 10,8 4,8" fill="#c2410c" stroke="#9a3412" strokeWidth="0.8" />
                    <polygon points="2,6 12,6 10,14 4,14" fill="#c2410c" stroke="#9a3412" strokeWidth="0.8" />
                    <polygon points="14,3 24,3 22,11 16,11" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
                  </g>
                </g>

                {/* 9. STREET FOOD & DELIGHT STATIONS */}
                {/* A. Sizzling Deep-Fryer Kadhai (Samosa & Spiral Jalebi) */}
                <g
                  transform="translate(165, 420)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickKadhai();
                  }}
                >
                  {/* Brick Stove Base with Blue/Orange Flame */}
                  <polygon points="5,55 75,55 70,72 10,72" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                  <polygon points="25,55 35,42 45,55" fill="#3b82f6" opacity="0.85" />
                  <polygon points="35,55 45,38 55,55" fill="#f97316" className="animate-pulse" />
                  {/* Cast Iron Heavy Kadhai */}
                  <path d="M 5,26 Q 40,68 75,26 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                  <ellipse cx="40" cy="27" rx="33" ry="11" fill="#f59e0b" stroke="#d97706" strokeWidth="1.8" />
                  {/* Bobbing Crisp Samosas */}
                  <polygon points="22,25 31,16 38,28" fill="#ca8a04" stroke="#78350f" strokeWidth="1" transform={`translate(0, ${samosaBob1})`} />
                  <polygon points="42,26 53,17 60,29" fill="#d97706" stroke="#78350f" strokeWidth="1" transform={`translate(0, ${samosaBob2})`} />
                  {/* Golden Concentric Jalebi Spiral */}
                  <circle cx="34" cy="26" r="5" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 1" />
                  {/* Bubbles */}
                  {kadhaiBubbles.map((kb, idx) => (
                    <circle key={`kb-${idx}`} cx={kb.x - 170 + 20} cy={kb.y - 425 + 10} r={kb.r} fill="#fef08a" opacity="0.85" />
                  ))}
                  {samosaSizzle && (
                    <g transform="translate(40, -4)" className="animate-ping">
                      <circle cx="0" cy="0" r="14" fill="#ffffff" opacity="0.75" />
                    </g>
                  )}
                  {/* Station Label */}
                  <rect x="15" y="74" width="50" height="12" rx="3" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
                  <text x="40" y="82.5" textAnchor="middle" fill="#f97316" fontSize="6.5" fontWeight="bold">
                    KADHAI 🔥
                  </text>
                </g>

                {/* B. Retro Wheeled Popcorn Cart */}
                <g
                  transform="translate(280, 385)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickPopcorn();
                  }}
                >
                  {/* Cart Body */}
                  <rect x="0" y="0" width="52" height="66" fill="#e0f2fe" opacity="0.8" stroke="#dc2626" strokeWidth="2.5" rx="4" />
                  <polygon points="-5,0 57,0 50,-18 2,-18" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                  <text x="26" y="-6" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                    POPCORN 🍿
                  </text>
                  {/* Spoked Carriage Wheel */}
                  <circle cx="26" cy="80" r="15" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                  <circle cx="26" cy="80" r="4" fill="#78350f" />
                  {[0, 45, 90, 135].map((wDeg) => (
                    <line
                      key={`w-${wDeg}`}
                      x1={26 + Math.cos((wDeg * Math.PI) / 180) * 15}
                      y1={80 + Math.sin((wDeg * Math.PI) / 180) * 15}
                      x2={26 - Math.cos((wDeg * Math.PI) / 180) * 15}
                      y2={80 - Math.sin((wDeg * Math.PI) / 180) * 15}
                      stroke="#ca8a04"
                      strokeWidth="1.2"
                    />
                  ))}
                  {/* Popping Yellow Kernels */}
                  {popcornJump.map((pj, idx) => (
                    <circle
                      key={`pj-${idx}`}
                      cx={8 + idx * 7.5}
                      cy={58 - pj}
                      r={3.4}
                      fill="#fde047"
                      stroke="#ca8a04"
                      strokeWidth="0.8"
                    />
                  ))}
                </g>

                {/* C. Shikanji Cold Drink Dispenser with Swirling Lemon Wedge */}
                <g transform="translate(650, 395)">
                  <rect x="0" y="0" width="46" height="62" fill="#fef08a" opacity="0.65" rx="6" stroke="#facc15" strokeWidth="2.5" />
                  <g transform={`translate(23, 32) rotate(${lemonSwirl}, 0, 0)`}>
                    <circle cx="0" cy="0" r="10" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                    <line x1="-10" y1="0" x2="10" y2="0" stroke="#ca8a04" strokeWidth="1" />
                    <line x1="0" y1="-10" x2="0" y2="10" stroke="#ca8a04" strokeWidth="1" />
                  </g>
                  {/* Floating Ice Cubes */}
                  <rect x="10" y="14" width="8" height="8" fill="#ffffff" opacity="0.75" rx="2" />
                  <rect x="26" y="20" width="7" height="7" fill="#ffffff" opacity="0.75" rx="2" />
                  <text x="23" y="55" textAnchor="middle" fill="#854d0e" fontSize="6.5" fontWeight="bold">
                    SHIKANJI 🍋
                  </text>
                </g>

                {/* D. Spun Sugar Candy Floss Cart ("Gudiya Ke Baal 🍭") */}
                <g
                  transform="translate(710, 420)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickCottonCandy();
                  }}
                >
                  {/* Pastel Wheeled Cart */}
                  <rect x="0" y="14" width="48" height="40" rx="3" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1.8" />
                  {/* Stainless Steel Spinning Drum */}
                  <ellipse cx="24" cy="14" rx="22" ry="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Swirling Pink Spun Cloud */}
                  <ellipse
                    cx="24"
                    cy="8"
                    rx="16"
                    ry="10"
                    fill="#f472b6"
                    stroke="#db2777"
                    strokeWidth="1.5"
                    transform={`rotate(${cottonCandySwirl}, 24, 8)`}
                    opacity="0.9"
                  />
                  {/* Candy Floss Cone Sticks */}
                  <line x1="12" y1="2" x2="18" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="34" y1="0" x2="28" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="2" r="5" fill="#38bdf8" opacity="0.8" />
                  <circle cx="34" cy="0" r="6" fill="#f472b6" opacity="0.8" />
                  {/* Wheels */}
                  <circle cx="12" cy="56" r="10" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
                  <circle cx="36" cy="56" r="10" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
                  <rect x="5" y="44" width="38" height="10" rx="2" fill="#831843" />
                  <text x="24" y="51" textAnchor="middle" fill="#fdf2f8" fontSize="5" fontWeight="bold">
                    CANDY FLOSS 🍭
                  </text>
                </g>

                {/* E. Spinning Rainbow Pinwheel */}
                <g
                  transform="translate(40, 365)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickPinwheel();
                  }}
                >
                  <line x1="0" y1="0" x2="0" y2="120" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                  <g transform={`rotate(${pinwheelDeg}, 0, 0)`}>
                    <polygon points="0,0 20,-20 0,-32" fill="#ef4444" />
                    <polygon points="0,0 20,20 32,0" fill="#facc15" />
                    <polygon points="0,0 -20,20 0,32" fill="#10b981" />
                    <polygon points="0,0 -20,-20 -32,0" fill="#3b82f6" />
                    <circle cx="0" cy="0" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
                  </g>
                </g>

                {/* F. Bobbing 5-Balloon Helium Bouquet */}
                <g
                  transform={`translate(695, ${315 + balloonBob})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickSky(e);
                  }}
                >
                  <path d="M 0,60 Q -10,30 -22,-10" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  <path d="M 0,60 Q 5,25 0,-15" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  <path d="M 0,60 Q 15,30 24,-8" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  <path d="M 0,60 Q -18,20 -35,5" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  <path d="M 0,60 Q 18,25 36,8" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  <circle cx="-22" cy="-10" r="17" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                  <circle cx="0" cy="-15" r="18" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="24" cy="-8" r="17" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
                  <circle cx="-35" cy="5" r="16" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
                  <circle cx="36" cy="8" r="16" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
                </g>

                {/* 10. BUSTLING ANIMATED FAIRGROUND PROMENADE CROWDS */}
                <g id="carnival-crowds" opacity="0.85">
                  {/* Walking Group 1: Mother in Saree & Child with Floating Balloon */}
                  <g transform={`translate(${crowdWalkX1}, 472)`}>
                    {/* Mother */}
                    <circle cx="10" cy="0" r="5.5" fill="#f43f5e" />
                    <polygon points="5,5 15,5 18,26 2,26" fill="#be123c" />
                    {/* Child Holding Hand */}
                    <circle cx="24" cy="10" r="4" fill="#38bdf8" />
                    <polygon points="20,14 28,14 29,26 19,26" fill="#0284c7" />
                    {/* Red Floating Balloon Tied to Child's Hand */}
                    <line x1="26" y1="14" x2="26" y2="-12" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="26" cy="-16" r="6" fill="#ef4444" />
                  </g>

                  {/* Walking Group 2: Friends Eating Snacks & Drinks Promenading Left */}
                  <g transform={`translate(${crowdWalkX2}, 474)`}>
                    {/* Friend 1 in Yellow Kurta */}
                    <circle cx="15" cy="0" r="5.5" fill="#fde047" />
                    <polygon points="10,5 20,5 22,26 8,26" fill="#ca8a04" />
                    {/* Friend 2 in Teal Shirt */}
                    <circle cx="34" cy="-2" r="5.5" fill="#2dd4bf" />
                    <polygon points="29,3 39,3 41,26 27,26" fill="#0f766e" />
                    {/* Drink Cup */}
                    <rect x="22" y="10" width="3" height="6" fill="#facc15" />
                  </g>

                  {/* Walking Group 3: Father Carrying Child on Shoulders with Pinwheel */}
                  <g transform={`translate(${crowdWalkX3}, 470)`}>
                    {/* Father */}
                    <circle cx="15" cy="6" r="6" fill="#1e293b" />
                    <polygon points="8,12 22,12 24,28 6,28" fill="#334155" />
                    {/* Child on Shoulders */}
                    <circle cx="15" cy="-5" r="4.5" fill="#f59e0b" />
                    <line x1="18" y1="-5" x2="28" y2="-15" stroke="#78350f" strokeWidth="1" />
                    <polygon points="28,-18 31,-15 28,-12 25,-15" fill="#10b981" />
                  </g>
                </g>

                {/* 11. NIGHT FINALE CELEBRATION (When Level Theme is Carnival Night) */}
                {levelTheme === 'carnival_night' && (
                  <g id="carnival-night-special">
                    {/* Fireworks Bursts */}
                    {fireworkBursts.map((fw, idx) => (
                      <g key={`fw-${idx}`} transform={`translate(${fw.x}, ${fw.y}) scale(${fw.scale})`} opacity={fw.op}>
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                          <line
                            key={`fw-ray-${deg}`}
                            x1="0"
                            y1="0"
                            x2={Math.cos((deg * Math.PI) / 180) * 42}
                            y2={Math.sin((deg * Math.PI) / 180) * 42}
                            stroke={fw.hue}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        ))}
                        <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.95" />
                      </g>
                    ))}
                    {/* Ascending Sky Lanterns */}
                    {skyLanterns.map((sl, idx) => (
                      <g key={`sl-${idx}`} transform={`translate(${sl.x}, ${sl.y})`} opacity={sl.op}>
                        <polygon points="-8,14 8,14 12,-10 -12,-10" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                        <polygon points="-6,10 6,10 9,-8 -9,-8" fill="#fde047" opacity="0.85" />
                        <circle cx="0" cy="12" r="3" fill="#ef4444" />
                        <circle cx="0" cy="10" r="1.8" fill="#ffffff" />
                      </g>
                    ))}
                    {/* Grand Marquee Fairground Sign with Chasing Bulb Lights */}
                    <g transform="translate(345, 220)">
                      <rect x="0" y="0" width="310" height="42" fill="#0f172a" stroke="#ca8a04" strokeWidth="2.5" rx="6" />
                      <text
                        x="155"
                        y="28"
                        textAnchor="middle"
                        fill="#fde047"
                        fontSize="15"
                        fontWeight="900"
                        fontFamily="Fredoka, cursive"
                        letterSpacing="1.5"
                      >
                        ★ SHIVAJI PARK ANAND MELA ★
                      </text>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bIdx) => {
                        const bx = bIdx <= 8 ? bIdx * 38.7 : (16 - bIdx) * 38.7;
                        const by = bIdx <= 8 ? 4 : 38;
                        const isLit = (bIdx + marqueePhase) % 3 === 0;
                        return (
                          <circle
                            key={`mq-${bIdx}`}
                            cx={bx}
                            cy={by}
                            r="2.5"
                            fill={isLit ? '#ffffff' : '#f59e0b'}
                            stroke="#ca8a04"
                            strokeWidth="0.8"
                            opacity={isLit ? 1 : 0.4}
                          />
                        );
                      })}
                    </g>
                  </g>
                )}
              </g>
            )}

            {/* ===============================================================
                UNIVERSAL MISO CHARACTER SPRITE (Sitting, Leaping or Galloping Sprint)
                =============================================================== */}
            {isMiso && isMisoVisible && (
              <g
                transform={`translate(${misoCustomX}, ${
                  misoCustomY + (isMisoRunning ? 0 : misoBobY)
                })`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickMiso();
                }}
              >
                {isMisoRunning ? (
                  /* ===========================================================
                     A. HIGH-SPEED GALLOPING SPRINT SPRITE (Dr. Kavita Vet Run)
                     =========================================================== */
                  <g transform="rotate(8, 25, 25) scale(1.1)">
                    {/* Road Dust Clouds Puffed Behind Paws */}
                    <g transform="translate(-18, 38)">
                      <circle
                        cx={-8}
                        cy={0}
                        r={4 + (transitionTick % 10)}
                        fill="#cbd5e1"
                        opacity={Math.max(0, 0.75 - (transitionTick % 10) / 10)}
                      />
                      <circle
                        cx={-22}
                        cy={-3}
                        r={6 + ((transitionTick + 5) % 12)}
                        fill="#94a3b8"
                        opacity={Math.max(0, 0.55 - ((transitionTick + 5) % 12) / 12)}
                      />
                      <circle
                        cx={-36}
                        cy={-6}
                        r={8 + ((transitionTick + 9) % 14)}
                        fill="#64748b"
                        opacity={Math.max(0, 0.35 - ((transitionTick + 9) % 14) / 14)}
                      />
                    </g>

                    {/* Wind Speed Lines Trailing */}
                    <g transform="translate(-40, 12)">
                      <line x1="0" y1="0" x2="-28" y2="0" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.9" />
                      <line x1="10" y1="8" x2="-22" y2="8" stroke="#ffffff" strokeWidth="2" strokeDasharray="6,4" opacity="0.85" />
                      <line x1="5" y1="16" x2="-32" y2="16" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="7,3" opacity="0.8" />
                    </g>

                    {/* Tail Streaming Back in Wind */}
                    <g transform="translate(4, 20)">
                      <polygon points="0,0 -24,-3 -36,-1 -30,5 0,4" fill="#ea580c" />
                      <polygon points="-26,-1 -36,-1 -30,5" fill="#f8fafc" />
                    </g>

                    {/* Torso Stretched in Dynamic Leap */}
                    <polygon points="10,34 56,32 52,14 14,16" fill="#ea580c" />
                    <polygon points="18,34 48,32 44,16 22,18" fill="#fed7aa" />

                    {/* Running Front Paws Pumping */}
                    <g transform={`rotate(${Math.sin(misoRunCycle) * 35}, 46, 32)`}>
                      <polygon points="42,32 50,32 56,46 48,46" fill="#f8fafc" stroke="#ea580c" strokeWidth="1" />
                    </g>
                    <g transform={`rotate(${-Math.sin(misoRunCycle) * 35}, 40, 32)`}>
                      <polygon points="36,32 44,32 40,46 32,46" fill="#fed7aa" />
                    </g>

                    {/* Running Hind Paws Pumping */}
                    <g transform={`rotate(${-Math.sin(misoRunCycle) * 35}, 16, 34)`}>
                      <polygon points="12,34 20,34 14,48 6,48" fill="#f8fafc" stroke="#ea580c" strokeWidth="1" />
                    </g>
                    <g transform={`rotate(${Math.sin(misoRunCycle) * 35}, 22, 34)`}>
                      <polygon points="18,34 26,34 30,48 22,48" fill="#fed7aa" />
                    </g>

                    {/* Head Thrusting Forward */}
                    <polygon points="46,18 74,14 70,-2 44,2" fill="#f97316" />
                    <polygon points="52,16 70,14 68,4 50,6" fill="#fed7aa" />

                    {/* Pinned Back Aerodynamic Ears */}
                    <polygon points="44,2 52,0 38,-12" fill="#ea580c" />
                    <polygon points="46,1 50,0 42,-8" fill="#fda4af" />
                    <polygon points="54,0 62,-2 50,-14" fill="#c2410c" />
                    <polygon points="56,-1 60,-2 53,-9" fill="#fda4af" />

                    {/* Royal Crown Swept Back */}
                    <g transform="translate(48, -14) rotate(-18)">
                      <polygon points="0,6 14,6 14,0 10.5,3 7,0 3.5,3 0,0" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
                      <circle cx="7" cy="3" r="1.2" fill="#ef4444" />
                    </g>

                    {/* Determined Happy Sprint Eyes */}
                    <path d="M 54,6 Q 60,3 66,6" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <polygon points="68,10 72,10 70,12" fill="#f43f5e" />

                    {/* Floating Heart & Speed Cross */}
                    <g transform="translate(18, -18)">
                      <text x="0" y="0" fontSize="14">❤️</text>
                      <text x="18" y="-6" fontSize="14">⚡</text>
                    </g>
                  </g>
                ) : (
                  /* ===========================================================
                     B. STANDARD SITTING / RESTING SPRITE
                     =========================================================== */
                  <g>
                    {/* Animated Wagging Tail */}
                    <g transform="translate(10, 32)">
                      <g transform={`rotate(${tailAngle}, 0, 0)`}>
                        <polygon points="0,0 -8,-10 -4,-18 4,-8" fill="#f97316" />
                        <g transform="translate(-4, -18)">
                          <g transform={`rotate(${tailAngle * 0.8}, 0, 0)`}>
                            <polygon points="0,0 -4,-10 2,-16 6,-6" fill="#fb923c" />
                            <polygon points="2,-16 6,-18 8,-12 4,-10" fill="#f8fafc" />
                          </g>
                        </g>
                      </g>
                    </g>

                    {/* Main Cat Body */}
                    <polygon points="12,42 48,42 44,18 16,18" fill="#ea580c" />
                    <polygon points="20,42 40,42 36,20 24,20" fill="#fed7aa" />

                    {/* White Paws */}
                    <polygon points="16,42 26,42 24,48 18,48" fill="#f8fafc" />
                    <polygon points="34,42 44,42 42,48 36,48" fill="#f8fafc" />

                    {/* Cat Head */}
                    <polygon points="12,18 48,18 52,-4 8,-4" fill="#f97316" />
                    <polygon points="20,18 40,18 42,4 18,4" fill="#fed7aa" />

                    {/* Pointy Ears */}
                    <polygon points="8,-4 22,-4 14,-22" fill="#ea580c" />
                    <polygon points="12,-4 20,-4 15,-16" fill="#fda4af" />
                    <polygon points="38,-4 52,-4 46,-22" fill="#c2410c" />
                    <polygon points="40,-4 48,-4 45,-16" fill="#fda4af" />

                    {/* Whiskers */}
                    <line x1="8" y1="8" x2="-8" y2="6" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="8" y1="12" x2="-6" y2="16" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="52" y1="8" x2="68" y2="6" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="52" y1="12" x2="66" y2="16" stroke="#ffffff" strokeWidth="1.5" />

                    {/* Dynamic Eyes */}
                    {misoMood === 'happy' || misoMood === 'cured' ? (
                      <>
                        <path d="M 18,4 Q 24,-2 30,4" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M 32,4 Q 38,-2 44,4" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      </>
                    ) : misoMood === 'scared' ? (
                      <>
                        <circle cx="24" cy="5" r="5" fill="#facc15" stroke="#1e293b" strokeWidth="1.5" />
                        <circle cx="24" cy="5" r="2.5" fill="#0f172a" />
                        <circle cx="38" cy="5" r="5" fill="#facc15" stroke="#1e293b" strokeWidth="1.5" />
                        <circle cx="38" cy="5" r="2.5" fill="#0f172a" />
                      </>
                    ) : (
                      <>
                        <polygon points="20,4 28,4 26,9 22,9" fill="#1e293b" />
                        <polygon points="34,4 42,4 40,9 36,9" fill="#1e293b" />
                        <circle cx="22" cy="5" r="1" fill="#ffffff" />
                        <circle cx="36" cy="5" r="1" fill="#ffffff" />
                      </>
                    )}

                    {/* Pink Nose */}
                    <polygon points="28,11 34,11 31,14" fill="#f43f5e" />

                    {/* Royal Crown */}
                    <g transform="translate(21, -28)">
                      <polygon points="0,8 18,8 18,0 13.5,4 9,0 4.5,4 0,0" fill="#facc15" stroke="#b45309" strokeWidth="0.8" />
                      <circle cx="9" cy="4" r="1.5" fill="#ef4444" />
                    </g>

                    {/* Floating Heart Effect */}
                    {(misoMood === 'happy' || misoMood === 'cured' || misoJumping) && (
                      <g transform={`translate(42, ${-10 - (tick % 40) * 0.8})`} opacity={Math.max(0, 1 - (tick % 40) / 40)}>
                        <text x="0" y="0" fontSize="16" fill="#f43f5e">❤️</text>
                      </g>
                    )}
                  </g>
                )}
              </g>
            )}

            {/* ===============================================================
                FOREGROUND ROAD VEHICLES LAYER (DOM Depth-Sorted on Asphalt)
                =============================================================== */}

            {/* 1. CINEMATIC KAALI-PEELI TAXI (CAB PICK-UP) */}
            <g
              transform={`translate(${cabArrivalX}, 445)`}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playHonk();
                spawnFloatingText('🚖 PEEP PEEP! TAXI READY!', '#facc15', 30, 50, '🚕');
              }}
            >
              {/* Exhaust Pipe & Trailing Smoke Puffs (when moving) */}
              {(transitionMode === 'cab_pickup' || cabArrivalX > -250) && (
                <g transform="translate(-6, 52)">
                  <line x1="0" y1="0" x2="-8" y2="0" stroke="#64748b" strokeWidth="3" />
                  <circle
                    cx={-14 - ((tick * 2) % 30)}
                    cy={-2 - ((tick * 1.2) % 15)}
                    r={3 + ((tick * 1.5) % 20) * 0.3}
                    fill="#e2e8f0"
                    opacity={Math.max(0, 0.7 - ((tick * 2) % 30) / 30)}
                  />
                  <circle
                    cx={-28 - ((tick * 2.5) % 35)}
                    cy={-6 - ((tick * 1.5) % 20)}
                    r={5 + ((tick * 1.5) % 20) * 0.35}
                    fill="#cbd5e1"
                    opacity={Math.max(0, 0.5 - ((tick * 2.5) % 35) / 35)}
                  />
                </g>
              )}

              {/* Lower Body: Glossy Black */}
              <polygon points="5,32 195,32 208,62 0,62" fill="#18181b" stroke="#27272a" strokeWidth="2" />
              {/* Chrome Bumpers */}
              <rect x="-3" y="55" width="10" height="7" fill="#cbd5e1" rx="2" stroke="#64748b" strokeWidth="1" />
              <rect x="202" y="55" width="10" height="7" fill="#cbd5e1" rx="2" stroke="#64748b" strokeWidth="1" />

              {/* Chrome Mid-Stripe */}
              <line x1="5" y1="33" x2="200" y2="33" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Yellow & Black Taxi Checkerboard Pattern */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ci) => (
                <rect
                  key={ci}
                  x={18 + ci * 13}
                  y={36}
                  width={6.5}
                  height={5.5}
                  fill={ci % 2 === 0 ? '#facc15' : '#ffffff'}
                />
              ))}

              {/* Yellow Curved Roof */}
              <polygon points="42,12 145,12 165,32 25,32" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />

              {/* Front Windshield */}
              <polygon points="140,15 160,31 135,31 125,15" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" opacity="0.85" />
              {/* Rear Passenger Window */}
              <polygon points="48,15 95,15 90,31 40,31" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" opacity="0.85" />

              {/* Driver Silhouette in Front Window */}
              <circle cx="132" cy="24" r="5" fill="#1e293b" opacity="0.75" />

              {/* Illuminated Roof Taxi Sign */}
              <g transform="translate(80, 0)">
                <rect x="0" y="0" width="40" height="12" fill="#facc15" stroke="#b45309" strokeWidth="1.5" rx="2" />
                <polygon points="0,0 4,12 36,12 40,0" fill="#fef08a" />
                <text x="20" y="9" textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="900" fontFamily="Fredoka, cursive">
                  TAXI 🚖
                </text>
              </g>

              {/* Front Twin Headlights with Forward Light Beam */}
              <circle cx="204" cy="45" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
              <polygon points="208,45 340,25 350,75 208,55" fill="#fef08a" opacity="0.22" />

              {/* Red Taillights */}
              <rect x="0" y="42" width="4" height="8" fill="#ef4444" rx="1" />

              {/* Wheels */}
              <g transform="translate(42, 62)">
                <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />
                <circle cx="0" cy="0" r="5.5" fill="#cbd5e1" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#18181b" strokeWidth="2" transform={`rotate(${transitionTick * 20})`} />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#18181b" strokeWidth="2" transform={`rotate(${transitionTick * 20})`} />
              </g>
              <g transform="translate(160, 62)">
                <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />
                <circle cx="0" cy="0" r="5.5" fill="#cbd5e1" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#18181b" strokeWidth="2" transform={`rotate(${transitionTick * 20})`} />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#18181b" strokeWidth="2" transform={`rotate(${transitionTick * 20})`} />
              </g>

              {/* Open Door Interior (when boarding) */}
              {cabDoorOpen && (
                <g transform="translate(90, 20)">
                  <rect x="0" y="10" width="30" height="32" fill="#fed7aa" stroke="#ca8a04" strokeWidth="1.5" />
                  <polygon points="0,10 -15,5 -15,42 0,42" fill="#18181b" stroke="#facc15" strokeWidth="1.5" />
                  <circle cx="-8" cy="24" r="2" fill="#cbd5e1" />
                </g>
              )}

              {/* Miso Sitting Inside Cab Window Looking Out Happily */}
              {cabShowMisoPassenger && (
                <g transform="translate(56, 14)">
                  <polygon points="2,22 26,22 28,10 0,10" fill="#f97316" />
                  <polygon points="6,22 22,22 23,13 5,13" fill="#fed7aa" />
                  {/* Ears */}
                  <polygon points="0,10 8,10 4,1" fill="#ea580c" />
                  <polygon points="2,10 6,10 4,4" fill="#fda4af" />
                  <polygon points="20,10 28,10 24,1" fill="#c2410c" />
                  <polygon points="22,10 26,10 24,4" fill="#fda4af" />
                  {/* Royal Crown */}
                  <g transform="translate(8, 0)">
                    <polygon points="0,3 12,3 12,-2 9,0 6,-2 3,0 0,-2" fill="#facc15" stroke="#b45309" strokeWidth="0.6" />
                    <circle cx="6" cy="0" r="1.2" fill="#ef4444" />
                  </g>
                  {/* Happy Eyes */}
                  <path d="M 5,14 Q 9,11 13,14" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M 15,14 Q 19,11 23,14" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {/* Nose */}
                  <polygon points="13,16.5 15,16.5 14,18" fill="#f43f5e" />
                  {/* Paws on Window Sill */}
                  <ellipse cx="6" cy="22" rx="3" ry="2" fill="#f8fafc" />
                  <ellipse cx="22" cy="22" rx="3" ry="2" fill="#f8fafc" />
                  {/* Whiskers */}
                  <line x1="2" y1="15" x2="-4" y2="14" stroke="#ffffff" strokeWidth="1" />
                  <line x1="26" y1="15" x2="32" y2="14" stroke="#ffffff" strokeWidth="1" />
                  {/* Floating Heart */}
                  <text x="24" y="4" fontSize="11">❤️</text>
                </g>
              )}
            </g>

            {/* 2. ANIMATED TATA CARGO TRUCK ON LOWER HIGHWAY ROAD LANE */}
            {levelTheme === 'highway_tapri' && (
              <g
                transform={`translate(${truckX}, 520)`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickTruck();
                }}
              >
                {/* Exhaust Pipe & Animated Smoke Puffs */}
                <g transform="translate(6, 10)">
                  <line x1="0" y1="16" x2="0" y2="-10" stroke="#475569" strokeWidth="4" />
                  <circle
                    cx={-4}
                    cy={-12 - truckExhaustSmokeY}
                    r={4 + truckExhaustSmokeY * 0.18}
                    fill="#cbd5e1"
                    opacity={Math.max(0, 0.75 - truckExhaustSmokeY / 40)}
                  />
                  <circle
                    cx={-9}
                    cy={-20 - truckExhaustSmokeY * 1.1}
                    r={6 + truckExhaustSmokeY * 0.22}
                    fill="#94a3b8"
                    opacity={Math.max(0, 0.55 - truckExhaustSmokeY / 40)}
                  />
                </g>
                {/* Cargo Bed Body (Decorated Indian Truck) */}
                <rect x="0" y="0" width="155" height="58" fill="#ea580c" stroke="#1e293b" strokeWidth="2.5" rx="3" />
                {/* Decorative Banner */}
                <rect x="5" y="4" width="145" height="11" fill="#facc15" stroke="#1e293b" strokeWidth="1.2" />
                <text x="77" y="13" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="900" fontFamily="Fredoka, cursive">
                  ★ BHARAT GOODS CARRIER ★
                </text>
                {/* Tailgate Lettering */}
                <rect x="8" y="19" width="139" height="23" fill="#0284c7" stroke="#1e293b" strokeWidth="1.2" />
                <text x="77" y="29" textAnchor="middle" fill="#fef08a" fontSize="6.5" fontWeight="900">
                  BURI NAZAR WALE TERA MOOH KALA
                </text>
                <rect x="24" y="32" width="106" height="8" fill="#ef4444" rx="2" />
                <text x="77" y="38.5" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="900" letterSpacing="0.8">
                  HORN OK PLEASE
                </text>
                {/* Front Cab */}
                <polygon points="155,58 208,58 208,22 180,12 155,12" fill="#16a34a" stroke="#1e293b" strokeWidth="2.5" />
                {/* Windshield */}
                <polygon points="160,30 180,18 198,23 198,32 160,32" fill="#bae6fd" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="175" cy="27" r="4.5" fill="#1e293b" />
                {/* Headlights */}
                <circle cx="206" cy="42" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                {/* Spinning Wheels */}
                <g transform="translate(30, 58)">
                  <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="5.5" fill="#94a3b8" />
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                </g>
                <g transform="translate(125, 58)">
                  <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="5.5" fill="#94a3b8" />
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                </g>
                <g transform="translate(188, 58)">
                  <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#3f3f46" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="5.5" fill="#94a3b8" />
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#18181b" strokeWidth="2" transform={`rotate(${truckWheelAngle})`} />
                </g>
              </g>
            )}

            {/* 3. DYNAMIC VEHICLE: BAJAJ AUTO-RICKSHAW */}
            {levelTheme === 'highway_tapri' && (
              <g
                transform={`translate(${isAutoHighlighted ? 120 : -320}, 455)`}
                className="transition-transform duration-700 ease-out cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickVehicle('auto');
                }}
              >
                <polygon points="30,0 150,0 145,55 20,55" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <polygon points="15,55 160,55 170,95 5,95" fill="#15803d" stroke="#14532d" strokeWidth="2" />
                <polygon points="120,5 145,5 142,45 118,45" fill="#7dd3fc" opacity="0.8" />
                <polygon points="165,70 340,40 350,110 165,85" fill="#fef08a" opacity="0.35" />
                <circle cx="35" cy="100" r="18" fill="#18181b" stroke="#52525b" strokeWidth="3" />
                <circle cx="35" cy="100" r="7" fill="#e4e4e7" />
                <circle cx="135" cy="100" r="18" fill="#18181b" stroke="#52525b" strokeWidth="3" />
                <circle cx="135" cy="100" r="7" fill="#e4e4e7" />
                <circle cx="105" cy="35" r="12" fill="#d97706" />
                <polygon points="95,45 120,45 125,75 90,75" fill="#93532d" />
              </g>
            )}

            {/* 4. DYNAMIC VEHICLE: EMERGENCY AMBULANCE */}
            {levelTheme === 'highway_tapri' && (
              <g
                transform={`translate(${isVetHighlighted && transitionMode === 'none' ? 20 : -450}, 445)`}
                className="transition-transform duration-700 ease-out cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickVehicle('amb');
                }}
              >
                <polygon points="20,15 190,15 220,55 220,105 10,105 10,40" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                <polygon points="10,65 220,65 220,80 10,80" fill="#ef4444" />
                <g transform="translate(100, 42)">
                  <rect x="0" y="8" width="24" height="8" fill="#ef4444" />
                  <rect x="8" y="0" width="8" height="24" fill="#ef4444" />
                </g>
                <polygon points="150,22 185,22 210,55 150,55" fill="#38bdf8" opacity="0.75" />
                <polygon points="90,22 140,22 140,55 90,55" fill="#38bdf8" opacity="0.75" />
                <circle cx="55" cy="110" r="20" fill="#18181b" stroke="#71717a" strokeWidth="3" />
                <circle cx="55" cy="110" r="8" fill="#e4e4e7" />
                <circle cx="175" cy="110" r="20" fill="#18181b" stroke="#71717a" strokeWidth="3" />
                <circle cx="175" cy="110" r="8" fill="#e4e4e7" />

                <g transform="translate(85, 3)">
                  <rect x="0" y="0" width="30" height="10" fill="#334155" rx="3" />
                  <ellipse cx="5" cy="4" rx="60" ry="40" fill="url(#sirenGlowBlue)" opacity={tick % 16 < 8 ? 0.9 : 0.15} />
                  <ellipse cx="25" cy="4" rx="60" ry="40" fill="url(#sirenGlowRed)" opacity={tick % 16 >= 8 ? 0.9 : 0.15} />
                </g>
              </g>
            )}

            {/* ===============================================================
                CINEMATIC STAGE TRANSITION HUD BANNER (Floating at Top of SVG)
                =============================================================== */}
            {transitionMode === 'cab_pickup' && (
              <g transform="translate(500, 75)">
                <rect x="-165" y="-18" width="330" height="36" fill="#0f172a" rx="18" stroke="#facc15" strokeWidth="2.5" />
                <circle cx="-140" cy="0" r="12" fill="#facc15" />
                <text x="-140" y="4" textAnchor="middle" fontSize="12">🚖</text>
                <text x="8" y="5" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="900" fontFamily="Fredoka, cursive" letterSpacing="0.5">
                  {transitionTick < 42
                    ? '🚖 CAB ARRIVING AT KERB...'
                    : transitionTick < 72
                    ? '🐾 ALL ABOARD! MISO HOPPED IN!'
                    : "💨 EN ROUTE TO DR. KAVITA'S CLINIC!"}
                </text>
              </g>
            )}

            {transitionMode === 'vet_sprint' && (
              <g transform="translate(500, 75)">
                <rect x="-175" y="-18" width="350" height="36" fill="#0f172a" rx="18" stroke="#38bdf8" strokeWidth="2.5" />
                <circle cx="-150" cy="0" r="12" fill="#38bdf8" />
                <text x="-150" y="4" textAnchor="middle" fontSize="12">🏥</text>
                <text x="10" y="5" textAnchor="middle" fill="#bae6fd" fontSize="12" fontWeight="900" fontFamily="Fredoka, cursive" letterSpacing="0.5">
                  {transitionTick < 22
                    ? '⚡ MISO LEAPING TOWARD HIGHWAY!'
                    : "🏥 SPRINTING TO DR. KAVITA'S VET CLINIC! 🐾"}
                </text>
              </g>
            )}
          </svg>

          {/* =================================================================
              PARTICLE / CONFETTI EXPLOSION OVERLAY
              ================================================================= */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
                borderRadius: p.shape === 'triangle' ? '0' : '2px',
                clipPath:
                  p.shape === 'triangle'
                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    : undefined,
                transform: `rotate(${p.rotation}deg)`,
                opacity: p.life,
                transition: 'opacity 0.05s linear',
              }}
            />
          ))}

          {/* Floating RPG Numbers */}
          {floatingEffects.map((f) => (
            <div
              key={f.id}
              className="absolute pointer-events-none font-title text-sm font-black animate-float-up shadow-md"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                color: f.color,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        {/* ===================================================================
            B. THE DECISION DECK & QUEST HUD (42% on Desktop, 58% on Mobile)
            =================================================================== */}
        <div className="flex-1 md:flex-[42] flex flex-col min-h-0 bg-slate-900 overflow-hidden">
          {/* Deck Prompt Header with Level Journey Road Map */}
          <div className="flex-none p-3 pb-2 border-b border-slate-800 bg-slate-900/80">
            {/* Visual Level Road Map Bar */}
            <div className="flex items-center justify-between gap-1 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-title text-[10px] font-black uppercase shadow-xs shrink-0">
                <Sparkles className="h-3 w-3 fill-slate-950" />
                <span>DECISION {stage} OF {totalStages}</span>
              </span>

              {/* Connected Stage Nodes */}
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                {Array.from({ length: totalStages }).map((_, i) => {
                  const nodeNum = i + 1;
                  const isCurrent = nodeNum === stage;
                  const isPast = nodeNum < stage;

                  return (
                    <div key={nodeNum} className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-110 shadow-sm'
                            : isPast
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isPast ? '✓' : nodeNum}
                      </div>
                      {i < totalStages - 1 && (
                        <div
                          className={`w-1.5 h-0.5 ${
                            isPast ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <h2 className="font-title text-sm md:text-base text-white mt-1 leading-snug">
              {promptQuestion}
            </h2>
            {promptDescription && (
              <p className="font-chunky text-xs text-slate-300 mt-0.5 line-clamp-2">
                {promptDescription}
              </p>
            )}

            {/* Actor Context & Hover Preview Dialogue (Docked safely inside Decision Deck) */}
            <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/70 border border-amber-400/30 text-white">
              <span className="text-base shrink-0 p-1 bg-amber-400/20 rounded-lg border border-amber-400/30">
                {activeHoverOption ? activeHoverOption.icon : actor.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-title text-amber-300 uppercase tracking-wide truncate">
                  {activeHoverOption ? `Previewing: ${activeHoverOption.title}` : `${actor.name} · ${actor.role}`}
                </div>
                <div className="text-[11px] font-chunky text-slate-200 line-clamp-1">
                  {activeHoverOption?.previewDialogue ||
                    (levelTheme === 'vet_clinic'
                      ? 'Dr. Kavita: Miso is resting on the exam table. Treatment is proceeding smoothly.'
                      : levelTheme === 'cozy_home'
                      ? 'Miso is thriving in your sunny home, purring by the window!'
                      : isMiso
                      ? 'Miso looks at you with wide amber eyes, hoping for aid.'
                      : 'The Shivaji Park carnival grounds await your business decisions!')}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Controls */}
          {customControls && (
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar">
              {customControls}
            </div>
          )}

          {/* RPG Card Deck Grid with Staggered Deal-In Animation */}
          {!customControls && (
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2.5">
              {options.map((option, idx) => {
                const isHovered = hoveredOptionId === option.id;
                const isExecuting = executingOption?.id === option.id;

                // Action badge type
                const isFree = !option.costAmount || option.costAmount === 0;
                const isUrgent = option.id.includes('vet') || option.id.includes('urgent');

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!!executingOption || transitionMode !== 'none'}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                    onMouseEnter={() => {
                      setHoveredOptionId(option.id);
                      soundFX.playClick();
                    }}
                    onMouseLeave={() => setHoveredOptionId(null)}
                    onClick={() => triggerOptionAction(option)}
                    className={`relative w-full text-left rounded-2xl p-3 border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md animate-card-deal ${
                      isExecuting
                        ? 'border-amber-400 bg-amber-500/20 scale-[0.98]'
                        : isHovered
                        ? 'border-amber-400 bg-slate-800 -translate-y-0.5 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Hotkey Tag Ribbon */}
                    <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 font-mono text-[10px] font-black text-amber-400 shadow-sm">
                      KEY [{idx + 1}]
                    </div>

                    {/* Option Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl bg-slate-900 border border-slate-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {option.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-title text-xs md:text-sm text-white truncate">
                            {option.title}
                          </h3>
                        </div>

                        <p className="font-chunky text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                          {option.description}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-amber-300 border border-amber-400/30">
                            {option.badge}
                          </span>
                          {option.costBadge && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                isFree
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {option.costBadge}
                            </span>
                          )}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              <Activity className="h-2.5 w-2.5" />
                              <span>PRIORITY CARE</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Arrow Button */}
                    <div className="shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isHovered
                            ? 'bg-amber-400 text-slate-950 scale-110 shadow-md'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Footer Bar with Level Indicator */}
          <footer className="flex-none px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="uppercase font-bold text-slate-300">
                SCENE: {levelTheme.replace('_', ' ')}
              </span>
            </div>
            <div className="font-mono text-slate-400">
              STAGE {stage}/{totalStages}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
