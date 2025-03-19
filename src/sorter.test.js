import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as sorter from './sorter.js';
import * as le from './lenen.js';
import * as random from './random.js';

let randSeed = 0;
afterEach(() => {
  randSeed++;
});

const chars2 = new Set([le.yabusame.id, le.tsubakura.id]); // 最小キャラ数
const chars3 = new Set([le.haiji.id, le.saragimaru.id, le.kaoru.id]); // 最小三つ組
const chars7 = new Set([le.tsubakura.id, le.lumen.id, le.medias.id, le.yago.id, le.hooaka.id, le.sukune.id, le.shion.id]); // デバッグに丁度いい大きさ
const chars10s = [
  new Set([le.mitori.id, le.hamee.id, le.para.id, le.yaorochi.id]),
  new Set([le.mitsumo.id]),
  new Set([le.shou.id, le.tsurubami.id, le.jinbei.id, le.kunimitsu.id]),
  new Set([le.aoji.id]),
];
const chars10 = chars10s[0].union(chars10s[1]).union(chars10s[2]).union(chars10s[3]); // 同率と単独が入り混じっている
const chars20s = [
  new Set([le.hibaru.id, le.chouki.id, le.kuroji.id, le.tsugumi.id, le.nilu.id]),
  new Set([le.tom.id, le.sese.id, le.suzumi.id, le.ardey.id, le.souko.id]),
  new Set([le.fumikado.id, le.zelo.id, le.iyozane.id, le.lin.id, le.jun.id]),
  new Set([le.xenoa.id, le.benny.id, le.sukune.id, le.tenkai.id, le.sanra.id]),
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

const charsAll = new Set(le.charIdAll);

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
    [chars3, 'sorted'],
    [chars3, 'reversed'],
    [chars3, 'random'],
    [chars7, 'sorted'],
    [chars7, 'reversed'],
    [chars7, 'random'],
    [charsAll, 'sorted'],
    [charsAll, 'reversed'],
    [charsAll, 'random'],
  ])('ソートアルゴリズムとしての検査: キャラ集合: %o、ランキング数: %d、入力に対するソート結果の並び順: %j', async (
    inputCharSet,
    expectedCharOrder
  ) => {
    let sortHistory = sorter.newSortHistory({ charIdSet: inputCharSet, numRanks: inputCharSet.size, randSeed });
    expect(shuffle).toHaveBeenCalledOnce();
    expect(shuffle.mock.results[0].type).toEqual('return');

    // newSortHistoryで呼ばれるrandom.shuffleの戻り値を参照して、期待する配列の並び順を決定する
    let expectedChars;
    switch (expectedCharOrder) {
    case 'sorted': expectedChars = shuffle.mock.results[0].value[0].map(c => [c]); break;
    case 'reversed': expectedChars = shuffle.mock.results[0].value[0].toReversed().map(c => [c]); break;
    case 'random': expectedChars = random.shuffle(Array.from(inputCharSet), random.newState(~(1 << 31) - randSeed))[0].map(c => [c]); break;
    default: throw new Error(`unexpected expectedCharOrder: ${expectedCharOrder}`);
    }

    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      const step = sortHistory.steps[sortHistory.currentStep];
      const aId = le.chars[step.heaptree[step.ai][step.aj]].id;
      const bId = le.chars[step.heaptree[step.bi][step.bj]].id;
      const cmp = compareChars(expectedChars, aId, bId);
      sortHistory = sorter.heapsort(sortHistory, cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'both');
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
    let sortHistory = sorter.newSortHistory({ charIdSet: inputCharSet, numRanks: inputNumRanks, randSeed });
    expect(shuffle).toHaveBeenCalledOnce();
    expect(shuffle.mock.results[0].type).toEqual('return');

    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      const step = sortHistory.steps[sortHistory.currentStep];
      const aId = le.chars[step.heaptree[step.ai][step.aj]].id;
      const bId = le.chars[step.heaptree[step.bi][step.bj]].id;
      const cmp = compareChars(expectedCharOrder, aId, bId);
      sortHistory = sorter.heapsort(sortHistory, cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'both');
    }

    expect(sortHistory.steps[sortHistory.currentStep].ranking).toEqual(expectedRanking);
  });

  // 今回は入力を信頼していいため、異常ケースのテストは省く
});
