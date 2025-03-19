import { describe, expect, test } from 'vitest';

function leftChildIndex(index) {
  return index * 2 + 1;
}

function rightChildIndex(index) {
  return index * 2 + 2;
}

// この関数を実際に使うわけではないが、アルゴリズムを状態機械に分解したまま実装するのは難しいため、
// まずはひとつの関数としてアルゴリズムを実装した。
// 実際に使うソート関数ではsiftdownの内部ループを無くして実装する。
function heapsort(array, nranks) {
  let ranking = [];
  let start = Math.floor(array.length / 2); // 最初のリーフノード(最後の非リーフノードの1つ後)。ソート開始直後にheapifyで-1するので、最後の非リーフノードになる。
  let root = null, child = null, recursiveSiftdownStack = [];
  let state; // prepare, compareParentChild, epilogue

  for (;;) {
    // pivot
    if (start > 0) { // heapify
      start--;
    } else if (array.length > 1 && ranking.length < nranks - 1) { // extract
      // 終了条件は2つのいずれか。ソートする配列の要素が1つになる(マージが一度でもあれば起きうる)か、ランキング数が指定の制限に達した時(打ち切り)
      ranking.push(array.shift());
      array.unshift(array.pop());
    } else {
      ranking.push(array.shift()); // last extract
      break;
    }

    root = start;
    state = 'prepare';
siftdown:
    for (;;) {
      switch (state) {
      case 'prepare': {

        if (leftChildIndex(root) >= array.length) { // root is leaf
          state = 'epilogue';
          continue;
        } else if (rightChildIndex(root) >= array.length) { // left only
          child = leftChildIndex(root);

          state = 'compareParentChild';
          continue;
        }
        // rightChildIndex(root) < array.length

        // 子同士の比較
        let c = array[leftChildIndex(root)][0] - array[rightChildIndex(root)][0];
        if (c < 0) {
          child = leftChildIndex(root);
        } else if (c > 0) {
          child = rightChildIndex(root);
        } else { // c === 0
          // 同値をマージ
          array[leftChildIndex(root)].push(...array[rightChildIndex(root)]);
          array[rightChildIndex(root)] = null;

          if (array.at(-1) !== null) {
            array[rightChildIndex(root)] = array.pop();
            // recursive siftdown
            recursiveSiftdownStack.push({ root });
            root = rightChildIndex(root);
            state = 'prepare';
            continue;
          }

          // マージ対象が配列の末尾の2要素であればrecursive siftdownは不要
          array.pop();
          child = leftChildIndex(root);
        }

        // fallthrough
      }
      case 'compareParentChild': {
        // 親子の比較
        let c = array[root][0] - array[child][0];
        if (c > 0) {
          [array[root], array[child]] = [array[child], array[root]]; // swap

          // 一段下げてsiftdown
          root = child;
          state = 'prepare';
          continue;
        } else if (c === 0) {
          // 同値をマージ
          array[root].push(...array[child]);
          array[child] = null;

          if (array.at(-1) !== null) {
            array[child] = array.pop();
            // recursive siftdown
            recursiveSiftdownStack.push({ root });
            root = child;
            state = 'prepare';
            continue;
          }

          // マージ対象が配列の末尾の要素とその親であればrecursive siftdownは不要
          array.pop();
        }
        // else: c > 0
        // 現在のsiftdownは終了、再帰しているのなら前のsiftdownに戻る

        // fallthrough
      }
      case 'epilogue': {
        if (recursiveSiftdownStack.length > 0) {
          ({ root } = recursiveSiftdownStack.pop());
          // 常にsiftdownを最初からやり直す。
          // 親子比較時に再帰して、その再帰から返ってきた時に、新たな子がもう1つの子より大きい(親と比べるべきでない)可能性がある
          state = 'prepare';
          continue;
        }

        break siftdown; // 最後のsiftdown終了、ソートのメインループに戻る
      }
      default: throw new Error(`unknown state: ${state}`);
      }
    }
  }

  return ranking;
}

// アルゴリズムのテスト
describe('heapsort algorithm', () => {
  test.each([
    ['最小個数、ソート済み', [[1], [2]], 2, [[1], [2]]],
    ['最小個数、逆順', [[2], [1]], 2, [[1], [2]]],
    ['最小個数、同値', [[1], [1]], 2, [[1, 1]]],
    ['最小個数、同値、ランク数最小限制限', [[1], [1]], 1, [[1, 1]]],
    ['最小の3つ組、ソート済み', [[1], [2], [3]], 3, [[1], [2], [3]]],
    ['最小の3つ組、逆順', [[3], [2], [1]], 3, [[1], [2], [3]]],
    ['最小の3つ組、同値', [[1], [1], [1]], 3, [[1, 1, 1]]],
    ['最小の3つ組、同値、ランク数最小限制限', [[1], [1], [1]], 1, [[1, 1, 1]]],
    ['最大個数超、ソート済み', Array(50).fill(null).map((_, i) => [i]), 50, Array(50).fill(null).map((_, i) => [i])],
    ['最大個数超、逆順', Array(50).fill(null).map((_, i) => [i]).toReversed(), 50, Array(50).fill(null).map((_, i) => [i])],
    ['最大個数超、同値', Array(50).fill(null).map(_ => [1]), 50, [Array(50).fill(1)]], // mapを使うのは、fillに直接配列を指定すると、同じ参照を共有してしまうため
    ['最大個数超、同値、ランク数最小限制限', Array(50).fill(null).map(_ => [1]), 1, [Array(50).fill(1)]],
    ['最大個数超、3値を一様に(昇順)', Array(17).fill(null).flatMap(_ => [[1], [2], [3]]), 51, [Array(17).fill(1), Array(17).fill(2), Array(17).fill(3)]],
    ['最大個数超、3値を一様に(降順)', Array(17).fill(null).flatMap(_ => [[3], [2], [1]]), 51, [Array(17).fill(1), Array(17).fill(2), Array(17).fill(3)]],
    ['最大個数超、3値を一様に(撹拌)', Array(17).fill(null).flatMap(_ => [[2], [3], [1]]), 51, [Array(17).fill(1), Array(17).fill(2), Array(17).fill(3)]],
    ['最大個数超、ランク数一部制限、逆順', Array(50).fill(null).map((_, i) => [i]).toReversed(), 20, Array(20).fill(null).map((_, i) => [i])],
  ])('%s', async (
    _testName,
    inputNums,
    inputNranks,
    expectedNums
  ) => {
    let actual = heapsort(inputNums, inputNranks);
    expect(actual).toEqual(expectedNums);
  });
});
