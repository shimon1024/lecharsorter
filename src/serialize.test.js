import { describe, expect, test } from 'vitest';

import * as serialize from './serialize.js';

describe('ランキングのシリアライズ', () => {
  test.each([
    [[], [], '', 'v=1&rn=&ur=&st='], // 空入力
    [[[1]], [], '好き', 'v=1&rn=Af8%3D&ur=&st=5aW944GN'], // ランキング一人
    [[], [1], '好き', 'v=1&rn=&ur=AQ%3D%3D&st=5aW944GN'], // ランク外一人
    [[[1], [2], [3]], [4, 5, 6], '好き', 'v=1&rn=Af8C_wP_&ur=BAUG&st=5aW944GN'], // ランキング複数人
    [[[1], [2, 3], [4]], [5, 6, 7], '好ki', 'v=1&rn=Af8CA_8E_w%3D%3D&ur=BQYH&st=5aW9a2k%3D'], // ランキング複数人、同じ順位あり、タイトルちょっと変更
  ])('バージョン1、ランキング%j、ランク外%j、タイトル「%s」 -> %j', async (
    inputRanking,
    inputUnranked,
    inputSorterTitle,
    expectedBase64
  ) => {
    const params = new URLSearchParams();
    serialize.serializeResultData(params, '1', { ranking: inputRanking, unranked: inputUnranked, sorterTitle: inputSorterTitle });
    expect(params.toString()).toEqual(expectedBase64);
  });

  test('不正なバージョン', async () => {
    expect(() => serialize.serializeResultData(null, 2, null)).toThrow(TypeError);
  });
});


describe('ランキングのデシリアライズ', () => {
  test.each([
    ['v=1&rn=&ur=&st=', [], [], ''], // 空入力
    ['v=1&rn=Af8%3D&ur=&st=5aW944GN', [[1]], [], '好き'], // ランキング一人
    ['v=1&rn=&ur=AQ%3D%3D&st=5aW944GN', [], [1], '好き'], // ランク外一人
    ['v=1&rn=Af8C_wP_&ur=BAUG&st=5aW944GN', [[1], [2], [3]], [4, 5, 6], '好き'], // ランキング複数人
    ['v=1&rn=Af8CA_8E_w%3D%3D&ur=BQYH&st=5aW9a2k%3D', [[1], [2, 3], [4]], [5, 6, 7], '好ki'], // ランキング複数人、同じ順位あり、タイトルちょっと変更
  ])('%j -> バージョン1、ランキング%j、ランク外%j、タイトル「%s」', async (
    inputBase64,
    expectedRanking,
    expectedUnranked,
    expectedSorterTitle,
  ) => {
    const params = new URLSearchParams(inputBase64);
    const actual = serialize.deserializeResultData(params, '1', );
    expect(actual).toEqual({ ranking: expectedRanking, unranked: expectedUnranked, sorterTitle: expectedSorterTitle });
  });

  test('不正なバージョン', async () => {
    const params = new URLSearchParams('v=2');
    expect(() => serialize.deserializeResultData(params)).toThrow(TypeError);
  });
});
