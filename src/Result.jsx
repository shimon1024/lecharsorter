import { Fragment } from 'react'
import './Result.css'

export default function Result({ sorterTitle, chars }) {
  return (
    <div className="result">
      <h1 className="result-title">連縁キャラソート</h1>
      <h2 className="result-subtitle">{sorterTitle}ランキング</h2>
      <div className="result-chars-container">
        {
          chars.slice(0, 10).map((c, i) =>
            <Fragment key={i}>
              <span className="result-chars-rank">{i+1}位</span>
              <span>{c}</span>
            </Fragment>
          )
        }
      </div>
      <div className="result-info">(〜分、〜回)</div>
      <hr className="result-hr-main-sub" />
      <a href="https://example.com/" target="_blank">Xで共有</a>
      <a className="result-result-link" href="https://example.com/" target="_blank">結果へのリンク</a>
      <button className="result-retry">もう一度</button>
    </div>
  );
}
