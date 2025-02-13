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

  test('入力欄に最大長入力する', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const inputString = 'x'.repeat(128);

    const inputSorterTitle = within(screen.getByText(/^どっちが/)).getByRole('textbox');
    await user.clear(inputSorterTitle);
    await user.type(inputSorterTitle, inputString);

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual(`どっちが${inputString}？`);
  });

  test('入力欄に最大長+1入力する', async () => {
    const user = userEvent.setup();
    render(
      <SceneProvider defaultScene={<Setup />}>
        <Scene />
      </SceneProvider>
    );

    const inputString = 'x'.repeat(129);

    const inputSorterTitle = within(screen.getByText(/^どっちが/)).getByRole('textbox');
    await user.clear(inputSorterTitle);
    await user.type(inputSorterTitle, inputString);

    await user.click(screen.getByRole('checkbox', { name: '全員' }));
    await user.click(screen.getByText('はじめる'));

    const compareSceneHeading = await screen.findByRole('heading', { level: 1 });
    expect(compareSceneHeading.textContent).toEqual(`どっちが${inputString.substring(1)}？`);
  });
});
