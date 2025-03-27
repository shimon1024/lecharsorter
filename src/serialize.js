export function serializeRanking(version, ranking) {
  if (version === 1) {
    // 各ランクごとにセミコロン的なデリミタがある。
    // 例: [1, 255, 2, 255, 3, 4, 255, 5, 255]
    //     ->[[1], [2], [3, 4], [5]]
    let charsBytes = [];
    for (let i = 0; i < ranking.length; i++) {
      for (let j = 0; j < ranking[i].length; j++) {
        charsBytes.push(ranking[i][j]);
      }
      charsBytes.push(255);
    }
    return Uint8Array.from(charsBytes);
  }

  throw new Error(`unknown verion ${version}`);
}

export function serializeUnranked(version, unranked) {
  if (version === 1) {
    // 各キャラIDを単純に並べる。
    return Uint8Array.from(unranked);
  }

  throw new Error(`unknown verion ${version}`);
}

export function serializeSorterTitle(version, sorterTitle) {
  if (version === 1) {
    // 単純にバイト列化。
    // new Uint8Arrayは回避策 https://github.com/vitest-dev/vitest/issues/4043
    return new Uint8Array((new TextEncoder()).encode(sorterTitle));
  }

  throw new Error(`unknown verion ${version}`);
}

// TODO 実装
// TODO タイトル
// TODO テスト
/*
export function deserializeResultData(version, charsBytes) {
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
