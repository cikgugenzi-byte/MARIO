import * as THREE from 'three';
import type { WorldSceneId } from '../data/curriculum';
import type { ProceduralTexturePack } from './textures';
import {
  buildBuddyModel,
  buildCastle,
  buildCloudCluster,
  buildDragonModel,
  buildGoldenCoin,
  buildMysteryBlock,
  buildPrincessModel,
  buildRiceSack,
  buildStylizedTree,
  buildToadGuideModel,
  buildTreeOfKindness,
  buildVillageHouse,
  buildVillagerModel,
  buildWindmill,
  type DragonRig,
  type HouseUpgradeRig,
} from './models';

export interface InteractiveTarget {
  id: string;
  label: string;
  actionType: string;
  position: THREE.Vector3;
  object: THREE.Object3D;
}

export interface WorldRefs {
  group: THREE.Group;
  skyColor: THREE.Color;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  hemiSky: number;
  hemiGround: number;
  heroSpawn: THREE.Vector3;
  heroYaw: number;
  cameraOffset: THREE.Vector3;
  lookAtOffset: THREE.Vector3;
  coins: THREE.Group[];
  clouds: THREE.Group[];
  mysteryBlocks: THREE.Group[];
  windmillBlades: THREE.Group | null;
  calculatorSacks: THREE.Group[];
  collectibleSacks: Array<{ id: string; group: THREE.Group; collected: boolean }>;
  houseRigs: Record<'pokok' | 'pendidikan' | 'kesehatan' | 'darurat', HouseUpgradeRig> | null;
  dragon: DragonRig | null;
  treeRig: {
    root: THREE.Group;
    canopyClusters: THREE.Mesh[];
    goldenHearts: THREE.Mesh[];
  } | null;
  interactables: InteractiveTarget[];
  foliageInstanced: THREE.InstancedMesh | null;
  boundaryRadius: number;
}

function addRollingHorizon(group: THREE.Group, hillColor: number, radius = 44) {
  const hillMat = new THREE.MeshStandardMaterial({ color: hillColor, roughness: 0.88 });
  const hillGeo = new THREE.SphereGeometry(9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52);
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const dist = radius + (i % 3) * 5;
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(Math.cos(angle) * dist, -0.5, Math.sin(angle) * dist);
    hill.scale.set(1.4 + (i % 2) * 0.4, 0.55 + (i % 3) * 0.25, 1.3);
    group.add(hill);
  }
}

function addInstancedGrassTufts(group: THREE.Group, count: number, radius: number, colorHex: number): THREE.InstancedMesh {
  const geo = new THREE.ConeGeometry(0.16, 0.48, 5);
  geo.translate(0, 0.24, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const baseColor = new THREE.Color(colorHex);
  const tint = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const angle = ((i * 137.5) % 360) * (Math.PI / 180);
    const r = 6 + ((i * 19.3) % (radius - 7));
    dummy.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    dummy.rotation.y = (i * 0.7) % Math.PI;
    const s = 0.85 + ((i % 7) - 3) * 0.05;
    dummy.scale.set(s, s * (0.9 + (i % 3) * 0.15), s);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);

    tint.copy(baseColor).offsetHSL(((i % 5) - 2) * 0.015, 0, ((i % 4) - 1.5) * 0.03);
    inst.setColorAt(i, tint);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.computeBoundingSphere();
  group.add(inst);
  return inst;
}

export function createWorldScene(worldId: WorldSceneId, textures: ProceduralTexturePack): WorldRefs {
  const group = new THREE.Group();
  const coins: THREE.Group[] = [];
  const clouds: THREE.Group[] = [];
  const mysteryBlocks: THREE.Group[] = [];
  const calculatorSacks: THREE.Group[] = [];
  const collectibleSacks: Array<{ id: string; group: THREE.Group; collected: boolean }> = [];
  const interactables: InteractiveTarget[] = [];

  let windmillBlades: THREE.Group | null = null;
  let houseRigs: WorldRefs['houseRigs'] = null;
  let dragon: DragonRig | null = null;
  let treeRig: WorldRefs['treeRig'] = null;
  let foliageInstanced: THREE.InstancedMesh | null = null;

  // Defaults
  let skyColor = new THREE.Color(0x5eb8f7);
  let fogDensity = 0.01;
  let sunColor = 0xfff3d1;
  let sunIntensity = 1.42;
  let hemiSky = 0xbae6fd;
  let hemiGround = 0x3f6212;
  const heroSpawn = new THREE.Vector3(0, 0, 7);
  let heroYaw = Math.PI; // Facing -Z toward landmarks!
  const cameraOffset = new THREE.Vector3(0, 5.1, 11.4);
  const lookAtOffset = new THREE.Vector3(0, 1.35, -4.5);
  const boundaryRadius = 25;

  // Shared Ground Builder
  const addGround = (mat: THREE.Material) => {
    const g = new THREE.Mesh(new THREE.CircleGeometry(68, 48), mat);
    g.rotation.x = -Math.PI / 2;
    g.receiveShadow = true;
    group.add(g);
  };

  // Helper to place clouds
  const spawnClouds = (count: number, heightBase: number) => {
    for (let i = 0; i < count; i++) {
      const c = buildCloudCluster();
      c.position.set(-28 + i * 11, heightBase + (i % 3) * 2.4, -18 - (i % 2) * 12);
      c.scale.setScalar(0.9 + (i % 3) * 0.25);
      group.add(c);
      clouds.push(c);
    }
  };

  if (worldId === 'world0') {
    skyColor = new THREE.Color(0x5eb8f7);
    fogDensity = 0.009;
    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.grassMap,
        bumpMap: textures.grassBump,
        bumpScale: 0.08,
        roughness: 0.88,
      }),
    );
    addRollingHorizon(group, 0x22c55e, 42);
    foliageInstanced = addInstancedGrassTufts(group, 140, 26, 0x16a34a);

    // Cobblestone plaza & royal road (Y offset +0.025 to prevent Z-fighting)
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 28),
      new THREE.MeshStandardMaterial({
        map: textures.stoneMap,
        bumpMap: textures.stoneBump,
        bumpScale: 0.06,
        roughness: 0.78,
      }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.025, -2);
    road.receiveShadow = true;
    group.add(road);

    // Grand Castle Landmark straight ahead (-Z)
    const castleWallMat = new THREE.MeshStandardMaterial({
      map: textures.stoneMap,
      color: 0xfef3c7,
      roughness: 0.7,
    });
    const castle = buildCastle(textures.contactShadowMap, castleWallMat, 0xef4444);
    castle.position.set(0, 0, -19);
    group.add(castle);

    // Princess at Castle Plaza
    const princess = buildPrincessModel(textures.contactShadowMap);
    princess.position.set(0, 0, -9.5);
    group.add(princess);
    interactables.push({
      id: 'npc-princess',
      label: 'Bicara dengan Princess',
      actionType: 'open-stage',
      position: princess.position.clone(),
      object: princess,
    });

    // Sahabat Hero
    const buddy = buildBuddyModel(textures.contactShadowMap);
    buddy.position.set(-2.6, 0, -7.8);
    buddy.rotation.y = 0.35;
    group.add(buddy);

    // 5 Mystery Question Blocks flanking the royal plaza so Princess & Castle stay unobstructed
    const mbCoords: Array<[number, number]> = [
      [-5.8, -3.2],
      [-3.5, -5.0],
      [3.5, -5.0],
      [5.8, -3.2],
      [2.6, -7.8],
    ];
    mbCoords.forEach(([mx, mz], i) => {
      const mb = buildMysteryBlock(textures.mysteryQuestionMap, textures.contactShadowMap);
      mb.position.set(mx, 0, mz);
      group.add(mb);
      mysteryBlocks.push(mb);
      interactables.push({
        id: `mystery-${i}`,
        label: 'Buka Mystery Block',
        actionType: 'open-stage',
        position: mb.position.clone(),
        object: mb,
      });
    });

    // Ring of Golden Coins for Hero Splash Run & Collection
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const coin = buildGoldenCoin(textures.contactShadowMap);
      coin.position.set(Math.cos(a) * 6.5, 0, Math.sin(a) * 6.5 + 1.5);
      group.add(coin);
      coins.push(coin);
    }

    // Surrounding Stylized Trees
    const treeCoords: Array<[number, number, number]> = [
      [-12, -10, 1.1],
      [12, -11, 1.2],
      [-15, 2, 1.0],
      [15, 3, 1.15],
      [-11, 12, 0.95],
      [11, 12, 1.05],
    ];
    for (const [tx, tz, ts] of treeCoords) {
      const tree = buildStylizedTree(textures.contactShadowMap, 0x22c55e);
      tree.position.set(tx, 0, tz);
      tree.scale.setScalar(ts);
      group.add(tree);
    }
    spawnClouds(6, 14);
  } else if (worldId === 'world1') {
    skyColor = new THREE.Color(0x68b9f5);
    fogDensity = 0.009;
    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.grassMap,
        bumpMap: textures.grassBump,
        bumpScale: 0.08,
        roughness: 0.86,
      }),
    );
    addRollingHorizon(group, 0x10b981, 44);
    foliageInstanced = addInstancedGrassTufts(group, 130, 26, 0x16a34a);

    // Village Cobblestone Square
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(10.5, 32),
      new THREE.MeshStandardMaterial({
        map: textures.stoneMap,
        bumpMap: textures.stoneBump,
        bumpScale: 0.06,
        roughness: 0.8,
      }),
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.025;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Toad Guide in center-front
    const toad = buildToadGuideModel(textures.contactShadowMap);
    toad.position.set(0, 0, -3.5);
    group.add(toad);
    interactables.push({
      id: 'npc-toad',
      label: 'Belajar ZIS & 8 Asnaf bersama Toad Guide',
      actionType: 'open-stage',
      position: toad.position.clone(),
      object: toad,
    });

    // 4 Village Houses framing the square nicely within upper camera view
    const houseSpots: Array<[number, number, number, number]> = [
      [-11.2, -9.5, 0.52, 0xef4444],
      [11.2, -9.5, -0.52, 0x0284c7],
      [-13.5, 4.5, 1.15, 0xd97706],
      [13.5, 4.5, -1.15, 0x10b981],
    ];
    for (const [hx, hz, rot, rColor] of houseSpots) {
      const h = buildVillageHouse(textures.contactShadowMap, rColor);
      h.root.position.set(hx, 0, hz);
      h.root.rotation.y = rot;
      h.gardenGroup.visible = true;
      group.add(h.root);
    }

    // 8 Villagers (representing 8 Asnaf) in semicircle
    const villagerColors = [0xdc2626, 0xea580c, 0xd97706, 0x059669, 0x0d9488, 0x0284c7, 0x4f46e5, 0x7c3aed];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI + ((i - 3.5) / 4.2) * (Math.PI * 0.72);
      const v = buildVillagerModel(textures.contactShadowMap, villagerColors[i], 0xfacc15);
      v.position.set(Math.sin(a) * 8.2, 0, Math.cos(a) * 8.2 - 2);
      v.lookAt(0, 0, 2);
      group.add(v);
    }

    // Coins
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const c = buildGoldenCoin(textures.contactShadowMap);
      c.position.set(Math.cos(a) * 5.2, 0, Math.sin(a) * 5.2 + 1);
      group.add(c);
      coins.push(c);
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      const t = buildStylizedTree(textures.contactShadowMap, 0x16a34a);
      t.position.set(Math.cos(a) * 20, 0, Math.sin(a) * 20);
      group.add(t);
    }
    spawnClouds(6, 14);
  } else if (worldId === 'world2') {
    skyColor = new THREE.Color(0xfcd34d);
    fogDensity = 0.009;
    sunColor = 0xffedd5;
    sunIntensity = 1.44;
    hemiSky = 0xfef08a;
    hemiGround = 0x4d7c0f;

    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.riceFieldMap,
        roughness: 0.85,
      }),
    );
    addRollingHorizon(group, 0x65a30d, 44);
    foliageInstanced = addInstancedGrassTufts(group, 150, 26, 0xca8a04);

    // Farm path
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 26),
      new THREE.MeshStandardMaterial({ map: textures.stoneMap, roughness: 0.82 }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.025, 0);
    path.receiveShadow = true;
    group.add(path);

    // Rotating 3D Windmill Landmark
    const wm = buildWindmill(textures.contactShadowMap);
    wm.group.position.set(-7.5, 0, -9.5);
    wm.group.rotation.y = 0.45;
    group.add(wm.group);
    windmillBlades = wm.blades;

    // Granary House
    const granary = buildVillageHouse(textures.contactShadowMap, 0xd97706);
    granary.root.position.set(7.5, 0, -9.5);
    granary.root.rotation.y = -0.5;
    granary.root.scale.setScalar(1.22);
    group.add(granary.root);

    // Toad Guide near Granary
    const toad = buildToadGuideModel(textures.contactShadowMap);
    toad.position.set(0, 0, -5);
    group.add(toad);
    interactables.push({
      id: 'npc-toad-rice',
      label: 'Buka Kalkulator & Tantangan Zakat Fitrah',
      actionType: 'open-stage',
      position: toad.position.clone(),
      object: toad,
    });

    // Dynamic Stack of Calculator Rice Sacks (15 slots stacked neatly near granary)
    for (let i = 0; i < 15; i++) {
      const sack = buildRiceSack(textures.contactShadowMap);
      const col = i % 5;
      const row = Math.floor(i / 5);
      sack.position.set(4.5 + col * 1.15, row * 0.92, -6.5 + (row % 2) * 0.25);
      sack.visible = i < 5; // Default 5 family members!
      group.add(sack);
      calculatorSacks.push(sack);
    }

    // 8 Collectible Rice Sacks in the paddy field for Rice Collection Challenge!
    const sackCoords: Array<[number, number]> = [
      [-6, 3],
      [6, 3],
      [-9, -2],
      [9, -2],
      [-5, -7],
      [5, -7],
      [-11, 7],
      [11, 7],
    ];
    sackCoords.forEach(([sx, sz], idx) => {
      const rs = buildRiceSack(textures.contactShadowMap);
      rs.position.set(sx, 0, sz);
      rs.scale.setScalar(1.1);
      group.add(rs);
      collectibleSacks.push({ id: `sack-${idx}`, group: rs, collected: false });
      interactables.push({
        id: `sack-${idx}`,
        label: 'Ambil Karung Beras 2,5 kg',
        actionType: 'collect-sack',
        position: rs.position.clone(),
        object: rs,
      });
    });

    for (let i = 0; i < 6; i++) {
      const c = buildGoldenCoin(textures.contactShadowMap);
      c.position.set((i - 2.5) * 3.2, 0, 1.5);
      group.add(c);
      coins.push(c);
    }
    spawnClouds(5, 14);
  } else if (worldId === 'world3') {
    skyColor = new THREE.Color(0x67d8f7);
    fogDensity = 0.009;
    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.grassMap,
        bumpMap: textures.grassBump,
        bumpScale: 0.08,
        roughness: 0.85,
      }),
    );
    addRollingHorizon(group, 0x10b981, 44);
    foliageInstanced = addInstancedGrassTufts(group, 120, 26, 0x059669);

    // Shimmering River Strip across Z = -1
    const river = new THREE.Mesh(
      new THREE.PlaneGeometry(76, 4.4),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.14,
        metalness: 0.15,
      }),
    );
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.02, -1);
    group.add(river);

    // Arched Stone Bridge across the river
    const bridgeMat = new THREE.MeshStandardMaterial({ map: textures.stoneMap, roughness: 0.72 });
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 6.2), bridgeMat);
    bridgeDeck.position.set(0, 0.25, -1);
    bridgeDeck.receiveShadow = true;
    group.add(bridgeDeck);
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 6.2), bridgeMat);
      rail.position.set(side * 2.45, 0.7, -1);
      group.add(rail);
    }

    // Toad Guide at Aid Center
    const toad = buildToadGuideModel(textures.contactShadowMap);
    toad.position.set(-2.4, 0, 4.2);
    group.add(toad);
    interactables.push({
      id: 'npc-caring-toad',
      label: 'Kelola Simulasi Dana Sosial Rp1.000.000',
      actionType: 'open-stage',
      position: toad.position.clone(),
      object: toad,
    });

    // 4 Needy Houses across the bridge that upgrade dynamically!
    const hPokok = buildVillageHouse(textures.contactShadowMap, 0xef4444);
    hPokok.root.position.set(-9.4, 0, -8.2);
    hPokok.root.rotation.y = 0.35;
    group.add(hPokok.root);

    const hPendidikan = buildVillageHouse(textures.contactShadowMap, 0x0284c7);
    hPendidikan.root.position.set(-3.2, 0, -10.2);
    hPendidikan.root.rotation.y = 0.15;
    group.add(hPendidikan.root);

    const hKesehatan = buildVillageHouse(textures.contactShadowMap, 0x10b981);
    hKesehatan.root.position.set(3.2, 0, -10.2);
    hKesehatan.root.rotation.y = -0.15;
    group.add(hKesehatan.root);

    const hDarurat = buildVillageHouse(textures.contactShadowMap, 0xf59e0b);
    hDarurat.root.position.set(9.4, 0, -8.2);
    hDarurat.root.rotation.y = -0.35;
    group.add(hDarurat.root);

    houseRigs = {
      pokok: hPokok,
      pendidikan: hPendidikan,
      kesehatan: hKesehatan,
      darurat: hDarurat,
    };

    for (let i = 0; i < 6; i++) {
      const c = buildGoldenCoin(textures.contactShadowMap);
      c.position.set((i - 2.5) * 2.6, 0, 2.5);
      group.add(c);
      coins.push(c);
    }

    for (const [tx, tz] of [
      [-17, -4],
      [17, -4],
      [-15, 10],
      [15, 10],
    ] as Array<[number, number]>) {
      const tree = buildStylizedTree(textures.contactShadowMap, 0x10b981);
      tree.position.set(tx, 0, tz);
      group.add(tree);
    }
    spawnClouds(5, 14);
  } else if (worldId === 'final') {
    skyColor = new THREE.Color(0x2e1f4d);
    fogDensity = 0.014;
    sunColor = 0xfbbf24;
    sunIntensity = 1.55;
    hemiSky = 0x7c3aed;
    hemiGround = 0x1e1b4b;
    cameraOffset.set(0, 4.8, 11.2);
    lookAtOffset.set(0, 2.2, -5.0);

    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.castleStoneMap,
        roughness: 0.78,
      }),
    );
    addRollingHorizon(group, 0x1e1b4b, 46);

    // Dark Castle Backdrop Keep
    const darkWallMat = new THREE.MeshStandardMaterial({
      map: textures.castleStoneMap,
      roughness: 0.72,
    });
    const darkCastle = buildCastle(textures.contactShadowMap, darkWallMat, 0x6d28d9);
    darkCastle.position.set(0, 0, -21);
    group.add(darkCastle);

    // Torch Pillars (4 warm lights)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    });
    const torchCoords: Array<[number, number]> = [
      [-6.5, -2],
      [6.5, -2],
      [-6.5, -10],
      [6.5, -10],
    ];
    for (const [tx, tz] of torchCoords) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 2.8, 10), pillarMat);
      pillar.position.set(tx, 1.4, tz);
      group.add(pillar);
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), flameMat);
      flame.position.set(tx, 3.1, tz);
      group.add(flame);
      const pl = new THREE.PointLight(0xfbbf24, 5, 14, 1.5);
      pl.position.set(tx, 3.4, tz);
      group.add(pl);
    }

    // Boss Dragon guarding the gate
    dragon = buildDragonModel(textures.contactShadowMap);
    dragon.root.position.set(0, 0, -7.2);
    group.add(dragon.root);
    interactables.push({
      id: 'boss-dragon',
      label: 'Hadapi Naga Penjaga Gerbang (15 Soal Evaluasi)',
      actionType: 'open-stage',
      position: dragon.root.position.clone(),
      object: dragon.root,
    });
  } else {
    // 'tree' — Sanctuary: Tree of Kindness
    skyColor = new THREE.Color(0xfde68a);
    fogDensity = 0.008;
    sunColor = 0xfffbeb;
    sunIntensity = 1.48;
    hemiSky = 0xfef08a;
    hemiGround = 0x3f6212;
    cameraOffset.set(3.2, 5.2, 12.2);
    lookAtOffset.set(2.4, 2.2, -3.5);

    addGround(
      new THREE.MeshStandardMaterial({
        map: textures.grassMap,
        bumpMap: textures.grassBump,
        bumpScale: 0.08,
        roughness: 0.84,
      }),
    );
    addRollingHorizon(group, 0x4ade80, 44);
    foliageInstanced = addInstancedGrassTufts(group, 150, 26, 0x4ade80);

    treeRig = buildTreeOfKindness(textures.contactShadowMap);
    treeRig.root.position.set(0, 0, -5.5);
    group.add(treeRig.root);

    const princess = buildPrincessModel(textures.contactShadowMap);
    princess.position.set(-3.5, 0, -1.5);
    princess.rotation.y = 0.4;
    group.add(princess);

    const buddy = buildBuddyModel(textures.contactShadowMap);
    buddy.position.set(3.5, 0, -1.5);
    buddy.rotation.y = -0.4;
    group.add(buddy);

    const toad = buildToadGuideModel(textures.contactShadowMap);
    toad.position.set(0, 0, 1.5);
    group.add(toad);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const c = buildGoldenCoin(textures.contactShadowMap);
      c.position.set(Math.cos(a) * 6.5, 0, Math.sin(a) * 6.5 - 3);
      group.add(c);
      coins.push(c);
    }
    spawnClouds(6, 15);
  }

  return {
    group,
    skyColor,
    fogDensity,
    sunColor,
    sunIntensity,
    hemiSky,
    hemiGround,
    heroSpawn,
    heroYaw,
    cameraOffset,
    lookAtOffset,
    coins,
    clouds,
    mysteryBlocks,
    windmillBlades,
    calculatorSacks,
    collectibleSacks,
    houseRigs,
    dragon,
    treeRig,
    interactables,
    foliageInstanced,
    boundaryRadius,
  };
}
