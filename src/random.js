import prand from 'pure-rand';

// テストでモックしたいので関数として実装
// これだけ副作用あり
export function genSeed() {
  // https://github.com/dubzzz/pure-rand/blob/8eca58c8e1d7b47e81695212c9ec587bd5cf55f2/README.md
  return Date.now() ^ (Math.random() * 0x100000000);
}

export function newState(seed) {
  return prand.xoroshiro128plus(seed).getState();
}

export function shuffle(array, state) {
  const prng = prand.xoroshiro128plus.fromState(state);
  const shuffled = array.slice();

  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = prand.unsafeUniformIntDistribution(0, i, prng);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return [shuffled, prng.getState()];
}

// min以上max以下の一様分布の整数を返す
export function nextInt(min, max, state) {
  const prng = prand.xoroshiro128plus.fromState(state);
  const num = prand.unsafeUniformIntDistribution(min, max, prng);
  return [num, prng.getState()];
}
