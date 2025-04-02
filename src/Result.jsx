import { Fragment, useContext } from 'react';
import html2canvas from 'html2canvas';
import './Result.css';
import Setup from './Setup.jsx';
import ErrorPage, { messageClearSaveData } from './ErrorPage.jsx';
import { SceneSetContext } from './SceneContext.jsx';
import * as le from './lenen.js';
import * as b64 from './base64.js';
import * as serialize from './serialize.js';
import * as save from './save.js';

const twPostURLBase = 'https://x.com/intent/post';

export default function Result({ sorterTitle, ranking, unranked, nCompares, mode }) {
  const setScene = useContext(SceneSetContext);

  const rankingList = [];
  let rank = 1;
  for (let i = 0; i < ranking.length; i++) {
    for (let j = 0; j < ranking[i].length; j++) {
      rankingList.push({
        rank,
        charId: ranking[i][j],
      });
    }
    rank += ranking[i].length;
  }

  const viewerURL = new URL(window.location.pathname, window.location.origin); // javascriptスキームインジェクションに注意
  viewerURL.searchParams.set('c', 'v');
  const paramMap = serialize.serializeResultData(viewerURL.searchParams, '1', { sorterTitle, ranking, unranked });

  const twRanking = rankingList.slice(0, 3).map(r => `${r.rank}位 ${le.chars[r.charId].name}\n`).reduce((a, s) => a + s, '');
  const twPostURL = new URL(twPostURLBase); // javascriptスキームインジェクションに注意
  twPostURL.searchParams.set('url', viewerURL.toString());
  twPostURL.searchParams.set('text', `\
連縁キャラソート${sorterTitle}ランキング
${twRanking}…`);

  async function handleRetryClick() {
    if (!confirm('後で結果を見返したい場合は、もう一度キャラソートする前に、結果の画像やリンクを控えてください。もう一度キャラソートしますか？')) {
      return;
    }

    try {
      await save.clearSaveData();
    } catch (e) {
      console.error(`Compare: handleRetryClick: clear save error: ${e}`);
      setScene(<ErrorPage message={messageClearSaveData} />);
      return;
    }

    setScene(<Setup />);
  }

  async function handleDownloadImage() {
    const rankingCanvas = await html2canvas(document.getElementById('ranking'));
    const downloadTempLink = document.createElement('a');
    downloadTempLink.href =  rankingCanvas.toDataURL();
    downloadTempLink.download = 'ranking.png';
    downloadTempLink.style.display = 'none';

    document.body.appendChild(downloadTempLink);
    try {
      downloadTempLink.click();
    } finally {
      document.body.removeChild(downloadTempLink);
    }
  }

  return (
    <div className="result">
      <h1 className="result-title">連縁キャラソート</h1>
      <h2 className="result-subtitle">{sorterTitle}ランキング</h2>
      <div id="ranking" className="result-chars-container" data-testid="result-chars-container">
        {
          rankingList.map((r, i) =>
            <Fragment key={i}>
              <span className="result-chars-rank">{r.rank}位</span>
              <span>{le.chars[r.charId].name}</span>
            </Fragment>
          ).concat(unranked.map((c, i) =>
            <Fragment key={rankingList.length + i}>
              <span className="result-chars-rank">ランク外</span>
              <span>{le.chars[c].name}</span>
            </Fragment>
          ))
        }
      </div>
      <div className="result-info" data-testid="result-info">
        {
          (() => {
            if (nCompares != null) {
              return `(比較${nCompares}回)`;
            }
          })()
        }
      </div>
      <hr className="result-hr-main-sub" />
      <button className="result-download-image" onClick={handleDownloadImage}>画像をダウンロード</button>
      {mode !== 'view' && <a href={twPostURL.toString()} target="_blank">Xで共有</a>}
      {mode !== 'view' && <a className="result-result-link" href={viewerURL.toString()} target="_blank">結果へのリンク</a>}
      {mode !== 'view' && <button className="result-retry" onClick={handleRetryClick}>もう一度</button>}
    </div>
  );
}
