import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.jsx';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import * as le from './lenen.js';
import * as sorter from './sorter.js';
import * as testutil from './testutil.js';

const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

vi.mock('./Setup.jsx', { spy: true });
afterEach(() => {
  vi.clearAllMocks();
});

describe('キャラ選択、諸情報', () => {
  // テスト間で再現性を保ちたいため、シード値は0で固定

  test('キャラA', async () => {
    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    screen.getByText('(1組目、0%完了)');
    await user.click(screen.getByRole('button', { name: '鵐頬赤' }));

    // assertion
    await screen.findByText('(2組目、20%完了)');
    screen.getByRole('button', { name: '鵐頬赤' });
    screen.getByRole('button', { name: '鵐頬告鳥' });
  });

  test('キャラB', async () => {
    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    screen.getByText('(1組目、0%完了)');
    await user.click(screen.getByRole('button', { name: '鵐蒿雀' }));

    // assertion
    await screen.findByText('(2組目、20%完了)');
    screen.getByRole('button', { name: '鵐蒿雀' });
    screen.getByRole('button', { name: '鵐頬告鳥' });
  });

  test('どちらも', async () => {
    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(await screen.findByRole('button', { name: 'どちらも' }));
    await user.click(await screen.findByRole('button', { name: 'どちらも' }));
    await user.click(await screen.findByRole('button', { name: 'どちらも' }));

    // assertion
    // Result
    await screen.findByRole('heading', { name: '連縁キャラソート' });
    await screen.findByRole('heading', { name: 'すきランキング' });
  });
});

describe('操作のやり直し', () => {
  test('undo', async () => {
    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: '鵐頬赤' }));

    await screen.findByText('(2組目、20%完了)');
    await user.click(screen.getByRole('button', { name: '↶' }));

    // assertion
    await screen.findByText('(1組目、0%完了)');
    screen.getByRole('button', { name: '鵐頬赤' });
    screen.getByRole('button', { name: '鵐蒿雀' });
  });

  test('redo', async () => {
    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: '鵐頬赤' }));

    await screen.findByText('(2組目、20%完了)');
    await user.click(screen.getByRole('button', { name: '↶' })); // undo

    await screen.findByText('(1組目、0%完了)');
    await user.click(screen.getByRole('button', { name: '↷' })); // redo

    // assertion
    await screen.findByText('(2組目、20%完了)');
    screen.getByRole('button', { name: '鵐頬赤' });
    screen.getByRole('button', { name: '鵐頬告鳥' });
  });
});

describe('キャラソートの中断', () => {
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
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
    expect(Setup).not.toHaveBeenCalled();
  });

  test('ポップアップを承認', async (
  ) => {
    confirm.mockImplementation(() => true);

    const user = userEvent.setup();
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={'すき'}
            initialSortHistory={initialSortHistory}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
    expect(Setup).toHaveBeenCalled();
  });
});
