import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as sorter from './sorter.js';
import * as le from './lenen.js';
import * as random from './random.js';

let randSeed = 0;
afterEach(() => {
  randSeed++;
});

const chars2 = new Set([le.yabusame.id, le.tsubakura.id]); // 最小キャラ数
const chars7 = new Set([le.tsubakura.id, le.lumen.id, le.medias.id, le.yago.id, le.hooaka.id, le.sukune.id, le.shion.id]); // デバッグに丁度いい大きさ
const charsAll = new Set(le.charIdAll);

//const charIdAllShuffled;

// 想定する結果から逆算して比較の結果を決める
function compareChars(orderedChars, aId, bId) {
  function findIndex(cId) {
    for (let i = 0; i < orderedChars.length; i++) {
      if (orderedChars[i].includes(cId)) {
        return i;
      }
    }

    throw new Error(`orderedChars: ${orderedChars}, aId: ${aId}, bId: ${bId}`);
  }

  const ai = findIndex(aId);
  const bi = findIndex(bId);
  return ai < bi ? -1 : ai > bi ? 1 : 0;
}

describe('heapsort', () => {
  let shuffle;

  beforeEach(() => {
    shuffle = vi.spyOn(random, 'shuffle');
  });

  afterEach(() => {
    shuffle.mockClear();
  });

  test.each([
    [chars2, 'sorted'],
    [chars2, 'reversed'],
    // chars2は全網羅済みなのでrandomは不要
    [chars7, 'sorted'],
    [chars7, 'reversed'],
    [chars7, 'random'],
    [charsAll, 'sorted'],
    [charsAll, 'reversed'],
    [charsAll, 'random'],
  ])('ソートアルゴリズムとしての検査: キャラ集合: %o、入力に対するソート結果の並び順: %j', async (
    inputCharSet,
    expectedCharOrder
  ) => {
    let sortHistory = sorter.newSortHistory({ charIdSet: inputCharSet, randSeed });
    expect(shuffle).toHaveBeenCalledOnce();
    expect(shuffle.mock.results[0].type).toEqual('return');

    // newSortHistoryで呼ばれるrandom.shuffleの戻り値を参照して、期待する配列の並び順を決定する
    let expectedChars;
    switch (expectedCharOrder) {
    case 'sorted': expectedChars = shuffle.mock.results[0].value[0].map(c => [c]); break;
    case 'reversed': expectedChars = shuffle.mock.results[0].value[0].toReversed().map(c => [c]); break;
    case 'random': expectedChars = random.shuffle(Array.from(inputCharSet), random.newState(~(1 << 31) - randSeed))[0].map(c => [c]); break;
    default: throw new Error(`expectedCharOrder: ${expectedCharOrder}`);
    }

    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      const step = sortHistory.steps[sortHistory.currentStep];
      const aId = le.chars[step.heaptree[step.ai][step.aj]].id;
      const bId = le.chars[step.heaptree[step.bi][step.bj]].id;
      const cmp = compareChars(expectedChars, aId, bId);
      sortHistory = sorter.heapsort(sortHistory, cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'both');
    }

    expect(sortHistory.steps[sortHistory.currentStep].heaptree).toEqual(expectedChars);
  });

  // 今回は入力を信頼していいため、異常ケースのテストは省く
});
