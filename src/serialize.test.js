import { describe, expect, test } from 'vitest';

import * as serialize from './serialize.js';

describe('ランキングのシリアライズ', () => {
  test.each([
    [[], []], // 空入力
    [[[1]], [1, 255]], // ランキングのみ
    [[[1], [2], [3]], [1, 255, 2, 255, 3, 255]], // ランキング複数人
    [[[1], [2, 3], [4]], [1, 255, 2, 3, 255, 4, 255]], // ランキング複数人、同じ順位あり
  ])('バージョン1、キャラID%j -> %j', async (
    inputRanking,
    expectedByteArray
  ) => {
    const emptyData = serialize.serializeRanking(1, inputRanking);
    expect(emptyData).toEqual(Uint8Array.from(expectedByteArray));
  });

  test('不正なバージョン', async () => {
    expect(() => serialize.serializeRanking(2, [])).toThrow(Error);
  });

  // 今回は入力を信用してよいため、他の不正な値のテストはしない
});

describe('ランク外のシリアライズ', () => {
  test.each([
    [[], []], // 空入力
    [[1], [1]], // 1人のみ
    [[1, 2, 3], [1, 2, 3]], // 複数人
  ])('バージョン1、ランク外%j、 -> %j', async (
    inputUnranked,
    expectedByteArray
  ) => {
    const emptyData = serialize.serializeUnranked(1, inputUnranked);
    expect(emptyData).toEqual(Uint8Array.from(expectedByteArray));
  });

  test('不正なバージョン', async () => {
    expect(() => serialize.serializeUnranked(2, [])).toThrow(Error);
  });

  // 今回は入力を信用してよいため、他の不正な値のテストはしない
});

describe('タイトル名のシリアライズ', () => {
  test.each([
    ['', []], // 空入力
    ['すき', [0xe3, 0x81, 0x99, 0xe3, 0x81, 0x8d]], // タイトルのみ
  ])('バージョン1、タイトル「%s」 -> %j', async (
    inputSorterTitle,
    expectedByteArray
  ) => {
    const emptyData = serialize.serializeSorterTitle(1, inputSorterTitle);
    expect(emptyData).toEqual(Uint8Array.from(expectedByteArray));
  });

  test('不正なバージョン', async () => {
    expect(() => serialize.serializeSorterTitle(2, '')).toThrow(Error);
  });

  // 今回は入力を信用してよいため、他の不正な値のテストはしない
});
