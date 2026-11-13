import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { WorldSceneId } from '../data/curriculum';
import { soundEngine } from '../audio/soundEngine';
import { createProceduralTextures } from './textures';
import { buildHeroModel } from './models';
import { createWorldScene, type WorldRefs } from './worlds';

export interface WorldViewportProps {
  gameState: 'title' | 'playing' | 'paused' | 'gameover';
  activeWorld: WorldSceneId;
  calculatorFamilyCount: number;
  houseUpgradeLevels: {
    pokok: number;
    pendidikan: number;
    kesehatan: number;
    darurat: number;
  };
  treeGrowthStage: number; // 0..6
  bossHitPulse: number; // increments when boss takes a hit
  bossDefeated: boolean;
  collectRiceMode: boolean;
  collectedRiceIds: string[];
  onCoinPickup: () => void;
  onRiceSackPickup: (sackId: string) => void;
  onInteractPromptChange: (prompt: string | null) => void;
  onTriggerWorldInteract: (actionType: string) => void;
  virtualMoveRef: React.MutableRefObject<{ x: number; z: number; jumpRequested: boolean }>;
}

// Pre-allocated zero-GC scratch objects outside animation loop
const _camGoal = new THREE.Vector3();
const _lookGoal = new THREE.Vector3();
const _camLookCurrent = new THREE.Vector3(0, 1.8, -3);
const _moveDir = new THREE.Vector3();
const _dummyMatrix = new THREE.Matrix4();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _dummyPos = new THREE.Vector3();
const _particleColor = new THREE.Color();

interface PooledParticle {
  active: boolean;
  age: number;
  life: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: number;
}

const PARTICLE_POOL_SIZE = 48;

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const rendererStr = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return true;
  }
}

export function WorldViewport(props: WorldViewportProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const syncNowRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || window.innerWidth || 1280;
    const initH = container.clientHeight || window.innerHeight || 720;
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, initW / initH, 0.2, 160);
    camera.position.set(0, 7.5, 16);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);

    // 3-Point Studio / Outdoor Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x3f6212, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d1, 1.42);
    keyLight.position.set(14, 24, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 70;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.42);
    rimLight.position.set(-14, 12, -16);
    scene.add(rimLight);

    // Hero character (persistent across worlds)
    const heroRig = buildHeroModel(textures.contactShadowMap);
    scene.add(heroRig.root);

    // Pooled Zero-GC Particle Ring Buffer (InstancedMesh)
    const particleGeo = new THREE.OctahedronGeometry(0.18, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.5,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_POOL_SIZE);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);

    const particlePool: PooledParticle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      age: 0,
      life: 0.7,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      color: 0xfacc15,
    }));
    let particleCursor = 0;

    const spawnParticleBurst = (origin: THREE.Vector3, count: number, colorHex: number) => {
      for (let i = 0; i < count; i++) {
        const p = particlePool[particleCursor];
        particleCursor = (particleCursor + 1) % PARTICLE_POOL_SIZE;
        p.active = true;
        p.age = 0;
        p.life = 0.55 + Math.random() * 0.35;
        p.pos.copy(origin);
        p.pos.y += 0.9;
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 2.4 + Math.random() * 3.5;
        p.vel.set(Math.cos(angle) * speed, 3.2 + Math.random() * 3.5, Math.sin(angle) * speed);
        p.color = colorHex;
      }
    };

    // World management
    let currentWorldId: WorldSceneId | null = null;
    let worldRefs: WorldRefs | null = null;

    // Player & simulation state
    const heroPos = new THREE.Vector3(0, 0, 7);
    let heroVelY = 0;
    let heroYaw = Math.PI;
    let heroGrounded = true;
    let coyoteTimer = 0;
    let jumpBufferTimer = 0;
    let walkDistance = 0;
    let stepCooldown = 0;
    let squashScaleY = 1;
    let squashScaleXZ = 1;
    let hitstopTimer = 0;
    let trauma = 0;
    let bossFlashTimer = 0;
    let lastSeenBossPulse = propsRef.current.bossHitPulse;
    let lastPrompt: string | null = null;

    const applyWorld = (nextId: WorldSceneId) => {
      if (worldRefs) {
        scene.remove(worldRefs.group);
      }
      worldRefs = createWorldScene(nextId, textures);
      currentWorldId = nextId;
      scene.add(worldRefs.group);
      scene.background = worldRefs.skyColor;
      scene.fog = new THREE.FogExp2(worldRefs.skyColor.getHex(), worldRefs.fogDensity);
      keyLight.color.setHex(worldRefs.sunColor);
      keyLight.intensity = worldRefs.sunIntensity;
      hemiLight.color.setHex(worldRefs.hemiSky);
      hemiLight.groundColor.setHex(worldRefs.hemiGround);
      hemiLight.intensity = nextId === 'final' ? 0.65 : 0.55;

      heroPos.copy(worldRefs.heroSpawn);
      heroVelY = 0;
      heroGrounded = true;
      heroYaw = worldRefs.heroYaw;
      heroRig.root.position.copy(heroPos);
      heroRig.root.rotation.y = heroYaw;

      if (lastPrompt !== null) {
        lastPrompt = null;
        propsRef.current.onInteractPromptChange(null);
      }

      if (propsRef.current.gameState === 'title') {
        camera.position.set(0, 7.6, 17.5);
        _camLookCurrent.set(1.5, 2.2, -5.5);
      } else {
        _camGoal.copy(heroPos).add(worldRefs.cameraOffset);
        camera.position.copy(_camGoal);
        _camLookCurrent.copy(heroPos).add(worldRefs.lookAtOffset);
      }
      camera.lookAt(_camLookCurrent);
    };

    const syncDynamicWorldState = (pState: WorldViewportProps, instantSnap = false) => {
      if (!worldRefs) return;
      if (worldRefs.calculatorSacks.length > 0) {
        worldRefs.calculatorSacks.forEach((sack, idx) => {
          sack.visible = idx < pState.calculatorFamilyCount;
        });
      }
      for (const cs of worldRefs.collectibleSacks) {
        const isCollected = pState.collectedRiceIds.includes(cs.id);
        cs.collected = isCollected;
        cs.group.visible = !isCollected;
      }
      if (worldRefs.houseRigs) {
        type SingleHouseRig = NonNullable<WorldRefs['houseRigs']>[keyof NonNullable<WorldRefs['houseRigs']>];
        const applyUpgrade = (rig: SingleHouseRig, level: number) => {
          const winMat = rig.lanternGlow.material as THREE.MeshStandardMaterial;
          winMat.emissiveIntensity = level > 0 ? 0.4 + level * 0.45 : 0.15;
          rig.gardenGroup.visible = level >= 1;
          rig.bookCrateGroup.visible = level >= 2;
          rig.roofBanner.visible = level >= 3;
        };
        applyUpgrade(worldRefs.houseRigs.pokok, pState.houseUpgradeLevels.pokok);
        applyUpgrade(worldRefs.houseRigs.pendidikan, pState.houseUpgradeLevels.pendidikan);
        applyUpgrade(worldRefs.houseRigs.kesehatan, pState.houseUpgradeLevels.kesehatan);
        applyUpgrade(worldRefs.houseRigs.darurat, pState.houseUpgradeLevels.darurat);
      }
      if (worldRefs.treeRig && instantSnap) {
        const growth = 0.55 + (pState.treeGrowthStage / 6) * 0.55;
        worldRefs.treeRig.canopyClusters.forEach((cluster) => {
          cluster.scale.setScalar(growth);
        });
        worldRefs.treeRig.goldenHearts.forEach((heart, idx) => {
          heart.visible = idx < pState.treeGrowthStage;
          if (heart.visible) heart.scale.setScalar(1.0);
        });
      }
      if (worldRefs.dragon && instantSnap && pState.bossDefeated) {
        worldRefs.dragon.body.position.y = -0.45;
        worldRefs.dragon.head.rotation.x = 0.38;
      }
    };

    applyWorld(propsRef.current.activeWorld);
    syncDynamicWorldState(propsRef.current, true);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Input Tracking (held + edge-triggered)
    const keysHeld = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (!keysHeld.has(e.code)) {
        if (e.code === 'Space') {
          jumpBufferTimer = 0.14;
        }
        if (e.code === 'KeyE') {
          if (worldRefs && propsRef.current.gameState === 'playing') {
            for (const t of worldRefs.interactables) {
              if (heroPos.distanceTo(t.position) < 4.0) {
                propsRef.current.onTriggerWorldInteract(t.actionType);
                break;
              }
            }
          }
        }
      }
      keysHeld.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.code);
      if (e.code === 'Space' && heroVelY > 2.0) {
        heroVelY *= 0.48; // variable jump cut
      }
    };

    const clearHeldInputs = () => {
      keysHeld.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldInputs);
    document.addEventListener('visibilitychange', clearHeldInputs);

    // Click Raycasting against explicit interactables only
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const onPointerDown = (ev: PointerEvent) => {
      if (propsRef.current.gameState !== 'playing' || !worldRefs) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);

      const objs = worldRefs.interactables.map((t) => t.object);
      const hits = raycaster.intersectObjects(objs, true);
      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj) {
          const found = worldRefs.interactables.find((t) => t.object === hitObj);
          if (found) {
            if (found.actionType === 'collect-sack') {
              const sackEntry = worldRefs.collectibleSacks.find((s) => s.id === found.id);
              if (sackEntry && !sackEntry.collected) {
                sackEntry.collected = true;
                sackEntry.group.visible = false;
                spawnParticleBurst(found.position, 14, 0xfacc15);
                soundEngine.playCoin();
                propsRef.current.onRiceSackPickup(found.id);
              }
            } else {
              spawnParticleBurst(found.position, 10, 0xfacc15);
              propsRef.current.onTriggerWorldInteract(found.actionType);
            }
            break;
          }
          hitObj = hitObj.parent;
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // ResizeObserver for crisp layout
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let drawPending = false;
    let pausedFrameSettled = false;

    function afterDraw(cb: () => void, drawMs: number) {
      const restMs = Math.max(110, Math.min(220, Math.round(drawMs * 0.5) + 95));
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, restMs);
        return;
      }
      gl.flush();
      let polls = 0;
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        polls += 1;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED && polls < 20) {
          frameId = window.setTimeout(poll, 6);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, restMs);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    syncNowRef.current = () => {
      if (disposed) return;
      pausedFrameSettled = false;
      const pState = propsRef.current;
      if (pState.activeWorld !== currentWorldId) {
        applyWorld(pState.activeWorld);
      }
      syncDynamicWorldState(pState, true);
      if (!isSoftwareGl) {
        renderer.render(scene, camera);
      } else if (!drawPending) {
        clearTimeout(frameId);
        tick();
      }
    };

    function tick() {
      if (disposed) return;

      const now = performance.now();
      const rawDt = Math.max(0.001, (now - lastTime) / 1000);
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const pState = propsRef.current;

      // Switch 3D world if changed
      if (pState.activeWorld !== currentWorldId) {
        applyWorld(pState.activeWorld);
        pausedFrameSettled = false;
      }

      // Trigger boss hit juice if counter incremented
      if (pState.bossHitPulse !== lastSeenBossPulse) {
        lastSeenBossPulse = pState.bossHitPulse;
        hitstopTimer = 0.055;
        trauma = 0.65;
        bossFlashTimer = 0.14;
        pausedFrameSettled = false;
        if (worldRefs?.dragon) {
          spawnParticleBurst(worldRefs.dragon.root.position, 24, 0xfacc15);
        }
      }

      const simPaused = pState.gameState === 'paused';
      if (!simPaused) {
        pausedFrameSettled = false;
      }
      if (hitstopTimer > 0) {
        hitstopTimer = Math.max(0, hitstopTimer - dt);
      }
      const simDt = simPaused || hitstopTimer > 0 ? 0 : dt;
      elapsed += simPaused ? 0 : dt;

      if (worldRefs) {
        syncDynamicWorldState(pState, false);
        for (const cs of worldRefs.collectibleSacks) {
          if (!cs.collected) {
            cs.group.rotation.y = elapsed * 1.1;
          }
        }
        if (worldRefs.houseRigs) {
          for (const rig of Object.values(worldRefs.houseRigs)) {
            if (rig.roofBanner.visible) {
              rig.roofBanner.rotation.y = elapsed * 2.2;
            }
          }
        }
        if (worldRefs.treeRig) {
          const growth = 0.55 + (pState.treeGrowthStage / 6) * 0.55;
          worldRefs.treeRig.canopyClusters.forEach((cluster, idx) => {
            const targetScale = growth + Math.sin(elapsed * 1.6 + idx) * 0.025;
            cluster.scale.setScalar(THREE.MathUtils.damp(cluster.scale.x, targetScale, 5, dt));
          });
          worldRefs.treeRig.goldenHearts.forEach((heart, idx) => {
            heart.visible = idx < pState.treeGrowthStage;
            if (heart.visible) {
              heart.rotation.y = elapsed * 2.2 + idx;
              const s = THREE.MathUtils.damp(heart.scale.x, 1.0, 6, dt);
              heart.scale.setScalar(s);
            }
          });
        }

        // Ambient world animations
        for (const c of worldRefs.clouds) {
          c.position.x += simDt * 0.9;
          if (c.position.x > 34) c.position.x = -34;
        }
        worldRefs.coins.forEach((coin, i) => {
          if (coin.visible) {
            coin.rotation.y = elapsed * 2.6 + i * 0.5;
            coin.position.y = Math.sin(elapsed * 3.0 + i) * 0.12;
          }
        });
        worldRefs.mysteryBlocks.forEach((mb, i) => {
          mb.position.y = Math.sin(elapsed * 2.4 + i * 0.8) * 0.14;
          mb.rotation.y = Math.sin(elapsed * 0.9 + i) * 0.14;
        });
        if (worldRefs.windmillBlades) {
          worldRefs.windmillBlades.rotation.z -= simDt * 1.35;
        }
        if (worldRefs.dragon) {
          const d = worldRefs.dragon;
          if (pState.bossDefeated) {
            d.body.position.y = THREE.MathUtils.damp(d.body.position.y, -0.45, 4, dt);
            d.head.rotation.x = THREE.MathUtils.damp(d.head.rotation.x, 0.38, 4, dt);
            d.leftWing.rotation.z = Math.sin(elapsed * 2) * 0.12;
            d.rightWing.rotation.z = -Math.sin(elapsed * 2) * 0.12;
          } else {
            d.body.position.y = Math.sin(elapsed * 2.5) * 0.18;
            d.head.rotation.y = Math.sin(elapsed * 1.4) * 0.15;
            d.leftWing.rotation.z = 0.25 + Math.sin(elapsed * 4.5) * 0.32;
            d.rightWing.rotation.z = -0.25 - Math.sin(elapsed * 4.5) * 0.32;
            d.tail.rotation.y = Math.sin(elapsed * 3.2) * 0.28;
          }
          if (bossFlashTimer > 0) {
            bossFlashTimer = Math.max(0, bossFlashTimer - dt);
            d.flashMeshes.forEach((m) => {
              (m.material as THREE.MeshStandardMaterial).emissive.setHex(0xffffff);
              (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9;
            });
          } else {
            d.flashMeshes.forEach((m) => {
              (m.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
              (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            });
          }
        }

        // Hero Movement & Camera Choreography
        if (pState.gameState === 'title') {
          // Live autonomous coin-running loop on Splash Screen
          const loopAngle = elapsed * 0.65;
          const r = 6.5;
          heroPos.set(Math.cos(loopAngle) * r, 0, Math.sin(loopAngle) * r + 1.5);
          heroYaw = -loopAngle;
          heroRig.root.position.copy(heroPos);
          heroRig.root.rotation.y = heroYaw;

          const runSwing = Math.sin(elapsed * 10.5) * 0.65;
          heroRig.leftLeg.rotation.x = runSwing;
          heroRig.rightLeg.rotation.x = -runSwing;
          heroRig.leftArm.rotation.x = -runSwing * 0.8;
          heroRig.rightArm.rotation.x = runSwing * 0.8;
          heroRig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 10.5)) * 0.14;

          // Scenic flyover framing Castle + Hero + 35% open sky negative space
          _camGoal.set(Math.sin(elapsed * 0.22) * 8, 7.6, 17.5 + Math.cos(elapsed * 0.22) * 2.2);
          _lookGoal.set(1.5, 2.2, -5.5);
          const dampK = 1 - Math.exp(-3.5 * dt);
          camera.position.lerp(_camGoal, dampK);
          _camLookCurrent.lerp(_lookGoal, dampK);
          camera.lookAt(_camLookCurrent);
        } else if (!simPaused) {
          // Player movement
          let mx = pState.virtualMoveRef.current.x;
          let mz = pState.virtualMoveRef.current.z;
          if (keysHeld.has('KeyA') || keysHeld.has('ArrowLeft')) mx -= 1;
          if (keysHeld.has('KeyD') || keysHeld.has('ArrowRight')) mx += 1;
          if (keysHeld.has('KeyW') || keysHeld.has('ArrowUp')) mz -= 1;
          if (keysHeld.has('KeyS') || keysHeld.has('ArrowDown')) mz += 1;

          if (pState.virtualMoveRef.current.jumpRequested) {
            jumpBufferTimer = 0.14;
            pState.virtualMoveRef.current.jumpRequested = false;
          }

          _moveDir.set(mx, 0, mz);
          const isMoving = _moveDir.lengthSq() > 0.01;
          if (isMoving) {
            _moveDir.normalize();
            const speed = 7.4;
            heroPos.x += _moveDir.x * speed * simDt;
            heroPos.z += _moveDir.z * speed * simDt;
            walkDistance += speed * simDt;

            // Clamp outdoor circular boundary naturally
            const distFromOrigin = Math.hypot(heroPos.x, heroPos.z);
            if (distFromOrigin > worldRefs.boundaryRadius) {
              const scale = worldRefs.boundaryRadius / distFromOrigin;
              heroPos.x *= scale;
              heroPos.z *= scale;
            }

            const targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
            let diff = targetYaw - heroYaw;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            heroYaw += diff * (1 - Math.exp(-12 * simDt));

            stepCooldown -= simDt;
            if (heroGrounded && stepCooldown <= 0) {
              soundEngine.playStep();
              stepCooldown = 0.28;
            }
          }

          // Jump with coyote time & input buffering
          if (heroGrounded) {
            coyoteTimer = 0.1;
          } else {
            coyoteTimer = Math.max(0, coyoteTimer - simDt);
          }
          if (jumpBufferTimer > 0) {
            jumpBufferTimer = Math.max(0, jumpBufferTimer - simDt);
          }

          if (jumpBufferTimer > 0 && coyoteTimer > 0) {
            heroVelY = 9.2;
            heroGrounded = false;
            coyoteTimer = 0;
            jumpBufferTimer = 0;
            squashScaleY = 1.22;
            squashScaleXZ = 0.85;
            soundEngine.playJump();
            spawnParticleBurst(heroPos, 5, 0xfef08a);
          }

          if (!heroGrounded || heroPos.y > 0) {
            heroVelY -= 24 * simDt;
            heroPos.y += heroVelY * simDt;
            if (heroPos.y <= 0) {
              heroPos.y = 0;
              heroVelY = 0;
              heroGrounded = true;
              squashScaleY = 0.78;
              squashScaleXZ = 1.18;
            }
          }

          squashScaleY = THREE.MathUtils.damp(squashScaleY, 1, 14, dt);
          squashScaleXZ = THREE.MathUtils.damp(squashScaleXZ, 1, 14, dt);

          heroRig.root.position.copy(heroPos);
          heroRig.root.rotation.y = heroYaw;
          heroRig.bodyGroup.scale.set(squashScaleXZ, squashScaleY, squashScaleXZ);

          const gaitPhase = walkDistance * 2.2;
          const gaitAmp = isMoving && heroGrounded ? 0.62 : 0;
          heroRig.leftLeg.rotation.x = THREE.MathUtils.damp(heroRig.leftLeg.rotation.x, Math.sin(gaitPhase) * gaitAmp, 14, dt);
          heroRig.rightLeg.rotation.x = THREE.MathUtils.damp(heroRig.rightLeg.rotation.x, -Math.sin(gaitPhase) * gaitAmp, 14, dt);
          heroRig.leftArm.rotation.x = THREE.MathUtils.damp(heroRig.leftArm.rotation.x, -Math.sin(gaitPhase) * gaitAmp * 0.8, 14, dt);
          heroRig.rightArm.rotation.x = THREE.MathUtils.damp(heroRig.rightArm.rotation.x, Math.sin(gaitPhase) * gaitAmp * 0.8, 14, dt);
          heroRig.bodyGroup.position.y = heroGrounded && !isMoving ? Math.sin(elapsed * 2.4) * 0.04 : 0;

          // Coin pickup check
          for (const coin of worldRefs.coins) {
            if (coin.visible && Math.hypot(heroPos.x - coin.position.x, heroPos.z - coin.position.z) < 1.35) {
              coin.visible = false;
              spawnParticleBurst(coin.position, 10, 0xfacc15);
              soundEngine.playCoin();
              pState.onCoinPickup();
            }
          }

          // Rice sack pickup check in Magic Rice Field
          if (pState.collectRiceMode) {
            for (const rs of worldRefs.collectibleSacks) {
              if (!rs.collected && Math.hypot(heroPos.x - rs.group.position.x, heroPos.z - rs.group.position.z) < 1.65) {
                rs.collected = true;
                rs.group.visible = false;
                spawnParticleBurst(rs.group.position, 14, 0xfde047);
                soundEngine.playCoin();
                pState.onRiceSackPickup(rs.id);
              }
            }
          }

          // Proximity interaction prompt
          let nearestLabel: string | null = null;
          let nearestDist = 4.2;
          for (const t of worldRefs.interactables) {
            if (t.actionType === 'collect-sack') continue;
            const d = Math.hypot(heroPos.x - t.position.x, heroPos.z - t.position.z);
            if (d < nearestDist) {
              nearestDist = d;
              nearestLabel = t.label;
            }
          }
          if (nearestLabel !== lastPrompt) {
            lastPrompt = nearestLabel;
            pState.onInteractPromptChange(nearestLabel);
          }

          // Smooth Damped Chase Camera + Trauma Shake
          _camGoal.copy(heroPos).add(worldRefs.cameraOffset);
          _lookGoal.copy(heroPos).add(worldRefs.lookAtOffset);
          const camDamp = 1 - Math.exp(-5.5 * dt);
          camera.position.lerp(_camGoal, camDamp);
          _camLookCurrent.lerp(_lookGoal, camDamp);

          if (trauma > 0) {
            const shake = trauma * trauma * 0.45;
            camera.position.x += (Math.random() - 0.5) * shake;
            camera.position.y += (Math.random() - 0.5) * shake;
            trauma = Math.max(0, trauma - dt * 1.9);
          }
          camera.lookAt(_camLookCurrent);
        }
      }

      // Update Pooled Particle Ring Buffer in-place (zero GC)
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const p = particlePool[i];
        if (!p.active) {
          _dummyScale.setScalar(0);
          _dummyMatrix.compose(_dummyPos.set(0, -100, 0), _dummyQuat, _dummyScale);
          particleMesh.setMatrixAt(i, _dummyMatrix);
          continue;
        }
        p.age += dt;
        if (p.age >= p.life) {
          p.active = false;
          _dummyScale.setScalar(0);
          _dummyMatrix.compose(_dummyPos.set(0, -100, 0), _dummyQuat, _dummyScale);
          particleMesh.setMatrixAt(i, _dummyMatrix);
          continue;
        }
        p.vel.y -= 9.8 * dt;
        p.pos.addScaledVector(p.vel, dt);
        const s = (1 - p.age / p.life) * 1.1;
        _dummyScale.setScalar(Math.max(0.01, s));
        _dummyQuat.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, elapsed * 4 + i);
        _dummyMatrix.compose(p.pos, _dummyQuat, _dummyScale);
        particleMesh.setMatrixAt(i, _dummyMatrix);
        _particleColor.setHex(p.color);
        particleMesh.setColorAt(i, _particleColor);
      }
      particleMesh.instanceMatrix.needsUpdate = true;
      if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;

      if (isSoftwareGl && simPaused && pausedFrameSettled) {
        frameId = window.setTimeout(tick, 180);
        return;
      }

      drawPending = true;
      const drawStart = performance.now();
      renderer.render(scene, camera);
      const drawMs = performance.now() - drawStart;
      if (simPaused) {
        pausedFrameSettled = true;
      }

      if (isSoftwareGl) {
        afterDraw(() => {
          drawPending = false;
          tick();
        }, drawMs);
      } else {
        drawPending = false;
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      syncNowRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldInputs);
      document.removeEventListener('visibilitychange', clearHeldInputs);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Immediately synchronize 3D scene & render on React state transitions
  useEffect(() => {
    syncNowRef.current?.();
  }, [
    props.activeWorld,
    props.gameState,
    props.calculatorFamilyCount,
    props.houseUpgradeLevels,
    props.treeGrowthStage,
    props.bossDefeated,
    props.collectedRiceIds,
  ]);

  return (
    <div
      ref={mountRef}
      data-testid="three-viewport"
      className="fixed inset-0 w-full h-full overflow-hidden select-none"
    />
  );
}
