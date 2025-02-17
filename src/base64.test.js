import { describe, expect, test } from 'vitest';

import * as b64 from './base64.js';

describe('Uint8Array->Base64', () => {
  test('空入力', async () => {
    const emptyB64 = b64.Uint8ArrayToBase64(Uint8Array.from([]), { alphabet: 'base64url', omitPadding: true });
    expect(emptyB64).toEqual('');
  });

  test('全バイト', async () => {
    const allBytes = Uint8Array.from(Array(256).fill(null).map((_, i) => i));
    const allBytesB64 = b64.Uint8ArrayToBase64(allBytes, { alphabet: 'base64url', omitPadding: true });
    expect(allBytesB64).toEqual('AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w');
  });
});

describe('Base64->Uint8Array', () => {
  test('空入力', async () => {
    const emptyBytes = b64.Uint8ArrayFromBase64('', { alphabet: 'base64url' });
    expect(emptyBytes).toEqual(Uint8Array.from([]));
  });

  test('全バイト', async () => {
    const allBytesB64 = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w'
    const allBytes = b64.Uint8ArrayFromBase64(allBytesB64, { alphabet: 'base64url' });
    expect(allBytes).toEqual(Uint8Array.from(Array(256).fill(null).map((_, i) => i)));
  });

  test('全バイト(パディングあり)', async () => {
    const allBytesB64 = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn-AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq-wsbKztLW2t7i5uru8vb6_wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t_g4eLj5OXm5-jp6uvs7e7v8PHy8_T19vf4-fr7_P3-_w=='
    const allBytes = b64.Uint8ArrayFromBase64(allBytesB64, { alphabet: 'base64url' });
    expect(allBytes).toEqual(Uint8Array.from(Array(256).fill(null).map((_, i) => i)));
  });
});
