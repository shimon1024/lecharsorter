function newCharacter(name) {
  return { name };
}

// NOTE: 255 is reserved (rank delimiter)
export const chars = [null];
let countChars = 1;
chars.push(newCharacter('鳳聯藪雨'));
chars.push(newCharacter('燕楽玄鳥'));
chars.push(newCharacter('國主雀巳'));
chars.push(newCharacter('烏蛇'));
chars.push(newCharacter('鵐蒿雀'));
chars.push(newCharacter('鵐頬赤'));
chars.push(newCharacter('鵐黒巫鳥'));
chars.push(newCharacter('クラウゼ'));
chars.push(newCharacter('闡裡鶴喰'));
chars.push(newCharacter('天宮潤'));
chars.push(newCharacter('雨杏宵'));
chars.push(newCharacter('ケレリタス・ルーメン'));
chars.push(newCharacter('旭天子ヒバル'));
chars.push(newCharacter('片埜宿禰'));
chars.push(newCharacter('徒雲八尾呂智'));
chars.push(newCharacter('徒雲蛇穴丸'));
chars.push(newCharacter('乞骸セセ'));
chars.push(newCharacter('馬立ツグミ'));
chars.push(newCharacter('藤原伊代真'));
chars.push(newCharacter('平文門'));
chars.push(newCharacter('シオン'));
chars.push(newCharacter('瑞風天堺'));
chars.push(newCharacter('照雲'));
chars.push(newCharacter('銀鏡蒼枯'));
chars.push(newCharacter('守武メリヤス'));
chars.push(newCharacter('袈裟クジル'));
chars.push(newCharacter('大宅都光'));
chars.push(newCharacter('東海仙'));
chars.push(newCharacter('柏木薫'));
chars.push(newCharacter('尾形ガライヤ'));
chars.push(newCharacter('藤原銀讃良'));
chars.push(newCharacter('パラ'));
chars.push(newCharacter('大天朱壬鳥'));
chars.push(newCharacter('平蝶鬼'));
chars.push(newCharacter('天目津金ヤゴ'));
chars.push(newCharacter('千理牌示'));
chars.push(newCharacter('ゼノア'));
chars.push(newCharacter('ニル'));
chars.push(newCharacter('ゼムリャ=C=トム'));
chars.push(newCharacter('ハル'));
chars.push(newCharacter('鵐頬告鳥'));
chars.push(newCharacter('ジンベイ'));
chars.push(newCharacter('シネ＝ハマル'));
chars.push(newCharacter('アルデ'));
chars.push(newCharacter('ベニー'));
chars.push(newCharacter('レイ'));
chars.push(newCharacter('ゼロ'));
chars.push(newCharacter('リン'));

countChars = 1;
export const yabusame = countChars++;
export const tsubakura = countChars++;
export const suzumi = countChars++;
export const kurohebi = countChars++;
export const aoji = countChars++;
export const hooaka = countChars++;
export const kuroji = countChars++;
export const clause = countChars++;
export const tsurubami = countChars++;
export const jun = countChars++;
export const shou = countChars++;
export const lumen = countChars++;
export const hibaru = countChars++;
export const sukune = countChars++;
export const yaorochi = countChars++;
export const saragimaru = countChars++;
export const sese = countChars++;
export const tsugumi = countChars++;
export const iyozane = countChars++;
export const fumikado = countChars++;
export const shion = countChars++;
export const tenkai = countChars++;
export const mitsumo = countChars++;
export const souko = countChars++;
export const medias = countChars++;
export const kujiru = countChars++;
export const kunimitsu = countChars++;
export const kaisen = countChars++;
export const kaoru = countChars++;
export const garaiya = countChars++;
export const sanra = countChars++;
export const para = countChars++;
export const mitori = countChars++;
export const chouki = countChars++;
export const yago = countChars++;
export const haiji = countChars++;
export const xenoa = countChars++;
export const nilu = countChars++;
export const tom = countChars++;
export const haru = countChars++;
export const hoojiro = countChars++;
export const jinbei = countChars++;
export const hamee = countChars++;
export const ardey = countChars++;
export const benny = countChars++;
export const rei = countChars++;
export const zelo = countChars++;
export const lin = countChars++;

function newWork(name, chars) {
  return { name, chars };
}

export const works = [null];
let countWorks = 1;
works.push(newWork('主要人物', [
  yabusame,
  tsubakura,
  suzumi,
]));
works.push(newWork('連縁无現里', [
  kurohebi,
  aoji,
  hooaka,
  kuroji,
  clause,
  tsurubami,
]));
works.push(newWork('連縁蛇叢釼', [
  jun,
  shou,
  lumen,
  hibaru,
  sukune,
  yaorochi,
  saragimaru,
]));
works.push(newWork('連縁霊烈傳', [
  sese,
  tsugumi,
  iyozane,
  fumikado,
  shion,
  tenkai,
]));
works.push(newWork('連縁天影戦記', [
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
works.push(newWork('連縁カフェ', [
  nilu,
  tom,
]));
works.push(newWork('音楽CD', [
  haru,
  hoojiro,
]));
works.push(newWork('動画', [
  rei,
  zelo,
  lin,
]));
works.push(newWork('設定', [
  jinbei,
  hamee,
  ardey,
  benny,
]));

countWorks = 1;
export const mains = countWorks++;
export const ee = countWorks++;
export const ems = countWorks++;
export const rmi = countWorks++;
export const bpohc = countWorks++;
export const botc = countWorks++;
export const albums = countWorks++;
export const videos = countWorks++;
export const others = countWorks++;

export const workIdsAll = [
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
export const charIdsAll = workIdsAll.flatMap(w => works[w].chars);

export const workIdsDefault = [
  mains,
  ee,
  ems,
  rmi,
  bpohc
];
export const charIdsDefault = workIdsDefault.flatMap(w => works[w].chars);
