import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { SceneProvider } from './SceneContext.jsx';
import Scene from './Scene.js';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import Result from './Result.jsx';
import ErrorPage, { messageClearSaveData } from './ErrorPage.jsx';
import * as le from './lenen.js';
import * as save from './save.js';
import * as sorter from './sorter.js';
import * as testutil from './testutil.js';

const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

vi.mock('./Setup.jsx', { spy: true });
vi.mock('./Result.jsx', { spy: true });
vi.mock('./ErrorPage.jsx', { spy: true });
afterEach(async () => {
  vi.clearAllMocks();
  await save.clearSaveData();
});

describe('キャラ選択、諸情報', () => {
  // テスト間で再現性を保ちたいため、シード値は0で固定

  test('キャラA', async () => {
    const user = userEvent.setup();
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
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
    const sorterTitle = 'すき'
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
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
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
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
    expect(Result).toHaveBeenCalledOnce();
  });
});

describe('操作のやり直し', () => {
  test('undo', async () => {
    const user = userEvent.setup();
    const sorterTitle = 'すき'
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
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
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
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

describe('自動保存', () => {
  let saveSaveData, console_error;

  beforeEach(() => {
    saveSaveData = vi.spyOn(save, 'saveSaveData');
    console_error = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    saveSaveData.mockRestore();
    console_error.mockRestore();
  });

  test.each([
    ['通常の選択',
     ['鵐頬赤', '鵐頬告鳥'],
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }]],
    ['1つだけ戻る',
     ['鵐頬赤', '鵐頬告鳥', '↶'],
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }]],
    ['2つ戻る',
     ['鵐頬赤', '鵐頬告鳥', '↶', '↶'],
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }]],
    ['1つだけ戻り1つだけ進む',
     ['鵐頬赤', '鵐頬告鳥', '↶', '↷'],
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'redo' }]],
    ['2つ戻り1つだけ進む',
     ['鵐頬赤', '鵐頬告鳥', '↶', '↶', '↷'],
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }, { type: 'redo' }]],
  ])('%s', async (
    _testName,
    inputUIOps,
    expectedSortOps,
  ) => {
    const user = userEvent.setup();
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    screen.getByText('(1組目、0%完了)');
    for (const name of inputUIOps) {
      await user.click(screen.getByRole('button', { name }));
    }

    let expectedSortHistory = initialSortHistory;
    for (const act of expectedSortOps) {
      expectedSortHistory =  sorter.reduceSortHistory(expectedSortHistory, act);
    }
    expect((await save.loadSaveData())[1]).toEqual(expectedSortHistory);
  });

  test('保存に失敗', async () => {
    console_error.mockImplementation(() => {}); // 握りつぶす

    const user = userEvent.setup();
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    const expectedMsg = '進行状態の自動保存に失敗しました。自動保存機能を無効にしてキャラソートを続行します。';

    screen.getByText('(1組目、0%完了)');
    expect(screen.queryByText(expectedMsg)).toEqual(null);
    saveSaveData.mockImplementation(async () => {throw new Error();}); // 初回の保存は成功させる
    await user.click(screen.getByRole('button', { name: '鵐頬赤' }));

    expect(saveSaveData).toHaveBeenCalledTimes(2);
    await screen.findByText(expectedMsg);

    await user.click(screen.getByRole('button', { name: '鵐頬告鳥' }));
    await screen.findByText(expectedMsg);
    expect(saveSaveData).toHaveBeenCalledTimes(2); // 一度無効になったらずっと無効。つまり呼ばれない
  });
});

describe('キャラソートの中断', () => {
  let confirm, clearSaveData, console_error;

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
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
    expect(Setup).not.toHaveBeenCalled();
  });

  test('ポップアップを承認', async () => {
    confirm.mockImplementation(() => true);

    const user = userEvent.setup();
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
    expect(Setup).toHaveBeenCalled();
  });

  test('データのクリア処理でエラーになるとエラーページへ遷移', async () => {
    confirm.mockImplementation(() => true);
    clearSaveData.mockImplementation(async () => {throw new Error();});
    console_error.mockImplementation(() => {}); // 握りつぶす

    const user = userEvent.setup();
    const sorterTitle = 'すき';
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
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
    const initialSortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    await save.saveSaveData(sorterTitle, initialSortHistory, 'compare');
    render(
      <SceneProvider
        defaultScene={
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    await user.click(await screen.findByRole('button', { name: 'どちらも' })); // autosave
    const loaded = await save.loadSaveData();
    expect(loaded[0]).toEqual(sorterTitle);
    expect(loaded[1]).toEqual(sorter.reduceSortHistory(initialSortHistory, { type: 'compare', result: 'both'}));

    await user.click(screen.getByRole('button', { name: 'キャラソートをやめる' }));
    expect(Setup).toHaveBeenCalled();
    expect(await save.loadSaveData()).toEqual([undefined, undefined]);
  });
});

describe('呼び出し', () => {
  test('end状態のsort historyを渡す', async () => {
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
          <Compare
            sorterTitle={sorterTitle}
            initialSortHistory={initialSortHistory}
            initialAutosaveIsEnabled={true}
          />
        }
      >
        <Scene />
      </SceneProvider>
    );

    screen.getByText(`(${initialSortHistory.currentStep + 1}組目、100%完了)`);
    expect(screen.getByTestId('compare-char1').textContent).toEqual('');
    expect(screen.getByTestId('compare-char2').textContent).toEqual('');

    await user.click(await screen.findByRole('button', { name: 'どちらも' })); // どれかの選択ボタンをクリックすると遷移
    await screen.findByRole('heading', { name: '連縁キャラソート' });
    await screen.findByRole('heading', { name: 'すきランキング' });
    expect(Result).toHaveBeenCalledOnce();
  });
});
