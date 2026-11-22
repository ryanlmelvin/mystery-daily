// The five cabinets. Each scene paints itself back to front and says where the
// numbered inspection tags sit, keyed by exhibit id.

import { C, SKIN } from './kit.js';
import { doll, head } from './doll.js';
import * as P from './props.js';

const S = 1.18;

const SCENES = {
  vicarage: {
    pins: { vicar: [206, 206], cup: [276, 256], notice: [84, 84], tray: [126, 206], visitor: [322, 204], letter: [272, 172], herbal: [180, 64] },
    draw() {
      let s = P.room({ wall: '#f6e2c0', stripe: '#f0c9a2', dado: '#86b3a2', floor: C.wood, rug: { x: 206, y: 250, rx: 104, ry: 24, color: '#b8433a', trim: C.cream } });
      s += P.door(40, 196, { w: 44, h: 106, color: '#9a6238', frame: C.cream });
      s += P.wallNotice(84, 96);
      s += P.windowPane(338, 150, { w: 58, h: 84, night: false, curtain: C.red });
      s += P.shelf(146, 96, 70) + P.openBook(180, 96, { w: 13 }) + P.jar(156, 96, C.sky) + P.jar(206, 96, C.pink, 10);
      s += P.armchair(206, 238, C.teal);
      s += doll({ x: 206, y: 240, s: S, dir: 1, sit: true, pose: 'slump', body: 'coat', paint: C.black, legs: '#4a4652', collar: 'clerical', hair: 'bald', hairColor: C.white, specs: true, skin: SKIN[4], spring: true });
      s += P.armchairArms(206, 238, C.teal);
      s += doll({ x: 126, y: 244, s: S, dir: 1, body: 'dress', paint: '#6a5a8c', apron: true, hat: 'mob', hatBand: C.red, hair: 'curls', hairColor: C.grey, skin: SKIN[1], head: 'wide', mood: 'shock', pose: 'carry', carry: P.teaTray(), rock: [-1.4, 1.4, 1.5] });
      s += doll({ x: 322, y: 242, s: S, dir: -1, body: 'coat', paint: C.black, legs: '#4a4652', collar: 'clerical', hair: 'part', hairColor: '#c7862e', skin: SKIN[0], head: 'long', mood: 'shifty', pose: 'hold', hold: P.hatInHand(), nod: [-4, 5, 2.4] });
      s += P.fallenCup(248, 258);
      return s;
    }
  },
  train: {
    pins: { timetable: [282, 104], victim: [88, 204], letter: [150, 178], lady: [322, 204], hatbox: [350, 58], traveller: [214, 210], samples: [150, 52] },
    draw() {
      let s = P.compartment();
      s += P.windowPane(58, 116, { w: 74, h: 74, night: true, curtain: '#7a3340' });
      s += P.luggageRack(112, 68, 276) + P.sampleCase(182, 68) + P.hatbox(322, 68, C.pink);
      s += P.frame(250, 86, 40, 26);
      s += P.bench(226);
      s += P.openBriefcase(150, 200);
      s += doll({ x: 88, y: 236, s: S, dir: -1, sit: true, pose: 'slump', body: 'coat', paint: '#5c6b7a', legs: '#3b3f4a', collar: 'tie', collarColor: C.teal, hair: 'part', hairColor: '#8a8178', whiskers: 'walrus', skin: SKIN[0], head: 'ball', spring: true });
      s += doll({ x: 322, y: 236, s: S, dir: -1, sit: true, body: 'dress', paint: C.plum, hat: 'plume', hatColor: C.plum, hatBand: C.mustard, hair: 'bob', hairColor: '#3a2a22', skin: SKIN[2], mood: 'shock', pose: 'alarm', rock: [-1.2, 1.2, 1.3] });
      s += doll({ x: 214, y: 254, s: S, dir: -1, body: 'coat', paint: '#8a7a4a', legs: '#5b4636', collar: 'tie', collarColor: C.red, hat: 'bowler', hatColor: '#5b4636', hair: 'crop', hairColor: '#2a2024', whiskers: 'handlebar', skin: SKIN[1], mood: 'shifty', pose: 'reach', wave: [-4, 4, 1.4], nod: [-3, 4, 2] });
      return s;
    }
  },
  theatre: {
    pins: { playbill: [34, 102], fallen: [232, 264], bottle: [258, 208], king: [146, 204], exit: [352, 204], script: [296, 178], wardrobe: [60, 208], table: [216, 120] },
    draw() {
      let s = P.room({ wall: '#efc2ae', stripe: null, dado: '#7a3b63', floor: C.woodLight });
      s += P.playbill(34, 44);
      s += P.dressingTable(216, 196) + P.bottle(196, 138, '#7fb0d8', 10) + P.tin(236, 138);
      s += P.door(352, 196, { w: 44, h: 106, color: C.teal, frame: C.cream, knob: -1 });
      s += P.chair(286, 230) + P.scriptBook(286, 200);
      s += doll({ x: 60, y: 246, s: S, dir: 1, body: 'dress', paint: C.teal, hair: 'bun', hairColor: '#8a8178', specs: true, skin: SKIN[3], mood: 'shock', pose: 'carry', carry: P.cloakOverArm(C.red), rock: [-1.3, 1.3, 1.6] });
      s += doll({ x: 146, y: 244, s: S, dir: -1, body: 'robe', paint: C.red, trim: C.white, hat: 'crown', hair: 'curls', hairColor: '#2a2024', whiskers: 'walrus', skin: SKIN[0], head: 'wide', mood: 'shock', pose: 'alarm', rock: [-2, 2, 1.2], wave: [-5, 5, 0.9] });
      s += doll({ x: 352, y: 244, s: S, dir: -1, body: 'coat', paint: '#4d5f8a', legs: '#2f3550', collar: 'tie', collarColor: C.mustard, hat: 'bowler', hair: 'part', hairColor: '#7a4a2a', skin: SKIN[1], head: 'long', mood: 'shifty', pose: 'hip', nod: [-4, 3, 2.6] });
      s += P.shadow(246, 274, 70, 6);
      s += doll({ x: 184, y: 272, s: S, dir: 1, body: 'shirt', paint: '#8a5630', legs: '#3b3f4a', hair: 'crop', hairColor: '#c7862e', whiskers: 'goatee', skin: SKIN[0], pose: 'dead', spring: true });
      s += P.spiltBottle(240, 198, C.green, 24);
      return s;
    }
  },
  study: {
    pins: { uncle: [252, 188], note: [222, 207], will: [284, 207], bellpull: [126, 92], nephew: [156, 204], portrait: [102, 60], secretary: [314, 200], bag: [368, 190] },
    draw() {
      const hale = { hair: 'bald', hairColor: '#c2542a', whiskers: 'mutton', skin: SKIN[0], head: 'long' };
      let s = P.room({ wall: '#3f7a66', stripe: '#377060', dado: '#9a6238', floor: C.wood, rug: { x: 240, y: 252, rx: 120, ry: 22, color: '#7a3340', trim: C.mustard } });
      s += P.bookcase(2, 196, 26, 150);
      s += P.fireplace(72, 196) + P.portrait(72, 46, 38, 48, head({ ...hale, mood: 'stern' }), C.navy);
      s += P.bellPull(126, 28, 44, true);
      s += P.windowPane(346, 132, { w: 50, h: 82, night: false, curtain: C.mustard }) + P.curtainCord(384, 44, 86);
      s += doll({ x: 252, y: 236, s: S, dir: -1, pose: 'slump', body: 'coat', paint: '#5b3d6b', collar: 'bow', collarColor: C.white, ...hale, spring: true });
      s += P.desk(252, 236, 108) + P.paper(224, 201, -8) + P.paper(282, 201, 5, 24, 7) + P.inkwell(204, 201);
      s += doll({ x: 156, y: 246, s: S, dir: 1, body: 'coat', paint: C.mustard, legs: '#5b4636', collar: 'tie', collarColor: C.teal, ...hale, hair: 'part', mood: 'shifty', pose: 'hip', nod: [-4, 4, 2.3] });
      s += doll({ x: 314, y: 246, s: S, dir: -1, body: 'dress', paint: '#4d5f8a', hair: 'bun', hairColor: '#3a2a22', specs: true, skin: SKIN[2], mood: 'shock', pose: 'clutch', hold: P.notebook(), rock: [-1.3, 1.3, 1.5] });
      s += doll({ x: 368, y: 252, s: S, dir: -1, body: 'coat', paint: C.black, legs: '#3b3f4a', collar: 'tie', collarColor: C.red, hat: 'top', hair: 'crop', hairColor: C.grey, whiskers: 'pencil', skin: SKIN[3], head: 'ball', mood: 'calm', mouth: 'o', pose: 'stand', hold: P.briefBag(), nod: [-3, 3, 2.8] });
      return s;
    }
  },
  glasshouse: {
    pins: { body: [236, 262], wagebook: [51, 160], maid: [146, 188], youth: [316, 94], letter: [316, 192], bag: [360, 236], stand: [226, 152], tools: [385, 158] },
    draw() {
      let s = P.glasshouse();
      s += P.pot(112, 196, 8, 'tall') + P.pot(190, 196, 7, 'fern') + P.pot(270, 196, 8, 'bush');
      s += P.door(146, 196, { w: 46, h: 108, open: true, frame: C.cream });
      s += P.door(338, 196, { w: 44, h: 104, color: C.green, frame: C.cream, knob: -1 });
      s += P.shearsOnHook(384, 104) + P.spade(376, 198, -7);
      s += P.pottingBench(10, 226) + P.openBook(51, 177);
      s += P.plantStand(226, 230);
      s += doll({ x: 146, y: 236, s: S, dir: 1, body: 'dress', paint: C.black, apron: true, hat: 'mob', hatBand: C.teal, hair: 'bun', hairColor: '#7a4a2a', skin: SKIN[0], mood: 'shock', pose: 'hold', hold: P.lantern(), rock: [-1.5, 1.5, 1.7], wave: [-3, 3, 1.1] });
      s += doll({ x: 316, y: 240, s: S, dir: -1, body: 'coat', paint: C.mustard, legs: '#5b4636', collar: 'bow', hat: 'boater', hatBand: C.red, hair: 'part', hairColor: '#3a2a22', whiskers: 'pencil', skin: SKIN[1], mood: 'shifty', pose: 'hip', nod: [-5, 4, 2.2] });
      s += P.carpetBag(360, 254);
      s += P.shadow(240, 274, 70, 6);
      s += doll({ x: 176, y: 272, s: S, dir: 1, body: 'shirt', paint: C.green, legs: '#6a5034', hair: 'bald', hairColor: C.grey, whiskers: 'beard', skin: SKIN[2], pose: 'dead', spring: true });
      return s;
    }
  }
};

export const sceneIds = Object.keys(SCENES);

export function scenePins(id) {
  return SCENES[id]?.pins || {};
}

export function sceneSvg(id) {
  const scene = SCENES[id];
  if (!scene) throw new Error(`No scene called ${id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.W} ${P.H}" class="scene" role="img" aria-label="The scene inside the cabinet">${scene.draw()}${P.valance()}</svg>`;
}
