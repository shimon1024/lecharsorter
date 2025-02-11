export class Character {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

export const chars = [null];
let countChars = 1;
chars.push(new Character(countChars++, '鳳聯藪雨'));
chars.push(new Character(countChars++, '燕楽玄鳥'));
chars.push(new Character(countChars++, '國主雀巳'));
chars.push(new Character(countChars++, '烏蛇'));
chars.push(new Character(countChars++, '鵐蒿雀'));
chars.push(new Character(countChars++, '鵐頬赤'));
chars.push(new Character(countChars++, '鵐黒巫鳥'));
chars.push(new Character(countChars++, 'クラウゼ'));
chars.push(new Character(countChars++, '闡裡鶴喰'));
chars.push(new Character(countChars++, '天宮潤'));
chars.push(new Character(countChars++, '雨杏宵'));
chars.push(new Character(countChars++, 'ケレリタス・ルーメン'));
chars.push(new Character(countChars++, '旭天子ヒバル'));
chars.push(new Character(countChars++, '片埜宿禰'));
chars.push(new Character(countChars++, '徒雲八尾呂智'));
chars.push(new Character(countChars++, '徒雲蛇穴丸'));
chars.push(new Character(countChars++, '乞骸セセ'));
chars.push(new Character(countChars++, '馬立ツグミ'));
chars.push(new Character(countChars++, '藤原伊代真'));
chars.push(new Character(countChars++, '平文門'));
chars.push(new Character(countChars++, 'シオン'));
chars.push(new Character(countChars++, '瑞風天堺'));
chars.push(new Character(countChars++, '照雲'));
chars.push(new Character(countChars++, '銀鏡蒼枯'));
chars.push(new Character(countChars++, '守武メリヤス'));
chars.push(new Character(countChars++, '袈裟クジル'));
chars.push(new Character(countChars++, '大宅都光'));
chars.push(new Character(countChars++, '東海仙'));
chars.push(new Character(countChars++, '柏木薫'));
chars.push(new Character(countChars++, '尾形ガライヤ'));
chars.push(new Character(countChars++, '藤原銀讃良'));
chars.push(new Character(countChars++, 'パラ'));
chars.push(new Character(countChars++, '大天朱壬鳥'));
chars.push(new Character(countChars++, '平蝶鬼'));
chars.push(new Character(countChars++, '天目津金ヤゴ'));
chars.push(new Character(countChars++, '千理牌示'));
chars.push(new Character(countChars++, 'ゼノア'));
chars.push(new Character(countChars++, 'ニル'));
chars.push(new Character(countChars++, 'ゼムリャ=C=トム'));
chars.push(new Character(countChars++, 'ハル'));
chars.push(new Character(countChars++, '鵐頬告鳥'));
chars.push(new Character(countChars++, 'ジンベイ'));
chars.push(new Character(countChars++, 'シネ＝ハマル'));
chars.push(new Character(countChars++, 'アルデ'));
chars.push(new Character(countChars++, 'ベニー'));
chars.push(new Character(countChars++, 'レイ'));
chars.push(new Character(countChars++, 'ゼロ'));
chars.push(new Character(countChars++, 'リン'));

countChars = 1;
export const yabusame = chars[countChars++];
export const tsubakura = chars[countChars++];
export const suzumi = chars[countChars++];
export const kurohebi = chars[countChars++];
export const aoji = chars[countChars++];
export const hooaka = chars[countChars++];
export const kuroji = chars[countChars++];
export const clause = chars[countChars++];
export const tsurubami = chars[countChars++];
export const jun = chars[countChars++];
export const shou = chars[countChars++];
export const lumen = chars[countChars++];
export const hibaru = chars[countChars++];
export const sukune = chars[countChars++];
export const yaorochi = chars[countChars++];
export const saragimaru = chars[countChars++];
export const sese = chars[countChars++];
export const tsugumi = chars[countChars++];
export const iyozane = chars[countChars++];
export const fumikado = chars[countChars++];
export const shion = chars[countChars++];
export const tenkai = chars[countChars++];
export const mitsumo = chars[countChars++];
export const souko = chars[countChars++];
export const medias = chars[countChars++];
export const kujiru = chars[countChars++];
export const kunimitsu = chars[countChars++];
export const kaisen = chars[countChars++];
export const kaoru = chars[countChars++];
export const garaiya = chars[countChars++];
export const sanra = chars[countChars++];
export const para = chars[countChars++];
export const mitori = chars[countChars++];
export const chouki = chars[countChars++];
export const yago = chars[countChars++];
export const haiji = chars[countChars++];
export const xenoa = chars[countChars++];
export const nilu = chars[countChars++];
export const tom = chars[countChars++];
export const haru = chars[countChars++];
export const hoojiro = chars[countChars++];
export const jinbei = chars[countChars++];
export const hamee = chars[countChars++];
export const ardey = chars[countChars++];
export const benny = chars[countChars++];
export const rei = chars[countChars++];
export const zelo = chars[countChars++];
export const lin = chars[countChars++];

export class Work {
  constructor(id, name, chars) {
    this.id = id;
    this.name = name;
    this.chars = chars;
  }
}

export const works = [null];
let countWorks = 1;
works.push(new Work(countWorks++, '主人公', [
  yabusame,
  tsubakura,
  suzumi,
]));
works.push(new Work(countWorks++, '連縁无現里', [
  kurohebi,
  aoji,
  hooaka,
  kuroji,
  clause,
  tsurubami,
]));
works.push(new Work(countWorks++, '連縁蛇叢釼', [
  jun,
  shou,
  lumen,
  hibaru,
  sukune,
  yaorochi,
  saragimaru,
]));
works.push(new Work(countWorks++, '連縁霊烈傳', [
  sese,
  tsugumi,
  iyozane,
  fumikado,
  shion,
  tenkai,
]));
works.push(new Work(countWorks++, '連縁天影戦記', [
  mitsumo,
  souko,
  medias,
  kujiru,
  kunimitsu,
  kaisen,
  kaoru,
  garaiya,
  sanra,
  para,
  mitori,
  chouki,
  yago,
  haiji,
  xenoa,
]));
works.push(new Work(countWorks++, '連縁カフェ', [
  nilu,
  tom,
]));
works.push(new Work(countWorks++, '音楽CD', [
  haru,
  hoojiro,
]));
works.push(new Work(countWorks++, '動画', [
  rei,
  zelo,
  lin,
]));
works.push(new Work(countWorks++, '設定', [
  jinbei,
  hamee,
  ardey,
  benny,
]));

countWorks = 1;
export const mains = works[countWorks++];
export const ee = works[countWorks++];
export const ems = works[countWorks++];
export const rmi = works[countWorks++];
export const bpohc = works[countWorks++];
export const botc = works[countWorks++];
export const albums = works[countWorks++];
export const videos = works[countWorks++];
export const others = works[countWorks++];

export const workAll = [
  mains,
  ee,
  ems,
  rmi,
  bpohc,
  botc,
  albums,
  videos,
  others,
];
export const workIdAll = workAll.map(w => w.id);
export const charAll = workAll.flatMap(w => w.chars);
export const charIdAll = charAll.map(c => c.id);

export const worksDefault = [
  mains,
  ee,
  ems,
  rmi,
  bpohc
];
export const workIdsDefault = worksDefault.map(w => w.id);
export const charsDefault = worksDefault.flatMap(w => w.chars);
export const charIdsDefault = charsDefault.map(c => c.id);
