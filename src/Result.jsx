export default function Result() {
  return (
    <>
      <h1>連縁キャラソート</h1>
      <h2>...ランキング</h2>
      {Array(10).fill(null).map((_, i) =>
        <div>{i+1}位 ...</div>
      )}
      <p>(〜分、〜回)</p>
      <div>Xで共有</div>
      <div>リンク</div>
      <button>もう一度</button>

      <div>開発: <a href="https://postfixnotation.org/">志文</a></div>
    </>
  );
}
