import { Fragment, useContext } from 'react';
import './Result.css';
import Setup from './Setup.jsx';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js';
import * as b64 from './base64.js';
import * as encoding from './encoding.js';

const sorterURLBase = 'https://example.com/';
const xPostURLBase = 'https://x.com/intent/post';

export default function Result({ sorterTitle, chars, nCompares }) {
  const setScene = useContext(SceneSetContext);

  const ranking = [];
  let rank = 1;
  for (let i = 0; i < chars.length; i++) {
    for (let j = 0; j < chars[i].length; j++) {
      ranking.push({
        rank,
        charId: chars[i][j],
      });
    }
    rank += chars[i].length;
  }

  const viewerURL = new URL(sorterURLBase); // javascriptスキームインジェクションに注意
  viewerURL.searchParams.set('c', 'v');
  viewerURL.searchParams.set('v', '1');
  viewerURL.searchParams.set('d', b64.Uint8ArrayToBase64(encoding.encodeResultData(1, chars, sorterTitle), { alphabet: 'base64url' }));

  const xRanking = ranking.slice(0, 3).map(r => `${r.rank}位 ${le.chars[r.charId].name}\n`).reduce((a, s) => a + s, '');
  const xPostURL = new URL(xPostURLBase); // javascriptスキームインジェクションに注意
  xPostURL.searchParams.set('url', viewerURL.toString());
  xPostURL.searchParams.set('text', `\
連縁キャラソート${sorterTitle}ランキング
${xRanking}…`);

  function handleRetryClick() {
    if (!confirm('結果はサーバーに保存されません。事前にスクリーンショットや結果へのリンクを控えてください。もう一度キャラソートしますか？')) {
      return;
    }

    setScene(<Setup />);
  }

  return (
    <div className="result">
      <h1 className="result-title">連縁キャラソート</h1>
      <h2 className="result-subtitle">{sorterTitle}ランキング</h2>
      <div className="result-chars-container" data-testid="result-chars-container">
        {
          ranking.map((r, i) =>
            <Fragment key={i}>
              <span className="result-chars-rank">{r.rank}位</span>
              <span>{le.chars[r.charId].name}</span>
            </Fragment>
          )
        }
      </div>
      <div className="result-info" data-testid="result-info">
        {
          (() => {
            if (nCompares != null) {
              return `(${nCompares}回)`;
            }
          })()
        }
      </div>
      <hr className="result-hr-main-sub" />
      <a href={xPostURL.toString()} target="_blank">Xで共有</a>
      <a className="result-result-link" href={viewerURL.toString()} target="_blank">結果へのリンク</a>
      <button className="result-retry" onClick={handleRetryClick}>もう一度</button>
    </div>
  );
}
