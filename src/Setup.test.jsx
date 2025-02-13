import { afterEach, describe, expect, test, vi } from 'vitest';
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
    [128, 128],
    [129, 128],
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

    const inputString = 'x'.repeat(inputLength);
    const inputSorterTitle = within(screen.getByText(/^どっちが/)).getByRole('textbox');
    await user.clear(inputSorterTitle);
    await user.type(inputSorterTitle, inputString);

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    const expectedString = 'x'.repeat(expectedLength);
    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual(`どっちが${expectedString}？`);
  });
});

describe('ランキング人数の選択', () => {
  test('選択せずデフォルト値に従う', async () => {
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
        charIds: expect.arrayContaining(le.charIdAll),
        numRankChars: 10,
        sorterTitle: 'すき'
      },
      expect.anything()
    );
  });

  test.each([
    ['1', 1],
    ['3', 3],
    ['5', 5],
    ['10', 10],
    ['20', 20],
    [String(le.charAll.length), le.charAll.length],
  ])('値%sの項目を選択すると、比較画面コンポーネントのランキング人数引数に%dが渡される', async (
    selectNumRankChars,
    argNumRankChars
  ) => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const selectRank = within(screen.getByText('ランキング人数')).getByRole('combobox');
    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    userEvent.selectOptions(selectRank, selectNumRankChars);
    await user.click(screen.getByText('はじめる'));

    await screen.findByRole('heading', { level: 1 });
    expect(Compare).toHaveBeenCalledWith(
      {
        charIds: expect.arrayContaining(le.charIdAll),
        numRankChars: argNumRankChars,
        sorterTitle: 'すき'
      },
      expect.anything()
    );
  });
});
