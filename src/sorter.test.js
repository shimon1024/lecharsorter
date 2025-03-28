import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as sorter from './sorter.js';
import * as le from './lenen.js';
import * as random from './random.js';
import * as testutil from './testutil.js';

let randSeed;
beforeEach(async ({ task }) => {
  randSeed = await testutil.shortHash(task.id);
});

const chars2 = new Set([le.yabusame, le.tsubakura]); // 最小キャラ数
const chars3 = new Set([le.haiji, le.saragimaru, le.kaoru]); // 最小三つ組
const chars7 = new Set([le.tsubakura, le.lumen, le.medias, le.yago, le.hooaka, le.sukune, le.shion]); // デバッグに丁度いい大きさ
const chars10s = [
  new Set([le.mitori, le.hamee, le.para, le.yaorochi]),
  new Set([le.mitsumo]),
  new Set([le.shou, le.tsurubami, le.jinbei, le.kunimitsu]),
  new Set([le.aoji]),
];
const chars10 = chars10s[0].union(chars10s[1]).union(chars10s[2]).union(chars10s[3]); // 同率と単独が入り混じっている
const chars20s = [
  new Set([le.hibaru, le.chouki, le.kuroji, le.tsugumi, le.nilu]),
  new Set([le.tom, le.sese, le.suzumi, le.ardey, le.souko]),
  new Set([le.fumikado, le.zelo, le.iyozane, le.lin, le.jun]),
  new Set([le.xenoa, le.benny, le.sukune, le.tenkai, le.sanra]),
];
let chars20; // 順位が入り混じってる
{
  const cs = [
    Array.from(chars20s[0]),
    Array.from(chars20s[1]),
    Array.from(chars20s[2]),
    Array.from(chars20s[3]),
  ];
  chars20 = new Set(cs[0].flatMap((c, i) => [c, cs[1][i], cs[2][i], cs[3][i]]));
}

const charsAll = new Set(le.charIdsAll);

function setToSortedArray(set) {
  return Array.from(set).toSorted((a, b) => a - b);
}

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

describe('reduceSortHistory (compare) / heapsort', () => {
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
    [chars3, 'sorted'],
    [chars3, 'reversed'],
    [chars3, 'random'],
    [chars7, 'sorted'],
    [chars7, 'reversed'],
    [chars7, 'random'],
    [charsAll, 'sorted'],
    [charsAll, 'reversed'],
    [charsAll, 'random'],
  ])('ソートアルゴリズムとしての検査: キャラ集合: %o、入力に対するソート結果の並び順: %s', async (
    inputCharSet,
    expectedCharOrder
  ) => {
    let sortHistory = sorter.newSortHistory(inputCharSet, inputCharSet.size, randSeed);
    expect(shuffle).toHaveBeenCalledOnce();
    expect(shuffle.mock.results[0].type).toEqual('return');

    // newSortHistoryで呼ばれるrandom.shuffleの戻り値を参照して、期待する配列の並び順を決定する
    let expectedChars;
    switch (expectedCharOrder) {
    case 'sorted': expectedChars = shuffle.mock.results[0].value[0].map(c => [c]); break;
    case 'reversed': expectedChars = shuffle.mock.results[0].value[0].toReversed().map(c => [c]); break;
    case 'random': expectedChars = random.shuffle(Array.from(inputCharSet), random.newState((1 << 28) - 1 - randSeed))[0].map(c => [c]); break;
    default: throw new Error(`unexpected expectedCharOrder: ${expectedCharOrder}`);
    }

    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      const step = sortHistory.steps[sortHistory.currentStep];
      const aId = step.heaptree[step.ai][step.aj];
      const bId = step.heaptree[step.bi][step.bj];
      const cmp = compareChars(expectedChars, aId, bId);
      sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'both'});
    }

    expect(sortHistory.steps[sortHistory.currentStep].ranking).toEqual(expectedChars);
  });

  test.each([
    [chars2, chars2.size, [setToSortedArray(chars2)], [setToSortedArray(chars2)]], // 全員同率1位
    [chars2, 1, [setToSortedArray(chars2)], [setToSortedArray(chars2)]], // 全員同率1位、ランク数も1位に制限
    [chars3, chars3.size, [setToSortedArray(chars3)], [setToSortedArray(chars3)]], // 全員同率1位
    [chars3, 1, [setToSortedArray(chars3)], [setToSortedArray(chars3)]], // 全員同率1位、ランク数も1位に制限
    [chars7, chars7.size, [setToSortedArray(chars7)], [setToSortedArray(chars7)]], // 全員同率1位
    [chars7, 1, [setToSortedArray(chars7)], [setToSortedArray(chars7)]], // 全員同率1位、ランク数も1位に制限
    [chars10, chars10s.length, chars10s.map(s => Array.from(s)), chars10s.map(s => setToSortedArray(s))], // 同率と単独が入り混じっている
    [chars10, 1, chars10s.map(s => Array.from(s)), [setToSortedArray(chars10s[0])]], // 同率と単独が入り混じっている、ランク数も1位に制限
    [chars10, chars10s.length - 1, chars10s.map(s => Array.from(s)), chars10s.slice(0, -1).map(s => setToSortedArray(s))], // 同率と単独が入り混じっている、ランク数をいくらか制限
    [chars20, chars20s.length, chars20s.map(s => Array.from(s)), chars20s.map(s => setToSortedArray(s))], // 同率と単独が入り混じっている
    [chars20, 1, chars20s.map(s => Array.from(s)), [setToSortedArray(chars20s[0])]], // 同率と単独が入り混じっている、ランク数も1位に制限
    [chars20, chars20s.length - 1, chars20s.map(s => Array.from(s)), chars20s.slice(0, -1).map(s => setToSortedArray(s))], // 同率と単独が入り混じっている、ランク数をいくらか制限
    [charsAll, charsAll.size, [setToSortedArray(charsAll)], [setToSortedArray(charsAll)]], // 全員同率1位
    [charsAll, Math.floor(charsAll.size / 3), [setToSortedArray(charsAll)], [setToSortedArray(charsAll)]], // 全員同率1位、ランク数をいくらか制限
    [charsAll, 1, [setToSortedArray(charsAll)], [setToSortedArray(charsAll)]], // 全員同率1位、ランク数も1位に制限
  ])('ソートアルゴリズムとしての検査: キャラ集合: %o、ランキング数: %d、想定全順位: %j、想定順位: %j', async (
    inputCharSet,
    inputNumRanks,
    expectedCharOrder,
    expectedRanking,
  ) => {
    let sortHistory = sorter.newSortHistory(inputCharSet, inputNumRanks, randSeed);
    expect(shuffle).toHaveBeenCalledOnce();
    expect(shuffle.mock.results[0].type).toEqual('return');

    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      const step = sortHistory.steps[sortHistory.currentStep];
      const aId = step.heaptree[step.ai][step.aj];
      const bId = step.heaptree[step.bi][step.bj];
      const cmp = compareChars(expectedCharOrder, aId, bId);
      sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'both'});
    }

    expect(sortHistory.steps[sortHistory.currentStep].ranking).toEqual(expectedRanking);
  });

  // 今回は入力を信頼していいため、異常ケースのテストは省く
});

describe('reduceSortHistory (undo / redo)', () => {
  test('前のステップが無い状態でundoしても何も起きない', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    const sortHistory2 = sorter.reduceSortHistory(sortHistory, { type: 'undo'});

    expect(sortHistory2).toEqual(sortHistory);
  });

  test('前のステップがある状態でundoすると1つ前に戻る', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    const sortHistory2 = sorter.reduceSortHistory(sortHistory, { type: 'undo'});

    expect(sortHistory2.version).toEqual(sortHistory.version);
    expect(sortHistory2.numRanks).toEqual(sortHistory.numRanks);
    expect(sortHistory2.steps).toEqual(sortHistory.steps);
    expect(sortHistory2.currentStep).toEqual(sortHistory.currentStep - 1);
  });

  test('undoしてから選択すると、現在のステップ以降のステップがすべて破棄される(undo前と同じ選択肢を選んだ場合)', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'undo'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'undo'});
    const bkSortHistory = structuredClone(sortHistory);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});

    expect(sortHistory.version).toEqual(bkSortHistory.version);
    expect(sortHistory.numRanks).toEqual(bkSortHistory.numRanks);

    expect(bkSortHistory.steps.length).toEqual(4);
    expect(sortHistory.steps.length).toEqual(3);
    expect(bkSortHistory.currentStep).toEqual(1);
    expect(sortHistory.currentStep).toEqual(2);

    expect(sortHistory.steps.slice(0, 3)).toEqual(bkSortHistory.steps.slice(0, 3));
  });

  test('undoしてから選択すると、現在のステップ以降のステップがすべて破棄される(undo前と異なる選択肢を選んだ場合)', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'undo'});
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'undo'});
    const bkSortHistory = structuredClone(sortHistory);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'b'});

    expect(sortHistory.version).toEqual(bkSortHistory.version);
    expect(sortHistory.numRanks).toEqual(bkSortHistory.numRanks);

    expect(bkSortHistory.steps.length).toEqual(4);
    expect(sortHistory.steps.length).toEqual(3);
    expect(bkSortHistory.currentStep).toEqual(1);
    expect(sortHistory.currentStep).toEqual(2);

    expect(sortHistory.steps.slice(0, 2)).toEqual(bkSortHistory.steps.slice(0, 2));
    expect(sortHistory.steps[2]).not.toEqual(bkSortHistory.steps[2]);
  });

  test('後のステップが無い状態でredoしても何も起きない', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    const sortHistory2 = sorter.reduceSortHistory(sortHistory, { type: 'redo'});

    expect(sortHistory2).toEqual(sortHistory);
  });

  test('後のステップがある状態でredoすると1つ後に戻る', async () => {
    let sortHistory = sorter.newSortHistory(charsAll, charsAll.size, randSeed);
    sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a'});
    const sortHistory2 = sorter.reduceSortHistory(sortHistory, { type: 'undo'});

    expect(sortHistory2.version).toEqual(sortHistory.version);
    expect(sortHistory2.numRanks).toEqual(sortHistory.numRanks);
    expect(sortHistory2.steps).toEqual(sortHistory.steps);
    expect(sortHistory2.currentStep).toEqual(sortHistory.currentStep - 1);

    const sortHistory3 = sorter.reduceSortHistory(sortHistory, { type: 'redo'});

    expect(sortHistory3.version).toEqual(sortHistory2.version);
    expect(sortHistory3.numRanks).toEqual(sortHistory2.numRanks);
    expect(sortHistory3.steps).toEqual(sortHistory2.steps);
    expect(sortHistory3.currentStep).toEqual(sortHistory2.currentStep + 1);

    expect(sortHistory3).toEqual(sortHistory);
  });
});
