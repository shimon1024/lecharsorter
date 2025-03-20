import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Result from './Result.jsx';
import Setup from './Setup.jsx';
import * as le from './lenen.js';

vi.mock('./Setup.jsx', { spy: true });
afterEach(() => {
  vi.clearAllMocks();
});

describe('キャラソートのタイトル', () => {
  test.each([
    [''], // 空文字列
    ['すき'], // 最初の画面の初期値
    ['鳥'.repeat(70)], // 最初の画面で設定可能な最大値
    ['鳥'.repeat(70) + '无'], // 最初の画面で設定可能な最大値を超えた値
  ])('「%s」', async (
    sorterTitle
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle={sorterTitle} chars={[[1]]} />}>
        <Scene />
      </SceneProvider>
    );

    const subtitle = screen.getByRole('heading', { level: 2 });
    expect(subtitle.textContent).toEqual(`${sorterTitle}ランキング`);
  });
});

describe('ランキング', () => {
  test.each([
    [[], ''], // 0人
    [[[le.yabusame.id]], '1位鳳聯藪雨'], // 1位のみ
    [[[le.yabusame.id], [le.kaoru.id], [le.clause.id], [le.aoji.id]], '1位鳳聯藪雨2位柏木薫3位クラウゼ4位鵐蒿雀'], // 4人
    [[[le.yabusame.id], [le.kaoru.id, le.clause.id], [le.aoji.id]], '1位鳳聯藪雨2位柏木薫2位クラウゼ4位鵐蒿雀'], // 4人(2位が同率2人)
  ])('キャラ%j -> ランキング: %s', async (
    chars,
    rankingString
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" chars={chars} />}>
        <Scene />
      </SceneProvider>
    );

    const charsContainer = screen.getByTestId('result-chars-container');
    expect(charsContainer.textContent).toEqual(rankingString);
  });
});

describe('諸情報', () => {
  test.each([
    [undefined, ''], // 引数に渡さない
    [100, '(100回)'], // 引数に渡す
  ])('時間%f分、比較回数%d回 -> %s', async (
    nCompares,
    infoString
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" chars={[[1]]} nCompares={nCompares} />}>
        <Scene />
      </SceneProvider>
    );

    const infoContainer = screen.getByTestId('result-info');
    expect(infoContainer.textContent).toEqual(infoString);
  });
});

describe('リンク', () => {
  test.each([
    [[], '', 'https://example.com/?c=v&v=1&d='], // 空
    [[[le.yabusame.id]], 'すき', 'https://example.com/?c=v&v=1&d=Af_jgZnjgY0%3D'], // 正常
    [[], 'すき', 'https://example.com/?c=v&v=1&d=44GZ44GN'], // キャラ無し
    [[[le.yabusame.id]], '', 'https://example.com/?c=v&v=1&d=Af8%3D'], // タイトル無し
    [[[le.yabusame.id], [le.garaiya.id, le.kaisen.id], [le.hoojiro.id]], '鳥'.repeat(70), 'https://example.com/?c=v&v=1&d=Af8eHP8p_-mzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpQ%3D%3D'], // 複数人、同率あり、タイトル最大長
  ])('キャラ%j、ソートタイトル%s -> 結果リンク %s', async (
    inputChars,
    inputSorterTitle,
    expectedResultURL
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle={inputSorterTitle} chars={inputChars} />}>
        <Scene />
      </SceneProvider>
    );

    const resultURL = screen.getByText('結果へのリンク');
    expect(resultURL.href).toEqual(expectedResultURL);
  });

  test.each([
    [[], '', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A%E2%80%A6'], // 空
    [[[le.yabusame.id]], 'すき', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3DAf_jgZnjgY0%253D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%81%99%E3%81%8D%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A%E2%80%A6'], // 正常 // https://example.com/?c=v&v=1&d=Af_jgZnjgY0%3D
    [[], 'すき', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3D44GZ44GN&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%81%99%E3%81%8D%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A%E2%80%A6'], // キャラ無し
    [[[le.yabusame.id]], '', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3DAf8%253D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A%E2%80%A6'], // タイトル無し
    [[[le.yabusame.id], [le.garaiya.id], [le.kaisen.id], [le.hoojiro.id]], '鳥'.repeat(70), 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3DAf8e_xz_Kf_ps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6Xps6U%253D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A2%E4%BD%8D+%E5%B0%BE%E5%BD%A2%E3%82%AC%E3%83%A9%E3%82%A4%E3%83%A4%0A3%E4%BD%8D+%E6%9D%B1%E6%B5%B7%E4%BB%99%0A%E2%80%A6'], // 複数人、タイトル最大長
    [[[le.yabusame.id], [le.garaiya.id, le.kaisen.id], [le.hoojiro.id]], '鳥'.repeat(70), 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26d%3DAf8eHP8p_-mzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpemzpQ%253D%253D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A2%E4%BD%8D+%E5%B0%BE%E5%BD%A2%E3%82%AC%E3%83%A9%E3%82%A4%E3%83%A4%0A2%E4%BD%8D+%E6%9D%B1%E6%B5%B7%E4%BB%99%0A%E2%80%A6'], // 複数人、同率あり、タイトル最大長
  ])('キャラ%j、ソートタイトル「%s」 -> Xポストリンク %s', async (
    inputChars,
    inputSorterTitle,
    expectedXPostURL
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle={inputSorterTitle} chars={inputChars} />}>
        <Scene />
      </SceneProvider>
    );

    const resultURL = screen.getByText('Xで共有');
    expect(resultURL.href).toEqual(expectedXPostURL);
  });
});

describe('もう一度ボタン', () => {
  let confirm;

  beforeEach(() => {
    confirm = vi.spyOn(window, 'confirm');
  });

  afterEach(() => {
    confirm.mockRestore();
  });

  test('ポップアップをキャンセル', async (
  ) => {
    confirm.mockImplementation(() => false);

    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" chars={[[1]]} />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByText('もう一度'));
    expect(Setup).not.toHaveBeenCalled();
  });

  test('ポップアップを承認', async (
  ) => {
    confirm.mockImplementation(() => true);

    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" chars={[[1]]} />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByText('もう一度'));
    expect(Setup).toHaveBeenCalled();
  });
});
