import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';
import Result from './Result.jsx';
import ErrorPage, { messageClearSaveData } from './ErrorPage.jsx';
import * as le from './lenen.js';
import * as save from './save.js';
import * as sorter from './sorter.js';

vi.mock('./Setup.jsx', { spy: true });
vi.mock('./ErrorPage.jsx', { spy: true });
afterEach(async () => {
  vi.clearAllMocks();
  await save.clearSaveData();
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
      <SceneProvider defaultScene={<Result sorterTitle={sorterTitle} ranking={[[1]]} unranked={[]} />}>
        <Scene />
      </SceneProvider>
    );

    const subtitle = screen.getByRole('heading', { level: 2 });
    expect(subtitle.textContent).toEqual(`${sorterTitle}ランキング`);
  });
});

describe('ランキング', () => {
  test.each([
    [[], [], ''], // 0人
    [[[le.yabusame]], [], '1位鳳聯藪雨'], // 1位のみ
    [[[le.yabusame]], [le.tsubakura], '1位鳳聯藪雨ランク外燕楽玄鳥'], // 1位のみ、ランク外
    [[[le.yabusame], [le.kaoru], [le.clause], [le.aoji]], [], '1位鳳聯藪雨2位柏木薫3位クラウゼ4位鵐蒿雀'], // 4人
    [[[le.yabusame], [le.kaoru, le.clause], [le.aoji]], [], '1位鳳聯藪雨2位柏木薫2位クラウゼ4位鵐蒿雀'], // 4人(2位が同率2人)
    [[[le.yabusame], [le.kaoru, le.clause], [le.aoji]], [le.hamee, le.ardey], '1位鳳聯藪雨2位柏木薫2位クラウゼ4位鵐蒿雀ランク外シネ＝ハマルランク外アルデ'], // 4人(2位が同率2人)、ランク外
  ])('キャラ%j、ランク外%j -> ランキング: %s', async (
    ranking,
    unranked,
    rankingString
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" ranking={ranking} unranked={unranked} />}>
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
    [100, '(比較100回)'], // 引数に渡す
  ])('時間%f分、比較回数%d回 -> %s', async (
    nCompares,
    infoString
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" ranking={[[1]]} unranked={[]} nCompares={nCompares} />}>
        <Scene />
      </SceneProvider>
    );

    const infoContainer = screen.getByTestId('result-info');
    expect(infoContainer.textContent).toEqual(infoString);
  });
});

describe('リンク', () => {
  test.each([
    [[], [], '', 'https://example.com/?c=v&v=1&rn=&ur=&st='], // 空
    [[[le.yabusame]], [], '', 'https://example.com/?c=v&v=1&rn=Af8%3D&ur=&st='], // ランキング
    [[], [le.tsubakura], '', 'https://example.com/?c=v&v=1&rn=&ur=Ag%3D%3D&st='], // ランク外
    [[], [], 'すき', 'https://example.com/?c=v&v=1&rn=&ur=&st=44GZ44GN'], // タイトル
    [[[le.yabusame]], [[le.tsubakura]], 'すき', 'https://example.com/?c=v&v=1&rn=Af8%3D&ur=Ag%3D%3D&st=44GZ44GN'], // 複合
    [[[le.yabusame], [le.garaiya, le.kaisen], [le.hoojiro]], [le.clause, le.yaorochi, le.shion], '鳥'.repeat(70), 'https://example.com/?c=v&v=1&rn=Af8eHP8p_w%3D%3D&ur=CA8V&st=6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl'], // 複数人、同率あり、タイトル最大長
  ])('ランキング%j、ランク外%j、ソートタイトル%s -> 結果リンク %s', async (
    inputRanking,
    inputUnranked,
    inputSorterTitle,
    expectedResultURL
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle={inputSorterTitle} ranking={inputRanking} unranked={inputUnranked} />}>
        <Scene />
      </SceneProvider>
    );

    const resultURL = screen.getByText('結果へのリンク');
    expect(resultURL.href).toEqual(expectedResultURL);
  });

  test.each([
    [[], [], '', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3D%26ur%3D%26st%3D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A%E2%80%A6'], // 空
    [[[le.yabusame]], [], '', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3DAf8%253D%26ur%3D%26st%3D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A%E2%80%A6'], // ランキング
    [[], [le.tsubakura], '', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3D%26ur%3DAg%253D%253D%26st%3D&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A%E2%80%A6'], // ランク外
    [[], [], 'すき', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3D%26ur%3D%26st%3D44GZ44GN&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%81%99%E3%81%8D%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A%E2%80%A6'], // タイトル
    [[[le.yabusame]], [le.tsubakura], 'すき', 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3DAf8%253D%26ur%3DAg%253D%253D%26st%3D44GZ44GN&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E3%81%99%E3%81%8D%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A%E2%80%A6'], // 複合
    [[[le.yabusame], [le.garaiya, le.kaisen], [le.hoojiro]], [le.clause, le.yaorochi, le.shion], '鳥'.repeat(70), 'https://x.com/intent/post?url=https%3A%2F%2Fexample.com%2F%3Fc%3Dv%26v%3D1%26rn%3DAf8eHP8p_w%253D%253D%26ur%3DCA8V%26st%3D6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl6bOl&text=%E9%80%A3%E7%B8%81%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%BD%E3%83%BC%E3%83%88%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E9%B3%A5%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%0A1%E4%BD%8D+%E9%B3%B3%E8%81%AF%E8%97%AA%E9%9B%A8%0A2%E4%BD%8D+%E5%B0%BE%E5%BD%A2%E3%82%AC%E3%83%A9%E3%82%A4%E3%83%A4%0A2%E4%BD%8D+%E6%9D%B1%E6%B5%B7%E4%BB%99%0A%E2%80%A6'], // 複数人、同率あり、タイトル最大長
  ])('ランキング%j、ランク外%j、ソートタイトル「%s」 -> Xポストリンク %s', async (
    inputRanking,
    inputUnranked,
    inputSorterTitle,
    expectedXPostURL
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle={inputSorterTitle} ranking={inputRanking} unranked={inputUnranked} />}>
        <Scene />
      </SceneProvider>
    );

    const resultURL = screen.getByText('Xで共有');
    expect(resultURL.href).toEqual(expectedXPostURL);
  });
});

describe('もう一度ボタン', () => {
  let confirm, clearSaveData, console_error;
  const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

  beforeEach(() => {
    confirm = vi.spyOn(window, 'confirm');
    clearSaveData = vi.spyOn(save, 'clearSaveData');
    console_error = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    confirm.mockRestore();
    clearSaveData.mockRestore();
    console_error.mockRestore();
  });

  test('ポップアップをキャンセル', async () => {
    confirm.mockImplementation(() => false);

    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" ranking={[[1]]} unranked={[]} />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByText('もう一度'));
    expect(Setup).not.toHaveBeenCalled();
  });

  test('ポップアップを承認', async () => {
    confirm.mockImplementation(() => true);

    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Result sorterTitle="すき" ranking={[[1]]} unranked={[]} />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByText('もう一度'));
    expect(Setup).toHaveBeenCalled();
  });

  test('データのクリア処理でエラーになるとエラーページへ遷移', async () => {
    confirm.mockImplementation(() => true);
    clearSaveData.mockImplementation(async () => {throw new Error();});
    console_error.mockImplementation(() => {}); // 握りつぶす

    const user = userEvent.setup();
    const sorterTitle = 'すき';

    let initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    while (initialSortHistory.steps[initialSortHistory.currentStep].sortState !== 'end') {
      initialSortHistory = sorter.reduceSortHistory(initialSortHistory, { type: 'compare', result: 'a' });
      await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    }

    render(
      <SceneProvider
        defaultScene={
          <Result
            sorterTitle="すき"
            ranking={initialSortHistory.steps[initialSortHistory.currentStep].ranking}
            unranked={initialSortHistory.steps[initialSortHistory.currentStep].heaptree.flat().toSorted((a, b) => a - b)}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'もう一度' }));
    await screen.findByText(messageClearSaveData);
    expect(Setup).not.toHaveBeenCalled();
    expect(ErrorPage).toHaveBeenCalled();
    await screen.findByText('エラー');
    screen.getByText(messageClearSaveData);
  });

  test('セーブデータが削除される', async () => {
    confirm.mockImplementation(() => true);

    const user = userEvent.setup();
    const sorterTitle = 'すき';

    let initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    while (initialSortHistory.steps[initialSortHistory.currentStep].sortState !== 'end') {
      initialSortHistory = sorter.reduceSortHistory(initialSortHistory, { type: 'compare', result: 'a' });
      await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    }

    render(
      <SceneProvider
        defaultScene={
          <Result
            sorterTitle="すき"
            ranking={initialSortHistory.steps[initialSortHistory.currentStep].ranking}
            unranked={initialSortHistory.steps[initialSortHistory.currentStep].heaptree.flat().toSorted((a, b) => a - b)}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    expect(await save.loadSaveData()).toEqual([sorterTitle, initialSortHistory]);

    await user.click(screen.getByRole('button', { name: 'もう一度' }));
    expect(Setup).toHaveBeenCalled();
    expect(await save.loadSaveData()).toEqual([undefined, undefined]);
  });
});
