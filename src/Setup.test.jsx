import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';

vi.mock('./Compare.jsx', { spy: true });
afterEach(() => {
  vi.clearAllMocks();
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

    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual('どっちがすき？');
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

    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual('どっちが？');
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
    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual(`どっちが${expectedString}？`);
  });
});

describe('順位の数の指定', () => {
  test('指定しない(全員)', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIdSet: new Set(le.charIdsAll),
        numRanks: le.charIdsAll.length,
        sorterTitle: 'すき',
        randSeed: expect.anything(),
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

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIdSet: new Set([le.tsurubami, le.tenkai]),
        numRanks: 2,
        sorterTitle: 'すき',
        randSeed: expect.anything(),
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
    const nranks = screen.getByText('順位の数を位までに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3');
    await user.click(screen.getByText('はじめる'));

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIdSet: new Set(le.charIdsAll),
        numRanks: 3,
        sorterTitle: 'すき',
        randSeed: expect.anything(),
      },
      expect.anything()
    );
  });

  test('順位を余分に指定すると自動で丸められる', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    for (const boxName of ['全員', '全員', '闡裡鶴喰', '瑞風天堺']) {
      await user.click(screen.getByRole('checkbox', { name: boxName }));
    }

    const nranks = screen.getByText('順位の数を位までに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3');
    await user.click(screen.getByText('はじめる'));

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIdSet: new Set([le.tsurubami, le.tenkai]),
        numRanks: 2,
        sorterTitle: 'すき',
        randSeed: expect.anything(),
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

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIdSet: new Set(expectedCharIds),
        numRanks: expectedCharIds.length,
        sorterTitle: 'すき',
        randSeed: expect.anything(),
      },
      expect.anything()
    );
  });
});

describe('キャラソート開始', () => {
  let alert;

  beforeEach(() => {
    alert = vi.spyOn(window, 'alert');
    alert.mockImplementation((msg) => {});
  });

  afterEach(() => {
    alert.mockRestore();
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

  test('不正な順位の数を入力', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const nranks = screen.getByText('順位の数を位までに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3a');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('はじめる');
    expect(alert).toHaveBeenCalledWith('・制限する順位には数値を入力してください。');
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

    const nranks = screen.getByText('順位の数を位までに制限');
    await user.click(within(nranks).getByRole('checkbox'));
    await user.type(within(nranks).getByRole('textbox'), '3a');
    await user.click(screen.getByText('はじめる'));

    await screen.findByText('はじめる');
    expect(alert).toHaveBeenCalledWith('・キャラクターを2人以上選択してください。\n・制限する順位には数値を入力してください。');
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

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalled();
  });
});
