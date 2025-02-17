// TODO: 各ブラウザで実装され次第、標準APIに差し替え
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64

const charTable = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '-',
  '_',
];
const bitsTable = new Map(charTable.map((c, i) => [c, i]));

export function Uint8ArrayFromBase64(string, options) {
  const { alphabet = 'base64', lastChunkHandling = 'loose' } = options;
  if (!(alphabet === 'base64url' && lastChunkHandling === 'loose')) {
    const err = alphabet === 'base64' || ['strict', 'stop-before-partial'].includes(lastChunkHandling) ?
          new Error('unimplemented') :
          new TypeError();
    throw err;
  }

  function charToBits(c) {
    const bits = bitsTable.get(c);
    if (bits === undefined) {
      throw '\t\n\f\r '.includes(c) ? new Error('unimplemented') : new SynxtaxError();
    }
    return bits;
  }

  string = string.replace(/=*$/, '');
  let a = [];
  let i = 3;
  for (; i < string.length; i += 4) {
    const bitsChunk = [
      charToBits(string.at(i - 3)),
      charToBits(string.at(i - 2)),
      charToBits(string.at(i - 1)),
      charToBits(string.at(i)),
    ];
    const chunk = [
      (bitsChunk[0] << 2) | (bitsChunk[1] >>> 4),
      ((bitsChunk[1] & 0x0f) << 4) | (bitsChunk[2] >>> 2),
      ((bitsChunk[2] & 0x03) << 6) | bitsChunk[3],
    ];
    a = a.concat(chunk);
  }
  if (i - string.length === 0) {
    const bitsChunk = [
      charToBits(string.at(i - 3)),
      charToBits(string.at(i - 2)),
      charToBits(string.at(i - 1)),
    ];
    const chunk = [
      (bitsChunk[0] << 2) | (bitsChunk[1] >>> 4),
      ((bitsChunk[1] & 0x0f) << 4) | (bitsChunk[2] >>> 2),
    ];
    a = a.concat(chunk);
  } else if (i - string.length === 1) {
    const bitsChunk = [
      charToBits(string.at(i - 3)),
      charToBits(string.at(i - 2)),
    ];
    const chunk = [
      (bitsChunk[0] << 2) | (bitsChunk[1] >>> 4),
    ];
    a = a.concat(chunk);
  } else if (i - string.length === 2) {
    throw new SyntaxError();
  }

  return Uint8Array.from(a);
}

export function Uint8ArrayToBase64(uint8array, options = {}) {
  if (!(uint8array instanceof Uint8Array)) {
    throw new TypeError;
  }

  const { alphabet = 'base64', omitPadding = false } = options;
  if (!(alphabet === 'base64url' && omitPadding)) {
    const err = alphabet === 'base64' ?
          new Error('unimplemented') :
          new TypeError();
    throw err;
  }

  const bytes = Array.from(uint8array);
  let s = '';
  let i = 2;
  for (; i < bytes.length; i += 3) {
    s += charTable[bytes[i - 2] >>> 2] +
         charTable[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >>> 4)] +
         charTable[((bytes[i - 1] & 0x0f) << 2) | ((bytes[i] & 0xc0) >>> 6)] +
         charTable[bytes[i] & 0x3f];
  }
  if (i - bytes.length === 0) {
    s += charTable[bytes[i - 2] >>> 2] +
         charTable[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >>> 4)] +
         charTable[(bytes[i - 1] & 0x0f) << 2];
  } else if (i - bytes.length === 1) {
    s += charTable[bytes[i - 2] >>> 2] +
         charTable[(bytes[i - 2] & 0x03) << 4];
  }

  return s;
}
