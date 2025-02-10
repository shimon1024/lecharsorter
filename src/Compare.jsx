import './Compare.css'

export default function Compare({ sorterTitle }) {
  return (
    <div className="compare">
      <h1 className="compare-title">どっちが{sorterTitle}？</h1>
      <button className="compare-char1">キャラ1</button>
      <button className="compare-char2">あいうえおかきくけこさしすせそ</button>
      <button className="compare-both">両方</button>
      <button className="compare-skip">あとまわし</button>
      <hr className="compare-hr-main-sub" />
      <button className="compare-undo">↶</button>
      <button className="compare-redo">↷</button>
      <div className="compare-info">(n組目、n%完了、残り最大n組)</div>
      <button className="compare-quit">ソートをやめる</button>
    </div>
  );
}
