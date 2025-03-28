import * as random from './random.js';

// ソートアルゴリズムにはヒープソートを採用する。 https://en.wikipedia.org/wiki/Heapsort#Standard_implementation
// ・計算量が少なめ。
// ・同率のマージを実装しやすい。元々、順位が確定して取り出したルートノードの跡地を埋める処理が必要なため、
// 　同じ方法でマージで空いた跡地を埋めることができる。
// ・木構造内で上下に比較していくため、同一キャラの最大連続比較回数を少なくできる。
//
// ヒープソートアルゴリズムを一部変更して使用する。
// ・同率はマージする。つまり、2つのノードを1つのノードにまとめる。空いた配列要素にはヒープ木の末尾の要素を移動してきて埋める。
// 　・空いた配列要素を埋めるのに使うノードは常にヒープ木の末尾なので、配列中に空き要素ができることはない。
// 　・空いた配列要素を埋めた後、現在のsiftdownを中断して、埋めたノードを根として再帰的にsiftdownする必要がある。
// 　　再帰的siftdownが完了したら、中断したsiftdownを最初からやり直す。
// ・上位3位までなど、順位の数を制限することができる。その場合、制限分順位が確定した時にソート処理を打ち切る。
// ・ソートが完了したノードは配列の末尾の代わりに別の配列の末尾に加える。
// 　・そうしない場合、同率順位のマージ処理時に空く配列要素の扱いが難しくなる。
// 　・これに伴いendが不要になる。代わりに配列の長さを使う。
// ・昇順でソートする時のヒープ木の根は最大値ではなく最小値。最下位ではなく1位から順位が確定する。
// 　・順位の数を制限する場合、ソートを途中で打ち切って不要な比較を避けることができる。
// 　・ソートが完了したノードは配列の末尾から順に埋めていく代わりに、
// 　　別の配列の末尾に加えていくため、最後に配列を逆順にする必要はない。
// ・ノード同士を比較する際の、ノード内のキャラの選出はランダム。
//
// sortHistoryのデータ構造:
// {
//   version: Number, // フォーマットバージョン。永続化で使用する可能性がある。
//   numRanks: Number, // ランキングの順位数
//   // 各比較のすべての履歴を保持する配列
//   // stepのsortStateがendの場合、そのstepではheaptreeとrankingとsortState以外の値が不定になることに注意。
//   steps: [
//     {
//       heaptree: [[Char ID]], // ヒープ木。同率順位は1つのノードにマージされていくため、二重配列になっている。
//       start: Heap index, // siftdownの開始インデックス
//       ai: Heap index, // 次に比較するキャラその1のヒープ木でのインデックス。heapifyなら親、siftdownなら左
//       bi: Heap index, // 次に比較するキャラその2のヒープ木でのインデックス。heapifyなら子、siftdownなら右
//       aj: Char index, // キャラグループaの中でのインデックス
//       bj: Char index, // キャラグループbの中でのインデックス
//       ranking: [[Char ID]], // ランキング。先頭が1位、末尾が最下位。同率内ではID順でソート
//       sortState: String, // ソートの状態。対外的にはcompareChildren, compareParentChild, end。内部では他の状態もある。
//       root: Heap index, // siftdownで比較する親ノード
//       child: Heap index, // siftdownで比較する子ノード
//       recursiveSiftdownStack: [{Heap index}], // ノードマージ時などに行う再帰的siftdownの再帰スタック
//       randState: [Number], // 乱数の状態
//     },
//     ...
//   ],
//   currentStep: Step index, // 現在の比較のインデックス
// }

function leftChildIndex(index) {
  return index * 2 + 1;
}

function rightChildIndex(index) {
  return index * 2 + 2;
}

// compareResult: 'a', 'b', 'both', (null for newSortHistory)
// 順位が高い(小さい)方が小さいとする昇順にソートする。
function heapsort(sortHistory, compareResult) {
  let { heaptree, start, ai, bi, aj, bj, ranking, sortState, root, child, recursiveSiftdownStack, randState } =
      structuredClone(sortHistory.steps[sortHistory.currentStep]);

  function packNextSortHistory() {
    const step = { heaptree, start, ai, bi, aj, bj, ranking, sortState, root, child, recursiveSiftdownStack, randState };
    return {
      ...sortHistory,
      steps: sortHistory.steps.slice(0, sortHistory.currentStep + 1).concat([step]), // sliceはredo対応に必要
      currentStep: sortHistory.currentStep + 1,
    };
  }

  function prepareCompareChildren() {
    ai = leftChildIndex(root);
    bi = rightChildIndex(root);
    [aj, randState] = random.nextInt(0, heaptree[ai].length - 1, randState);
    [bj, randState] = random.nextInt(0, heaptree[bi].length - 1, randState);
    sortState = 'compareChildren';
  }

  function prepareCompareParentChild() {
    ai = root;
    bi = child;
    [aj, randState] = random.nextInt(0, heaptree[ai].length - 1, randState);
    [bj, randState] = random.nextInt(0, heaptree[bi].length - 1, randState);
    sortState = 'compareParentChild';
  }

  for (;;) {
    switch (sortState) {
    case 'pivot': {
      if (start > 0) {
        // heapify
        start--;
      } else if (heaptree.length > 1 && ranking.length < sortHistory.numRanks - 1) {
        // 終了条件は2つのいずれか。
        // ソートする配列の要素が1つになる(マージが一度でもあれば起きうる)か、
        // ランキング数が指定の制限に達した時(打ち切り)

        // extract
        ranking.push(heaptree.shift().toSorted((a, b) => a - b)); // 同率内のソート
        heaptree.unshift(heaptree.pop());
      } else {
        // last extract
        ranking.push(heaptree.shift().toSorted((a, b) => a - b));
        sortState = 'end';
        return packNextSortHistory();
      }

      root = start;
      sortState = 'siftdown';
      continue;
    }
    case 'siftdown': {
      if (leftChildIndex(root) >= heaptree.length) { // root is leaf
        sortState = 'siftdownEpilogue';
        continue;
      } else if (rightChildIndex(root) >= heaptree.length) { // left only
        child = leftChildIndex(root); // 右が無いので、左で親と比較する必要がある。

        prepareCompareParentChild();
        return packNextSortHistory();
      }
      // rightChildIndex(root) < array.length

      prepareCompareChildren();
      return packNextSortHistory();
    }
    case 'compareChildren': {
      switch (compareResult) {
      case 'a': {
        child = leftChildIndex(root); // 選ばれた方が親との比較で交換されうる(順位が上がりうる)

        prepareCompareParentChild();
        return packNextSortHistory();
      }
      case 'b': {
        child = rightChildIndex(root); // 選ばれた方が親との比較で交換されうる(順位が上がりうる)

        prepareCompareParentChild();
        return packNextSortHistory();
      }
      case 'both': {
        // 同値をマージ
        heaptree[leftChildIndex(root)].push(...heaptree[rightChildIndex(root)]);
        heaptree[rightChildIndex(root)] = null;

        if (heaptree.at(-1) !== null) {
          heaptree[rightChildIndex(root)] = heaptree.pop();
          // recursive siftdown
          recursiveSiftdownStack.push({ root });
          root = rightChildIndex(root);
          sortState = 'siftdown';
          continue;
        }
        // マージ対象が配列の末尾の2要素であればrecursive siftdownは不要

        heaptree.pop();
        child = leftChildIndex(root);

        prepareCompareParentChild();
        return packNextSortHistory();
      }
      default: throw new Error(`unknown compareResult: ${compareResult}`);
      }
    }
    case 'compareParentChild': {
      switch (compareResult) {
      case 'a': {
        // 現在のsiftdownは終了、再帰しているのなら前のsiftdownに戻る
        sortState = 'siftdownEpilogue';
        continue;
      }
      case 'b': {
        [heaptree[root], heaptree[child]] = [heaptree[child], heaptree[root]];
        root = child;

        sortState = 'siftdown';
        continue;
      }
      case 'both': {
        // 同値をマージ
        heaptree[root].push(...heaptree[child]);
        heaptree[child] = null;

        if (heaptree.at(-1) !== null) {
          heaptree[child] = heaptree.pop();
          // recursive siftdown
          recursiveSiftdownStack.push({ root });
          root = child;
          sortState = 'siftdown';
          continue;
        }
        // マージ対象が配列の末尾の要素とその親であればrecursive siftdownは不要

        heaptree.pop();

        sortState = 'siftdownEpilogue';
        continue;
      }
      default: throw new Error(`unknown compareResult: ${compareResult}`);
      }
    }
    case 'siftdownEpilogue': {
      if (recursiveSiftdownStack.length > 0) {
        ({ root } = recursiveSiftdownStack.pop());

        // 常にsiftdownを最初からやり直す。
        // 親子比較時に再帰して、その再帰から返ってきた時に、新たな子がもう1つの子より大きい(親と比べるべきでない)可能性がある
        sortState = 'siftdown';
        continue;
      }

      sortState = 'pivot';
      continue;
    }
    default: throw new Error(`unknown state: ${sortState}`);
    }
  }
}

// actionのデータ構造:
// {
//   type: 'compare',
//   result: string, // 'a', 'b', 'both'
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
    if (sortHistory.currentStep > 0) {
      sortHistory = {
        ...sortHistory,
        currentStep: sortHistory.currentStep - 1,
      };
    }

    return sortHistory;
  }
  case 'redo': {
    if (sortHistory.currentStep < sortHistory.steps.length - 1) {
      sortHistory = {
        ...sortHistory,
        currentStep: sortHistory.currentStep + 1,
      };
    }

    return sortHistory;
  }
  default: throw new Error(`unknown action ${action.type}`);
  }
}

export function newSortHistory(charIdSet, numRanks, randSeed) {
  let randState = random.newState(randSeed);
  let charIds;
  [charIds, randState] = random.shuffle(Array.from(charIdSet), randState);

  const sortHistory = heapsort({
    version: 1,
    numRanks,
    steps: [
      {
        heaptree: charIds.map(c => [c]),
        // 最初のリーフノード(最後の非リーフノードの1つ後)。ソート開始直後にheapifyで-1するので、最後の非リーフノードになる。
        start: Math.floor(charIds.length / 2),
        ranking: [],
        ai: null,
        bi: null,
        aj: null,
        bj: null,
        sortState: 'pivot',
        root: null,
        child: null,
        recursiveSiftdownStack: [],
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
