import * as THREE from 'three';

export interface HeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

export interface DragonRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  tail: THREE.Group;
  flashMeshes: THREE.Mesh[];
}

export interface HouseUpgradeRig {
  root: THREE.Group;
  lanternGlow: THREE.Mesh;
  gardenGroup: THREE.Group;
  bookCrateGroup: THREE.Group;
  roofBanner: THREE.Mesh;
}

export function createContactShadow(shadowMap: THREE.Texture, radius = 1.0, opacity = 0.42): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 24);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.018;
  mesh.renderOrder = 1;
  return mesh;
}

function addCartoonEyes(parent: THREE.Group, zOffset: number, yOffset: number, eyeSpacing = 0.14, scale = 1) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.0 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.05 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.1 });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.75 });

  for (const side of [-1, 1]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.085 * scale, 16, 14), whiteMat);
    sclera.scale.set(0.92, 1.25, 0.55);
    sclera.position.set(side * eyeSpacing, yOffset, zOffset);
    parent.add(sclera);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.052 * scale, 14, 12), irisMat);
    iris.scale.set(0.9, 1.15, 0.55);
    iris.position.set(side * eyeSpacing, yOffset - 0.01, zOffset + 0.032 * scale);
    parent.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028 * scale, 12, 10), pupilMat);
    pupil.position.set(side * eyeSpacing, yOffset - 0.01, zOffset + 0.05 * scale);
    parent.add(pupil);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.05 * scale, 12, 10), cheekMat);
    cheek.scale.set(1.2, 0.7, 0.4);
    cheek.position.set(side * (eyeSpacing + 0.1), yOffset - 0.11 * scale, zOffset - 0.02 * scale);
    parent.add(cheek);
  }
}

export function buildHeroModel(shadowMap: THREE.Texture): HeroRig {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 0.85, 0.44));

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfdd5b1, roughness: 0.62 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xf4b28a, roughness: 0.56 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 0.72 });
  const redShirtMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.58 });
  const blueOverallsMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.74 });
  const kopyahMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.66, metalness: 0.08 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.86 });
  const bootUpperMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.36, metalness: 0.08 });
  const bootSoleMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.44 });

  // Torso: Red long-sleeve shirt + plump Blue Overalls + front bib + straps + 2 gold buttons
  const upperChest = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.24, 8, 16), redShirtMat);
  upperChest.position.y = 0.96;
  upperChest.castShadow = true;
  bodyGroup.add(upperChest);

  const overallsBelly = new THREE.Mesh(new THREE.SphereGeometry(0.385, 20, 16), blueOverallsMat);
  overallsBelly.scale.set(1.02, 0.92, 1.05);
  overallsBelly.position.y = 0.73;
  overallsBelly.castShadow = true;
  bodyGroup.add(overallsBelly);

  const overallsBib = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.14), blueOverallsMat);
  overallsBib.position.set(0, 0.94, 0.24);
  bodyGroup.add(overallsBib);

  for (const side of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.32, 0.38), blueOverallsMat);
    strap.position.set(side * 0.15, 1.07, 0.04);
    bodyGroup.add(strap);

    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.048, 16), goldMat);
    button.rotation.x = Math.PI / 2;
    button.position.set(side * 0.135, 0.99, 0.33);
    bodyGroup.add(button);
  }

  // Explorer backpack with gold clasp
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.2), bootUpperMat);
  pack.position.set(0, 0.89, -0.34);
  pack.castShadow = true;
  bodyGroup.add(pack);
  const packClasp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), goldMat);
  packClasp.position.set(0, 0.94, -0.45);
  bodyGroup.add(packClasp);

  // Head + Expressive Cartoon Face + Iconic Mustache + Black Indonesian Kopyah (Peci)
  const head = new THREE.Group();
  head.position.set(0, 1.54, 0);
  bodyGroup.add(head);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.37, 22, 18), skinMat);
  headSphere.castShadow = true;
  head.add(headSphere);

  // Ears + Sideburns + Hair back
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), skinMat);
    ear.scale.set(0.55, 1.15, 0.8);
    ear.position.set(side * 0.37, 0.01, -0.02);
    head.add(ear);

    const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.17, 0.13), hairMat);
    sideburn.position.set(side * 0.335, 0.06, 0.09);
    head.add(sideburn);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.09, 4, 8), hairMat);
    brow.rotation.z = Math.PI / 2 - side * 0.18;
    brow.position.set(side * 0.135, 0.185, 0.345);
    head.add(brow);
  }

  const hairBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.365, 18, 14, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.45),
    hairMat,
  );
  hairBack.position.set(0, 0.02, -0.055);
  head.add(hairBack);

  // Big cheerful cartoon nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.114, 16, 14), noseMat);
  nose.scale.set(1.12, 0.94, 1.08);
  nose.position.set(0, -0.02, 0.375);
  head.add(nose);

  addCartoonEyes(head, 0.33, 0.075, 0.135, 1.02);

  // Iconic scalloped bushy mustache (6 sculpted puffs below the nose)
  const stachePuffs: Array<[number, number, number, number]> = [
    [-0.175, -0.095, 0.31, 0.06],
    [-0.098, -0.125, 0.355, 0.072],
    [-0.032, -0.135, 0.37, 0.07],
    [0.032, -0.135, 0.37, 0.07],
    [0.098, -0.125, 0.355, 0.072],
    [0.175, -0.095, 0.31, 0.06],
  ];
  for (const [mx, my, mz, mr] of stachePuffs) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(mr, 12, 10), hairMat);
    puff.scale.set(1.1, 0.95, 0.85);
    puff.position.set(mx, my, mz);
    head.add(puff);
  }

  // Cheerful smile arc peeking just below the mustache
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.065, 0.014, 8, 14, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.45 }),
  );
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.195, 0.328);
  head.add(smile);

  // Authentic Sculpted Indonesian Kopyah / Songkok Hitam
  const kopyahShape = new THREE.Shape();
  kopyahShape.moveTo(0, 0.42);
  kopyahShape.bezierCurveTo(0.265, 0.32, 0.345, 0.14, 0.345, 0);
  kopyahShape.bezierCurveTo(0.345, -0.14, 0.265, -0.32, 0, -0.42);
  kopyahShape.bezierCurveTo(-0.265, -0.32, -0.345, -0.14, -0.345, 0);
  kopyahShape.bezierCurveTo(-0.345, 0.14, -0.265, 0.32, 0, 0.42);

  const kopyahGroup = new THREE.Group();
  kopyahGroup.position.set(0, 0.21, -0.01);
  kopyahGroup.rotation.x = -0.08;
  head.add(kopyahGroup);

  const kopyahGeo = new THREE.ExtrudeGeometry(kopyahShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.022,
    bevelSegments: 3,
  });
  kopyahGeo.rotateX(-Math.PI / 2);
  const kopyahMesh = new THREE.Mesh(kopyahGeo, kopyahMat);
  kopyahMesh.castShadow = true;
  kopyahGroup.add(kopyahMesh);

  // Thin embroidered gold trim band at lower edge of kopyah + front Hero pin
  const trimGeo = new THREE.ExtrudeGeometry(kopyahShape, {
    depth: 0.024,
    bevelEnabled: false,
  });
  trimGeo.rotateX(-Math.PI / 2);
  const kopyahTrim = new THREE.Mesh(trimGeo, goldMat);
  kopyahTrim.scale.set(1.028, 1, 1.028);
  kopyahTrim.position.y = -0.004;
  kopyahGroup.add(kopyahTrim);

  const kopyahBadge = new THREE.Mesh(new THREE.OctahedronGeometry(0.058, 0), goldMat);
  kopyahBadge.scale.set(1, 1, 0.45);
  kopyahBadge.position.set(0, 0.115, 0.432);
  kopyahGroup.add(kopyahBadge);

  // Arms: Red Sleeves + Puffed White Glove Cuffs + White Cartoon Gloves
  const makeArm = (side: number) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.42, 1.1, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.24, 6, 12), redShirtMat);
    sleeve.position.y = -0.16;
    sleeve.castShadow = true;
    arm.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.102, 0.03, 8, 16), gloveMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.3;
    arm.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.132, 14, 12), gloveMat);
    hand.position.y = -0.4;
    hand.castShadow = true;
    arm.add(hand);
    bodyGroup.add(arm);
    return arm;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // Legs + Sturdy Rounded Platformer Work Boots
  const makeLeg = (side: number) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.175, 0.54, 0);
    const pants = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.24, 6, 12), blueOverallsMat);
    pants.position.y = -0.18;
    pants.castShadow = true;
    leg.add(pants);
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), bootUpperMat);
    bootUpper.position.set(0, -0.41, 0.05);
    bootUpper.castShadow = true;
    leg.add(bootUpper);
    const bootToe = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), bootUpperMat);
    bootToe.scale.set(1.0, 0.78, 1.05);
    bootToe.position.set(0, -0.42, 0.16);
    leg.add(bootToe);
    const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.055, 0.36), bootSoleMat);
    bootSole.position.set(0, -0.505, 0.06);
    leg.add(bootSole);
    bodyGroup.add(leg);
    return leg;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  return { root, bodyGroup, head, leftArm, rightArm, leftLeg, rightLeg };
}

export function buildBuddyModel(shadowMap: THREE.Texture): THREE.Group {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 0.78, 0.4));

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfdd5b1, roughness: 0.65 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.35 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 8, 16), greenMat);
  torso.position.y = 0.85;
  torso.castShadow = true;
  root.add(torso);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 10, 20), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.14;
  root.add(scarf);

  const head = new THREE.Group();
  head.position.y = 1.48;
  root.add(head);
  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), skinMat);
  headSphere.castShadow = true;
  head.add(headSphere);
  addCartoonEyes(head, 0.3, 0.05, 0.12, 0.96);

  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.45, 18), greenMat);
  hat.position.set(0, 0.36, -0.02);
  hat.rotation.x = -0.15;
  hat.castShadow = true;
  head.add(hat);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.28, 6, 10), bootMat);
    leg.position.set(side * 0.15, 0.25, 0);
    root.add(leg);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 6, 10), greenMat);
    arm.position.set(side * 0.38, 0.9, 0);
    arm.rotation.z = side * 0.32;
    root.add(arm);
  }

  return root;
}

export function buildPrincessModel(shadowMap: THREE.Texture): THREE.Group {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 0.95, 0.42));

  const gownMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.72 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde0c4, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.42 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.88 });
  const gemMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.2, emissive: 0x0284c7, emissiveIntensity: 0.4 });

  // Lathe gown silhouette
  const skirtPoints = [
    new THREE.Vector2(0.0, 0.02),
    new THREE.Vector2(0.62, 0.02),
    new THREE.Vector2(0.5, 0.55),
    new THREE.Vector2(0.28, 1.05),
    new THREE.Vector2(0.24, 1.32),
    new THREE.Vector2(0.0, 1.32),
  ];
  const skirt = new THREE.Mesh(new THREE.LatheGeometry(skirtPoints, 24), gownMat);
  skirt.castShadow = true;
  root.add(skirt);

  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.055, 10, 22), trimMat);
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 1.02;
  root.add(sash);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.62;
  root.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), skinMat);
  head.castShadow = true;
  headGroup.add(head);
  addCartoonEyes(headGroup, 0.29, 0.04, 0.12, 0.94);

  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14), hairMat);
  hairBack.position.set(0, 0.05, -0.09);
  headGroup.add(hairBack);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.16, 8), goldMat);
  crown.position.y = 0.36;
  headGroup.add(crown);

  const crownGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), gemMat);
  crownGem.position.set(0, 0.39, 0.14);
  headGroup.add(crownGem);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.28, 6, 10), trimMat);
    arm.position.set(side * 0.34, 1.14, 0.06);
    arm.rotation.z = side * 0.4;
    root.add(arm);
  }

  return root;
}

export function buildToadGuideModel(shadowMap: THREE.Texture): THREE.Group {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 0.85, 0.42));

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.72 });
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.75 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const spotMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.85 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.32, 8, 16), vestMat);
  torso.position.y = 0.65;
  torso.castShadow = true;
  root.add(torso);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.15;
  root.add(headGroup);

  const face = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 16), bodyMat);
  face.castShadow = true;
  headGroup.add(face);
  addCartoonEyes(headGroup, 0.29, 0.03, 0.12, 0.95);

  // Wise glasses rim
  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 8, 18), goldMat);
    rim.position.set(side * 0.12, 0.03, 0.32);
    headGroup.add(rim);
  }

  // Mushroom scholar cap + emerald spots
  const mushCap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 22, 16), capMat);
  mushCap.scale.set(1.08, 0.78, 1.08);
  mushCap.position.y = 0.35;
  mushCap.castShadow = true;
  headGroup.add(mushCap);

  const spotCoords: Array<[number, number, number]> = [
    [0, 0.64, 0.36],
    [0.42, 0.45, 0.16],
    [-0.42, 0.45, 0.16],
    [0, 0.56, -0.38],
  ];
  for (const [sx, sy, sz] of spotCoords) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), spotMat);
    spot.position.set(sx, sy, sz);
    headGroup.add(spot);
  }

  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), vestMat);
    foot.scale.set(1, 0.7, 1.4);
    foot.position.set(side * 0.16, 0.1, 0.05);
    root.add(foot);
  }

  return root;
}

export function buildVillagerModel(shadowMap: THREE.Texture, tunicColor: number, hatColor: number): THREE.Group {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 0.72, 0.36));

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfdd5b1, roughness: 0.65 });
  const tunicMat = new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.78 });
  const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.36, 8, 14), tunicMat);
  body.position.y = 0.68;
  body.castShadow = true;
  root.add(body);

  const head = new THREE.Group();
  head.position.y = 1.24;
  root.add(head);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), skinMat);
  head.add(face);
  addCartoonEyes(head, 0.25, 0.03, 0.1, 0.85);

  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.22, 16), hatMat);
  hat.position.y = 0.24;
  head.add(hat);

  return root;
}

export function buildDragonModel(shadowMap: THREE.Texture): DragonRig {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 2.4, 0.48));

  const scaleMat = new THREE.MeshStandardMaterial({ color: 0x6d28d9, roughness: 0.55, metalness: 0.12 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.75 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.28, metalness: 0.2 });
  const wingMembraneMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const body = new THREE.Group();
  root.add(body);

  const flashMeshes: THREE.Mesh[] = [];

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 1.25, 10, 20), scaleMat);
  torso.position.y = 1.85;
  torso.rotation.x = 0.22;
  torso.castShadow = true;
  body.add(torso);
  flashMeshes.push(torso);

  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.76, 1.0, 8, 16), bellyMat);
  belly.position.set(0, 1.75, 0.35);
  belly.rotation.x = 0.22;
  body.add(belly);

  // Head + Horns + Glowing Eyes + Snout
  const head = new THREE.Group();
  head.position.set(0, 3.25, 0.72);
  body.add(head);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 16), scaleMat);
  cranium.scale.set(1.05, 0.92, 1.15);
  cranium.castShadow = true;
  head.add(cranium);
  flashMeshes.push(cranium);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), scaleMat);
  snout.position.set(0, -0.14, 0.65);
  head.add(snout);
  flashMeshes.push(snout);

  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.78, 12), hornMat);
    horn.position.set(side * 0.42, 0.68, -0.15);
    horn.rotation.z = -side * 0.32;
    horn.rotation.x = -0.25;
    head.add(horn);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), eyeMat);
    eye.position.set(side * 0.38, 0.16, 0.68);
    head.add(eye);
  }

  // Extruded Wing Geometry
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.4, 1.35);
  wingShape.lineTo(2.1, -0.45);
  wingShape.lineTo(1.25, -0.15);
  wingShape.lineTo(0.65, -0.65);
  wingShape.closePath();

  const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });

  const makeWing = (side: number) => {
    const wg = new THREE.Group();
    wg.position.set(side * 0.78, 2.35, -0.2);
    const mesh = new THREE.Mesh(wingGeo, wingMembraneMat);
    mesh.scale.x = side;
    mesh.castShadow = true;
    wg.add(mesh);
    body.add(wg);
    return wg;
  };
  const leftWing = makeWing(-1);
  const rightWing = makeWing(1);

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 1.15, -0.85);
  body.add(tail);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.2, -1.1),
    new THREE.Vector3(0.35, 0.25, -2.0),
  ]);
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.22, 10, false), scaleMat);
  tail.add(tailMesh);
  flashMeshes.push(tailMesh);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.85, 0.68), scaleMat);
    leg.position.set(side * 0.65, 0.42, 0.15);
    leg.castShadow = true;
    body.add(leg);
  }

  return { root, body, head, leftWing, rightWing, tail, flashMeshes };
}

export function buildCastle(shadowMap: THREE.Texture, wallMat: THREE.Material, roofColor = 0xdc2626): THREE.Group {
  const castle = new THREE.Group();
  castle.add(createContactShadow(shadowMap, 9.5, 0.32));

  const trimMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.85 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });

  // Central Keep
  const keep = new THREE.Mesh(new THREE.BoxGeometry(8.5, 6.2, 6.8), wallMat);
  keep.position.y = 3.1;
  keep.castShadow = true;
  keep.receiveShadow = true;
  castle.add(keep);

  // Keep Spire Roof
  const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.8, 12), roofMat);
  keepRoof.position.y = 8.1;
  keepRoof.castShadow = true;
  castle.add(keepRoof);

  // Corner Towers (4)
  const towerOffsets: Array<[number, number]> = [
    [-4.3, 3.4],
    [4.3, 3.4],
    [-4.3, -3.4],
    [4.3, -3.4],
  ];
  for (const [tx, tz] of towerOffsets) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.48, 7.6, 16), wallMat);
    tower.position.set(tx, 3.8, tz);
    tower.castShadow = true;
    castle.add(tower);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.65, 2.7, 16), roofMat);
    spire.position.set(tx, 8.95, tz);
    spire.castShadow = true;
    castle.add(spire);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), goldMat);
    finial.position.set(tx, 10.4, tz);
    castle.add(finial);
  }

  // Gatehouse Jambs + Wooden Arch Door
  for (const side of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.2, 0.9), trimMat);
    jamb.position.set(side * 1.45, 1.6, 3.6);
    castle.add(jamb);
  }
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.65, 0.9), trimMat);
  archTop.position.set(0, 3.3, 3.6);
  castle.add(archTop);

  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.95, 0.35), doorMat);
  door.position.set(0, 1.48, 3.45);
  castle.add(door);

  // Crest Star above door
  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), goldMat);
  crest.position.set(0, 4.6, 3.6);
  castle.add(crest);

  return castle;
}

export function buildMysteryBlock(questionMap: THREE.Texture, shadowMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(shadowMap, 0.95, 0.32));

  const goldFrameMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.55,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: questionMap,
    roughness: 0.35,
    emissive: 0xd97706,
    emissiveIntensity: 0.28,
  });

  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), faceMat);
  cube.position.y = 1.95;
  cube.castShadow = true;
  group.add(cube);

  // 4 corner rivet studs
  const studGeo = new THREE.SphereGeometry(0.11, 10, 8);
  for (const sx of [-0.56, 0.56]) {
    for (const sy of [-0.56, 0.56]) {
      for (const sz of [-0.56, 0.56]) {
        const stud = new THREE.Mesh(studGeo, goldFrameMat);
        stud.position.set(sx, 1.95 + sy, sz);
        group.add(stud);
      }
    }
  }

  return group;
}

export function buildVillageHouse(shadowMap: THREE.Texture, roofColor = 0xe11d48): HouseUpgradeRig {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 3.6, 0.36));

  const foundationMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.78 });
  const timberMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.38 });
  const windowOffMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.25,
    roughness: 0.15,
  });

  // Stone foundation
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 3.8), foundationMat);
  plinth.position.y = 0.225;
  plinth.receiveShadow = true;
  root.add(plinth);

  // Main cottage walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.6, 3.5), wallMat);
  walls.position.y = 1.75;
  walls.castShadow = true;
  walls.receiveShadow = true;
  root.add(walls);

  // Pitched Roof (4-sided cone rotated 45deg)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.45, 2.2, 4), roofMat);
  roof.position.y = 4.1;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  root.add(roof);

  // Framed Front Door + Jambs
  for (const side of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.6, 0.22), timberMat);
    jamb.position.set(side * 0.52, 1.25, 1.78);
    root.add(jamb);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.5, 0.12), timberMat);
  door.position.set(0, 1.2, 1.75);
  root.add(door);

  // Glowing Window / Lantern Glow
  const lanternGlow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.12), windowOffMat);
  lanternGlow.position.set(1.25, 1.85, 1.76);
  root.add(lanternGlow);

  // Upgrade tier 1+: Flower Garden Box
  const gardenGroup = new THREE.Group();
  gardenGroup.visible = false;
  const planter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.32, 0.45), timberMat);
  planter.position.set(1.25, 0.9, 1.95);
  gardenGroup.add(planter);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
  for (let i = -1; i <= 1; i++) {
    const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), flowerMat);
    blossom.position.set(1.25 + i * 0.28, 1.15, 1.95);
    gardenGroup.add(blossom);
  }
  root.add(gardenGroup);

  // Upgrade tier 2+: Aid Supply / Book Crates
  const bookCrateGroup = new THREE.Group();
  bookCrateGroup.visible = false;
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 0.65), crateMat);
  crate1.position.set(-1.55, 0.75, 1.95);
  bookCrateGroup.add(crate1);
  const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.52), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.45 }));
  crate2.position.set(-1.5, 1.28, 1.95);
  bookCrateGroup.add(crate2);
  root.add(bookCrateGroup);

  // Upgrade tier 3: Golden Blessing Banner above door
  const roofBanner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.7, metalness: 0.7, roughness: 0.2 }),
  );
  roofBanner.position.set(0, 3.05, 1.95);
  roofBanner.visible = false;
  root.add(roofBanner);

  return { root, lanternGlow, gardenGroup, bookCrateGroup, roofBanner };
}

export function buildRiceSack(shadowMap: THREE.Texture): THREE.Group {
  const sack = new THREE.Group();
  sack.add(createContactShadow(shadowMap, 0.65, 0.35));

  const burlapMat = new THREE.MeshStandardMaterial({ color: 0xe7d2a7, roughness: 0.88 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 });
  const tagMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });

  // Plump Lathe burlap sack profile
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.46, 0.02),
    new THREE.Vector2(0.55, 0.35),
    new THREE.Vector2(0.46, 0.72),
    new THREE.Vector2(0.24, 0.92),
    new THREE.Vector2(0.36, 1.12),
    new THREE.Vector2(0.0, 1.06),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), burlapMat);
  body.castShadow = true;
  sack.add(body);

  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 18), ropeMat);
  tie.rotation.x = Math.PI / 2;
  tie.position.y = 0.9;
  sack.add(tie);

  const tag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.04), tagMat);
  tag.position.set(0, 0.56, 0.52);
  sack.add(tag);

  return sack;
}

export function buildWindmill(shadowMap: THREE.Texture): { group: THREE.Group; blades: THREE.Group } {
  const group = new THREE.Group();
  group.add(createContactShadow(shadowMap, 3.0, 0.38));

  const towerMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.75 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.42 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const sailMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.85, 6.2, 12), towerMat);
  base.position.y = 3.1;
  base.castShadow = true;
  group.add(base);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.55, 1.85, 12), roofMat);
  cap.position.y = 7.1;
  cap.castShadow = true;
  group.add(cap);

  const blades = new THREE.Group();
  blades.position.set(0, 5.4, 1.48);
  group.add(blades);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 12), woodMat);
  hub.rotation.x = Math.PI / 2;
  blades.add(hub);

  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI) / 2;
    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.2, 0.12), woodMat);
    spar.position.y = 1.6;
    arm.add(spar);

    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.3, 0.05), sailMat);
    sail.position.set(0.38, 1.9, 0.04);
    sail.castShadow = true;
    arm.add(sail);
    blades.add(arm);
  }

  return { group, blades };
}

export function buildStylizedTree(shadowMap: THREE.Texture, foliageColor = 0x22c55e): THREE.Group {
  const tree = new THREE.Group();
  tree.add(createContactShadow(shadowMap, 1.7, 0.35));

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.65 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 2.1, 10), trunkMat);
  trunk.position.y = 1.05;
  trunk.castShadow = true;
  tree.add(trunk);

  const crownMain = new THREE.Mesh(new THREE.SphereGeometry(1.45, 14, 12), leafMat);
  crownMain.position.y = 2.85;
  crownMain.castShadow = true;
  tree.add(crownMain);

  const crownLeft = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), leafMat);
  crownLeft.position.set(-0.9, 2.4, 0.35);
  tree.add(crownLeft);

  const crownRight = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), leafMat);
  crownRight.position.set(0.9, 2.45, -0.35);
  tree.add(crownRight);

  return tree;
}

export function buildTreeOfKindness(shadowMap: THREE.Texture): {
  root: THREE.Group;
  canopyClusters: THREE.Mesh[];
  goldenHearts: THREE.Mesh[];
} {
  const root = new THREE.Group();
  root.add(createContactShadow(shadowMap, 3.5, 0.4));

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x6b3e26, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
  const blossomMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.5,
    roughness: 0.25,
    metalness: 0.6,
  });

  // Flared trunk using LatheGeometry
  const trunkPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.15, 0.0),
    new THREE.Vector2(0.68, 1.2),
    new THREE.Vector2(0.55, 2.8),
    new THREE.Vector2(0.75, 4.0),
    new THREE.Vector2(0.0, 4.1),
  ];
  const trunk = new THREE.Mesh(new THREE.LatheGeometry(trunkPts, 16), barkMat);
  trunk.castShadow = true;
  root.add(trunk);

  const canopyClusters: THREE.Mesh[] = [];
  const canopyOffsets: Array<[number, number, number, number]> = [
    [0, 5.1, 0, 2.1],
    [-1.7, 4.3, 0.8, 1.45],
    [1.7, 4.3, -0.7, 1.45],
    [0.2, 4.4, 1.65, 1.35],
    [-0.2, 4.5, -1.65, 1.35],
    [0, 6.2, 0, 1.45],
  ];
  for (const [cx, cy, cz, r] of canopyOffsets) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 14), leafMat);
    c.position.set(cx, cy, cz);
    c.castShadow = true;
    root.add(c);
    canopyClusters.push(c);
  }

  const goldenHearts: THREE.Mesh[] = [];
  const heartOffsets: Array<[number, number, number]> = [
    [-1.3, 4.6, 1.6],
    [1.35, 4.7, 1.4],
    [0, 5.7, 1.85],
    [-1.85, 4.9, -0.5],
    [1.85, 5.0, -0.6],
    [0.2, 6.6, 0.8],
  ];
  for (const [hx, hy, hz] of heartOffsets) {
    const h = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), blossomMat);
    h.position.set(hx, hy, hz);
    root.add(h);
    goldenHearts.push(h);
  }

  return { root, canopyClusters, goldenHearts };
}

export function buildGoldenCoin(shadowMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  group.add(createContactShadow(shadowMap, 0.52, 0.28));

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.16,
    metalness: 0.92,
  });

  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 20), goldMat);
  coin.rotation.x = Math.PI / 2;
  coin.position.y = 1.05;
  coin.castShadow = true;
  group.add(coin);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 20), goldMat);
  rim.position.y = 1.05;
  group.add(rim);

  return group;
}

export function buildCloudCluster(): THREE.Group {
  const cloud = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  const spheres: Array<[number, number, number, number]> = [
    [0, 0, 0, 1.6],
    [-1.4, -0.25, 0.2, 1.15],
    [1.4, -0.2, -0.1, 1.2],
    [0.3, 0.65, 0.3, 1.1],
  ];
  for (const [x, y, z, r] of spheres) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat);
    m.position.set(x, y, z);
    cloud.add(m);
  }
  return cloud;
}
