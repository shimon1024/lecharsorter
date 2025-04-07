import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import App from './App.jsx';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import Result from './Result.jsx';
import ErrorPage, { messageOpenViewMode } from './ErrorPage.jsx';
import * as le from './lenen.js';
import * as save from './save.js';
import * as serialize from './serialize.js';
import * as sorter from './sorter.js';

const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

vi.mock('./Setup.jsx', { spy: true });
vi.mock('./Compare.jsx', { spy: true });
vi.mock('./Result.jsx', { spy: true });
vi.mock('./ErrorPage.jsx', { spy: true });
afterEach(async () => {
  vi.clearAllMocks();
  await save.clearSaveData();
});

describe('セーブデータの読み込み', () => {
  let confirm, loadSaveData, console_error;

  beforeEach(() => {
    confirm = vi.spyOn(window, 'confirm');
    loadSaveData = vi.spyOn(save, 'loadSaveData');
    console_error = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    confirm.mockRestore();
    loadSaveData.mockRestore();
    console_error.mockRestore();
  });

  test('セーブデータ無し', async () => {
    confirm.mockImplementation(() => {throw new Error();});

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
  });

  test('セーブデータ部分破損', async () => {
    confirm.mockImplementation(() => {throw new Error();});
    loadSaveData.mockImplementation(async () => ['すき？', undefined]);

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
  });

  test('セーブデータあり(未完了)', async () => {
    confirm.mockImplementation(() => true);

    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    save.saveSaveData(sorterTitle, sortHistory, 'compare');

    render(
      <App />
    );

    await screen.findByText('どっちがすき？');
    expect(Setup).not.toHaveBeenCalledOnce();
    expect(Compare).toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
  });

  test('セーブデータあり(完了)', async () => {
    confirm.mockImplementation(() => true);

    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    save.saveSaveData(sorterTitle, sortHistory, 'compare');
    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a' });
      await save.saveSaveData(sorterTitle, sortHistory, 'compare');
    }

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).not.toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).toHaveBeenCalledOnce();
  });

  test('セーブデータあり(キャンセル)', async () => {
    confirm.mockImplementation(() => false);

    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    save.saveSaveData(sorterTitle, sortHistory, 'compare');
    while (sortHistory.steps[sortHistory.currentStep].sortState !== 'end') {
      sortHistory = sorter.reduceSortHistory(sortHistory, { type: 'compare', result: 'a' });
      await save.saveSaveData(sorterTitle, sortHistory, 'compare');
    }

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
  });

  test('セーブデータあり(読み込みで例外)', async () => {
    confirm.mockImplementation(() => {throw new Error();});
    loadSaveData.mockImplementation(async () => {throw new Error();});
    console_error.mockImplementation(() => {}); // 握りつぶす

    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    save.saveSaveData(sorterTitle, sortHistory, 'compare');

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
  });
});

describe('ビューモード', () => {
  let console_error;

  beforeEach(() => {
    console_error = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    console_error.mockRestore();
  });

  test('正常に開く', async () => {
    const locationMod = Object.fromEntries(Object.entries(window.location));
    // 1位藪雨、ランク外玄鳥、ランク外雀巳、「好き」
    locationMod.search = '?c=v&v=1&rn=Af8%3D&ur=AgM%3D&st=5aW944GN';
    vi.stubGlobal('location', locationMod);

    render(
      <App />
    );

    await screen.findByText('連縁キャラソート');
    expect(Setup).not.toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).toHaveBeenCalledOnce();
    expect(ErrorPage).not.toHaveBeenCalledOnce();

    const charsContainer = screen.getByTestId('result-chars-container');
    expect(charsContainer.textContent).toEqual('1位鳳聯藪雨ランク外燕楽玄鳥ランク外國主雀巳');
    expect(screen.queryByText('Xで共有')).toEqual(null);
    expect(screen.queryByText('結果へのリンク')).toEqual(null);
    expect(screen.queryByText('もう一度')).toEqual(null);
  });

  test('データ破損', async () => {
    console_error.mockImplementation(() => {}); // 握りつぶす

    const locationMod = Object.fromEntries(Object.entries(window.location));
    locationMod.search = '?c=v&v=1&rn=Adsodsf8f8%3D&ur=AsdiogM%3D&st=5asdAW944GN';
    vi.stubGlobal('location', locationMod);

    render(
      <App />
    );

    await screen.findByText('エラー');
    expect(Setup).not.toHaveBeenCalledOnce();
    expect(Compare).not.toHaveBeenCalledOnce();
    expect(Result).not.toHaveBeenCalledOnce();
    expect(ErrorPage).toHaveBeenCalledOnce();

    screen.getByText(messageOpenViewMode);
  });
});
