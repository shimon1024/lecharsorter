export function encodeResultData(version, charIds, sorterTitle) {
  if (version === 1) {
    // 前半にランキングデータ(キャラIDの配列)、後半にランキングタイトルを埋め込む。

    // 各ランクごとにセミコロン的なデリミタがある
    // 例: [1, 255, 2, 255, 3, 4, 255, 5, 255]
    //     ->[[1], [2], [3, 4], [5]]
    let charsBytes = [];
    for (let i = 0; i < charIds.length; i++) {
      for (let j = 0; j < charIds[i].length; j++) {
        charsBytes.push(charIds[i][j]);
      }
      charsBytes.push(255);
    }
    charsBytes = Uint8Array.from(charsBytes);

    const titleBytes = (new TextEncoder()).encode(sorterTitle);

    const bytes = new Uint8Array(charsBytes.length + titleBytes.length);
    bytes.set(charsBytes, 0);
    bytes.set(titleBytes, charsBytes.length);

    return bytes;
  }

  throw new Error(`unknown verion ${version}`);
}

// TODO 実装
// TODO タイトル
// TODO テスト
/*
export function decodeResultData(version, charsBytes) {
  if (version === 1) {
    const chars = [];
    let sameRankChars = [];
    for (let i = 0; i < charsBytes.length; i++) {
      if (charsBytes[i] === 255) {
        chars.push(sameRankChars);
        sameRankChars = [];
      } else {
        sameRankChars.push(charsBytes[i]);
      }
    }

    return chars;
    //return { sorterTitle, chars };
  }

  throw new Error(`unknown verion ${version}`);
}
*/
