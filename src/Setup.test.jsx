import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';

import Compare from './Compare.jsx';

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
  ])('入力欄に長さ%iの文字列を入力すると、比較画面に長さ%iの文字列が渡される', async (inputLength, expectedLength) => {
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
