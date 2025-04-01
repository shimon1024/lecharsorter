import { openDB } from 'idb';

// 自動保存の動作:
// - 比較および結果画面からボタンで設定画面に戻るときに、セーブをクリア。クリアできなかった場合はエラーページに遷移。
//   - ベストエフォートで消してしまうと、設定画面に戻るときはデータが消えるのが期待なのに、まれに消えないことがある、
//     それがユーザーからは分からない、という動作になってしまう。
// - 比較開始時のクリア/セーブ、比較中のセーブが失敗したら、自動保存を無効にして続行。
//   - ユーザーをクラッシュループに巻き込み続けるほどの機能ではない。
//   - ユーザーには自動保存が無効になったことを知らせる。
// - アプリ開始時に保存データが見つかった場合はデータをロード。
//   - もしロードしたデータに不整合があってアプリがクラッシュした場合は(アプリのバグ)、再アクセス時にデータをロードしなければ
//     最初の設定画面からできる。
//     - 比較開始時のクリア/セーブに失敗したら、自動保存を無効にして続行なので、キャラソート自体はできる。
//   - アプリ開始時にクリアはしない。クラッシュループになりうるため。最初のロードに失敗した場合は、失敗を握りつぶした後、
//     比較開始までセーブデータにアクセスしない。

const dbName = window.location.pathname + '#idbSortHistory';
const dbPromise = openDB(dbName, 1, {
  upgrade(db, oldVersion) {
    switch (oldVersion) {
    case 0: {
      db.createObjectStore('save');
    }
    }
  },
});

// 効率のため、sortHistory.stepsは最新のstepのみを保存をするので、新たなstepを追加するたびに都度この関数を呼び出して
// 保存する必要がある。
export async function saveSaveData(sorterTitle, sortHistory, actionType) {
  if (!['compare', 'undo', 'redo'].includes(actionType)) {
    throw new TypeError(`unknown action type: ${actionType}`);
  }

  const tx = (await dbPromise).transaction('save', 'readwrite');
  const oldStepsLength = (await tx.store.get('sortHistory_steps_length')) ?? 0;

  let reqs = [
    tx.store.put(sorterTitle, 'sorterTitle'),
    tx.store.put(sortHistory.currentStep, 'sortHistory_currentStep'),
    tx.store.put(sortHistory.numRanks, 'sortHistory_numRanks'),
    tx.done,
  ];

  if (actionType === 'compare') {
    reqs = reqs.concat([
      tx.store.put(sortHistory.steps.length, 'sortHistory_steps_length'),
      tx.store.put(sortHistory.steps[sortHistory.currentStep], ['sortHistory_steps', sortHistory.currentStep]),
      // e.g.
      //   steps: 0 1 2 3 4 5(currentStep) 6  (oldStepslength: 7)  ->  [0, 1]  ->  [5, 6]  ->  [6]
      //   steps: 0 1 2 3 4(currentStep) 5 6  (oldStepslength: 7)  ->  [0, 1, 2]  ->  [4, 5, 6]  ->  [5, 6]
      //   steps: 0(currentStep)  (oldStepslength: 0)  ->  []  ->  []  ->  []
      //   steps: 0 1(currentStep)  (oldStepslength: 1)  ->  []  ->  []  ->  []
      //   steps: 0 1(currentStep)  (oldStepslength: 2)  ->  [0]  ->  [1]  ->  []  (例えば、一回だけundoした場合など)
      ...(Array(oldStepsLength - sortHistory.currentStep).fill(null)
          .map((_, i) => i + sortHistory.currentStep)
          .slice(1) // chop tx.store.delete(['sortHistory_steps', sortHistory.currentStep]) because of race with tx.store.put
          .map(i => tx.store.delete(['sortHistory_steps', i]))),
    ]);
  }

  await Promise.all(reqs);
}

// 例外を出さずに結果を返した場合も、アプリのバグで不整合が起こりうることに注意。
// 見つからなかったときに例外ではなくundefinedを返すのは、IndexedDBとの動作の一貫性のため。
export async function loadSaveData() {
  const tx = (await dbPromise).transaction('save');

  const sorterTitle = await tx.store.get('sorterTitle');
  const currentStep = await tx.store.get('sortHistory_currentStep');
  const numRanks = await tx.store.get('sortHistory_numRanks');

  const steps = [];
  const stepsLength = await tx.store.get('sortHistory_steps_length');
  if (stepsLength != null && stepsLength > 0) {
    const stepsCursor = await tx.store.openCursor(IDBKeyRange.bound(
      ['sortHistory_steps', 0],
      ['sortHistory_steps', stepsLength - 1]
    ));
    for await (const cursor of stepsCursor) {
      steps.push(cursor.value);
    }
  }

  let sortHistory;
  if (currentStep != null && numRanks != null && steps.length > 0) {
    sortHistory = { currentStep, numRanks, steps };
  }
  return [sorterTitle, sortHistory];
}

export async function clearSaveData() {
  (await dbPromise).clear('save');
}
