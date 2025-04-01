import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';
import * as random from './random.js';
import * as save from './save.js';
import * as sorter from './sorter.js';
import * as testutil from './testutil.js';

vi.mock('./Compare.jsx', { spy: true });
vi.mock('./sorter.js', { spy: true });
let genSeed;

beforeEach(async ({ task }) => {
  const shortHash = await testutil.shortHash(task.id);

  genSeed = vi.spyOn(random, 'genSeed');
  genSeed.mockImplementation(() => shortHash);
});

afterEach(async () => {
  vi.clearAllMocks();
  genSeed.mockRestore();
  await save.clearSaveData();
});

describe('キャラソートのタイトル入力', () => {
  test('入力しない', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
  });

  test('入力欄を空にする', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const inputSorterTitle = within(screen.getByText(/^どっちが/)).getByRole('textbox');
    await user.clear(inputSorterTitle);

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちが？');
  });

  test.each([
    [70, 70],
    [71, 70],
  ])('入力欄に長さ%iの文字列を入力すると、比較画面に長さ%iの文字列が渡される', async (
    inputLength,
    expectedLength
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const inputString = 'ぬ'.repeat(inputLength);
    const inputSorterTitle = within(screen.getByText(/^どっちが/)).getByRole('textbox');
    await user.clear(inputSorterTitle);
    await user.type(inputSorterTitle, inputString);

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    const expectedString = 'ぬ'.repeat(expectedLength);
    await screen.findByText(`どっちが${expectedString}？`);
  });
});

describe('ランク数の指定', () => {
  test('指定しない(全員)', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(sorter.newSortHistory).toHaveBeenCalledOnce();
    expect(sorter.newSortHistory.mock.results[0].type).toEqual('return');
    expect(new Set(sorter.newSortHistory.mock.calls[0][0])).toEqual(new Set(le.charIdsAll));
    expect(sorter.newSortHistory.mock.calls[0][1]).toEqual(le.charIdsAll.length);
    expect(Compare).toHaveBeenCalledWith(
      {
        sorterTitle: 'すき',
        initialSortHistory: sorter.newSortHistory.mock.results[0].value,
        initialAutosaveIsEnabled: true,
      },
      expect.anything()
    );
  });

  test('指定しない(2人)', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '闡裡鶴喰', '瑞風天堺']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(sorter.newSortHistory).toHaveBeenCalledOnce();
    expect(sorter.newSortHistory.mock.results[0].type).toEqual('return');
    expect(new Set(sorter.newSortHistory.mock.calls[0][0])).toEqual(new Set([le.tsurubami, le.tenkai]));
    expect(sorter.newSortHistory.mock.calls[0][1]).toEqual(2);
    expect(Compare).toHaveBeenCalledWith(
      {
        sorterTitle: 'すき',
        initialSortHistory: sorter.newSortHistory.mock.results[0].value,
        initialAutosaveIsEnabled: true,
      },
      expect.anything()
    );
  });

  test('指定する', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    const nranks = screen.getByText('ランクインするランクの数をまでに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(sorter.newSortHistory).toHaveBeenCalledOnce();
    expect(sorter.newSortHistory.mock.results[0].type).toEqual('return');
    expect(new Set(sorter.newSortHistory.mock.calls[0][0])).toEqual(new Set(le.charIdsAll));
    expect(sorter.newSortHistory.mock.calls[0][1]).toEqual(3);
    expect(Compare).toHaveBeenCalledWith(
      {
        sorterTitle: 'すき',
        initialSortHistory: sorter.newSortHistory.mock.results[0].value,
        initialAutosaveIsEnabled: true,
      },
      expect.anything()
    );
  });

  test('ランクを余分に指定すると自動で丸められる', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '闡裡鶴喰', '瑞風天堺']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    const nranks = screen.getByText('ランクインするランクの数をまでに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(sorter.newSortHistory).toHaveBeenCalledOnce();
    expect(sorter.newSortHistory.mock.results[0].type).toEqual('return');
    expect(new Set(sorter.newSortHistory.mock.calls[0][0])).toEqual(new Set([le.tsurubami, le.tenkai]));
    expect(sorter.newSortHistory.mock.calls[0][1]).toEqual(2);
    expect(Compare).toHaveBeenCalledWith(
      {
        sorterTitle: 'すき',
        initialSortHistory: sorter.newSortHistory.mock.results[0].value,
        initialAutosaveIsEnabled: true,
      },
      expect.anything()
    );
  });
});

describe('キャラ/グループの選択', () => {
  test.each([
    // 何もしない
    [
      [],
      le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]),
      le.workIdsDefault.flatMap(w => le.works[w].chars),
    ],
    // (部分選択->)全選択
    [
      ['全員'],
      ['全員', ...le.workIdsAll.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))])],
      le.charIdsAll,
    ],
    /* TODO: 「はじめる」クリック時にポップアップを出して開始させないようにするべき。この入力をCompareは想定していないため、エラーになる
    // 全選択->全解除
    [
      ['全員', '全員'],
      [],
      [],
    ],
    */
    // 全選択->部分選択->全選択
    [
      ['全員', '鳳聯藪雨', '全員'],
      ['全員', ...le.workIdsAll.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))])],
      le.charIdsAll,
    ],
    // 全解除->部分選択->全選択
    [
      ['全員', '全員', '鳳聯藪雨', '全員'],
      ['全員', ...le.workIdsAll.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))])],
      le.charIdsAll,
    ],
    // 作品解除
    [
      ['主要人物'],
      [le.ee, le.ems, le.rmi, le.bpohc].flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]),
      [le.ee, le.ems, le.rmi, le.bpohc].flatMap(w => le.works[w].chars),
    ],
    // 作品選択
    [
      ['音楽CD'],
      ['音楽CD', 'ハル', '鵐頬告鳥', ...(le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]))],
      [le.haru, le.hoojiro, ...(le.workIdsDefault.flatMap(w => le.works[w].chars))],
    ],
    // 作品解除->部分選択->作品選択
    [
      ['音楽CD', '音楽CD', 'ハル', '音楽CD'],
      ['音楽CD', 'ハル', '鵐頬告鳥', ...(le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]))],
      [le.haru, le.hoojiro, ...(le.workIdsDefault.flatMap(w => le.works[w].chars))],
    ],
    // 部分選択->作品選択
    [
      ['ハル', '音楽CD'],
      ['音楽CD', 'ハル', '鵐頬告鳥', ...(le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]))],
      [le.haru, le.hoojiro, ...(le.workIdsDefault.flatMap(w => le.works[w].chars))],
    ],
    // キャラ解除
    [
      ['鳳聯藪雨'],
      ['燕楽玄鳥', '國主雀巳', ...([le.ee, le.ems, le.rmi, le.bpohc].flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]))],
      [le.tsubakura, le.suzumi, ...([le.ee, le.ems, le.rmi, le.bpohc].flatMap(w => le.works[w].chars))],
    ],
    // キャラ選択
    [
      ['ハル'],
      ['ハル', ...(le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]))],
      [le.haru, ...(le.workIdsDefault.flatMap(w => le.works[w].chars))],
    ],
    // キャラ選択->キャラ解除
    [
      ['ハル', 'ハル'],
      le.workIdsDefault.flatMap(w => [le.works[w].name, ...(le.works[w].chars.map(c => le.chars[c].name))]),
      le.workIdsDefault.flatMap(w => le.works[w].chars),
    ],
  ])('%jにチェックすると%jにチェックが入り、%jが比較画面に渡される', async (
    selectingCheckBoxes,
    expectedCheckedBoxes,
    expectedCharIds
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of selectingCheckBoxes) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    const setupCharsContainer = screen.getByTestId('setup-chars-container');
    const allChoices = setupCharsContainer.querySelectorAll('label:has(input[type="checkbox"])');
    const choiceTexts = [];
    for (const l of allChoices) {
      if (l.querySelector('input[type="checkbox"]').checked) {
         choiceTexts.push(l.textContent);
      }
    }

    expect(new Set(choiceTexts)).toEqual(new Set(expectedCheckedBoxes));

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(sorter.newSortHistory).toHaveBeenCalledOnce();
    expect(sorter.newSortHistory.mock.results[0].type).toEqual('return');
    expect(new Set(sorter.newSortHistory.mock.calls[0][0])).toEqual(new Set(expectedCharIds));
    expect(sorter.newSortHistory.mock.calls[0][1]).toEqual(expectedCharIds.length);
    expect(Compare).toHaveBeenCalledWith(
      {
        sorterTitle: 'すき',
        initialSortHistory: sorter.newSortHistory.mock.results[0].value,
        initialAutosaveIsEnabled: true,
      },
      expect.anything()
    );
  });
});

describe('キャラソート開始', () => {
  let alert, genSeed, saveSaveData, console_error;

  beforeEach(() => {
    alert = vi.spyOn(window, 'alert');
    alert.mockImplementation((msg) => {});

    genSeed = vi.spyOn(random, 'genSeed');
    genSeed.mockImplementation(() => 0);

    saveSaveData = vi.spyOn(save, 'saveSaveData');

    console_error = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    alert.mockRestore();
    genSeed.mockRestore();
    saveSaveData.mockRestore();
    console_error.mockRestore();
  });

  test.each([
    [0, []],
    [1, ['鳳聯藪雨']],
  ])('キャラを%d人選択', async (
    _nchars,
    inputChars
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    let clicking = ['全員', '全員'].concat(inputChars);
    for (const boxName of clicking) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('はじめる');
    expect(alert).toHaveBeenCalledWith('・キャラクターを2人以上選択してください。');
    expect(Compare).not.toHaveBeenCalled();
  });

  test('不正なランク数を入力', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const nranks = screen.getByText('ランクインするランクの数をまでに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3a');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('はじめる');
    expect(alert).toHaveBeenCalledWith('・ランク数制限には数値を入力してください。');
    expect(Compare).not.toHaveBeenCalled();
  });

  test('不適切に設定', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    const nranks = screen.getByText('ランクインするランクの数をまでに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3a');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('はじめる');
    expect(alert).toHaveBeenCalledWith('・キャラクターを2人以上選択してください。\n・ランク数制限には数値を入力してください。');
    expect(Compare).not.toHaveBeenCalled();
  });

  test('適切に設定', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '鳳聯藪雨', '燕楽玄鳥']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(Compare).toHaveBeenCalled();
  });

  test('初期値がセーブされる', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '鳳聯藪雨', '燕楽玄鳥']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(Compare).toHaveBeenCalledOnce();
    expect(await save.loadSaveData()).toEqual(['すき', sorter.newSortHistory(new Set([le.yabusame, le.tsubakura]), 2, 0)]);
  });

  test('前回のセーブデータが残っていてもセーブされる', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const initialSortHistory = sorter.newSortHistory(new Set([le.re, le.zelo, le.lin]), 3, 1);
    await save.saveSaveData('好き', initialSortHistory, 'compare');
    expect(await save.loadSaveData()).toEqual(['好き', initialSortHistory]);

    for (const boxName of ['全員', '全員', '鳳聯藪雨', '燕楽玄鳥']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(Compare).toHaveBeenCalledOnce();
    expect(await save.loadSaveData()).toEqual(['すき', sorter.newSortHistory(new Set([le.yabusame, le.tsubakura]), 2, 0)]);
  });

  test('セーブが失敗すると自動保存機能が無効', async () => {
    saveSaveData.mockImplementation(async () => {throw new Error();});
    console_error.mockImplementation(() => {}); // 握りつぶす

    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '鳳聯藪雨', '燕楽玄鳥']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    await user.click(screen.getByText('はじめる'));

    await screen.findByText('どっちがすき？');
    expect(Compare).toHaveBeenCalledOnce();
    expect(await save.loadSaveData()).toEqual([undefined, undefined]);
    screen.getByText('進行状態の自動保存に失敗しました。自動保存機能を無効にしてキャラソートを続行します。');
  });
});
