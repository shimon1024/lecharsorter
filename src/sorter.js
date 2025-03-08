import * as random from './random.js';

// sortHistoryのデータ構造:
// {
//   version: Number // フォーマットバージョン(永続化で使用する可能性がある)
//   // 各比較のすべての履歴を保持する配列
//   steps: [
//     {
//       heaptree: [[Char ID]] // ヒープ木
//       start: Heap index
//       end: Heap index
//       ai: Heap index // 次に比較するキャラその1のヒープ木でのインデックス。heapifyなら親、siftdownなら左
//       bi: Heap index // 次に比較するキャラその2のヒープ木でのインデックス。heapifyなら子、siftdownなら右
//       aj: Char index // キャラグループaの中でのインデックス
//       bj: Char index // キャラグループbの中でのインデックス
//       sortState: String // ソートの内部状態。heapify、siftdown、findleaf、siftup
//       siftdownRoot: Heap index // siftdownで比較する親ノード
//       siftdownChild: Heap index // siftdownで比較する子ノード
//       randState: [Number] // 乱数の状態
//     },
//     ...
//   ],
//   currentStep: Step index // 現在の比較のインデックス
// }

function leftChildIndex(index) {
  return 2 * index + 1;
}

function rightChildIndex(index) {
  return 2 * index + 2;
}

// ソートアルゴリズムにはヒープソートを採用する。 https://en.wikipedia.org/wiki/Heapsort#Standard_implementation
// 単純な配列ではなくヒープ木に基づくため、bothやskipの実装がしやすいと思われる。

// TODO: both/skip
// compareResult: 'a', 'b', 'both', 'skip', (null)
// 順位が高い(小さい)方が小さいとする昇順にソートする。
// 同率内ではID順でソート
export function heapsort(sortHistory, compareResult) {
  let { heaptree, start, end, ai, bi, aj, bj, sortState, siftdownRoot, siftdownChild, randState } =
      structuredClone(sortHistory.steps[sortHistory.currentStep]);

  function packNextSortHistory() {
    const step = { heaptree, start, end, ai, bi, aj, bj, sortState, siftdownRoot, siftdownChild, randState };
    return {
      ...sortHistory,
      steps: sortHistory.steps.concat([step]),
      currentStep: sortHistory.currentStep + 1,
    };
  }

  function setNextAjBj() {
    [aj, randState] = random.nextInt(0, heaptree[ai].length - 1, randState);
    [bj, randState] = random.nextInt(0, heaptree[bi].length - 1, randState);
  }

  function swapHeaptreeNodes(a, b) {
    [heaptree[a], heaptree[b]] = [heaptree[b], heaptree[a]];
  }

  for (;;) {
    switch (sortState) {
    case 'heapify': {
      if (end > 1) {
        if (start > 0) {
          // ヒープ構築
          start--;
        } else {
          // ヒープ抽出
          end--;
          swapHeaptreeNodes(0, end);
          heaptree[end].sort((a, b) => a - b); // 同率内のソート
        }

        siftdownRoot = start; // siftdownの準備
        sortState = 'siftdown';
        continue;
      }

      sortState = 'end';
      return packNextSortHistory();
    }
    case 'siftdown': {
      if (leftChildIndex(siftdownRoot) < end) {
        if (rightChildIndex(siftdownRoot) < end) {
          ai = leftChildIndex(siftdownRoot);
          bi = rightChildIndex(siftdownRoot);
          setNextAjBj();

          sortState = 'compchildren';
          return packNextSortHistory();
        }

        siftdownChild = leftChildIndex(siftdownRoot); // 右が無いので、左で親と比較する必要がある。

        ai = siftdownRoot;
        bi = siftdownChild;
        setNextAjBj();

        sortState = 'compparentchild';
        return packNextSortHistory();
      }

      sortState = 'heapify';
      continue;
    }
    case 'compchildren': {
      switch (compareResult) {
      case 'a': {
        siftdownChild = rightChildIndex(siftdownRoot); // 選ばれなかった方が親との比較で交換されうる(順位が下がりうる)

        ai = siftdownRoot;
        bi = siftdownChild;
        setNextAjBj();

        sortState = 'compparentchild';
        return packNextSortHistory();
      }
      case 'b': {
        siftdownChild = leftChildIndex(siftdownRoot); // 選ばれなかった方が親との比較で交換されうる(順位が下がりうる)

        ai = siftdownRoot;
        bi = siftdownChild;
        setNextAjBj();

        sortState = 'compparentchild';
        return packNextSortHistory();
      }
      case 'both': {
        // TODO impl
        throw new Error('unimplemented');
      }
      case 'skip': {
        // TODO impl
        throw new Error('unimplemented');
      }
      }

      throw new Error(`unknown compareResult: ${compareResult}`);
    }
    case 'compparentchild': {
      switch (compareResult) {
      case 'a': {
        swapHeaptreeNodes(siftdownRoot, siftdownChild);
        siftdownRoot = siftdownChild;

        sortState = 'siftdown';
        continue;
      }
      case 'b': {
        sortState = 'heapify';
        continue;
      }
      case 'both': {
        // TODO impl
        throw new Error('unimplemented');
      }
      case 'skip': {
        // TODO impl
        throw new Error('unimplemented');
      }
      }

      throw new Error(`unknown compareResult: ${compareResult}`);
    }
    }

    throw new Error(`unknown state: ${sortState}`);
  }

  throw new Error('unreachable');
}

// actionのデータ構造:
// {
//   type: 'compare',
//   result: string, // 'a', 'b', 'both', 'skip'
// }
// もしくは
// {
//   type: 'undo'
// }
// もしくは
// {
//   type: 'redo'
// }
export function reduceSortHistory(sortHistory, action) {
  switch (action.type) {
  case 'compare': {
    return heapsort(sortHistory, action.result);
  }
  case 'undo': {
    // TODO impl

    if (sortHistory.currentStep > 0) {
      sortHistory = structuredClone(sortHistory);
      sortHistory.currentStep--;
    }

    return sortHistory;
  }
  case 'redo': {
    // TODO impl

    if (sortHistory.currentStep < sortHistory.steps.length - 1) {
      sortHistory = structuredClone(sortHistory);
      sortHistory.currentStep++;
    }

    return sortHistory;
  }
  }

  throw new Error(`unknown action ${action.type}`);
}

export function newSortHistory({ charIdSet, randSeed }) {
  let randState = random.newState(randSeed);
  let charIds;
  [charIds, randState] = random.shuffle(Array.from(charIdSet), randState);

  const sortHistory = heapsort({
    version: 1,
    steps: [
      {
        heaptree: charIds.map(c => [c]),
        start: Math.floor(charIds.length / 2),
        end: charIds.length,
        ai: null,
        bi: null,
        aj: null,
        bj: null,
        sortState: 'heapify',
        siftdownRoot: null,
        siftdownChild: null,
        randState,
      }
    ],
    currentStep: 0,
  }, null);

  // 最初のステップは仮のものなので捨てる
  return {
    ...sortHistory,
    steps: sortHistory.steps.slice(1),
    currentStep: sortHistory.currentStep - 1,
  };
}
