// TODO: 各ブラウザで実装され次第、標準APIに差し替え
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64

export function Uint8ArrayFromBase64(string, options = {}) {
  const { alphabet = 'base64', lastChunkHandling = 'loose' } = options;
  if (!(alphabet === 'base64url' && lastChunkHandling === 'loose')) {
    const err = alphabet === 'base64' || ['strict', 'stop-before-partial'].includes(lastChunkHandling) ?
          new Error('unimplemented') :
          new TypeError();
    throw err;
  }

  string = string.concat('='.repeat((4 - string.length % 4) % 4)).replaceAll('-', '+').replaceAll('_', '/');
  return Uint8Array.from(atob(string), c => c.charCodeAt(0));
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

  const bstr = Array.from(uint8array, b => String.fromCharCode(b)).reduce((s, c) => s + c, '');
  return btoa(bstr).replace(/=*$/, '').replaceAll('+', '-').replaceAll('/', '_');
}
