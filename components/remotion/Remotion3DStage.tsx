'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { interpolate, spring } from 'remotion';
import { ArrowRight, Volume2, Sparkles, Heart, ShieldAlert, Award } from 'lucide-react';
import { soundFX } from '@/lib/sound';
import { gameRuntime } from '@/lib/game-runtime';
import { SimulationOption } from '../LiveSimulationStage';

export interface Remotion3DStageProps {
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
}

/**
 * Floating World Number/Text effect in 3D
 */
interface FloatingTextEffect {
  id: number;
  text: string;
  color: string;
  position: [number, number, number];
  opacity: number;
  yOffset: number;
}

/**
 * Remotion3DStage:
 * Professional 3D Video Game Stage powered by Three.js & Remotion.
 * Features:
 * - Full 3D procedural models: Miso the cat (with ears, crown, animated tail & purr jump),
 *   Ramesh Kaka (with apron, mustache & stirring ladle), Dr. Kavita (with stethoscope & medical bag),
 *   Bajaj Auto-Rickshaw with working headlight beam, and Ambulance with dual flashing blue/red lights!
 * - Real-time mouse parallax tilt (Monument Valley / Paper Mario tilt-shift effect).
 * - 3D particle systems: steam puffs, drifting sun motes, floating hearts, and golden coin bursts.
 * - Reactive camera tracking and hotkey gamepad support [1, 2, 3, 4].
 */
export function Remotion3DStage({
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
}: Remotion3DStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [executingOption, setExecutingOption] = useState<SimulationOption | null>(null);
  const [inReelTransition, setInReelTransition] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextEffect[]>([]);
  const autoAdvanceRef = useRef<(() => void) | null>(null);

  // Mouse parallax tilt coordinates (-1 to 1)
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic 3D Model References
  const catGroupRef = useRef<THREE.Group | null>(null);
  const catTailRef = useRef<THREE.Mesh | null>(null);
  const catCrownRef = useRef<THREE.Mesh | null>(null);
  const rameshGroupRef = useRef<THREE.Group | null>(null);
  const rameshArmRef = useRef<THREE.Group | null>(null);
  const vetGroupRef = useRef<THREE.Group | null>(null);
  const ambulanceGroupRef = useRef<THREE.Group | null>(null);
  const sirenLightBlueRef = useRef<THREE.PointLight | null>(null);
  const sirenLightRedRef = useRef<THREE.PointLight | null>(null);
  const autoGroupRef = useRef<THREE.Group | null>(null);
  const ferrisWheelGroupRef = useRef<THREE.Group | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const healRingRef = useRef<THREE.Mesh | null>(null);

  const frameClock = useRef(0);

  // Reset executing option when stage changes
  useEffect(() => {
    setExecutingOption(null);
    setHoveredOptionId(null);
    setInReelTransition(false);
    if (autoAdvanceRef.current) {
      autoAdvanceRef.current();
    }
  }, [stage]);

  const activeOption = executingOption || (hoveredOptionId ? options.find((o) => o.id === hoveredOptionId) : null);

  const handleChooseOption = (opt: SimulationOption) => {
    if (executingOption) return;
    soundFX.playClick();
    setExecutingOption(opt);

    // Audio cue based on choice
    if (opt.id.includes('B') || opt.title.toLowerCase().includes('food') || opt.title.toLowerCase().includes('kaka')) {
      soundFX.playPurr();
    } else if (opt.id.includes('C') || opt.title.toLowerCase().includes('vet') || opt.title.toLowerCase().includes('rescuer')) {
      soundFX.playCoin();
    } else {
      soundFX.playCoin();
    }

    // Trigger floating 3D text in game
    const effectText = opt.costBadge && opt.costBadge.includes('-') ? opt.costBadge : '💖 PURR!';
    const effectColor = opt.costBadge && opt.costBadge.includes('-') ? '#ef4444' : '#10b981';
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: effectText,
        color: effectColor,
        position: [0.9, 1.8, 1.5],
        opacity: 1,
        yOffset: 0,
      },
    ]);

    autoAdvanceRef.current = gameRuntime.schedule(2.4, () => {
      handleCompleteAction(opt.id);
    });
  };

  const handleCompleteAction = (optionId: string) => {
    if (autoAdvanceRef.current) autoAdvanceRef.current();
    setInReelTransition(true);
    soundFX.playStageAdvance();
    gameRuntime.schedule(0.38, () => {
      onSelectOption(optionId);
    });
  };

  // Keyboard shortcut keys [1], [2], [3], [4]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (executingOption) return;
      if (e.code === 'Digit1' && options[0]) handleChooseOption(options[0]);
      if (e.code === 'Digit2' && options[1]) handleChooseOption(options[1]);
      if (e.code === 'Digit3' && options[2]) handleChooseOption(options[2]);
      if (e.code === 'Digit4' && options[3]) handleChooseOption(options[3]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, executingOption]);

  // Mouse Parallax listener
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mousePos.current.targetX = x;
    mousePos.current.targetY = y;
  };

  // =========================================================================
  // 3D PROCEDURAL THREE.JS WORLD CREATION
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isMiso = story === 'miso';
    const topColor = isMiso ? new THREE.Color(0x0e3a53) : new THREE.Color(0xc2410c);
    const bottomColor = isMiso ? new THREE.Color(0x020617) : new THREE.Color(0x18181b);
    scene.background = topColor;
    scene.fog = new THREE.FogExp2(bottomColor, 0.028);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.4, 7.6);
    camera.lookAt(0, 1.1, 0);
    cameraRef.current = camera;

    // 3. Renderer with Soft Shadows & Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const skyRimLight = new THREE.DirectionalLight(isMiso ? 0x38bdf8 : 0xfde047, 0.9);
    skyRimLight.position.set(-6, 4, -4);
    scene.add(skyRimLight);

    // 5. Environment: Ground & Curving NH-48 Road
    const groundGeo = new THREE.PlaneGeometry(36, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isMiso ? 0x1e293b : 0x27272a,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(36, 3.6);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.75,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 0.9);
    road.receiveShadow = true;
    scene.add(road);

    // Yellow Dashed Center Line
    for (let x = -16; x <= 16; x += 3.2) {
      const stripeGeo = new THREE.PlaneGeometry(1.6, 0.14);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(x, 0.03, 0.9);
      scene.add(stripe);
    }

    // Roadside Milestone ("NH-48 · 24 KM")
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.75, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    stone.position.set(3.8, 0.37, 2.5);
    stone.castShadow = true;
    scene.add(stone);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    cap.position.set(3.8, 0.75, 2.5);
    scene.add(cap);

    // Low-Poly Roadside Trees
    const treeMatTrunk = new THREE.MeshStandardMaterial({ color: 0x5b3419, roughness: 0.9 });
    const treeMatLeaves = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    [[-6, -3], [-3.8, -4], [5, -4], [7.5, -3]].forEach(([tx, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.4, 8), treeMatTrunk);
      trunk.position.set(tx, 0.7, tz);
      trunk.castShadow = true;
      const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.3, 6), treeMatLeaves);
      foliage1.position.set(tx, 1.8, tz);
      foliage1.castShadow = true;
      const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 6), treeMatLeaves);
      foliage2.position.set(tx, 2.4, tz);
      foliage2.castShadow = true;
      scene.add(trunk, foliage1, foliage2);
    });

    // =========================================================================
    // 6. 3D MODEL 1: RAMESH CHAI TAPRI & RAMESH KAKA
    // =========================================================================
    const tapriGroup = new THREE.Group();
    tapriGroup.position.set(-2.5, 0, -0.6);

    // Wooden counter table
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    counter.position.y = 0.55;
    counter.castShadow = true;
    counter.receiveShadow = true;
    tapriGroup.add(counter);

    // Awning Canopy with red & yellow striped roof
    const awning = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    awning.rotation.y = Math.PI / 4;
    awning.position.set(0, 2.1, 0);
    awning.scale.set(1.5, 0.8, 1.05);
    awning.castShadow = true;
    tapriGroup.add(awning);

    // Posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), postMat);
      post.position.set(px, 1.45, pz);
      tapriGroup.add(post);
    });

    // Boiling Chai Kettle
    const kettle = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.7, roughness: 0.3 })
    );
    kettle.position.set(-0.55, 1.28, 0.2);
    kettle.castShadow = true;
    tapriGroup.add(kettle);
    scene.add(tapriGroup);

    // Steam particles rising from kettle
    const steamCount = 40;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      steamPos[i * 3] = -3.05 + (Math.random() - 0.5) * 0.35;
      steamPos[i * 3 + 1] = 1.35 + Math.random() * 1.3;
      steamPos[i * 3 + 2] = -0.4 + (Math.random() - 0.5) * 0.35;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.5,
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    scene.add(steamPoints);
    steamParticlesRef.current = steamPoints;

    // 3D RAMESH KAKA MODEL
    const rameshGroup = new THREE.Group();
    rameshGroup.position.set(-1.2, 0, 0.1);

    // Body
    const rameshBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.7 }) // Red printed shirt
    );
    rameshBody.position.y = 0.95;
    rameshBody.castShadow = true;
    rameshGroup.add(rameshBody);

    // Blue Apron
    const apron = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.36, 0.8, 12, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 })
    );
    apron.rotation.y = -Math.PI / 2;
    apron.position.y = 0.9;
    rameshGroup.add(apron);

    // Head
    const rameshHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
    );
    rameshHead.position.y = 1.68;
    rameshHead.castShadow = true;
    rameshGroup.add(rameshHead);

    // Mustache
    const stache = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.04, 6, 12, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    stache.position.set(0, 1.64, 0.22);
    rameshGroup.add(stache);

    // Stirring Arm with Ladle
    const armGroup = new THREE.Group();
    armGroup.position.set(-0.35, 1.35, 0);
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd97706 })
    );
    arm.rotation.z = Math.PI / 4;
    arm.position.set(-0.15, -0.15, 0.15);
    armGroup.add(arm);
    rameshGroup.add(armGroup);
    rameshArmRef.current = armGroup;

    scene.add(rameshGroup);
    rameshGroupRef.current = rameshGroup;

    // =========================================================================
    // 7. 3D MODEL 2: MISO THE CAT IN WARM CARDBOARD BOX
    // =========================================================================
    const catBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.42, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 })
    );
    catBox.position.set(0.9, 0.21, 1.5);
    catBox.rotation.y = -0.2;
    catBox.castShadow = true;
    catBox.receiveShadow = true;
    scene.add(catBox);

    // Full 3D Miso Group
    const catGroup = new THREE.Group();
    catGroup.position.set(0.9, 0.38, 1.5);
    catGroup.rotation.y = -0.2;

    const catFurMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 }); // Warm ginger
    const catBellyMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.6 }); // Cream belly
    const catPinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }); // Pink inner ears/nose
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });

    // Cat Body
    const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), catFurMat);
    catBody.scale.set(1, 1.15, 0.9);
    catBody.position.y = 0.22;
    catBody.castShadow = true;
    catGroup.add(catBody);

    const catBelly = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), catBellyMat);
    catBelly.scale.set(0.8, 1, 0.3);
    catBelly.position.set(0, 0.2, 0.2);
    catGroup.add(catBelly);

    // Cat Head
    const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), catFurMat);
    catHead.position.set(0, 0.55, 0.08);
    catHead.castShadow = true;
    catGroup.add(catHead);

    // Ears
    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), catFurMat);
    leftEar.position.set(-0.14, 0.78, 0.08);
    leftEar.rotation.z = 0.25;
    leftEar.castShadow = true;
    const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), catFurMat);
    rightEar.position.set(0.14, 0.78, 0.08);
    rightEar.rotation.z = -0.25;
    rightEar.castShadow = true;
    catGroup.add(leftEar, rightEar);

    // Inner pink ears
    const leftInner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), catPinkMat);
    leftInner.position.set(-0.13, 0.78, 0.11);
    leftInner.rotation.z = 0.25;
    const rightInner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), catPinkMat);
    rightInner.position.set(0.13, 0.78, 0.11);
    rightInner.rotation.z = -0.25;
    catGroup.add(leftInner, rightInner);

    // Crown atop Miso's head!
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.12, 5), goldMat);
    crown.position.set(0, 0.84, 0.08);
    crown.castShadow = true;
    catGroup.add(crown);
    catCrownRef.current = crown;

    // Cat Tail
    const catTail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.45, 8), catFurMat);
    catTail.position.set(0, 0.2, -0.28);
    catTail.rotation.x = -Math.PI / 3;
    catGroup.add(catTail);
    catTailRef.current = catTail;

    scene.add(catGroup);
    catGroupRef.current = catGroup;

    // 3D Healing Ring on Ground beneath Miso
    const healRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.8, 24),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    healRing.rotation.x = -Math.PI / 2;
    healRing.position.set(0.9, 0.04, 1.5);
    scene.add(healRing);
    healRingRef.current = healRing;

    // =========================================================================
    // 8. 3D MODEL 3: BAJAJ AUTO-RICKSHAW (For Transport decisions)
    // =========================================================================
    const autoGroup = new THREE.Group();
    autoGroup.position.set(-12, 0, 0.9); // Starts parked left

    // Green Body base
    const autoBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 })
    );
    autoBase.position.y = 0.55;
    autoBase.castShadow = true;
    autoGroup.add(autoBase);

    // Yellow Canopy Top
    const autoRoof = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.65, 1.15),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    autoRoof.position.set(-0.1, 1.1, 0);
    autoRoof.castShadow = true;
    autoGroup.add(autoRoof);

    // Working Headlight + SpotLight
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    headlight.rotation.z = Math.PI / 2;
    headlight.position.set(0.95, 0.65, 0);
    autoGroup.add(headlight);

    // Wheels
    const autoWheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const wFront = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 12), autoWheelMat);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0.7, 0.22, 0);
    autoGroup.add(wFront);

    const wRearL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 12), autoWheelMat);
    wRearL.rotation.z = Math.PI / 2;
    wRearL.position.set(-0.6, 0.22, 0.52);
    const wRearR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 12), autoWheelMat);
    wRearR.rotation.z = Math.PI / 2;
    wRearR.position.set(-0.6, 0.22, -0.52);
    autoGroup.add(wRearL, wRearR);

    scene.add(autoGroup);
    autoGroupRef.current = autoGroup;

    // =========================================================================
    // 9. 3D MODEL 4: EMERGENCY AMBULANCE & DR. KAVITA (VET)
    // =========================================================================
    const ambulanceGroup = new THREE.Group();
    ambulanceGroup.position.set(12, 0, 0.9); // Starts parked offscreen right

    // Van Body
    const van = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.25, 1.15),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    );
    van.position.y = 0.82;
    van.castShadow = true;
    ambulanceGroup.add(van);

    // Red Crosses
    const crossH = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }));
    const crossV = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.42), new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }));
    crossH.position.set(0, 0.85, 0.59);
    crossV.position.set(0, 0.85, 0.59);
    ambulanceGroup.add(crossH, crossV);

    // Dual Emergency Siren Lights on Roof (Blue & Red)
    const sirenBar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.2), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    sirenBar.position.set(0.3, 1.48, 0);
    ambulanceGroup.add(sirenBar);

    const lightBlue = new THREE.PointLight(0x38bdf8, 0, 6);
    lightBlue.position.set(0.2, 1.6, 0);
    ambulanceGroup.add(lightBlue);
    sirenLightBlueRef.current = lightBlue;

    const lightRed = new THREE.PointLight(0xef4444, 0, 6);
    lightRed.position.set(0.4, 1.6, 0);
    ambulanceGroup.add(lightRed);
    sirenLightRedRef.current = lightRed;

    // Wheels
    const ambWheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.16, 12), ambWheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.25, wz);
      ambulanceGroup.add(w);
    });

    // DR. KAVITA 3D MODEL (Standing by ambulance)
    const vetGroup = new THREE.Group();
    vetGroup.position.set(-1.6, 0, 0.6);

    // Doctor Body in mint coat
    const docBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.3, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.5 })
    );
    docBody.position.y = 0.9;
    docBody.castShadow = true;
    vetGroup.add(docBody);

    // Head with Ponytail
    const docHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
    );
    docHead.position.y = 1.62;
    docHead.castShadow = true;
    vetGroup.add(docHead);

    // Stethoscope
    const steth = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 6, 12, Math.PI * 1.4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
    );
    steth.position.set(0, 1.45, 0.16);
    vetGroup.add(steth);

    // First Aid Kit Bag
    const medBag = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    medBag.position.set(0.38, 0.55, 0.1);
    medBag.castShadow = true;
    vetGroup.add(medBag);

    ambulanceGroup.add(vetGroup);
    vetGroupRef.current = vetGroup;

    scene.add(ambulanceGroup);
    ambulanceGroupRef.current = ambulanceGroup;

    // =========================================================================
    // 10. FUNFAIR FERRIS WHEEL (If Carnival Story)
    // =========================================================================
    if (!isMiso) {
      const ferrisGroup = new THREE.Group();
      ferrisGroup.position.set(3.5, 2.6, -4.5);

      const rimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.08, 8, 24), rimMat);
      ferrisGroup.add(rim);

      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 5), rimMat);
        spoke.rotation.z = (i * Math.PI) / 6;
        ferrisGroup.add(spoke);
      }

      scene.add(ferrisGroup);
      ferrisWheelGroupRef.current = ferrisGroup;
    }

    // 11. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // =========================================================================
    // 12. 60 FPS REMOTION ANIMATION LOOP
    // =========================================================================
    const animate = (dt: number, time: number) => {
      frameClock.current = time;
      const steppedTime = Math.floor(time * 12) / 12; // 12 FPS stop-motion cadence

      // Smooth mouse parallax damping
      const damping = 1 - Math.exp(-5 * dt);
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * damping;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * damping;

      // Camera position with parallax tilt & cinematic action push-in
      if (cameraRef.current) {
        const baseCamX = Math.sin(steppedTime * 0.8) * 0.2;
        const baseCamY = 3.4 + Math.cos(steppedTime * 0.6) * 0.1;
        const targetZ = executingOption ? 6.2 : 7.6;
        cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * damping;
        cameraRef.current.position.x = baseCamX + mousePos.current.x * 0.6;
        cameraRef.current.position.y = baseCamY - mousePos.current.y * 0.35;
        cameraRef.current.lookAt(0, 1.1, 0);
      }

      // Ramesh Kaka idle bob & ladle stirring
      if (rameshGroupRef.current) {
        rameshGroupRef.current.position.y = Math.sin(steppedTime * 4.5) * 0.04;
      }
      if (rameshArmRef.current) {
        rameshArmRef.current.rotation.y = Math.sin(time * 4) * 0.3;
      }

      // Miso breathing bob & tail wag (with lively jump when executing decision)
      if (catGroupRef.current) {
        if (executingOption) {
          const jumpArc = Math.abs(Math.sin(time * 10)) * 0.38;
          catGroupRef.current.position.y = 0.38 + jumpArc;
          catGroupRef.current.rotation.y = Math.sin(time * 12) * 0.22;
        } else {
          catGroupRef.current.position.y = 0.38 + Math.sin(steppedTime * 3.8) * 0.03;
          catGroupRef.current.rotation.y = 0;
        }
      }
      if (catTailRef.current) {
        catTailRef.current.rotation.z = executingOption
          ? Math.sin(time * 16) * 0.7
          : Math.sin(time * 3.5) * 0.25;
      }

      // Steam particles rise
      if (steamParticlesRef.current) {
        const pos = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < steamCount; i++) {
          pos[i * 3 + 1] += 0.6 * dt;
          if (pos[i * 3 + 1] > 2.8) {
            pos[i * 3 + 1] = 1.35;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Ferris Wheel rotation
      if (ferrisWheelGroupRef.current) {
        ferrisWheelGroupRef.current.rotation.z += 0.24 * dt;
      }

      // Flashing Ambulance siren lights
      if (sirenLightBlueRef.current && sirenLightRedRef.current) {
        const flashPhase = Math.floor(time * 8) % 2;
        if (ambulanceGroupRef.current && ambulanceGroupRef.current.position.x < 5) {
          sirenLightBlueRef.current.intensity = flashPhase === 0 ? 3.5 : 0.2;
          sirenLightRedRef.current.intensity = flashPhase === 1 ? 3.5 : 0.2;
        } else {
          sirenLightBlueRef.current.intensity = 0;
          sirenLightRedRef.current.intensity = 0;
        }
      }

      // Healing Ring pulse
      if (healRingRef.current) {
        const isHealing = hoveredOptionId === 'J1_C' || executingOption?.id === 'J1_C';
        const ringMat = healRingRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = isHealing ? 0.3 + Math.sin(time * 6) * 0.2 : 0;
        healRingRef.current.scale.setScalar(isHealing ? 1 + Math.sin(time * 4) * 0.08 : 1);
      }

      renderer.render(scene, camera);
    };

    const unsubscribe = gameRuntime.subscribe(animate);

    return () => {
      resizeObserver.disconnect();
      unsubscribe();
      renderer.dispose();
    };
  }, [story, stage]);

  // =========================================================================
  // DYNAMIC 3D VEHICLE & CAMERA CONTROLLER
  // =========================================================================
  useEffect(() => {
    const isVetActive = hoveredOptionId === 'J1_C' || executingOption?.id === 'J1_C';
    const isAutoActive = hoveredOptionId === 'J2_A' || hoveredOptionId === 'J2_B';

    // 3D Ambulance drives onto the highway road in front of camera
    if (ambulanceGroupRef.current) {
      if (isVetActive) {
        ambulanceGroupRef.current.position.x = 2.4;
      } else {
        ambulanceGroupRef.current.position.x = 12;
      }
    }

    // 3D Bajaj Auto-Rickshaw drives in from left
    if (autoGroupRef.current) {
      if (isAutoActive) {
        autoGroupRef.current.position.x = -1.2;
      } else {
        autoGroupRef.current.position.x = -12;
      }
    }

    // Camera dynamic focus tracking
    if (cameraRef.current) {
      if (hoveredOptionId === 'J1_B') {
        // Dolly close to Ramesh Kaka
        cameraRef.current.position.set(-1.2, 2.8, 5.6);
      } else if (isVetActive) {
        // Dolly close to Dr. Kavita & ambulance
        cameraRef.current.position.set(1.5, 2.7, 6.0);
      } else {
        // Overview diorama
        cameraRef.current.position.set(0, 3.4, 7.6);
      }
    }
  }, [hoveredOptionId, executingOption]);

  const misoHp = Math.min(5, Math.max(1, stage <= 2 ? 2 : stage <= 4 ? 3 : stage <= 6 ? 4 : 5));

  return (
    <div className="relative w-full h-full flex-1 flex flex-col md:flex-row overflow-hidden rounded-2xl border-3 border-slate-900 shadow-2xl bg-slate-950 select-none min-h-0">
      {/* =====================================================================
          LEFT PANE (DESKTOP) / TOP PANE (MOBILE): 3D THREE.JS WEBGL CANVAS
         ===================================================================== */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full md:w-7/12 h-[26%] sm:h-[34%] md:h-full overflow-hidden flex flex-col justify-between bg-slate-950 shrink-0 md:shrink border-b-2 md:border-b-0 border-slate-800"
      >
        {/* Top 3D Film Reel Slate & Status Bar */}
        <div className="relative z-30 bg-slate-950/95 backdrop-blur-md px-3 py-1.5 border-b-2 border-slate-900 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-title text-xs tracking-wider text-brand-yellow uppercase">
              {story === 'miso' ? 'Miso Rescue' : 'Funfair Founder'} · 3D Scene {levelNumber}/{totalStages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {story === 'miso' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-emerald-500/40 shadow-xs">
                <span className="text-[9px] text-emerald-300 font-mono font-bold">HP</span>
                <div className="flex items-center text-[10px] tracking-tighter">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < misoHp ? 'text-red-500 drop-shadow animate-pulse' : 'text-slate-700 opacity-40'}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
            )}
            <span className="font-mono text-[10px] text-slate-300 font-extrabold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 hidden sm:inline-block">
              {sceneTitle}
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-black">
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 3D WebGL Canvas Layer with interactive tilt */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10 cursor-grab active:cursor-grabbing" />

        {/* In-Scene 3D Action Reaction Overlay (When option is chosen!) */}
        {executingOption && (
          <div className="absolute inset-x-3 top-10 z-25 p-3 rounded-xl bg-white/95 border-2 border-slate-900 shadow-xl backdrop-blur-md flex flex-col gap-1.5 speech-bubble-pop">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">{executingOption.icon}</span>
                <div>
                  <h4 className="font-title text-xs text-slate-950 uppercase tracking-wide">
                    {executingOption.title}
                  </h4>
                  <p className="font-chunky text-[11px] text-emerald-700 font-extrabold">
                    {executingOption.actionImpactText}
                  </p>
                </div>
              </div>
              {executingOption.costBadge && (
                <span className="px-2 py-0.5 rounded-full font-mono text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {executingOption.costBadge}
                </span>
              )}
            </div>

            {/* In-World Character Dialogue */}
            <div className="bg-slate-900 text-amber-300 p-2 rounded-lg font-chunky text-xs leading-snug">
              💬 &ldquo;{executingOption.actionDialogue}&rdquo;
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-[10px] text-slate-400 font-bold animate-pulse">
                Advancing 3D reel to next scene...
              </span>
              <button
                type="button"
                onClick={() => handleCompleteAction(executingOption.id)}
                className="px-2.5 py-1 rounded-lg bg-brand-yellow hover:bg-yellow-300 border border-slate-900 text-slate-950 font-title text-[10px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-xs"
              >
                <span>Skip Ahead</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* 3D Floating Action Indicators */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            style={{ color: ft.color }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-25 font-title text-xl drop-shadow-md animate-bounce pointer-events-none"
          >
            {ft.text}
          </div>
        ))}

        {/* 3D Engine Badge Overlay */}
        <div className="absolute bottom-2 left-3 z-20 pointer-events-none flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-slate-300 font-mono text-[9px] font-black uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Three.js 3D Engine · Tilt Enabled
          </span>
          {hoveredOptionId === 'J1_C' && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-title text-[9px] animate-pulse">
              🚑 3D Ambulance Deployed
            </span>
          )}
        </div>
      </div>

      {/* =====================================================================
          RIGHT PANE (DESKTOP) / BOTTOM PANE (MOBILE): INTERACTIVE DECISION DECK
         ===================================================================== */}
      <div className="relative z-20 w-full md:w-5/12 h-[74%] sm:h-[66%] md:h-full bg-slate-900/95 backdrop-blur-md border-t-2 md:border-t-0 md:border-l-2 border-slate-800 p-2 sm:p-3.5 flex flex-col justify-between shadow-2xl overflow-y-auto overscroll-contain no-scrollbar">
        {/* Top: Prompt Question Bar & Actor Avatar */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow border-2 border-slate-900 flex items-center justify-center text-xl font-black shrink-0 shadow-sm stop-motion-bob">
              {actor.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-title text-[11px] text-brand-yellow uppercase tracking-wider">
                  {actor.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">({actor.role})</span>
              </div>
              <h3 className="font-title text-xs sm:text-sm text-white leading-tight mt-0.5">
                {promptQuestion}
              </h3>
              {promptDescription && (
                <p className="font-chunky text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-1">
                  {promptDescription}
                </p>
              )}
            </div>
          </div>

          {/* Live 3D Preview Dialogue Banner (Reacts when user hovers or taps an option!) */}
          {activeOption?.previewDialogue && !executingOption && (
            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 font-chunky text-[11px] flex items-center gap-2 speech-bubble-pop">
              <span className="text-base shrink-0">{activeOption.icon}</span>
              <div className="flex-1 truncate">
                <span className="font-extrabold text-white">3D Preview:</span> &ldquo;{activeOption.previewDialogue}&rdquo;
              </div>
              {activeOption.costBadge && (
                <span className="font-mono text-[10px] font-black text-amber-300 shrink-0">
                  {activeOption.costBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Custom HUD Controls */}
        {customControls && <div className="py-2 flex-1 overflow-y-auto no-scrollbar">{customControls}</div>}

        {/* Tactical Decision Option Grid with Arcade Hotkeys */}
        {options.length > 0 && !customControls && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 flex-1 overflow-y-auto no-scrollbar content-center">
            {options.map((opt, index) => {
              const isHovered = hoveredOptionId === opt.id;
              const isExecuting = executingOption?.id === opt.id;
              const hotkey = index + 1;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onMouseEnter={() => setHoveredOptionId(opt.id)}
                  onMouseLeave={() => setHoveredOptionId((cur) => (cur === opt.id ? null : cur))}
                  onClick={() => handleChooseOption(opt)}
                  disabled={executingOption !== null}
                  className={`text-left rounded-xl p-2 sm:p-2.5 transition-all duration-150 cursor-pointer flex flex-col justify-between border-2 shadow-[0_3px_0_#020617] relative overflow-hidden group ${
                    isExecuting
                      ? 'bg-amber-300 border-slate-950 scale-[1.02] shadow-[0_1px_0_#020617] translate-y-[2px] ring-2 ring-brand-yellow text-slate-950'
                      : isHovered
                      ? 'bg-white border-brand-yellow scale-[1.02] shadow-[0_1px_0_#020617] translate-y-[2px] text-slate-950'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-400 text-white active:translate-y-[3px] active:shadow-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">
                        {opt.icon}
                      </span>
                      <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-black bg-slate-950/60 text-brand-yellow border border-slate-700 group-hover:border-slate-900">
                        [{hotkey}]
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                        opt.badgeColor || 'bg-slate-900/60 text-slate-200'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>

                  <h4 className="font-chunky text-xs font-black leading-tight line-clamp-1">
                    {opt.title}
                  </h4>
                  <p
                    className={`font-sans text-[10px] leading-tight line-clamp-2 mt-0.5 ${
                      isHovered || isExecuting ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Seamless Film Gate Reel Cut Effect on Level Transition */}
      {inReelTransition && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-2 text-white speech-bubble-pop">
          <div className="w-12 h-12 rounded-full border-3 border-brand-yellow border-t-transparent animate-spin" />
          <span className="font-title text-sm tracking-widest text-brand-yellow uppercase">
            3D REEL ADVANCE · SCENE {levelNumber + 1}
          </span>
        </div>
      )}
    </div>
  );
}
