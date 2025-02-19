import { describe, expect, test } from 'vitest';

import * as encoding from './encoding.js';

describe('encodeResultData', () => {
  test.each([
    [[], '', []], // 空入力
    [[[1]], '', [1, 255]], // ランキングのみ
    [[], 'すき', [0xe3, 0x81, 0x99, 0xe3, 0x81, 0x8d]], // タイトルのみ
    [[[1]], 'すき', [1, 255, 0xe3, 0x81, 0x99, 0xe3, 0x81, 0x8d]], // 複合
    [[[1], [2], [3]], '', [1, 255, 2, 255, 3, 255]], // ランキング複数人
    [[[1], [2, 3], [4]], '', [1, 255, 2, 3, 255, 4, 255]], // ランキング複数人、同じ順位あり
    [[[1], [2, 3], [4]], 'すき', [1, 255, 2, 3, 255, 4, 255, 0xe3, 0x81, 0x99, 0xe3, 0x81, 0x8d]], // ランキング複数人、同じ順位あり、タイトル
  ])('バージョン1、キャラID%j、タイトル「%s」 -> %j', async (
    inputCharIds,
    inputSorterTitle,
    expectedByteArray
  ) => {
    const emptyData = encoding.encodeResultData(1, inputCharIds, inputSorterTitle);
    expect(emptyData).toEqual(Uint8Array.from(expectedByteArray));
  });

  test('不正なバージョン', async () => {
    expect(() => encoding.encodeResultData(2, [], '')).toThrow(Error);
  });

  // 今回は入力を信用してよいため、他の不正な値のテストはしない
});
