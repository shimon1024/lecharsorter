import { describe, expect, test } from 'vitest';

import * as random from './random.js';

const nLoops = 1000000;
const seed = 0;

describe('shuffle', () => {
  test('一様分布', async () => {
    let s = random.newState(seed);
    const da = Array(10).fill(null).map((_, i) => i);
    let a;
    // (original position, random (after) position)の二次元配列
    let counter = Array(10).fill(null).map(_ => Array(10).fill(0));
    for (let i = 0; i < nLoops; i++) {
      [a, s] = random.shuffle(da, s);
      for (const [o, r] of a.entries()) {
        counter[o][r]++;
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const p = (counter[i][j] / nLoops) * 100;
        expect(p).toBeGreaterThanOrEqual(9.9);
        expect(p).toBeLessThanOrEqual(10.1);
      }
    }
  });
});

describe('nextInt', () => {
  test('一様分布', async () => {
    let s = random.newState(seed);
    let n;
    let counter = Array(10).fill(0);
    for (let i = 0; i < nLoops; i++) {
      [n, s] = random.nextInt(0, 9, s);
      counter[n]++;
    }

    for (let i = 0; i < 10; i++) {
      const p = (counter[i] / nLoops) * 100;
      expect(p).toBeGreaterThanOrEqual(9.9);
      expect(p).toBeLessThanOrEqual(10.1);
    }
  });
});
