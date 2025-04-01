import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import App from './App.jsx';
import Setup from './Setup.jsx';
import Compare from './Compare.jsx';
import Result from './Result.jsx';
import * as le from './lenen.js';
import * as save from './save.js';
import * as sorter from './sorter.js';

const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

vi.mock('./Setup.jsx', { spy: true });
vi.mock('./Compare.jsx', { spy: true });
vi.mock('./Result.jsx', { spy: true });
afterEach(async () => {
  vi.clearAllMocks();
  await save.clearSaveData();
});

describe('セーブデータの読み込み', () => {
  let confirm, loadSaveData;

  beforeEach(() => {
    confirm = vi.spyOn(window, 'confirm');
    loadSaveData = vi.spyOn(save, 'loadSaveData');
  });

  afterEach(() => {
    confirm.mockRestore();
    loadSaveData.mockRestore();
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
