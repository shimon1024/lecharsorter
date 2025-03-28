// Gitなどで使われる7文字の短いハッシュ値を整数で返す。
// 乱数の決定論的シードなどに使う。
export async function shortHash(string) {
  const msg = (new TextEncoder()).encode(string);
  const hash = await crypto.subtle.digest('SHA-1', msg);
  const bytes = new Uint8Array(hash);
  return ((bytes[3] << 20) | (bytes[2] << 12) | (bytes[1] << 4) | (bytes[0] >>> 4));
}
