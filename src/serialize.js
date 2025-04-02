import { Uint8ArrayToBase64, Uint8ArrayFromBase64 } from './base64.js';

export function serializeResultData(searchParams, version, resultData) {
  switch (version) {
  case '1': {
    searchParams.set('v', version);
    const { sorterTitle, ranking, unranked } = resultData;

    // 各ランクごとにセミコロン的なデリミタがある。
    // 例: [1, 255, 2, 255, 3, 4, 255, 5, 255]
    //     ->[[1], [2], [3, 4], [5]]
    let rankingBytes = [];
    for (let i = 0; i < ranking.length; i++) {
      for (let j = 0; j < ranking[i].length; j++) {
        rankingBytes.push(ranking[i][j]);
      }
      rankingBytes.push(255);
    }
    searchParams.set('rn', Uint8ArrayToBase64(Uint8Array.from(rankingBytes), { alphabet: 'base64url' }));

    searchParams.set('ur', Uint8ArrayToBase64(Uint8Array.from(unranked), { alphabet: 'base64url' }));

    // 単純にバイト列化。
    // new Uint8Arrayは回避策 https://github.com/vitest-dev/vitest/issues/4043
    const sorterTitleBytes = new Uint8Array((new TextEncoder()).encode(sorterTitle));
    searchParams.set('st', Uint8ArrayToBase64(Uint8Array.from(sorterTitleBytes), { alphabet: 'base64url' }));

    return;
  }
  default: throw new TypeError(`unknown verion ${version}`);
  }
}

export function deserializeResultData(searchParams) {
  const version = searchParams.get('v');

  switch (version) {
  case '1': {
    const rankingBytes = Uint8ArrayFromBase64(searchParams.get('rn'), { alphabet: 'base64url' });
    const ranking = [];
    let sameRank = [];
    for (const num of rankingBytes) {
      if (num === 255) {
        ranking.push(sameRank);
        sameRank = [];
      } else {
        sameRank.push(num);
      }
    }
    if (sameRank.length !== 0) {
      throw new SyntaxError('invalid ranking format');
    }

    const unranked = Array.from(Uint8ArrayFromBase64(searchParams.get('ur'), { alphabet: 'base64url' }));

    // new Uint8Arrayは回避策 https://github.com/vitest-dev/vitest/issues/4043
    const sorterTitleBytes = Uint8ArrayFromBase64(searchParams.get('st'), { alphabet: 'base64url' });
    const sorterTitle = (new TextDecoder('utf-8', { fatal: true })).decode(new Uint8Array(sorterTitleBytes));

    return { sorterTitle, ranking, unranked };
  }
  default: throw new TypeError(`unknown verion ${version}`);
  }
}
