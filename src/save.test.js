import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { openDB } from 'idb';

import * as le from './lenen.js';
import * as save from './save.js';
import * as sorter from './sorter.js';

// IndexedDBに永続化できているかを確かめるテスト。

const dbName = window.location.pathname + '#idbSave';
const dbPromise = openDB(dbName, 1);

afterEach(async () => {
  await (await dbPromise).clear('save');
});

const charIdSet = new Set([le.hoojiro, le.kuroji, le.hooaka, le.aoji]);

describe('保存', () => {
  test.each([
    ['初期値', []],
    ['1つ選択',
     [{ type: 'compare', result: 'a' }]],
    ['2つ選択',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }]],
    ['1つだけ戻る',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }]],
    ['2つ戻る',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }]],
    ['1つだけ戻り1つだけ進む',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'redo' }]],
    ['2つ戻り1つだけ進む',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }, { type: 'redo' }]],
  ])('%s', async (
    _testName,
    inputActions,
  ) => {
    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);
    save.saveSaveData(sorterTitle, sortHistory, 'compare');

    for (const action of inputActions) {
      sortHistory = sorter.reduceSortHistory(sortHistory, action);
      save.saveSaveData(sorterTitle, sortHistory, action.type);
    }

    const tx = (await dbPromise).transaction('save', 'readonly');
    expect(await tx.store.get('sorterTitle')).toEqual(sorterTitle);
    expect(await tx.store.get('sortHistory_currentStep')).toEqual(sortHistory.currentStep);
    expect(await tx.store.get('sortHistory_numRanks')).toEqual(sortHistory.numRanks);
    expect(await tx.store.get('sortHistory_steps_length')).toEqual(sortHistory.steps.length);
    sortHistory.steps.forEach(async (step, i) => {
      expect(await tx.store.get(['sortHistory_steps', i])).toEqual(step);
    });
  });
});

describe('読み込み', () => {
  test.each([
    ['初期値', []],
    ['1つ選択',
     [{ type: 'compare', result: 'a' }]],
    ['2つ選択',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }]],
    ['1つだけ戻る',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }]],
    ['2つ戻る',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }]],
    ['1つだけ戻り1つだけ進む',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'redo' }]],
    ['2つ戻り1つだけ進む',
     [{ type: 'compare', result: 'a' }, { type: 'compare', result: 'b' }, { type: 'undo' }, { type: 'undo' }, { type: 'redo' }]],
  ])('%s', async (
    _testName,
    inputActions,
  ) => {
    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);

    for (const action of inputActions) {
      sortHistory = sorter.reduceSortHistory(sortHistory, action);
    }

    const tx = (await dbPromise).transaction('save', 'readwrite');
    await tx.store.add(sorterTitle, 'sorterTitle');
    await tx.store.add(sortHistory.currentStep, 'sortHistory_currentStep');
    await tx.store.add(sortHistory.numRanks, 'sortHistory_numRanks');
    await tx.store.add(sortHistory.steps.length, 'sortHistory_steps_length');
    sortHistory.steps.forEach(async (step, i) => {
      await tx.store.add(step, ['sortHistory_steps', i]);
    });

    expect(await save.loadSaveData()).toEqual([sorterTitle, sortHistory]);
  });
});

describe('削除', () => {
  test.each([
    ['初期値', []],
    ['1つ選択', [{ type: 'compare', result: 'a' }]],
  ])('%s', async (
    _testName,
    inputActions,
  ) => {
    const sorterTitle = 'すき';
    let sortHistory = sorter.newSortHistory(charIdSet, charIdSet.size, 0);

    for (const action of inputActions) {
      sortHistory = sorter.reduceSortHistory(sortHistory, action);
    }

    const tx = (await dbPromise).transaction('save', 'readwrite');
    await tx.store.add(sorterTitle, 'sorterTitle');
    await tx.store.add(sortHistory.currentStep, 'sortHistory_currentStep');
    await tx.store.add(sortHistory.numRanks, 'sortHistory_numRanks');
    await tx.store.add(sortHistory.steps.length, 'sortHistory_steps_length');
    sortHistory.steps.forEach(async (step, i) => {
      await tx.store.add(step, ['sortHistory_steps', i]);
    });

    await save.clearSaveData();

    expect(await (await dbPromise).getAll('save')).toEqual([]);
  });
});
