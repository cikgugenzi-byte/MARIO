import * as THREE from 'three';

export interface ProceduralTexturePack {
  grassMap: THREE.CanvasTexture;
  grassBump: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  riceFieldMap: THREE.CanvasTexture;
  castleStoneMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  mysteryQuestionMap: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

function makeSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTexturePack {
  const rng = makeSeededRng(202506);

  // 1. Meadow Grass Albedo + Bump (seamless organic fantasy green)
  const [grassC, gCtx] = makeCanvas(256);
  gCtx.fillStyle = '#33993d';
  gCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1100; i++) {
    const x = rng() * 256;
    const y = rng() * 256;
    const w = 3 + rng() * 4;
    const h = 4 + rng() * 5;
    const tone = i % 3 === 0 ? '#2b8837' : i % 3 === 1 ? '#3fae47' : '#4ec052';
    gCtx.fillStyle = tone;
    gCtx.fillRect(x, y, w, h);
    if (x + w > 256) gCtx.fillRect(x - 256, y, w, h);
    if (y + h > 256) gCtx.fillRect(x, y - 256, w, h);
  }

  const bumpRng = makeSeededRng(90421);
  const [grassBumpC, gbCtx] = makeCanvas(256);
  gbCtx.fillStyle = '#808080';
  gbCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = bumpRng() * 256;
    const y = bumpRng() * 256;
    gbCtx.fillStyle = i % 2 === 0 ? '#a8a8a8' : '#646464';
    gbCtx.fillRect(x, y, 4, 6);
  }

  // 2. Cobblestone Path Albedo + Bump
  const [stoneC, sCtx] = makeCanvas(256);
  sCtx.fillStyle = '#9c8360';
  sCtx.fillRect(0, 0, 256, 256);
  const [stoneBumpC, sbCtx] = makeCanvas(256);
  sbCtx.fillStyle = '#3e3e3e';
  sbCtx.fillRect(0, 0, 256, 256);

  const rows = 4;
  const cols = 4;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const offsetX = r % 2 === 0 ? 0 : cellW * 0.5;
    for (let c = -1; c <= cols; c++) {
      const px = c * cellW + offsetX + 4;
      const py = r * cellH + 4;
      const shade = 178 + ((r * 7 + c * 13) % 24);
      sCtx.fillStyle = `rgb(${shade}, ${shade - 16}, ${shade - 38})`;
      sCtx.beginPath();
      sCtx.roundRect(px, py, cellW - 8, cellH - 8, 12);
      sCtx.fill();

      sbCtx.fillStyle = '#d4d4d4';
      sbCtx.beginPath();
      sbCtx.roundRect(px + 1, py + 1, cellW - 10, cellH - 10, 12);
      sbCtx.fill();
    }
  }

  // 3. Rice Paddy Terraced Texture
  const [riceC, rCtx] = makeCanvas(256);
  rCtx.fillStyle = '#5e9625';
  rCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    rCtx.fillStyle = y % 32 === 0 ? '#74ae2d' : '#4f821f';
    rCtx.fillRect(0, y, 256, 10);
  }
  for (let i = 0; i < 480; i++) {
    rCtx.fillStyle = i % 2 === 0 ? '#eab308' : '#84cc16';
    rCtx.fillRect((i * 59) % 256, (i * 97) % 256, 3, 9);
  }

  // 4. Dark Castle Stone Texture
  const [castleC, cCtx] = makeCanvas(256);
  cCtx.fillStyle = '#332f48';
  cCtx.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 6; r++) {
    const off = (r % 2) * 28;
    for (let c = -1; c < 6; c++) {
      const bx = c * 52 + off + 3;
      const by = r * 43 + 3;
      const v = 64 + ((r * 11 + c * 17) % 22);
      cCtx.fillStyle = `rgb(${v}, ${v - 4}, ${v + 18})`;
      cCtx.fillRect(bx, by, 46, 37);
    }
  }

  // 5. Soft Radial Contact Shadow Disc
  const [shadowC, shCtx] = makeCanvas(128);
  const grad = shCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.72)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.34)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 128, 128);

  // 6. Mystery Block "?" Plaque Texture
  const [mystC, mCtx] = makeCanvas(256);
  mCtx.fillStyle = '#f59e0b';
  mCtx.fillRect(0, 0, 256, 256);
  mCtx.strokeStyle = '#b45309';
  mCtx.lineWidth = 18;
  mCtx.strokeRect(12, 12, 232, 232);
  mCtx.fillStyle = '#fffbeb';
  mCtx.font = 'bold 170px "Bricolage Grotesque", sans-serif';
  mCtx.textAlign = 'center';
  mCtx.textBaseline = 'middle';
  mCtx.fillText('?', 128, 138);

  const grassMap = configureTexture(grassC, true, 16, 16, maxAnisotropy);
  const grassBump = configureTexture(grassBumpC, false, 16, 16, maxAnisotropy);
  const stoneMap = configureTexture(stoneC, true, 8, 8, maxAnisotropy);
  const stoneBump = configureTexture(stoneBumpC, false, 8, 8, maxAnisotropy);
  const riceFieldMap = configureTexture(riceC, true, 10, 10, maxAnisotropy);
  const castleStoneMap = configureTexture(castleC, true, 12, 12, maxAnisotropy);

  const contactShadowMap = new THREE.CanvasTexture(shadowC);
  contactShadowMap.anisotropy = maxAnisotropy;
  contactShadowMap.needsUpdate = true;

  const mysteryQuestionMap = new THREE.CanvasTexture(mystC);
  mysteryQuestionMap.colorSpace = THREE.SRGBColorSpace;
  mysteryQuestionMap.anisotropy = maxAnisotropy;
  mysteryQuestionMap.needsUpdate = true;

  return {
    grassMap,
    grassBump,
    stoneMap,
    stoneBump,
    riceFieldMap,
    castleStoneMap,
    contactShadowMap,
    mysteryQuestionMap,
    dispose: () => {
      grassMap.dispose();
      grassBump.dispose();
      stoneMap.dispose();
      stoneBump.dispose();
      riceFieldMap.dispose();
      castleStoneMap.dispose();
      contactShadowMap.dispose();
      mysteryQuestionMap.dispose();
    },
  };
}
